import { SubjectCredentialRequests, Credential } from '@unumid/types';
import logger from '../logger';
import { requireAuth } from '../requireAuth';
import { UnumDto, VerifiedStatus } from '../types';
import { CustError } from '../utils/error';
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

/**
 * Interface to encapsulate all the attributes necessary to fullfil a verifySubjectCredentialRequests and
 * a verifySubjectCredentialRequests in the helper function handleSubjectCredentialRequests
 */
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
export async function handleSubjectCredentialRequests (options: HandleSubjectCredentialRequestsOptions): Promise<UnumDto<Credential[]>> {
  logger.debug('handleSubjectCredentialRequests');
  const { authorization, issuerDid, subjectDid, subjectCredentialRequests, reEncryptCredentialsOptions: { signingPrivateKey, encryptionPrivateKey, issuerEncryptionKeyId, credentialTypes } } = options;

  requireAuth(authorization);

  const verifySubjectCredentialRequestsResult: UnumDto<VerifiedStatus> = await verifySubjectCredentialRequests(authorization, issuerDid, subjectDid, subjectCredentialRequests);
  const authToken = verifySubjectCredentialRequestsResult.authToken;
  const { isVerified, message } = verifySubjectCredentialRequestsResult.body;

  if (!isVerified) {
    // return verifySubjectCredentialRequestsResult;
    throw new CustError(500, message as string);
  }

  // handle sending back the ReceiptSubjectCredentialRequestVerifiedData receipt with the verification status
  const reEncryptCredentialsResult: UnumDto<Credential[]> = await reEncryptCredentials(authToken, issuerDid, subjectDid, signingPrivateKey, encryptionPrivateKey, issuerEncryptionKeyId, credentialTypes);

  logger.debug(`handleSubjectCredentialRequests resultant credentials re-encrypted: ${reEncryptCredentialsResult.body.map(cred => cred.type)}`);
  return reEncryptCredentialsResult;
}
