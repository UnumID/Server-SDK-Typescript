import { SubjectCredentialRequests, Credential } from '@unumid/types';
import { UnumDto } from '../types';
/**
 * A subset of the inputs to reEncryptCredentials.
 * The complete set of inputs includes inputs shared by verifySubjectCredentialRequests and our first class attributes to HandleSubjectCredentialRequestsOptions.
 */
export interface HandleSubjectCredentialRequestsReEncryptOptions {
    signingPrivateKey: string;
    encryptionPrivateKey: string;
    issuerEncryptionKeyId: string;
    credentialTypes: string[];
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
export declare function handleSubjectCredentialRequests(options: HandleSubjectCredentialRequestsOptions): Promise<UnumDto<Credential[]>>;
//# sourceMappingURL=handleSubjectCredentialRequets.d.ts.map