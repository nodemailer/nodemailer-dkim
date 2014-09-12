# Changelog

## v1.0.0 2014-09-12

Set transform stream as a callable function, this allows to use the same mail object several times (new DKIMSigner is created for every instance).

## v0.2.0 2014-08-06

Added new method `verifyKeys` to verify the DKIM settings. The method fetches the public key from DNS and tries to verify some data signed with the private key.