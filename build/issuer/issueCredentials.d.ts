import { UnumDto } from '../types';
import { Credential } from '@unumid/library-issuer-verifier-utility';
import { CredentialSubject } from '@unumid/library-issuer-verifier-utility/build/types';
/**
 * Handles issuing a credential with UnumID's SaaS.
 *
 * @param authorization
 * @param type
 * @param issuer
 * @param credentialSubject
 * @param eccPrivateKey
 * @param expirationDate
 */
export declare const issueCredential: (authorization: string | undefined, type: string | string[], issuer: string, credentialSubject: CredentialSubject, eccPrivateKey: string, expirationDate?: Date | undefined) => Promise<UnumDto<Credential>>;
//# sourceMappingURL=issueCredentials.d.ts.map