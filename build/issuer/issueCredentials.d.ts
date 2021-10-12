import { UnumDto } from '../types';
import { CredentialSubject, CredentialPb } from '@unumid/types';
/**
 * Multiplexed handler for issuing credentials with UnumID's SaaS.
 *
 * @param authorization
 * @param type
 * @param issuer
 * @param credentialSubject
 * @param signingPrivateKey
 * @param expirationDate
 */
export declare const issueCredentials: (authorization: string, type: string[], issuer: string, credentialSubjects: CredentialSubject[], signingPrivateKey: string, expirationDate?: Date | undefined) => Promise<UnumDto<CredentialPb[]>>;
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
export declare const issueCredential: (authorization: string, type: string | string[], issuer: string, credentialSubject: CredentialSubject, signingPrivateKey: string, expirationDate?: Date | undefined) => Promise<UnumDto<CredentialPb>>;
//# sourceMappingURL=issueCredentials.d.ts.map