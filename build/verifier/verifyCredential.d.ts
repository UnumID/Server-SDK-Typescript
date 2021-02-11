import { VerifiableCredential } from '../types';
/**
 * Used to verify the credential signature given the corresponding Did document's public key.
 * @param credential
 * @param authorization
 */
export declare const verifyCredential: (credential: VerifiableCredential, authorization: string) => Promise<boolean>;
//# sourceMappingURL=verifyCredential.d.ts.map