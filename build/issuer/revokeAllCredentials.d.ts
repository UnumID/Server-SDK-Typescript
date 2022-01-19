import { UnumDto } from '../types';
/**
 * Helper to revoke all credentials that the calling issuer (DID + signing private key) has issued a particular DID.
 * @param authorization
 * @param issuerDid
 * @param signingPrivateKey
 * @param subjectDid
 * @returns
 */
export declare const revokeAllCredentials: (authorization: string, issuerDid: string, signingPrivateKey: string, subjectDid: string) => Promise<UnumDto<undefined>>;
//# sourceMappingURL=revokeAllCredentials.d.ts.map