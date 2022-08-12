import { UnumDto } from '../types';
import { CredentialPb, PublicKeyInfo } from '@unumid/types';
/**
 * Used to verify the credential signature after fetching the Did document's public key(s).
 * @param credential
 * @param authorization
 */
export declare const verifyCredential: (authorization: string, credential: CredentialPb) => Promise<UnumDto<boolean>>;
/**
 * Used to verify the credential signature given the corresponding Did document's public key(s).
 * @param credential
 * @param authorization
 */
export declare const verifyCredentialHelper: (credential: CredentialPb, publicKeyInfoList: PublicKeyInfo[]) => boolean;
//# sourceMappingURL=verifyCredential.d.ts.map