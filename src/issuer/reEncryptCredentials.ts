import { configData } from '../config';
import { RESTData, UnumDto } from '../types';
import { requireAuth } from '../requireAuth';
import { Credential, JSONObj, CredentialPb, CredentialData, EncryptedCredentialEnrichedDto, CredentialSubject, PublicKeyInfo, IssueCredentialOptions } from '@unumid/types';

import { CustError } from '../utils/error';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';
import _ from 'lodash';
import { doDecrypt } from '../utils/decrypt';
import { constructIssueCredentialOptions, issueCredentials, sendEncryptedCredentials } from './issueCredentials';
import { sdkMajorVersion } from '../utils/constants';
import { extractCredentialType } from '../utils/extractCredentialType';
import { createListQueryString } from '../utils/queryStringHelper';
import { verifyCredentialHelper } from '../verifier/verifyCredential';
import logger from '../logger';
import { getDidDocPublicKeys } from '../utils/didHelper';
import { versionList } from '../utils/versionList';

/**
 * Helper to facilitate an issuer re-encrypting any credentials it has issued to a target subject.
 * This is useful in the case of needing to provide a subject credential data encrypted with a new RSA key id.
 *
 * @param authorization
 * @param issuerDid
 * @param signingPrivateKey
 * @param encryptionPrivateKey
 * @param subjectDid
 * @param issuerEncryptionKeyId
 * @param credentialTypes
 */
export const reEncryptCredentials = async (authorization: string, issuerDid: string, signingPrivateKey: string, encryptionPrivateKey: string, issuerEncryptionKeyId: string, subjectDid: string, credentialTypes: string[] = []): Promise<UnumDto<Credential[]>> => {
  // The authorization string needs to be passed for the SaaS to authorize getting the DID document associated with the holder / subject.
  requireAuth(authorization);

  // Validate inputs.
  validateInputs(issuerDid, signingPrivateKey, encryptionPrivateKey, subjectDid, issuerEncryptionKeyId);

  // create the did + fragment
  const issuerDidWithFragment = `${issuerDid}#${issuerEncryptionKeyId}`;

  // get all the credentials issued by the issuer to the subject
  const credentialsResponse: UnumDto<EncryptedCredentialEnrichedDto[]> = await getRelevantCredentials(authorization, issuerDidWithFragment, subjectDid, credentialTypes);
  authorization = credentialsResponse.authToken;
  const credentials = credentialsResponse.body;

  // result list to house the decrypted and verified credential data
  const credentialDataList: CredentialData[] = [];

  // grab all 'secp256r1' keys from the DID + fragment document for credential verification.
  const publicKeyInfoResponse: UnumDto<PublicKeyInfo[]> = await getDidDocPublicKeys(authorization, issuerDid, 'secp256r1');
  const publicKeyInfo: PublicKeyInfo[] = publicKeyInfoResponse.body;
  const authToken = publicKeyInfoResponse.authToken;

  // decrypt and verify the credentials
  const promises = [];
  const decryptedCredentials: {credential: CredentialPb, version: string}[] = [];
  for (const credential of credentials) {
    const { encryptedCredential: { version } } = credential;
    // decrypt the credential into a byte array
    const decryptedCredentialBytes = await doDecrypt(encryptionPrivateKey, credential.encryptedCredential.data);

    // create a protobuf Credential object from the byte array
    const decryptedCredential = CredentialPb.decode(decryptedCredentialBytes);
    decryptedCredentials.push({ credential: decryptedCredential, version });

    // verify the credential signature
    const isVerified = await verifyCredentialHelper(decryptedCredential, publicKeyInfo);
    if (!isVerified) {
      logger.warn(`Credential ${decryptedCredential.id} signature could not be verified. This should never happen and is very suspicious. Please contact UnumID support.`);
      continue;
    }

    // Now just need to re-encrypt the credential with the new subject DID key id.
    const reEncryptedCredentialOptions: IssueCredentialOptions = constructIssueCredentialOptions(decryptedCredential, publicKeyInfo, subjectDid, version);

    // send the EncryptedCredential to the SaaS
    const promise = sendEncryptedCredentials(authorization, { credentialRequests: [reEncryptedCredentialOptions] }, version);
    promises.push(promise);
  }

  // wait for all requests to finish or fail
  const results = await Promise.all(promises).catch((err) => {
    logger.error(`Error sending encrypted credentials to SaaS: ${err?.message || JSON.stringify(err)}`);
  });

  const latestVersion = versionList[versionList.length - 1];
  const resultantCredentials: Credential[] = decryptedCredentials.filter(cred => (cred.version === latestVersion)).map(cred => cred.credential as Credential);

  return {
    authToken: authorization, // TODO this needs to be the latest authToken from the results
    body: resultantCredentials
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
 * @param credentialTypes
 * @returns
 */
const getRelevantCredentials = async (authorization: string, issuerDidWithFragment: string, subjectDid: string, credentialTypes: string[]) :Promise<UnumDto<EncryptedCredentialEnrichedDto[]>> => {
  const typesQuery = createListQueryString('type', credentialTypes);

  const restData: RESTData = {
    method: 'GET',
    baseUrl: configData.SaaSUrl,
    endPoint: `credentialReIssuanceRepository/${encodeURIComponent(issuerDidWithFragment)}?subject=${encodeURIComponent(subjectDid)}&version=${encodeURIComponent(sdkMajorVersion)}&${typesQuery}`,
    header: { Authorization: authorization, version: sdkMajorVersion }
  };

  const restResp: JSONObj = await makeNetworkRequest(restData);

  const authToken: string = handleAuthTokenHeader(restResp, authorization as string);

  const encryptedCredentials: UnumDto<EncryptedCredentialEnrichedDto[]> = { body: restResp.body, authToken };

  return encryptedCredentials;
};
