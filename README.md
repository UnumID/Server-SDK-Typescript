This SDK combines the functionality of an [**Issuer**](#issuer) and [**Verifier**](#verifier) entity to work with UnumID's SaaS.

## SDK Functionality
The Server SDK uses the **UnumDto** type to facilitate handling many response body types while providing a reliable structure to access the result.

```typescript title="UnumDto"
{
  "authToken": string; // The JWT auth token which is used by the SDK to authenticate with UnumID's SaaS. This is periodically refreshed thus its value should be read and stored in every resultant function call. 
  "body": T; // The placeholder for the function's response type is function specific. 
}
```

**Authentication**
Every request detailed below requires a preceding Bearer `authToken` as a first parameter which is used to authenticate request to UnumID's SaaS on your behalf. As mention above this auth token updated upon every subsequent function call and should be read via the `authToken` attribute and persisted accordingly for later requests. 

**Errors** 
Errors returned by UnumID's SaaS will also be wrapped in the UnumDto object so that the (potentially) updated `authToken` can be retrieved. Validation errors which are created prior to any internal calls to UnumID's SaaS will however simply by of type Error and are thrown. This is due to never making a network call with the provided authToken so no (potential) new token to pass back.
## Issuer
The Issuer functionality is used by a customer acting as an Issuer. It allows one to register Issuers and perform actions such as issuing and revoking Credentials.

### registerIssuer
Register an issuer corresponding to your customer UUID and issuer API key provided by UnumID's SaaS. As a customer, you can register as many issuers as you like (or none at all), depending on your use case. Note, however, that you'll need a unique issuer API key for each one.

You should store the DID (`did`) and encryption and signing key pairs (`keys`) that this returns. You'll need these to issue credentials to users.

Parameters:
```typescript
"name": string, // a human-readable name for the Issuer. It will be displayed to users in the Holder when Credentials from the Issuer are created.
"customerUuid": string, // your Unum ID customer uuid
"apiKey": string // a unique Issuer API key obtained from Unum ID
```

Response Body:  [**RegisteredIssuer**](https://docs.unum.id/Server-SDK-Typescript/interfaces/registeredissuer.html)
```typescript title="RegisteredIssuer"
{
  "uuid": string, // identifies the new Issuer in the Unum ID database
  "customerUuid": string, // identifies the customer which Created the Issuer
  "did": string, // identifies the Issuer in the Unum ID decentralized ecosystem
  "name": string, // a human-readable name for the Issuer
  "createdAt": string, // the date and time the Issuer was registered
  "updatedAt": string, // the date and time the Issuer was last updated
  "keys": {
    "signing": {
      "privateKey": string, // your Issuer Signing Private Key. You will need to provide it in order to issue Credentials
      "publicKey": string, // your Issuer Signing Public Key. It is also stored in the Issuer's DID Document, and can be used by other entities in the Unum ID ecosystem to verify the Issuer's signature on Credentials it issues.
    }
  }
}
```

### issueCredential
Issue a credential to a subject (user).

You need to provide your issuer DID (created when you registered), as well as your signing and encryption private keys, which the Issuer uses to sign and encrypt the credential. You need to specify a credentialType, which verifiers will use to later request the credential from the user.

This returns a credential `id` that you should store so you can later revoke the credential if need be. We would recommend storing the entire credential indexed on the resultant credential `id`. Note that there are also id fields within credentialSubject and credentialStatus, but these are different. They refer to the subject DID and credential status identifier, respectively.

:::info
The private keys never leave your app. This function, like all the others in this SDK, needs them in order to handle to cryptographic functionality on your behalf.
:::

Parameters
```typescript
"credentialSubject": {
  "id": string, // a DID identifying the Subject of the Credential
  [key: string]: any, // any number of claims about the subject, expressed as key-value pairs
},
"type": string || string[], // The Credential type(s)
"issuer": string, // DID identifying the Issuer issuing the Credential
"expirationDate": string, // date and time after which the Credential will no longer be valid
"eccPrivateKey": string // your Issuer's Private Key
```

Response Body: [**Credential**](https://docs.unum.id/Server-SDK-Typescript/interfaces/credential.html)
```typescript title="Credential"
{
    "@context": ["https://www.w3.org/2018/credentials/v1"], // this field is specified in the W3C Verifiable Credential spec
    "credentialStatus": {
        "id": string, // a url from which the Credential's status can be checked or updated
        "type": "CredentialStatus"
    },
    "credentialSubject": {
        "id": string, // a DID identifying the Subject of the Credential
        [key: string]: any, // any number of claims about the subject, expressed as key-value pairs
    },
    "issuer": string, // DID identifying the Issuer that issued the Credential
    "type": string[], // the Credential type(s)
    "id": string, // a version 4 UUID uniquely identifying the Credential
    "issuanceDate": string, // the date and time at which the credential was issued
    "expirationDate": string, // date and time after which the Credential will no longer be valid
    "proof": Proof // a cryptographic proof created by signing the Credential with the Issuer's Private Key. It can be used to verify the authenticity of the Credential.
}
```

### revokeCredential
Revoke a credential, i.e. make it invalid.

You need to provide the credential `id` (created when you issued the credential).

Parameters
```typescript
{
  "credentialId": string // id of the Credential to revoke
}
```

Response Body: **Empty**. If unsuccessful and exception will be thrown.
```typescript
{}
```

## Verifier
The Verifier functionality is used by a customer acting as a verifier. It allows one to register verifiers. Most importantly, it allows one to send PresentationRequests and verify Presentations.

### registerVerifier
Register a verifier corresponding to your customer UUID and verifier API key that UnumID's SaaS provides. As a customer, you can register as many verifiers as you like (or none at all), depending on your use case. Note, however, that you'll need a unique verifier API key for each one.

You should store the DID (`did`) and signing key pair (`keys`) that this returns. You'll need these to create requests for (presentations of) credentials from users.

Parameters
```typescript
"name": string, // a human-readable name for the verifier. It will be displayed to users in the Holder when receiving a PresentationRequest.
"customerUuid": string, // your Unum ID customer uuid
"apiKey": string // a unique Verifier API key obtained from Unum ID
```

Response body: [**RegisteredVerifier**](https://docs.unum.id/Server-SDK-Typescript/interfaces/registeredverifier.html)
```typescript title="RegisteredVerifier"
{
  "uuid": string, // identifies the new Verifier in the Unum ID database
  "customerUuid": string, // identifies the customer which Created the Verifier
  "did": string, // identifies the Verifier in the Unum ID decentralized ecosystem
  "name": string, // a human-readable name for the Verifier
  "createdAt": string, // the date and time the Verifier was registered
  "updatedAt": string, // the date and time the Verifier was last updated
  "keys": {
    "signing": {
      "privateKey": string, // your Verifier Signing Private Key. You will need to provide it in order to send PresentationRequests
      "publicKey": string, // your Verifier Signing Public Key. It is also stored in the Verifiers DID Document, and can be used by other entities in the Unum ID ecosystem to verify the Verifier's signature on PresentationRequests it creates
    }, "encryption": {
      "privateKey": string, // your Verifier Encryption Private Key. You will need to provide it in order to send PresentationRequests
      "publicKey": string, // your Verifier Encryption Public Key. It is also stored in the Verifiers DID Document, and can be used by other entities in the Unum ID ecosystem to encrypt presentations for the Verifier to verifier.
    }
  }
}
```


### sendRequest
Create a request for (a presentation of) credentials from a user.

You need to provide your verifier DID (created when you registered) and the UUID of the holder app from which the user can share the data. You also need to provide your signing private key, which the Verifier App uses to sign the request.

To request credentials, you need to specify the credentialType and one or more acceptable issuers (entities that issue those credentials). If you list more than one issuer, the user can share a credential issued by any of the ones you list.

:::info
The private keys never leave your app. This function, like all the others in this SDK, needs them in order to handle to cryptographic functionality on your behalf.
:::

Parameters
```typescript
"verifier": string, // your Verifier DID
"credentialRequests": CredentialRequest[], // a list of one or more CredentialRequest objects. Describes the Credentials which should be shared to fulfill the PresentationRequest
"eccPrivateKey": string, // your Verifier's Private Key
"holderAppUuid": string, // identifies which Holder App the PresentationRequest should be sent to
"expiresAt": string, // Optional. The date and time the PresentationRequest should expire. Default is 10 minutes after creation
"metadata": object // any additional data to include in the PresentationRequest
```

Response Body: [**PresentationRequestResponse**](https://docs.unum.id/Server-SDK-Typescript/interfaces/presentationrequestresponse.html)
```typescript title="PresentationRequestResponse"
{
  "presentationRequest": {
    "uuid": string, // identifies the PresentationRequest in the Unum ID database
    "createdAt": string, // the date and time the PresentationRequest was created
    "updatedAt": string, // the date and time the PresentationRequest was last updated. This should always be the same as createdAt
    "expiresAt": string, // the date and time the PresentationRequest expires
    "verifier": string, // DID identifying the Verifier which created the PresentationRequest
    "credentialRequests": CredentialRequest[], // a list of one or more CredentialRequest objects. Describes the Credentials which should be shared to fulfill the PresentationRequest
    "proof": Proof, // a cryptographic proof signed by your Verifier Private Key that can be used to verify the authenticity of the PresentationRequest
    "metadata": object // any additional data provided when the PresentationRequest was created
  },
  "verifier": {
      "name": string, // verifier name
      "did": string, // verifier did
      "url": string // the url of a customer applications that received presentations
  },
  "issuers": {
      "IssuerDid:string": { // a map keyed on the issuer did that issued the requested credential(s)
        "name": string, // name of the issuer that issued the credential(s)
        "did": string // issuer did that issued the credential(s) 
      }
  },
  "deeplink": string, // a deeplink that can be used to trigger the intended HolderApp to load the PresentationRequest
  "qrCode": string // a QR code containing the deeplink, encoded as a data URL
}
```

### verifyEncryptedPresentation 
Verify a encrypted Presentation. 

This is used in service behind the `/presentation` endpoint that needs to be defined according to [this](unum.id) spec which UnumID's SaaS forwards encrypted Presentations to. It handles decrypting the encrypted presentation and verifies the signature is valid. 

:::tip
Although this request is coming from UnumID's SaaS, UnumID never has access to the credentials within the presentation due to the encryption. Do not forget to save the signing and encryption private keys returned during the **registerVerifier** step.
:::

Parameters
```typescript
"encryptedPresentation": EncryptedData, // the encrypted presentation with sensitive credential information.
"verifierDid": string, // the did associated with the verifier's public that was used to encrypt the presentation by the Holder SDK.
"encryptionPrivateKey": string // associated Verifier's (based on did) `encryptionPrivateKey` attribute that should persisted in your db.
```


Response Body: [**DecryptedPresentation**](https://docs.unum.id/Server-SDK-Typescript/interfaces/decryptedpresentation.html)
```typescript title="DecryptedPresentation"
{
  isVerified: boolean; // boolean indicating wether the signatures signed by the subject (user) is valid 
  type: 'VerifiablePresentation' | 'NoPresentation' // type of the presentation. NoPresentation means the presentation request was declined by the user.
  credentials?: VerifiableCredential[] // (optional) a list of VerifiableCredential objects. This is the decrypted credential information. Only populated if the presentation signatures are verified and of type `VerifiablePresentation`.
  message?: string; // (optional) message detailing why the verification did not succeed if isVerified is false.
}
```

### sendSms
Use to send a deep link to a user by SMS. The message will be delivered from an Unum ID associated phone number. You can of course use your own SMS sending service if you prefer.

To request (a presentation of) credentials from a user, you first create the request object and receive a deep link that references it. The user need to receive this deep link, which will open the correct app on their phone and prompt them to share the credentials. SMS is one convenient channel.


Parameters
```typescript
{
  "to": string, // phone number to send the SMS to
  "msg": string // message to send
}
```

Response Body: **Empty**. If unsuccessful and exception will be thrown.
```typescript
{}
```

### sendEmail
Use to send a deep link to a user by email. The message will be delivered from DoNotReply@UnumID.org. You can of course use your own email sending service if you prefer.

To request (a presentation of) credentials from a user, you first create the request object and receive a deep link that references it. The user need to receive this deep link, which will open the correct app on their phone and prompt them to share the credentials. Email is one convenient channel, though keep in mind that the user will need to click the link from their phone for the deep link to work.

:::tip
JSON special characters such a double quote or backslash in the `subject` or `htmlBody` fields will need to be escaped with a backslash, i.e. "the best org in the country" must be \"the best org in the country\".
:::

Parameters
```typescript
{
  "to": string, // target email
  "from": string, // from email
  "replyTo": string, // replyTo email
  "subject": string, // subject of the email
  "textBody": string, // email message body
}
```

Response Body: **Empty**. If unsuccessful and exception will be thrown.
```typescript
{}
```

## Other Information
### Distribution

Currently this project is still closed source, so standard distribution options via public source code or NPM repository are not viable. In downstream projects are leveraging this project via it's git url using Docker Buildkit to provide SSH credentials for access to this Github source code repo. An example of such a buildkit configuration can be found in the [hooli-demo-server](https://github.com/UnumID/hooli-demo-server) `Dockerfile` and `.circleci/config.yaml`.

We considered opting to build and push as a private module through a private Github NPM repo. However due to the complexities of configuring a downstream project to have rights to pull from the private NPM repo we have opted to not add pushing a private package to our CI job. 

Soon, we hope to open source this project and uploaded the package as public NPM module.  
### Global Dependencies
- NodeJS v14.0.0 or higher, preferably v14.15.0 or higher
- yarn

### Logging
Logs level defaults to Info. One can set to debug for more information via the environment variable LOG_LEVEL, i.e. LOG_LEVEL=debug. We are using standard NPM log levels. More details on the various log levels [here](https://github.com/winstonjs/winston#logging-levels).

The logs default to stdout so can be aggregated using any log provider you would like from disk.

### Documentation
High level technical documentation can be found [here](https://https://docs.unum.id/server-sdk) which is served via [Docusaurus](https://github.com/UnumID/UnumID.github.io). More detailed generated from source documentation can be found [here](https://docs.unum.id/Server-SDK-Typescript/index.html) which is served via repo specific Github pages via the /docs folder of the main branch.

In order to generate the Typedoc documentation from the source code run the `createTypedocs.sh` script.