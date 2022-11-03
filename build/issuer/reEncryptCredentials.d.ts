import { UnumDto } from '../types';
import { Credential } from '@unumid/types';
/**
 * Helper to facilitate an issuer re-encrypting any credentials it has issued to a target subject.
 * This is useful in the case of needing to provide a subject credential data encrypted with a new RSA key id.
 *
 * @param authorization
 * @param issuerDid
 * @param signingPrivateKey
 * @param encryptionPrivateKey
 * @param subjectDidWithFragment
 * @param issuerEncryptionKeyId
 * @param credentialTypes
 */
export declare const reEncryptCredentials: (authorization: string, issuerDid: string, signingPrivateKey: string, encryptionPrivateKey: string, issuerEncryptionKeyId: string, subjectDidWithFragment: string, credentialTypes?: string[]) => Promise<UnumDto<Credential[]>>;
//# sourceMappingURL=reEncryptCredentials.d.ts.map