import { UnumDto } from '../types';
import { Credential, CredentialPb } from '@unumid/types';
/**
 * Helper to facilitate an issuer re-encrypting any credentials it has issued to a target subject.
 * This is useful in the case of needing to provide a subject credential data encrypted with a new RSA key id.
 *
 * @param authorization
 * @param issuerDid
 * @param signingPrivateKey
 * @param encryptionPrivateKey
 * @param subjectDid
 */
export declare const reEncryptCredentials: (authorization: string, issuerDid: string, signingPrivateKey: string, encryptionPrivateKey: string, subjectDid: string, issuerEncryptionKeyId: string) => Promise<UnumDto<(CredentialPb | Credential)[]>>;
//# sourceMappingURL=reEncryptCredentials.d.ts.map