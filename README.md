This SDK combines the functionality of an [**Issuer**](#issuer) and [**Verifier**](#verifier) entities to work with UnumID's SaaS. For necessary account creation and API keys please email admin@unum.id.

## SDK Functionality
The Server SDK uses the **UnumDto** type to facilitate handling many response body types while providing a reliable structure to access the result body and importantly the rolling JWT authToken.

```typescript title="UnumDto"
{
  "authToken": string; // The JWT auth token which is used by the SDK to authenticate with UnumID's SaaS. This is periodically refreshed thus its value should be read and stored in every resultant function call. 
  "body": T; // The placeholder for the function's response type is function specific. 
}
```

**Authentication**
Every request detailed below requires a Bearer `authToken` as a first parameter which is used to authenticate request to UnumID's SaaS on your behalf. As mention above this auth token updated upon every subsequent function call and should be read via the `authToken` attribute and persisted accordingly for later requests. 

**Errors** 
Errors returned by UnumID's SaaS will also be wrapped in the UnumDto object so that the potentially updated `authToken` can be retrieved. Validation errors which are created prior to any internal calls to UnumID's SaaS will be of type Error and are thrown. This is due to never making a network call with the provided authToken so no potential new authToken to pass back. For this reason we recommend wrapping all SDK calls in a try/catch.
## Issuer
The Issuer functionality is used by a customer acting as an Issuer. It allows customers to perform actions such as issuing and revoking Credentials.

### registerIssuer
Register an issuer corresponding to your customer UUID and issuer API key provided by UnumID. As a customer, you can register as many issuers as you like (or none at all), depending on your use case. Note, however, that you'll need a unique issuer API key for each one.

You should store the DID (`did`) and encryption and signing key pairs (`keys`) that this returns. You'll need these to issue credentials to users.

Parameters:
```typescript
"name": string, // human readable name for issuer. Displayed to users in mobile apps when verifiers request credentials.
"customerUuid": string, // your customer UUID
"apiKey": string // your issuer API key
```

Response Body:  [**RegisteredIssuer**](https://docs.unum.id/Server-SDK-Typescript/interfaces/registeredissuer.html)
```typescript title="RegisteredIssuer"
{
  "uuid": string, // identifies issuer in Unum ID database
  "customerUuid": string, // identifies customer in Unum ID database
  "did": string, // identifies issuer in Unum ID ecosystem
  "name": string, // human-readable name for issuer
  "createdAt": string, // when issuer was registered
  "updatedAt": string, // when issuer was last updated
  "keys": {
    "signing": {
      "privateKey": string, // you use this to create signatures on credentials
      "publicKey": string, // subjects and verifiers use this to verify your signatures on credentials
    }
    "encryption": {
      "privateKey": string, // you use this to encrypt credentials you send to subjects
      "publicKey": string, // subjects use this to decrypt credentials they receive from you
    }
  }
}
```

### issueCredential
Issue a credential to a Subject, also known as a User.

You need to provide your Issuer DID (created when you registered), as well as your signing and encryption private keys, which the Issuer uses to sign and encrypt the credential. You need to specify a credential `type`, which verifiers will use to later request the credential from the user.

This returns a credential `id` that should be stored for reference. For example, the credential id is required to revoke the credential if need be. We would recommend storing the entire credential indexed on the resultant credential `id`. Note that there are also id fields within a `credentialSubject` and `credentialStatus`, but these are different. They refer to the subject DID and credential status identifier, respectively, as defined by the W3C spec [[1](https://www.w3.org/TR/vc-data-model/#credential-subject)],[[2](https://www.w3.org/TR/vc-data-model/#status)].

**Important**: The private keys never leave your app. This function, like all the others in this SDK, needs them in order to handle to cryptographic functionality on your behalf.

Parameters
```typescript
"type": string || string[], // The Credential type(s)
"issuer": string, // your issuer DID
"credentialSubject": {
  "id": string, // subject DID
  [key: string]: any, // data about subject (any valid JSON)
},
"signingPrivateKey": string // your issuer signing private key
"expirationDate"?: string, // (optional) when credential will no longer be valid (ISO 8601 date/time)
```

Response Body: [**Credential**](https://docs.unum.id/Server-SDK-Typescript/interfaces/credential.html)
```typescript title="Credential"
{
    "@context": ["https://www.w3.org/2018/credentials/v1"], // for conformance with W3C Verifiable Credential spec
    "credentialStatus": {
        "id": string, // a url for credential's status
        "type": "CredentialStatus"
    },
    "credentialSubject": {
        "id": string, // subject DID
        [key: string]: any, // // data about subject
    },
    "issuer": string, // issuer DID
    "type": string[], // credential type(s), always begins with "VerifiableCredential"
    "id": string, // identifies credential (version 4 UUID)
    "issuanceDate": string, // when credential was issued (ISO 8601 date/time)
    "expirationDate": string, // when credential will no longer be valid (ISO 8601 date-time)
    "proof": Proof // cryptographic proof created by signing credential with your issuer signing private key. Can be used to verify credential.
}
```

### updateCredentialStatus
Update a credential, i.e. make it invalid.

You need to provide the credential `id` (created when you issued the credential) and a [CredentialStatusOptions](https://docs.unum.id/types/modules.html#credentialstatusoptions) `status`. Currently the only valid status are: verified and revoked.

```typescript
export type CredentialStatusOptions = 'valid' | 'revoked';
```

Parameters
```typescript
{
  "credentialId": string // id of the credential
  "status": CredentialStatusOptions // status to update the credential to (defaults to 'revoked')
}
```

Response Body: **Empty**. If unsuccessful and exception will be thrown.
```typescript
{}
```

## Verifier
The Verifier functionality is used by a customer acting as a verifier. Most importantly, it allows customers to send PresentationRequests to the UnumID mobile SDK and to verify the encrypted Presentation responses.

### registerVerifier
Register a verifier corresponding to your customer UUID and verifier API key that UnumID provides. As a customer, you can register as many verifiers as you like (or none at all), depending on your use case. Note, however, that you'll need a unique verifier API key for each one.

You should store the DID (`did`) and signing key pair (`keys`) that this returns. You'll need these to create requests for (presentations of) credentials from users.

Parameters
```typescript
"name": string, // human readable name for verifier. Displayed to users in mobile apps when you make requests.
"customerUuid": string, // your customer UUID
"url": string, // the url of which UnumID's SaaS will interface with
"apiKey": string // your verifier API key
```

Response body: [**RegisteredVerifier**](https://docs.unum.id/Server-SDK-Typescript/interfaces/registeredverifier.html)
```typescript title="RegisteredVerifier"
{
  "uuid": string, // identifies verifier in Unum ID database
  "customerUuid": string, // identifies customer in Unum ID database
  "did": string, // identifiers verifier in Unum ID ecosystem
  "name": string, // human-readable name for verifier
  "createdAt": string, // when verifier was registered (ISO 8601 date/time)
  "updatedAt": string, // when verifier was last updated (ISO 8601 date/time)
  "keys": {
    "signing": {
      "privateKey": string, // you use this to create signatures on requests
      "publicKey": string, // subjects use this to verify your signatures on requests
    }, "encryption": {
      "privateKey": string, // you use this to decrypt presentations you receive from subjects
      "publicKey": string, // subjects use this to encrypt presentations they send to you
    }
  }
```


### sendRequest
Create a request for (a presentation of) credentials from a user.

You need to provide your verifier DID (created when you registered) and the UUID of the holder app from which the user can share the data. You also need to provide your signing private key, which the SDK uses to sign the request.

**Important**: The signing private key never leaves your app. This function, like all the others in this SDK, is solely using it to handle to cryptographic functionality on your behalf.

To request credentials, you need to populate one or more [CredentialRequest](https://docs.unum.id/types/interfaces/credentialrequest.html) objects, defined in the UnumID generic [types](https://github.com/UnumID/types/blob/00ba819e661e2856ba9909923ac6f083b9a15e85/index.d.ts#L113-L117) project and shown below.

```typescript
export interface CredentialRequest {
  type: string; // credential type. This must match type of previously issued credential.
  issuers: string[]; // list of DIDs for acceptable issuers. If multiple, any one is acceptable.
  required?: boolean; // (optional) if credential is required (default is true)
}
```
If you list more than one acceptable `issuers` (entities that issued the desired credential type), the user can share a credential issued by any of the ones listed.

Parameters
```typescript
"verifier": string, // your verifier DID
"credentialRequests": CredentialRequest[], // a list of one or more CredentialRequest objects. Encodes which credentials should be included in presentation that responds to PresentationRequest.
"signingPrivateKey": string, // your verifier signing private key
"holderAppUuid": string, // identifies mobile app subjects will share presentations from
"expiresAt"?: string, // (optional) when PresentationRequest will no longer be valid (ISO 8601 date/time). Default is 10 minutes after creation.
"metadata"?: object // (optional) any additional data to include in PresentationRequest
```

Response Body: [**PresentationRequestPostDto**](https://docs.unum.id/types/interfaces/presentationrequestpostdto.html)
```typescript title="PresentationRequestPostDto"
{
  "presentationRequest": {
    "uuid": string, // identifies PresentationRequest in Unum ID database
    "createdAt": string, // when PresentationRequest was created (ISO 8601 date/time)
    "updatedAt": string, // when PresentationRequest was last updated (ISO 8601 date/time). Should always be same as createdAt.
    "expiresAt": string, // when PresentationRequest will no longer be valid (ISO 8601 date/time)
    "verifier": string, // your verifier DID
    "credentialRequests": CredentialRequest[], // a list of one or more CredentialRequest objects. Encodes which credentials should be included in presentation that responds to PresentationRequest.
    "proof": Proof, // acryptographic proof created by signing PresentationRequest with your verifier signing private key. Can be used to verify PresentationRequest.
    "metadata": object // any additional data to include in PresentationRequest
  },
  "verifier": {
      "name": string, // human readable name for verifier. Displayed to users in mobile apps.
      "did": string, // your verifier DID
      "url": string // endpoint you use to receive presentations
  },
  "issuers": {
      "IssuerDid:string": { // map keyed on issuer DID(s) that issued requested credential(s)
        "name": string, // human readable name for issuer
        "did": string // issuer DID
      }
  },
  "holderApp": {
    "name": string, // human readable name for holder app. Displayed to users in the Web SDK.
    "uriScheme": string, // uri scheme to create deep links to the holder app.
    "deeplinkButtonImg": string // image for the Web SDK to display as a button, encoded as a data uri
  },
  /* You send this to a user with the Web SDK: */
  "deeplink": string, // deep link (URL) that can be used to trigger intended mobile app to load PresentationRequest
  /* You display this to a user with the Web SDK */
  "qrCode": string // QR code representation of deep link (encoded as data URL)
}
```

### verifyPresentation 
Handles decrypting the encrypted presentation and verifies the signatures are valid.

You need to be able to receive presentations from users and pass them to this function. To do this, you need to create a `/presentation` endpoint that conforms to our [OpenAPI specification](https://unumid.postman.co/workspace/Unum-ID-Team-Workspace~48b1f312-a6e6-4bcc-86a0-aa4bc37df9b4/api/09ad0ccd-c614-4d54-a1b4-ff9ae85b8449?version=c217a461-fc05-4476-a792-6c9163f2a198&tab=define). The Unum ID cloud sends encrypted presentations to this endpoint, which should pass those presentations to the `verifyPresentation` function to be decrypted and verified.

You need to provide:

1. your verifier did
2. your verifier encryption private key
3. encrypted presentation (received at `/presentation` endpoint)
4. (optional, but recommended) presentation request (received at `/presentation` endpoint)

The fist two are returned by [`registerVerifier`](#registerVerifier).

**Important** Although the mobile SDK sends the presentations directly to UnumID's SaaS, UnumID never has access to the credentials within the presentation. The mobile SDK encrypts all presentations with the presentation requesting verifier's public key, to which the requestor is the only ones with necessary decryption private key, the Verifier's `encryptionPrivateKey`, an attribute created with the registerVerifier call.

**Note** `presentationRequest` is optional in order for the server sdk can handle verifying presentations that may not have a corresponding request. However, if `presentationRequest` is supplied from UnumID's SaaS via the `/presentation` endpoint, it is strongly recommended that it is provided as it performs additional validation checks on your behalf.

Parameters
```typescript
"encryptedPresentation": EncryptedData, // encrypted presentation
"verifierDid": string, // your verifier DID
"encryptionPrivateKey": string // your verifier encryption private key
"presentationRequest"?: PresentationRequestDto // (optional) presentation request dto object to verify presentation credentials meet request requirements. This is an optional param to support the future use case of handling verifying presentations that are not in response to PresentationRequest
```


Response Body: [**DecryptedPresentation**](https://docs.unum.id/Server-SDK-Typescript/interfaces/decryptedpresentation.html)
```typescript title="DecryptedPresentation"
{
  "isVerified": boolean; // whether the presentation is valid
  "type": 'VerifiablePresentation' | 'NoPresentation' // type of presentation. NoPresentation means user declined request.
  "presentation": Presentation | NoPresentation, // decrypted Presentation (or NoPresentation) object
  "message"?: string; // (optional) included if isVerified is false. Explains why verification failed.
}
```

### sendSms
Use to send a deep link to a user by SMS. A templated message will be delivered from an UnumID associated phone number. You can of course use your own SMS sending service if you prefer.

To request (a presentation of) credentials from a user, you first create the request object and receive a deep link that references it. The user need to receive this deep link, which will open the correct app on their phone and prompt them to share the credentials. SMS is one convenient channel.

The SMS message will be in the format:
- Verification Request: [verifier_name]. Click here to complete: [deep_link]

**Note**: The verifier is corresponding to the presentation request from which the deeplink references. Because you are the acting verifier, the name will be what ever you provided as the name to [registerVerifier](###registerVerifier). 

Parameters
```typescript
{
  "to": string, // phone number to send SMS to
  "deeplink": string // the deeplink corresponding to the presentation request you would like served to the user
}
```

Response Body: **Empty**. If unsuccessful and exception will be thrown.
```typescript
{}
```

### sendEmail
Use to send a deep link to a user by email. A templated message will be delivered from no-reply@unum.id. You can of course use your own email sending service if you prefer.

To request (a presentation of) credentials from a user, you first create the request object and receive a deep link that references it. The user need to receive this deep link, which will open the correct app on their phone and prompt them to share the credentials. Email is one convenient channel, though keep in mind that the user will need to click the link from their phone for the deep link to work.

The email will be in the format:
  - *subject:* Verification Request: [verifier_name]
  - *body:* Click here to complete: [deep_link]

**Note**: The verifier is corresponding to the presentation request from which the deeplink references. Because you are the acting verifier, the name will be what ever you provided as the name to [registerVerifier](###registerVerifier). 

Parameters
```typescript
{
  "to": string, // email address to send email to
  "deeplink": string // the deeplink corresponding to the presentation request you would like served to the user
}
```

Response Body: **Empty**. If unsuccessful and exception will be thrown.
```typescript
{}
```

### checkCredentialStatus
Used to check the status of a credential. 

The `status` attribute of the response is of type [CredentialStatusOptions](https://docs.unum.id/types/modules.html#credentialstatusoptions). Currently the only valid status are: verified and revoked.

```typescript
export type CredentialStatusOptions = 'valid' | 'revoked';
```

Parameters
```typescript
{
  "credentialId": string, // the id of the credential in question
}
```

Response Body: **CredentialStatusInfo**. If unsuccessful and exception will be thrown.
```typescript
{
  "createdAt": Date; // the time  the credential was recorded as created in the UnumID SaaS db
  "updatedAt": Date; // the time  the credential was recorded as updated in the UnumID SaaS db
  "credentialId": string; // the did (aka id) of the credential this status is in regard to
  "status": CredentialStatusOptions; // a string literal type that currently only consists of 'valid' and 'revoked'
}
```

## Other Information
### Distribution

This project is publicly published on the official npm [registry](https://www.npmjs.com/package/@unumid/server-sdk). For example it can be pulled with, `npm i @unumid/server-sdk` or `yarn add @unumid/server-sdk`.

### Releases

Releases and publishing to NPM is automated via Github Actions CI job. In order to trigger a release one should push a git tag with a preceding `v` with semver notation, ie v1.1.1, to the `main` branch. This will trigger the CI job to bump the package version, generate typedocs, publish to NPM, make a release commit, and make a Github Release. The message of the git tag will be the release message so please make it meaningful. For example, `git tag v1.2.0 -m "Updated the SDK with a new CI job" && push origin v1.1.1`.

### Global Dependencies
- NodeJS v14.0.0 or higher, preferably v14.15.0 or higher
- yarn

### Logging
Logs level defaults to Info. One can set to debug for more information via the environment variable LOG_LEVEL, i.e. LOG_LEVEL=debug. We are using standard NPM log levels. More details on the various log levels [here](https://github.com/winstonjs/winston#logging-levels).

The logs default to stdout so can be aggregated using any log provider you would like from disk.

### Documentation
High level technical documentation can be found [here](https://https://docs.unum.id/server-sdk) which is served via [Docusaurus](https://github.com/UnumID/UnumID.github.io). More detailed generated from source documentation can be found [here](https://docs.unum.id/Server-SDK-Typescript/index.html) which is served via repo specific Github pages via the /docs folder of the main branch.

In order to generate the Typedoc documentation from the source code run the `createTypedocs.sh` script.
