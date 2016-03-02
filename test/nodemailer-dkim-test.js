'use strict';

var chai = require('chai');
var dkim = require('../src/nodemailer-dkim');
var fs = require('fs');
var sinon = require('sinon');

var expect = chai.expect;
chai.Assertion.includeStack = true;

describe('nodemailer-dkim tests', function() {
    it('should add valid signature', function(done) {
        var mail = 'From: andris@node.ee\r\nTo:andris@kreata.ee\r\n\r\nHello world!';

        var signer = new dkim.DKIMSigner({
            domainName: 'node.ee',
            keySelector: 'dkim',
            privateKey: fs.readFileSync(__dirname + '/fixtures/test_private.pem')
        });

        var chunks = [];

        signer.on('data', function(chunk) {
            chunks.push(chunk);
        });

        signer.on('end', function() {
            // unwrap all lines
            var message = Buffer.concat(chunks).toString('utf-8').replace(/\r?\n +/g, ' ');
            // normalize first line by removing spaces
            message = message.replace(/^.*$/m, function(str) {
                return str.replace(/ /g, '');
            });
            expect(message).to.exist;
            expect(message).to.equal('DKIM-Signature:v=1;a=rsa-sha256;c=relaxed/relaxed;d=node.ee;q=dns/txt;s=dkim;bh=z6TUz85EdYrACGMHYgZhJGvVy5oQI0dooVMKa2ZT7c4=;h=from:to;b=pVd+Dp+EjmYBcc1AWlBAP4ESpuAJ2WMS4gbxWLoeUZ1vZRodVN7K9UXvcCsLuqjJktCZMN2+8dyEUaYW2VIcxg4sVBCS1wqB/tqYZ/gxXLnG2/nZf4fyD2vxltJP4pDL\r\n' + mail);
            done();
        });

        signer.end(mail);
    });

    it('should verify valid keys', function(done) {
        var dns = require('dns');
        sinon.stub(dns, 'resolveTxt').yields(null, [ [' p = MHwwDQYJKoZIhvcNAQEBBQADawAwaAJhANCx7ncKUfQ8wBUYmMqq6ky8rBB0NL8knBf3+uA7q/CSxpX6sQ8NdFNtEeEd7gu7BWEM7+PkO1P0M78eZOvVmput8BP9R44ARpgHY4V0qSCdUt4rD32nwfjlGbh8p5ua5wIDAQAB'] ]);

        dkim.verifyKeys({
            domainName: 'node.ee',
            keySelector: 'dkim',
            privateKey: fs.readFileSync(__dirname + '/fixtures/test_private.pem')
        }, function(err, success) {
            expect(err).to.not.exist;
            expect(success).to.be.true;
            dns.resolveTxt.restore();
            done();
        });
    });

    it('should not verify missing keys', function(done) {
        var dns = require('dns');
        sinon.stub(dns, 'resolveTxt').yields(null, []);

        dkim.verifyKeys({
            domainName: 'node.ee',
            keySelector: 'dkim',
            privateKey: fs.readFileSync(__dirname + '/fixtures/test_private.pem')
        }, function(err) {
            expect(err).to.exist;
            dns.resolveTxt.restore();
            done();
        });
    });

    it('should not verify non matching keys', function(done) {
        var dns = require('dns');
        sinon.stub(dns, 'resolveTxt').yields(null, [ ['p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDFDiKg3O4hdG5iehr5MNxMgrJNMUh6hgWekILDZg2I8WGERJTFZpnspUT1wgoVRziVzGB7ORbVOZEPdZy7noNSTpx5hDgHie/8cO1Q9O/IIX6Mx4qfQL21m0d1zZRbCo6wdO/cwXMoqOZN6ijpFsLFBMNanJ7AysIXiu6GeYLxwQIDAQAB'] ]);

        dkim.verifyKeys({
            domainName: 'node.ee',
            keySelector: 'dkim',
            privateKey: fs.readFileSync(__dirname + '/fixtures/test_private.pem')
        }, function(err) {
            expect(err).to.exist;
            dns.resolveTxt.restore();
            done();
        });
    });
});
