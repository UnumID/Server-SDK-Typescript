import { UnumDto, VerifiedStatus } from '../types';
import { DID } from '@unumid/types';
/**
 * Verify the CredentialRequests signatures.
 */
export declare function verifySignedDid(authorization: string, issuerDid: string, signedDid: DID): Promise<UnumDto<VerifiedStatus>>;
//# sourceMappingURL=verifyDidDocument.d.ts.map