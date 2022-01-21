import { UnumDto } from '../types';
import { CredentialPb } from '@unumid/types';
/**
 * Used to verify the credential signature given the corresponding Did document's public key.
 * @param credential
 * @param authorization
 */
export declare const verifyCredential: (authorization: string, credential: CredentialPb) => Promise<UnumDto<boolean>>;
//# sourceMappingURL=verifyCredential.d.ts.map