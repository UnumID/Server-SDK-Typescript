import { configData } from '../config';
import { CredentialOptions, RESTData, UnumDto } from '../types';
import { requireAuth } from '../requireAuth';
import { CredentialSubject, EncryptedCredentialOptions, EncryptedData, Proof, UnsignedCredential, Credential, JSONObj } from '@unumid/types';

import logger from '../logger';
import { getDIDDoc, getKeyFromDIDDoc } from '../utils/didHelper';
import { doEncrypt } from '../utils/encrypt';
import { createProof } from '../utils/createProof';
import { getUUID } from '../utils/helpers';
import { CustError } from '../utils/error';
import { handleAuthToken, makeNetworkRequest } from '../utils/networkRequestHelper';
import { convertCredentialSubject } from '../utils/convertCredentialSubject';

/**
 * Creates an object of type EncryptedCredentialOptions which encapsulates information relating to the encrypted credential data
 * @param cred Credential
 * @param authorization String
 */
const constructEncryptedCredentialOpts = async (cred: Credential, authorization: string): Promise<EncryptedCredentialOptions[]> => {
  const credentialSubject: CredentialSubject = convertCredentialSubject(cred.credentialSubject);
  const subjectDid = credentialSubject.id;

  // resolve the subject's DID
  const didDocResponse = await getDIDDoc(configData.SaaSUrl, authorization, subjectDid);

  if (didDocResponse instanceof Error) {
    throw didDocResponse;
  }

  // get subject's public key info from its DID document
  const publicKeyInfos = getKeyFromDIDDoc(didDocResponse.body, 'RSA');

  if (publicKeyInfos.length === 0) {
    throw new CustError(404, 'Public key not found for the DID');
  }

  // create an encrypted copy of the credential with each RSA public key
  return publicKeyInfos.map(publicKeyInfo => {
    const subjectDidWithKeyFragment = `${subjectDid}#${publicKeyInfo.id}`;
    const encryptedData: EncryptedData = doEncrypt(subjectDidWithKeyFragment, publicKeyInfo, cred);

    const encryptedCredentialOptions: EncryptedCredentialOptions = {
      credentialId: cred.id,
      subject: subjectDidWithKeyFragment,
      issuer: cred.issuer,
      type: cred.type,
      data: encryptedData
    };

    return encryptedCredentialOptions;
  });
};

/**
 * Creates a signed credential with all the relevant information. The proof serves as a cryptographic signature.
 * @param usCred UnsignedCredential
 * @param privateKey String
 */
const constructSignedCredentialObj = (usCred: UnsignedCredential, privateKey: string): Credential => {
  const proof: Proof = createProof(usCred, privateKey, usCred.issuer, 'pem');
  const credential: Credential = {
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
const constructUnsignedCredentialObj = (credOpts: CredentialOptions): UnsignedCredential => {
  const credentialId: string = getUUID();
  const unsCredObj: UnsignedCredential = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    credentialStatus: {
      id: `${configData.SaaSUrl}/credentialStatus/${credentialId}`,
      type: 'CredentialStatus'
    },
    credentialSubject: JSON.stringify(credOpts.credentialSubject), // Converting the CredentialSubject type to a string for passing to holder. Really so iOS can handle it as a concrete type instead of a map of unknown keys.
    issuer: credOpts.issuer,
    type: ['VerifiableCredential', ...credOpts.type],
    id: credentialId,
    issuanceDate: new Date(),
    expirationDate: credOpts.expirationDate
  };

  return (unsCredObj);
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

const constructCredentialOptions = (type: string|string[], issuer: string, credentialSubject: CredentialSubject, signingPrivateKey: string, expirationDate?: Date): CredentialOptions => {
  // HACK ALERT: removing duplicate 'VerifiableCredential' if present in type string[]
  const typeList: string[] = ['VerifiableCredential'].concat(type); // Need to have some value in the "base" array so just just the keyword we are going to filter over.
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
 * Handles issuing a credential with UnumID's SaaS.
 *
 * @param authorization
 * @param type
 * @param issuer
 * @param credentialSubject
 * @param signingPrivateKey
 * @param expirationDate
 */
export const issueCredential = async (authorization: string | undefined, type: string | string[], issuer: string, credentialSubject: CredentialSubject, signingPrivateKey: string, expirationDate?: Date): Promise<UnumDto<Credential>> => {
  try {
    // The authorization string needs to be passed for the SaaS to authorize getting the DID document associated with the holder / subject.
    requireAuth(authorization);

    // Validate the inputs
    validateInputs(type, issuer, credentialSubject, signingPrivateKey, expirationDate);

    // Construct CredentialOptions object
    const credentialOptions = constructCredentialOptions(type, issuer, credentialSubject, signingPrivateKey, expirationDate);

    // Create the UnsignedCredential object
    const unsignedCredential = constructUnsignedCredentialObj(credentialOptions);

    // Create the signed Credential object from the unsignedCredential object
    const credential = constructSignedCredentialObj(unsignedCredential, signingPrivateKey);

    // Create the attributes for an encrypted credential. The authorization string is used to get the DID Document containing the subject's public key for encryption.
    const encryptedCredentialOptions = await constructEncryptedCredentialOpts(credential, authorization as string);

    const encryptedCredentialUploadOptions = {
      credentialId: credential.id,
      subject: credentialSubject.id,
      issuer: credential.issuer,
      type: credential.type,
      encryptedCredentials: encryptedCredentialOptions
    };

    const restData: RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'credentialRepository',
      header: { Authorization: authorization },
      data: encryptedCredentialUploadOptions
    };

    const restResp: JSONObj = await makeNetworkRequest(restData);

    const authToken: string = handleAuthToken(restResp);

    const issuedCredential: UnumDto<Credential> = { body: credential, authToken };

    return issuedCredential;
  } catch (error) {
    logger.error(`Error issuing a credential with UnumID SaaS. ${error}`);
    throw error;
  }
};
