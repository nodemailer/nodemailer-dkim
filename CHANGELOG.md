# Changelog

## v1.0.4 2016-03-02

Bumped dependencies to fix too long lines issue

## v1.0.3 2015-05-13

Fixed an issue with long public keys (https://github.com/andris9/nodemailer-dkim/pull/4)

## v1.0.2 2015-01-13

Trim whitespace around keys and values in the TXT record when verifying DKIM setup

## v1.0.0 2014-09-12

Set transform stream as a callable function, this allows to use the same mail object several times (new DKIMSigner is created for every instance).

## v0.2.0 2014-08-06

Added new method `verifyKeys` to verify the DKIM settings. The method fetches the public key from DNS and tries to verify some data signed with the private key.
