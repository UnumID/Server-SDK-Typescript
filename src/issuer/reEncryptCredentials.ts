import { configData } from '../config';
import { RESTData, UnumDto } from '../types';
import { requireAuth } from '../requireAuth';
import { Credential, JSONObj, CredentialPb, CredentialData, EncryptedCredentialDto, EncryptedCredentialEnrichedDto, CredentialSubject } from '@unumid/types';

import { CustError } from '../utils/error';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';
import _ from 'lodash';
import { doDecrypt } from '../utils/decrypt';
import { issueCredentials } from './issueCredentials';
import { sdkMajorVersion } from '../utils/constants';
import { extractCredentialType } from '../utils/extractCredentialType';

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
export const reEncryptCredentials = async (authorization: string, issuerDid: string, signingPrivateKey: string, encryptionPrivateKey: string, subjectDid: string, issuerEncryptionKeyId: string): Promise<UnumDto<(CredentialPb | Credential)[]>> => {
  // The authorization string needs to be passed for the SaaS to authorize getting the DID document associated with the holder / subject.
  requireAuth(authorization);

  // Validate inputs.
  validateInputs(issuerDid, signingPrivateKey, encryptionPrivateKey, subjectDid, issuerEncryptionKeyId);

  /**
   * Not handling case with the issuer Enrollment Key Id is not passed currently.
  if (!issuerEncryptionKeyId) {
    // Get target Issuer's DID document public keys for the key id.
    const publicKeyInfoResponse: UnumDto<PublicKeyInfo[]> = await getDidDocPublicKeys(authorization, subjectDid, 'RSA');
    const publicKeyInfos = publicKeyInfoResponse.body;
    authorization = publicKeyInfoResponse.authToken;
  }
  */

  // create the did + fragment
  const issuerDidWithFragment = `${issuerDid}#${issuerEncryptionKeyId}`;

  // get all the credentials issued by the issuer to the subject
  const credentialsResponse: UnumDto<EncryptedCredentialEnrichedDto[]> = await getRelevantCredentials(authorization, issuerDidWithFragment, subjectDid);
  authorization = credentialsResponse.authToken;
  const credentials = credentialsResponse.body;

  // TODO: verify all the credentials

  // decrypt the credentials
  const credentialDataList: CredentialData[] = [];

  for (const credential of credentials) {
    // decrypt the credential into a byte array
    const decryptedCredentialBytes = await doDecrypt(encryptionPrivateKey, credential.encryptedCredential.data);

    // create a protobuf Credential object from the byte array
    const decryptedCredential = CredentialPb.decode(decryptedCredentialBytes);

    // extract the credential data from the credential for sake of re-issuance
    const credentialSubject = JSON.parse(decryptedCredential.credentialSubject) as CredentialSubject;

    // omit the id which is added to credential data to make the subject
    const credentialData = {
      ..._.omit(credentialSubject, 'id'),
      /**
       * HACK ALERT: assuming the credential type is ultimately only of length 2 with the first element being the 'VerifiableCredential' indicator.
       * This will need to be updated if we want to actually sport multiple credential types being defined in one credential.
       * However, lots of other parts of our product would have to updated too.
       */
      type: extractCredentialType(decryptedCredential.type)[0]
    };

    // push the credential data to the array
    credentialDataList.push(credentialData);
  }

  // (re)issue the credentials to the target subject
  const reissuedCredentials = await issueCredentials(authorization, issuerDid, subjectDid, credentialDataList, signingPrivateKey, undefined, false);

  return reissuedCredentials;
};

function validateInputs (issuerDid: string, signingPrivateKey: string, encryptionPrivateKey: string, subjectDid: string, issuerEncryptionKeyId: string) {
  if (!issuerDid) {
    throw new CustError(400, 'issuerDid is required.');
  }

  if (!subjectDid) {
    throw new CustError(400, 'subjectDid is required.');
  }

  if (!signingPrivateKey) {
    throw new CustError(400, 'signingPrivateKey is required.');
  }

  if (!encryptionPrivateKey) {
    throw new CustError(400, 'encryptionPrivateKey is required.');
  }

  if (!issuerEncryptionKeyId) {
    throw new CustError(400, 'issuerEncryptionKeyId is required.');
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

  if (typeof encryptionPrivateKey !== 'string') {
    throw new CustError(400, 'encryptionPrivateKey must be a string.');
  }

  if (typeof issuerEncryptionKeyId !== 'string') {
    throw new CustError(400, 'issuerEncryptionKeyId must be a string.');
  }
}

/**
 * Helper to get the relevant credentials issued by the issuer for the subject of which the issuer also issued to self.
 * @param authorization
 * @param issuerDid w/ keyId
 * @param subjectDid
 * @returns
 */
const getRelevantCredentials = async (authorization: string, issuerDidWithFragment: string, subjectDid: string) :Promise<UnumDto<EncryptedCredentialEnrichedDto[]>> => {
  const restData: RESTData = {
    method: 'GET',
    baseUrl: configData.SaaSUrl,
    endPoint: `credentialReIssuanceRepository/${encodeURIComponent(issuerDidWithFragment)}?subject=${encodeURIComponent(subjectDid)}&version=${encodeURIComponent(sdkMajorVersion)}`,
    header: { Authorization: authorization, version: sdkMajorVersion }
  };

  const restResp: JSONObj = await makeNetworkRequest(restData);

  const authToken: string = handleAuthTokenHeader(restResp, authorization as string);

  const encryptedCredentials: UnumDto<EncryptedCredentialEnrichedDto[]> = { body: restResp.body, authToken };

  return encryptedCredentials;
};
