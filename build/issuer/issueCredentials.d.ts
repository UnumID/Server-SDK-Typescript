import { UnumDto } from '../types';
import { CredentialSubject, Credential, CredentialPb, CredentialData } from '@unumid/types';
/**
 * Multiplexed handler for issuing credentials with UnumID's SaaS.
 * @param authorization
 * @param types
 * @param issuer
 * @param subjectDid
 * @param credentialDataList
 * @param signingPrivateKey
 * @param expirationDate
 * @returns
 */
export declare const issueCredentials: (authorization: string, issuer: string, subjectDid: string, credentialDataList: CredentialData[], signingPrivateKey: string, expirationDate?: Date | undefined) => Promise<UnumDto<(CredentialPb | Credential)[]>>;
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