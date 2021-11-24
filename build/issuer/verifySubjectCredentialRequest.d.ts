import { SubjectCredentialRequestVerifiedStatus, UnumDto } from '../types';
import { SubjectCredentialRequest } from '@unumid/types';
/**
 * Verify the CredentialRequests signatures.
 */
export declare function verifySubjectCredentialRequests(authorization: string, issuerDid: string, credentialRequests: SubjectCredentialRequest[]): Promise<UnumDto<SubjectCredentialRequestVerifiedStatus>>;
export declare function verifySubjectCredentialRequest(authorization: string, issuerDid: string, credentialRequest: SubjectCredentialRequest): Promise<UnumDto<SubjectCredentialRequestVerifiedStatus>>;
//# sourceMappingURL=verifySubjectCredentialRequest.d.ts.map