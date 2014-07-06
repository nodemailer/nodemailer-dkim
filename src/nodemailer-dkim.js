'use strict';

var dkimSign = require("dkim-signer").DKIMSign;
var Transform = require('stream').Transform;
var util = require('util');

/**
 * Nodemailer plugin for the 'stream' event. Caches the entire message to memory,
 * signes it and passes on
 *
 * @param {Object} options DKIM options
 * @returns {Function} handler for 'stream'
 */
module.exports.signer = function(options) {
    return function(mail, callback) {
        mail.message.transform(new DKIMSigner(options));
        setImmediate(callback);
    };
};

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
    this.push(new Buffer([].concat(signature || []).concat(this._message ||  []).join('\r\n'), 'utf-8'));
    done();
};