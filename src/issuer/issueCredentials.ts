import { configData } from '../config';
import { CredentialOptions, RESTData, UnumDto } from '../types';
import { requireAuth } from '../requireAuth';
import { CredentialSubject, EncryptedCredentialOptions, EncryptedData, Proof, Credential, JSONObj, UnsignedCredentialPb, CredentialPb, ProofPb, PublicKeyInfo, CredentialData, IssueCredentialsRequest, WithVersion } from '@unumid/types';
import { UnsignedCredential as UnsignedCredentialV2, Credential as CredentialV2 } from '@unumid/types-v2';

import logger from '../logger';
import { getDidDocPublicKeys } from '../utils/didHelper';
import { doEncrypt } from '../utils/encrypt';
import { createProof, createProofPb } from '../utils/createProof';
import { getUUID } from '../utils/helpers';
import { CustError } from '../utils/error';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';
import { convertCredentialSubject } from '../utils/convertCredentialSubject';
import { gte, lt } from 'semver';
import { versionList } from '../utils/versionList';
import { CryptoError } from '@unumid/library-crypto';
import { getCredentialType } from '../utils/getCredentialType';
import { IssueCredentialRequest } from '@unumid/types/build/protos/credential';
import { omit } from 'lodash';

// interface to handle grouping Credentials and their encrypted form
interface CredentialPair {
  encryptedCredential: IssueCredentialRequest,
  credential: CredentialPb | Credential
}

/**
 * Creates an object of type EncryptedCredentialOptions which encapsulates information relating to the encrypted credential data
 * @param cred Credential
 * @param authorization String
 */
const constructEncryptedCredentialOpts = (cred: Credential | CredentialPb, publicKeyInfos: PublicKeyInfo[]): EncryptedCredentialOptions[] => {
  const credentialSubject: CredentialSubject = convertCredentialSubject(cred.credentialSubject);
  const subjectDid = credentialSubject.id;

  logger.debug(`Encrypting credential ${cred}`);
  // create an encrypted copy of the credential with each RSA public key
  return publicKeyInfos.map(publicKeyInfo => {
    const subjectDidWithKeyFragment = `${subjectDid}#${publicKeyInfo.id}`;
    const encryptedData: EncryptedData = doEncrypt(subjectDidWithKeyFragment, publicKeyInfo, cred);

    // Removing the w3c credential spec of "VerifiableCredential" from the Unum ID internal type for simplicity
    const credentialType = getCredentialType(cred.type);

    const encryptedCredentialOptions: EncryptedCredentialOptions = {
      credentialId: cred.id,
      subject: subjectDidWithKeyFragment,
      issuer: cred.issuer,
      type: credentialType,
      data: encryptedData
    };

    return encryptedCredentialOptions;
  });
};

/**
 * Creates a signed credential with all the relevant information. The proof serves as a cryptographic signature.
 * @param usCred UnsignedCredentialPb
 * @param privateKey String
 */
const constructSignedCredentialPbObj = (usCred: UnsignedCredentialPb, privateKey: string): CredentialPb => {
  try {
    // convert the protobuf to a byte array
    const bytes: Uint8Array = UnsignedCredentialPb.encode(usCred).finish();

    const proof: ProofPb = createProofPb(bytes, privateKey, usCred.issuer, 'pem');

    const credential: CredentialPb = {
      context: usCred.context,
      credentialStatus: usCred.credentialStatus,
      credentialSubject: usCred.credentialSubject,
      issuer: usCred.issuer,
      type: usCred.type,
      id: usCred.id,
      issuanceDate: usCred.issuanceDate,
      expirationDate: usCred.expirationDate,
      proof: proof
    };

    return (credential);
  } catch (e) {
    if (e instanceof CryptoError) {
      logger.error(`Issue in the crypto lib while creating credential ${usCred.id} proof. ${e}.`);
    } else {
      logger.error(`Issue while creating creating credential ${usCred.id} proof ${e}.`);
    }

    throw e;
  }
};

/**
 * Creates a signed credential with all the relevant information. The proof serves as a cryptographic signature.
 * @param usCred UnsignedCredential
 * @param privateKey String
 */
const constructSignedCredentialObj = (usCred: UnsignedCredentialV2, privateKey: string): CredentialV2 => {
  const proof: Proof = createProof(usCred, privateKey, usCred.issuer, 'pem');
  const credential: CredentialV2 = {
    '@context': usCred['@context'],
    credentialStatus: usCred.credentialStatus,
    credentialSubject: usCred.credentialSubject,
    issuer: usCred.issuer,
    type: usCred.type,
    id: usCred.id,
    issuanceDate: usCred.issuanceDate,
    expirationDate: usCred.expirationDate,
    proof: proof
  };

  return (credential);
};

/**
 * Creates all the attributes associated with an unsigned credential.
 * @param credOpts CredentialOptions
 */
const constructUnsignedCredentialPbObj = (credOpts: CredentialOptions): UnsignedCredentialPb => {
  // CredentialSubject type is dependent on version. V2 is a string for passing to holder so iOS can handle it as a concrete type instead of a map of unknown keys.
  const credentialSubject = JSON.stringify(credOpts.credentialSubject);
  const credentialId: string = getUUID();
  const unsCredObj: UnsignedCredentialPb = {
    context: ['https://www.w3.org/2018/credentials/v1'],
    credentialStatus: {
      id: `${configData.SaaSUrl}/credentialStatus/${credentialId}`,
      type: 'CredentialStatus'
    },
    credentialSubject,
    issuer: credOpts.issuer,
    type: ['VerifiableCredential', ...credOpts.type],
    id: credentialId,
    issuanceDate: new Date(),
    expirationDate: credOpts.expirationDate
  };

  return unsCredObj;
};

/**
 * Creates all the attributes associated with an unsigned credential.
 * @param credOpts CredentialOptions
 */
const constructUnsignedCredentialObj = (credOpts: CredentialOptions): UnsignedCredentialV2 => {
  // CredentialSubject type is dependent on version. V2 is a string for passing to holder so iOS can handle it as a concrete type instead of a map of unknown keys.
  const credentialSubject = JSON.stringify(credOpts.credentialSubject);
  const credentialId: string = getUUID();
  const unsCredObj: UnsignedCredentialV2 = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    credentialStatus: {
      id: `${configData.SaaSUrl}/credentialStatus/${credentialId}`,
      type: 'CredentialStatus'
    },
    credentialSubject,
    issuer: credOpts.issuer,
    type: ['VerifiableCredential', ...credOpts.type],
    id: credentialId,
    issuanceDate: new Date(),
    expirationDate: credOpts.expirationDate
  };

  return unsCredObj;
};

/**
 * Handle input validation.
 * @param type
 * @param issuer
 * @param credentialSubject
 * @param signingPrivateKey
 */
const validateInputs = (type: string|string[], issuer: string, credentialSubject: CredentialSubject, signingPrivateKey: string, expirationDate?: Date): void => {
  if (!type) {
    // type element is mandatory, and it can be either string or an array
    throw new CustError(400, 'type is required.');
  }

  if (!issuer) {
    throw new CustError(400, 'issuer is required.');
  }

  if (!credentialSubject) {
    throw new CustError(400, 'credentialSubject is required.');
  }

  if (!signingPrivateKey) {
    throw new CustError(400, 'signingPrivateKey is required.');
  }

  // id must be present in credentialSubject input parameter
  if (!credentialSubject.id) {
    throw new CustError(400, 'Invalid credentialSubject: id is required.');
  }

  if (!Array.isArray(type) && typeof type !== 'string') {
    throw new CustError(400, 'type must be an array or a string.');
  }

  if (typeof issuer !== 'string') {
    throw new CustError(400, 'issuer must be a string.');
  }

  if (typeof signingPrivateKey !== 'string') {
    throw new CustError(400, 'signingPrivateKey must be a string.');
  }

  // expirationDate must be a Date object and return a properly formed time. Invalid Date.getTime() will produce NaN
  if (expirationDate && (!(expirationDate instanceof Date) || isNaN(expirationDate.getTime()))) {
    throw new CustError(400, 'expirationDate must be a valid Date object.');
  }

  if (expirationDate && expirationDate < new Date()) {
    throw new CustError(400, 'expirationDate must be in the future.');
  }
};

/**
 * Multiplexed handler for issuing credentials with UnumID's SaaS.
 * @param authorization
 * @param types
 * @param issuer
 * @param subjectDid
 * @param credentialDataList
 * @param signingPrivateKey
 * @param expirationDate
 * @returns
 */
export const issueCredentials = async (authorization: string, issuer: string, subjectDid: string, credentialDataList: CredentialData[], signingPrivateKey: string, expirationDate?: Date): Promise<UnumDto<(CredentialPb | Credential)[]>> => {
  // validate credentialDataList
  validateCredentialDataList(credentialDataList);

  // Get target Subject's DID document public keys for encrypting all the credentials issued.
  const publicKeyInfos = await getDidDocPublicKeys(authorization, subjectDid);

  // loop through the types and credential data lists inputted to create CredentialPairs of each supported version for each
  const creds: WithVersion<CredentialPair>[] = [];

  for (let i = 0; i < credentialDataList.length; i++) {
    const type = credentialDataList[i].type;
    const credData = omit(credentialDataList[i], 'type');

    // construct the Credential's credentialSubject
    const credSubject: CredentialSubject = { id: subjectDid, ...credData };

    // construct the Credentials and their encrypted form for each supported version
    const credentialVersionPairs: CredentialPair[] = constructEncryptedCredentialOfEachVersion(authorization, type, issuer, credSubject, signingPrivateKey, publicKeyInfos, expirationDate);

    // add all credentialVersionPairs to creds array
    Array.prototype.push.apply(creds, credentialVersionPairs);
  }

  // loop through the versions list and send all the encrypted credentials to the saas grouped by version
  for (const version of versionList) {
    // only grab the encrypted credentials of the current version
    const resultantEncryptedCredentials: IssueCredentialRequest[] = creds.filter(credPair => credPair.version === version).map(credPair => credPair.encryptedCredential);

    const result = await sendEncryptedCredentials(authorization, { credentialRequests: resultantEncryptedCredentials }, version);
    authorization = result.authToken;
  }

  // grab all the credentials of the latest version from the CredentialPairs for the response
  const latestVersion = versionList[versionList.length - 1];
  const resultantCredentials: (Credential | CredentialPb)[] = creds.filter(credPair => credPair.version === latestVersion).map(credPair => credPair.credential);

  return {
    authToken: authorization,
    body: resultantCredentials
  };
};

/**
 * Handles issuing a credential with UnumID's SaaS.
 *
 * @param authorization
 * @param type
 * @param issuer
 * @param credentialSubject
 * @param signingPrivateKey
 * @param expirationDate
 */
export const issueCredential = async (authorization: string, type: string | string[], issuer: string, credentialSubject: CredentialSubject, signingPrivateKey: string, expirationDate?: Date): Promise<UnumDto<CredentialPb>> => {
  try {
    // The authorization string needs to be passed for the SaaS to authorize getting the DID document associated with the holder / subject.
    requireAuth(authorization);

    // Validate the inputs
    validateInputs(type, issuer, credentialSubject, signingPrivateKey, expirationDate);

    // Get target Subject's DID document public keys for encrypting all the credentials issued.
    const subjectDid = credentialSubject.id;
    const publicKeyInfos = await getDidDocPublicKeys(authorization, subjectDid);

    return issueCredentialHelper(authorization, type, issuer, credentialSubject, signingPrivateKey, publicKeyInfos, expirationDate);
  } catch (error) {
    logger.error(`Error issuing a credential with UnumID SaaS. ${error}`);
    throw error;
  }
};

/**
 * Helper to construct a Credential's CredentialOptions
 * @param type
 * @param issuer
 * @param credentialSubject
 * @param expirationDate
 * @returns
 */
const constructCredentialOptions = (type: string|string[], issuer: string, credentialSubject: CredentialSubject, expirationDate?: Date): CredentialOptions => {
  // HACK ALERT: removing duplicate 'VerifiableCredential' if present in type string[]
  const typeList: string[] = ['VerifiableCredential'].concat(type); // Need to have some value in the "base" array so just using the keyword we are going to filter over.
  const types = typeList.filter(t => t !== 'VerifiableCredential');

  const credOpt: CredentialOptions = {
    credentialSubject,
    issuer,
    type: types,
    expirationDate: expirationDate
  };

  return (credOpt);
};

/**
 * Helper to construct versioned CredentialPairs
 * @param authorization
 * @param type
 * @param issuer
 * @param credentialSubject
 * @param signingPrivateKey
 * @param publicKeyInfos
 * @param expirationDate
 * @returns
 */
const constructEncryptedCredentialOfEachVersion = (authorization: string, type: string | string[], issuer: string, credentialSubject: CredentialSubject, signingPrivateKey: string, publicKeyInfos: PublicKeyInfo[], expirationDate?: Date): WithVersion<CredentialPair>[] => {
  const credentialOptions = constructCredentialOptions(type, issuer, credentialSubject, expirationDate);

  const results: WithVersion<CredentialPair>[] = [];

  logger.debug(`credentialOptions: ${credentialOptions}`);
  /**
   * Need to loop through all versions except most recent so that can issued credentials could be backwards compatible with older holder versions.
   * However only care to return the most recent Credential type for customers to use.
   */
  for (let v = 0; v < versionList.length - 1; v++) { // note: purposely terminating one index early, which ought to be the most recent version.
    const version: string = versionList[v];

    if (gte(version, '2.0.0') && lt(version, '3.0.0')) {
      // Create latest version of the UnsignedCredential object
      const unsignedCredential: UnsignedCredentialV2 = constructUnsignedCredentialObj(credentialOptions);

      // Create the signed Credential object from the unsignedCredential object
      const credential: CredentialV2 = constructSignedCredentialObj(unsignedCredential, signingPrivateKey);

      // Create the encrypted credential issuance dto
      const encryptedCredentialUploadOptions: IssueCredentialRequest = constructIssueCredentialDto(credential, publicKeyInfos, credentialSubject.id);

      const credPair: WithVersion<CredentialPair> = {
        credential,
        encryptedCredential: encryptedCredentialUploadOptions,
        version
      };

      results.push(credPair);
    }
  }

  // Grabbing the latest version as defined in the version list, 3.0.0
  const latestVersion: string = versionList[versionList.length - 1];

  // Create latest version of the UnsignedCredential object
  const unsignedCredential = constructUnsignedCredentialPbObj(credentialOptions);

  // Create the signed Credential object from the unsignedCredential object
  const credential = constructSignedCredentialPbObj(unsignedCredential, signingPrivateKey);

  // Create the encrypted credential issuance dto
  const encryptedCredentialUploadOptions: IssueCredentialRequest = constructIssueCredentialDto(credential, publicKeyInfos, credentialSubject.id);

  const credPair: WithVersion<CredentialPair> = {
    credential,
    encryptedCredential: encryptedCredentialUploadOptions,
    version: latestVersion
  };

  results.push(credPair);

  return results;
};

/**
 * Helper to handle creating and sending encrypted credentials to Saas while sending back the latest credential version
 * @param authorization
 * @param type
 * @param issuer
 * @param credentialSubject
 * @param signingPrivateKey
 * @param publicKeyInfos
 * @param expirationDate
 * @returns
 */
const issueCredentialHelper = async (authorization: string, type: string | string[], issuer: string, credentialSubject: CredentialSubject, signingPrivateKey: string, publicKeyInfos: PublicKeyInfo[], expirationDate?: Date): Promise<UnumDto<CredentialPb>> => {
  // Construct CredentialOptions object
  const credentialOptions = constructCredentialOptions(type, issuer, credentialSubject, expirationDate);

  logger.debug(`credentialOptions: ${credentialOptions}`);
  /**
   * Need to loop through all versions except most recent so that can issued credentials could be backwards compatible with older holder versions.
   * However only care to return the most recent Credential type for customers to use.
   */
  for (let v = 0; v < versionList.length - 1; v++) { // note: purposely terminating one index early, which ought to be the most recent version.
    const version: string = versionList[v];

    if (gte(version, '2.0.0') && lt(version, '3.0.0')) {
      // Create latest version of the UnsignedCredential object
      const unsignedCredential: UnsignedCredentialV2 = constructUnsignedCredentialObj(credentialOptions);

      // Create the signed Credential object from the unsignedCredential object
      const credential: CredentialV2 = constructSignedCredentialObj(unsignedCredential, signingPrivateKey);

      // Create the encrypted credential issuance dto
      const encryptedCredentialUploadOptions: IssueCredentialRequest = constructIssueCredentialDto(credential, publicKeyInfos, credentialSubject.id);

      // Send encrypted credential to Saas
      const result = await sendEncryptedCredential(authorization, encryptedCredentialUploadOptions, version);

      // authorization = handleAuthTokenHeader(restResp, authorization as string);
      authorization = result.authToken;
    }
  }

  // Grabbing the latest version as defined in the version list, 3.0.0
  const latestVersion: string = versionList[versionList.length - 1];

  // Create latest version of the UnsignedCredential object
  const unsignedCredential = constructUnsignedCredentialPbObj(credentialOptions);

  // Create the signed Credential object from the unsignedCredential object
  const credential = constructSignedCredentialPbObj(unsignedCredential, signingPrivateKey);

  // Create the encrypted credential issuance dto
  const encryptedCredentialUploadOptions: IssueCredentialRequest = constructIssueCredentialDto(credential, publicKeyInfos, credentialSubject.id);

  // Send encrypted credential to Saas
  const result = await sendEncryptedCredential(authorization, encryptedCredentialUploadOptions, latestVersion);

  const issuedCredential: UnumDto<CredentialPb> = { body: credential, authToken: result.authToken };

  return issuedCredential;
};

/**
 * Helper to construct a IssueCredentialRequest prior to sending to the Saas
 * @param credential
 * @param publicKeyInfos
 * @param subjectDid
 * @returns
 */
const constructIssueCredentialDto = (credential: Credential | CredentialPb, publicKeyInfos: PublicKeyInfo[], subjectDid: string): IssueCredentialRequest => {
  // Create the attributes for an encrypted credential. The authorization string is used to get the DID Document containing the subject's public key for encryption.
  const encryptedCredentialOptions = constructEncryptedCredentialOpts(credential, publicKeyInfos);

  // Removing the w3c credential spec of "VerifiableCredential" from the Unum ID internal type for simplicity
  const credentialType = getCredentialType(credential.type);

  const encryptedCredentialUploadOptions: IssueCredentialRequest = {
    credentialId: credential.id,
    subject: subjectDid,
    issuer: credential.issuer,
    type: credentialType,
    encryptedCredentials: encryptedCredentialOptions
  };

  return encryptedCredentialUploadOptions;
};

/**
 * Helper to handle sending a single encrypted credential, IssueCredentialRequest, to the Saas
 * @param authorization
 * @param encryptedCredentialUploadOptions
 * @param version
 * @returns
 */
const sendEncryptedCredential = async (authorization: string, encryptedCredentialUploadOptions: IssueCredentialRequest, version: string) :Promise<UnumDto<void>> => {
  const restData: RESTData = {
    method: 'POST',
    baseUrl: configData.SaaSUrl,
    endPoint: 'credentialRepository',
    header: { Authorization: authorization, version },
    data: encryptedCredentialUploadOptions
  };

  const restResp: JSONObj = await makeNetworkRequest(restData);

  const authToken: string = handleAuthTokenHeader(restResp, authorization as string);

  const issuedCredential: UnumDto<void> = { body: restResp.body, authToken };

  return issuedCredential;
};

/**
 * Helper to send multiple encrypted credentials, IssueCredentialsRequest, to the Saas
 * @param authorization
 * @param encryptedCredentialUploadOptions
 * @param version
 * @returns
 */
const sendEncryptedCredentials = async (authorization: string, encryptedCredentialUploadOptions: IssueCredentialsRequest, version: string) :Promise<UnumDto<void>> => {
  const restData: RESTData = {
    method: 'POST',
    baseUrl: configData.SaaSUrl,
    endPoint: 'credentialsRepository',
    header: { Authorization: authorization, version },
    data: encryptedCredentialUploadOptions
  };

  const restResp: JSONObj = await makeNetworkRequest(restData);

  const authToken: string = handleAuthTokenHeader(restResp, authorization as string);

  const issuedCredential: UnumDto<void> = { body: restResp.body, authToken };

  return issuedCredential;
};

/**
 * Validates the credential data objects
 * @param credentialDataList
 */
function validateCredentialDataList (credentialDataList: CredentialData[]) {
  for (const data of credentialDataList) {
    if (!data.type) {
      throw new CustError(400, 'Credential Data needs to contain the credential type');
    }
  }
}
