import { configData } from '../config';
import { CredentialOptions, RESTData, UnumDto } from '../types';
import { requireAuth } from '../requireAuth';
import { CredentialSubject, EncryptedCredentialOptions, EncryptedData, Proof, Credential, JSONObj, UnsignedCredentialPb, CredentialPb, ProofPb, PublicKeyInfo, CredentialData, IssueCredentialsOptions, WithVersion, IssueCredentialOptions, EncryptedCredentialDto } from '@unumid/types';
import { UnsignedCredential as UnsignedCredentialV2, Credential as CredentialV2 } from '@unumid/types-v2';

import logger from '../logger';
import { getDidDocPublicKeys } from '../utils/didHelper';
import { doEncrypt, doEncryptPb } from '../utils/encrypt';
import { createProof, createProofPb } from '../utils/createProof';
import { getUUID } from '../utils/helpers';
import { CustError } from '../utils/error';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';
import { convertCredentialSubject } from '../utils/convertCredentialSubject';
import { gte, lt } from 'semver';
import { versionList } from '../utils/versionList';
import { CryptoError } from '@unumid/library-crypto';
import { getCredentialType } from '../utils/getCredentialType';
import { omit } from 'lodash';
import { v4 } from 'uuid';
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

  // Get target Subject's DID document public keys for encrypting all the credentials issued.
  const publicKeyInfoResponse: UnumDto<PublicKeyInfo[]> = await getDidDocPublicKeys(authorization, subjectDid, 'RSA');
  const publicKeyInfos = publicKeyInfoResponse.body;
  authorization = publicKeyInfoResponse.authToken;

  // get all the credentials issued by the issuer to the subject
  const credentials: EncryptedCredentialDto[] = []; // TODO

  // decrypt the credentials
  const decryptedCredentials: CredentialPb[] = [];

  for (const credential of credentials) {
    // decrypt the credential into a byte array
    const decryptedCredentialBytes = await doDecrypt(encryptionPrivateKey, credential.data);

    // create a protobuf Credential object from the byte array
    const decryptedCredential = CredentialPb.decode(decryptedCredentialBytes);

    decryptedCredentials.push(decryptedCredential);
  }

  // (re)issue the credentials to the target subject
  const reissuedCredentials = issueCredentials(authorization, issuerDid, subjectDid, decryptedCredentials, signingPrivateKey, false);
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
