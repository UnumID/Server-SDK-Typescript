import { UnumDto, VerifiedStatus } from '../types';
import { SignedDidDocument } from '@unumid/types';
/**
 * Verify the CredentialRequests signatures.
 */
export declare function verifySubjectDidDocument(authorization: string, issuerDid: string, didDocument: SignedDidDocument): Promise<UnumDto<VerifiedStatus>>;
export declare function verifyDidDocument(authorization: string, didDocument: SignedDidDocument): Promise<UnumDto<VerifiedStatus>>;
//# sourceMappingURL=verifyDidDocument.d.ts.map