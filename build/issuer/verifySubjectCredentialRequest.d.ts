import { SubjectCredentialRequestsVerifiedMetadata, UnumDto, VerifiedStatus } from '../types';
import { SubjectCredentialRequest } from '@unumid/types';
/**
 * Verify the CredentialRequests signatures.
 */
export declare function verifySubjectCredentialRequests(authorization: string, issuerDid: string, credentialRequests: SubjectCredentialRequest[]): Promise<UnumDto<VerifiedStatus<SubjectCredentialRequestsVerifiedMetadata>>>;
export declare function verifySubjectCredentialRequest(authorization: string, issuerDid: string, credentialRequest: SubjectCredentialRequest): Promise<UnumDto<VerifiedStatus>>;
//# sourceMappingURL=verifySubjectCredentialRequest.d.ts.map