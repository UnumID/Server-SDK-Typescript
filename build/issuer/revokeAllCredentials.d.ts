import { UnumDto } from '../types';
/**
 * Helper to revoke all credentials that the calling issuer (DID + signing private key) has issued a particular DID.
 * @param authorization string // auth string
 * @param credentialId string // id of credential to revoke
 * @param status CredentialStatusOptions // status to update the credential to (defaults to 'revoked')
 */
export declare const revokeAllCredentials: (authorization: string, issuerDid: string, signingPrivateKey: string, subjectDid: string) => Promise<UnumDto<undefined>>;
//# sourceMappingURL=revokeAllCredentials.d.ts.map