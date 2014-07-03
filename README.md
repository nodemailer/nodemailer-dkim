# DKIM Signer plugin for Nodemailer

This applies to Nodemailer v1.0+. Older versions have DKIM support built in.

## Install

Install from npm

    npm install nodemailer-dkim --save

## Usage

Load the `signer` function

```javascript
var signer = require('nodemailer-dkim').signer;
```

Attach it as a 'send' handler for a nodemailer transport object

```javascript
nodemailerTransport.use('send', signer(options))
```

Where

  * **options** is the DKIM options object
      * **domainName** is the domain name that is being used for signing
      * **keySelector** is the key selector (if you have set up a TXT record with DKIM public key at *zzz._domainkey.blurdybloop.com* then `zzz` is the selector)
      * **privateKey** is the private key that is used for DKIM signing (string)
      * **headerFieldNames** is an (optional) colon separated list of header fields to sign, by default all fields suggested by RFC4871 #5.5 are used

All messages transmitted through this transport objects are from now on DKIM signed.

> **NB!** If several header fields with the same name exists, only the last one (the one in the bottom) is signed.

## License

**MIT**



