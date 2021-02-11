import { VerifiableCredential } from '../types';
/**
 * Helper to check the status of a credential: verified, revoked, etc.
 * @param credential
 * @param authHeader
 */
export declare const checkCredentialStatus: (credential: VerifiableCredential, authHeader: string) => Promise<boolean>;
//# sourceMappingURL=checkCredentialStatus.d.ts.map