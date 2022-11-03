import { UnumDto, VerifiedStatus } from '../types';
import { SubjectCredentialRequests } from '@unumid/types';
/**
 * Verify the CredentialRequests signatures.
 */
export declare function verifySubjectCredentialRequests(authorization: string, issuerDid: string, subjectDid: string, subjectCredentialRequests: SubjectCredentialRequests): Promise<UnumDto<VerifiedStatus>>;
/**
 * Validates the attributes for a credential request to UnumID's SaaS.
 * @param requests CredentialRequest
 */
export declare const validateSubjectCredentialRequests: (requests: SubjectCredentialRequests, subjectDid: string) => string;
//# sourceMappingURL=verifySubjectCredentialRequests.d.ts.map