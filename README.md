# Verifier Server App

The Verifier Server App is used by a customer acting as a verifier and is run on their servers. It allows them to register verifiers and perform various actions as them, most importantly sending PresentationRequests and verifying Presentations.

## Docker For External Deployment / Packaging
### Build
`docker build -t verifier-app:latest .`

### Distribution

Currently this project is still closed source, so standard distribution options via public source code repository or a docker registry are not viable. However, in order to distribute access to the app it is advised to leverage Github repository deployment keys. 

#### Source code 

Github deployment keys allows fine grained, read-only access that is easy to manage with basic usage information. The interested party just needs to provide us with a RSA public key and we will give them read-only access to pull the source using that corresponding private key.

When open sourced this application can be distributed more naturally via a public a public git repository or package manager, i.e. npm.

#### Docker registry

##### Private Docker registry
This distribution option makes less sense than at first glance. While it is possible to host the images in a private registry, the need to provide access to the registry remains. Opting to simply give ready only access to the source code repo from which the image can be built and deploy. 

##### Public Docker registry
When open sourced this application can be distributed more naturally via a public Docker registry, DockerHub.

#### TAR file
##### Create a TAR file
Run `docker save verifier-app -o verifier-app.tar` to create a .tar file of the image

To create a gun zipped the tar file of the image:
`docker save verifier-app:latest | gzip > verifier-app_latest.tar.gz`

##### Unpacking the image TAR file
`docker load -i verifier.tar` which then adds the image to the local docker image list
## Installing and running the app
### Installation
- If distributed via a docker image tar file see the "Unpacking the image TAR file" section"
- Clone this repo, if open sourced.
- In the future, the app may also be hosted in a private docker registry and a public registry once open sourced.

## Running the app
### Global Dependencies
- NodeJS v14.0.0 or higher, preferably v14.15.0 or higher
- yarn

### Running the app directly
- In the Verifier-Server-App directory (or whatever directory it was cloned into)
- run `yarn` to install dependencies
- (optional) modify `config/config.json` to set the port the application will run on. (default is `8080`)
- (optional) run `yarn build` to transpile TypeScript. This is optional as this repository does include a pretranspiled `build` directory. If you changed the default port, you will need to do this step as well.
- run `node build/server.js` to start the application.

### Running the app with pm2
- install pm2 `yarn add pm2` or `yarn global add pm2`
- In the Verifier-Server-App directory (or whatever directory it was cloned into)
- run `yarn` to install dependencies
- (optional) modify `config/config.json` to set the port the application will run on. (default is `8080`)
- (optional) run `yarn build` to transpile TypeScript. This is optional as this repository does include a pretranspiled `build` directory. If you changed the default port, you will need to do this step as well.
- run `yarn pm2 start .` or yarn pm2 start build/server.js` to start the server with pm2

### Running with Docker
Default port 8080:
  `docker run --rm --name verifier -p 8080:8080 verifier-app:latest`

Specifying none default PORT env var 
  `docker run --rm --name verifier -e PORT=9090 -p 9090:9090 verifier-app:latest`

Specifying none default PORT env var and more verbose logging
  `docker run --rm --name verifier -e LOG_LEVEL=debug -e PORT=9090 -p 9090:9090 verifier-app:latest`

## Logging
One can set the log level via the env var LOG_LEVEL. It defaults to info. Set to debug for more information, i.e. LOG_LEVEL=debug.

More details on the various log levels [here](https://github.com/winstonjs/winston#logging-levels).

The logs default to stdout so can be aggregated and using any log provider you would like from disk.

## API functionality

### Register a Verifier
Verifiers are registered by sending a POST request to the `/api/register` API endpoint. Each verifier must be registered using a unique Verifier API Key.

Request body (JSON)
```typescript
{
  "name": string, // a human-readable name for the verifier. It will be displayed to users in the Holder when receiving a PresentationRequest.
  "customerUuid": string, // your Unum ID customer uuid
  "apiKey": string // a unique Verifier API key obtained from Unum ID
}
```

Response body (JSON)
```typescript
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
    }
  }
}
```

Response headers (success)
```
"x-auth-token": jwt // your Verifier Auth Token. It must be provided to authenticate future calls to act as the Verifier.
```

### Send a PresentationRequest
Send a PresentationRequest by sending a POST request to the `/api/sendRequest` API endpoint

Request Headers
```
"Authorization": Verifier Auth Token // the Verifier Auth Token recieved when you registered your Verifier
"Content-Type": "application/json"
```
Request Body (JSON)
```typescript
{
  "verifier": string, // your Verifier DID
  "credentialRequests": CredentialRequest[], // a list of one or more CredentialRequest objects. Describes the Credentials which should be shared to fulfill the PresentationRequest
  "eccPrivateKey": string, // your Verifier's Private Key
  "holderAppUuid": string, // identifies which Holder App the PresentationRequest should be sent to
  "expiresAt": string, // Optional. The date and time the PresentationRequest should expire. Default is 10 minutes after creation
  "metadata": object // any additional data to include in the PresentationRequest
}
```

Response Body (JSON)
```typescript
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
  "deeplink": string, // a deeplink that can be used to trigger the intended HolderApp to load the PresentationRequest
  "qrCode": string // a QR code containing the deeplink, encoded as a data URL
}
```

Response Headers
```
"x-auth-token": Verifier Auth Token // if this is different from the token you provided, it means your previous token expired and you were automatically issued a new one. You should replace it with this one for the next call.
```

### Verify a Presentation
Verify a Presentation by sending a POST request to the `/api/verifyPresentation` API endpoint

Request Headers
```
"Authorization": Verifier Auth Token // the Verifier Auth Token recieved when you registered your Verifier
"Content-Type": "application/json"
```

Request Body (JSON)
- The Presentation shared by a Holder


Response Body (JSON)
```typescript
{
  "verifiedStatus": boolean // true if the Presentation was successfully verified. false indicates that either 1. the Presentation proof is invalid, 2. One or more Credential proofs are invalid, 3. One or more Credentials are expired, or 4. One or more Credentials have been revoked.
}
```

Response Headers
```
"x-auth-token": Verifier Auth Token // if this is different from the token you provided, it means your previous token expired and you were automatically issued a new one. You should replace it with this one for the next call.
```

### Send an SMS
Send an SMS by sending a POST request to the `/api/sendSms` API endpoint

Request Headers
```
"Authorization": Verifier Auth Token // the Verifier Auth Token recieved when you registered your Verifier
"Content-Type": "application/json"
```

Request Body (JSON)
```typescript
{
  "to": string, // phone number to send the SMS to
  "msg": string // message to send
}
```

Response Headers
```
"x-auth-token": Verifier Auth Token // if this is different from the token you provided, it means your previous token expired and you were automatically issued a new one. You should replace it with this one for the next call.
```
### Send an Email
Send an email by sending a POST request to the `/api/sendEmail` API endpoint

Request Headers
```
"Authorization": Verifier Auth Token // the Verifier Auth Token recieved when you registered your Verifier
"Content-Type": "application/json"
```

Request Body (JSON)
```typescript
{
  "to": string, // target email
  "from": string, // from email
  "replyTo": string, // replyTo email
  "subject": string, // subject of the email
  "textBody": string, // email message body
}
```

Response Headers
```
"x-auth-token": Verifier Auth Token // if this is different from the token you provided, it means your previous token expired and you were automatically issued a new one. You should replace it with this one for the next call.
```

### Health
One can confirm that the app is running by using the `/health/alive` API endpoint. No auth necessary.