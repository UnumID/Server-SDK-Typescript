import { UnumDto, VerifiedStatus } from '../types';
import { SubjectCredentialRequest } from '@unumid/types';
/**
 * Verify the CredentialRequests signatures.
 */
export declare function verifySubjectCredentialRequests(authorization: string, issuerDid: string, subjectDid: string, credentialRequests: SubjectCredentialRequest[]): Promise<UnumDto<VerifiedStatus>>;
export declare function verifySubjectCredentialRequest(authorization: string, issuerDid: string, subjectDid: string, credentialRequest: SubjectCredentialRequest): Promise<UnumDto<VerifiedStatus>>;
//# sourceMappingURL=verifySubjectCredentialRequests.d.ts.map