import { configData } from '../config';
import { RESTData, UnumDto } from '../types';
import { requireAuth } from '../requireAuth';
import { Credential, JSONObj, CredentialPb, CredentialData, EncryptedCredentialDto } from '@unumid/types';

import { CustError } from '../utils/error';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';
import _ from 'lodash';
import { doDecrypt } from '../utils/decrypt';
import { issueCredentials } from './issueCredentials';

/**
 * Helper to facilitate an issuer re-encrypting any credentials it has issued to a target subject.
 * This is useful in the case of needing to provide a subject credential data encrypted with a new RSA key id.
 *
 * @param authorization
 * @param issuerDid
 * @param signingPrivateKey
 * @param encryptionPrivateKey
 * @param subjectDid
 */
export const reEncryptCredentials = async (authorization: string, issuerDid: string, signingPrivateKey: string, encryptionPrivateKey: string, subjectDid: string): Promise<UnumDto<(CredentialPb | Credential)[]>> => {
  // The authorization string needs to be passed for the SaaS to authorize getting the DID document associated with the holder / subject.
  requireAuth(authorization);

  // Validate inputs.
  validateInputs(issuerDid, subjectDid, signingPrivateKey);

  // // Get target Subject's DID document public keys for encrypting all the credentials issued.
  // const publicKeyInfoResponse: UnumDto<PublicKeyInfo[]> = await getDidDocPublicKeys(authorization, subjectDid, 'RSA');
  // const publicKeyInfos = publicKeyInfoResponse.body;
  // authorization = publicKeyInfoResponse.authToken;

  // get all the credentials issued by the issuer to the subject
  const credentials: EncryptedCredentialDto[] = getRelevantCredentials(authorization, issuerDid, subjectDid); // TODO

  // verify all the credentials

  // decrypt the credentials
  const credentialData: CredentialData[] = [];

  for (const credential of credentials) {
    // decrypt the credential into a byte array
    const decryptedCredentialBytes = await doDecrypt(encryptionPrivateKey, credential.data);

    // create a protobuf Credential object from the byte array
    const decryptedCredential = CredentialPb.decode(decryptedCredentialBytes);

    // extract the credential data from the credential for sake of re-issuance
    const credentialSubject = JSON.parse(decryptedCredential.credentialSubject);

    // omit the id which is added to credential data to make the subject
    const credentialData = _.omit(credentialSubject, 'id');

    // push the credential data to the array
    credentialData.push(credentialData);
  }

  // (re)issue the credentials to the target subject
  const reissuedCredentials = issueCredentials(authorization, issuerDid, subjectDid, credentialData, signingPrivateKey, undefined, false);
};

function validateInputs (issuerDid: string, subjectDid: string, signingPrivateKey: string) {
  if (!issuerDid) {
    throw new CustError(400, 'issuerDid is required.');
  }

  if (!subjectDid) {
    throw new CustError(400, 'subjectDid is required.');
  }

  if (!signingPrivateKey) {
    throw new CustError(400, 'signingPrivateKey is required.');
  }

  if (typeof issuerDid !== 'string') {
    throw new CustError(400, 'issuer must be a string.');
  }

  if (typeof subjectDid !== 'string') {
    throw new CustError(400, 'subjectDid must be a string.');
  }

  if (typeof signingPrivateKey !== 'string') {
    throw new CustError(400, 'signingPrivateKey must be a string.');
  }
}

/**
 * Helper to get the relevant credentials issued by the issuer for the subject of which the issuer also issued to self.
 * @param authorization
 * @param issuerDid w/ keyId
 * @param subjectDid
 * @returns
 */
const getRelevantCredentials = async (authorization: string, issuerDid: string, subjectDid: string) :Promise<UnumDto<void>> => {
  const restData: RESTData = {
    method: 'POST',
    baseUrl: configData.SaaSUrl,
    endPoint: 'credentialsRepositoryV2/',
    header: { Authorization: authorization, version },
    data: encryptedCredentialUploadOptions
  };

  const restResp: JSONObj = await makeNetworkRequest(restData);

  const authToken: string = handleAuthTokenHeader(restResp, authorization as string);

  const issuedCredential: UnumDto<void> = { body: restResp.body, authToken };

  return issuedCredential;
};
