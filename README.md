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

Attach it as a 'stream' handler for a nodemailer transport object

```javascript
transporter.use('stream', signer(options))
```

Where

  * **options** is the DKIM options object
      * **domainName** is the domain name that is being used for signing
      * **keySelector** is the key selector (if you have set up a TXT record with DKIM public key at *zzz._domainkey.blurdybloop.com* then `zzz` is the selector)
      * **privateKey** is the private key that is used for DKIM signing (string)
      * **headerFieldNames** is an (optional) colon separated list of header fields to sign, by default all fields suggested by RFC4871 #5.5 are used

All messages transmitted through this transport objects are from now on DKIM signed.

> **NB!** If several header fields with the same name exists, only the last one (the one in the bottom) is signed.

## Example

```javascript
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();
transporter.use('stream', require('nodemailer-dkim').signer({
    domainName: 'kreata.ee',
    keySelector: 'test',
    privateKey: fs.readFileSync('private.pem')
}));
transporter.sendMail({
    from: 'sender@address',
    to: 'receiver@address',
    subject: 'hello',
    text: 'hello world!'
}, function(err, response) {
    console.log(err || response);
});
```

### Configration verification

You can use this module to check if your configuration is correct and the private key matches the public key listed in DNS

```javascript
var verifyKeys = require('nodemailer-dkim').verifyKeys;
verifyKeys(options, callback);
```

Where

  * **options** is the same option object you use for the `signer` function
  * **callback** is the callback to run once verification is completed

**Example**

```javascript
verifyKeys({
    domainName: 'kreata.ee',
    keySelector: 'test',
    privateKey: fs.readFileSync('private.pem')
}, function(err, success){
    if(err){
        console.log('Verification failed');
        console.log(err);
    }else if(success){
        console.log('Verification successful, keys match');
    }
});
```

## License

**MIT**



