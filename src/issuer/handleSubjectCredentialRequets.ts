import { SubjectCredentialRequests, Credential } from '@unumid/types';
import { requireAuth } from '../requireAuth';
import { UnumDto, VerifiedStatus } from '../types';
import { reEncryptCredentials } from './reEncryptCredentials';
import { verifySubjectCredentialRequests } from './verifySubjectCredentialRequests';

/**
 * A subset of the inputs to reEncryptCredentials.
 * The complete set of inputs includes inputs shared by verifySubjectCredentialRequests and our first class attributes to HandleSubjectCredentialRequestsOptions.
 */
export interface HandleSubjectCredentialRequestsReEncryptOptions {
    signingPrivateKey: string,
    encryptionPrivateKey: string,
    issuerEncryptionKeyId: string,
    credentialTypes: string[]
}

export interface HandleSubjectCredentialRequestsOptions {
    authorization: string;
    issuerDid: string;
    subjectDid: string;
    subjectCredentialRequests: SubjectCredentialRequests;
    reEncryptCredentialsOptions: HandleSubjectCredentialRequestsReEncryptOptions;
}

/**
 * Verify the CredentialRequests signatures and handle calling reEncryptCredentials.
 * Returns the verifiedStatus if the SubjectCredentialRequests are not valid. Otherwise, returns the re-encrypted credentials response which contains the re-encrypted credentials.
 */
export async function handleSubjectCredentialRequests (options: HandleSubjectCredentialRequestsOptions): Promise<UnumDto<VerifiedStatus | Credential[]>> {
  const { authorization, issuerDid, subjectDid, subjectCredentialRequests, reEncryptCredentialsOptions: { signingPrivateKey, encryptionPrivateKey, issuerEncryptionKeyId, credentialTypes } } = options;

  requireAuth(authorization);

  const verifySubjectCredentialRequestsResult: UnumDto<VerifiedStatus> = await verifySubjectCredentialRequests(authorization, issuerDid, subjectDid, subjectCredentialRequests);
  const authToken = verifySubjectCredentialRequestsResult.authToken;
  const { isVerified } = verifySubjectCredentialRequestsResult.body;

  if (!isVerified) {
    return verifySubjectCredentialRequestsResult;
  }

  // handle sending back the ReceiptSubjectCredentialRequestVerifiedData receipt with the verification status
  const reEncryptCredentialsResult: UnumDto<Credential[]> = await reEncryptCredentials(authToken, issuerDid, subjectDid, signingPrivateKey, encryptionPrivateKey, issuerEncryptionKeyId, credentialTypes);

  return reEncryptCredentialsResult;
}
