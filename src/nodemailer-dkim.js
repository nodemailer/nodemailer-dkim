'use strict';

var dkimSign = require("dkim-signer").DKIMSign;
var Transform = require('stream').Transform;
var util = require('util');
var dns = require('dns');
var crypto = require('crypto');
var punycode = require('punycode');

/**
 * Nodemailer plugin for the 'stream' event. Caches the entire message to memory,
 * signes it and passes on
 *
 * @param {Object} options DKIM options
 * @returns {Function} handler for 'stream'
 */
module.exports.signer = function(options) {
    return function(mail, callback) {
        mail.message.transform(function() {
            return new DKIMSigner(options);
        });
        setImmediate(callback);
    };
};

module.exports.verifyKeys = verifyKeys;

// Expose for testing only
module.exports.DKIMSigner = DKIMSigner;

/**
 * Creates a Transform stream for signing messages
 *
 * @constructor
 * @param {Object} options DKIM options
 */
function DKIMSigner(options) {
    this.options = options || {};
    Transform.call(this, this.options);

    this._message = '';
}
util.inherits(DKIMSigner, Transform);

/**
 * Caches all input
 */
DKIMSigner.prototype._transform = function(chunk, encoding, done) {
    chunk = (chunk || '').toString('utf-8');
    this._message += chunk;
    done();
};

/**
 * Signs and emits the entire cached input at once
 */
DKIMSigner.prototype._flush = function(done) {
    var signature = dkimSign(this._message, this.options);
    this.push(new Buffer([].concat(signature || []).concat(this._message || []).join('\r\n'), 'utf-8'));
    done();
};

/**
 * Verifies if selected settings are valid (private key matches the publick key listed in DNS)
 *
 * @param {Function} callback Callback function with the result
 */
function verifyKeys(options, callback) {
    var domain = punycode.toASCII([options.keySelector, '_domainkey', options.domainName].join('.'));
    dns.resolveTxt(domain, function(err, result) {
        if (err) {
            return callback(err);
        }

        if (!result || !result.length) {
            return callback(new Error('Selector not found (%s)', domain));
        }

        var data = {};
        [].concat(result[0] || []).join('').split(/;/).forEach(function(row) {
            var key, val;
            row = row.split('=');
            key = (row.shift() || '').toString().trim();
            val = (row.join('=') || '').toString().trim();
            data[key] = val;
        });

        if (!data.p) {
            return callback(new Error('DNS TXT record does not seem to be a DKIM value', domain));
        }

        var pubKey = '-----BEGIN PUBLIC KEY-----\n' + data.p.replace(/.{78}/g, '$&\n') + '\n-----END PUBLIC KEY-----';

        try {
            var sign = crypto.createSign('RSA-SHA256');
            sign.update('nodemailer');
            var signature = sign.sign(options.privateKey, 'hex');
            var verifier = crypto.createVerify('RSA-SHA256');
            verifier.update('nodemailer');

            if (verifier.verify(pubKey, signature, 'hex')) {
                return callback(null, true);
            } else {
                return callback(new Error('Verification failed, keys do not match'));
            }
        } catch (E) {
            callback(E);
        }
    });
}
