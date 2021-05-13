import { UnumDto } from '../types';
import { CredentialSubject, CredentialPb } from '@unumid/types';
/**
 * Handles issuing a credential with UnumID's SaaS.
 *
 * @param authorization
 * @param type
 * @param issuer
 * @param credentialSubject
 * @param signingPrivateKey
 * @param expirationDate
 */
export declare const issueCredential: (authorization: string | undefined, type: string | string[], issuer: string, credentialSubject: CredentialSubject, signingPrivateKey: string, expirationDate?: Date | undefined) => Promise<UnumDto<CredentialPb>>;
//# sourceMappingURL=issueCredentials.d.ts.map