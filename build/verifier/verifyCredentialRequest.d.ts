import { UnumDto, VerifiedStatus } from '../types';
import { SubjectCredentialRequest } from '@unumid/types';
/**
 * Verify the CredentialRequests signatures.
 */
export declare function verifyCredentialRequests(authorization: string, credentialRequests: SubjectCredentialRequest[]): Promise<UnumDto<VerifiedStatus>>;
//# sourceMappingURL=verifyCredentialRequest.d.ts.map