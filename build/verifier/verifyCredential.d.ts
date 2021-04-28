import { UnumDto } from '../types';
import { Credential } from '@unumid/types';
/**
 * Used to verify the credential signature given the corresponding Did document's public key.
 * @param credential
 * @param authorization
 */
export declare const verifyCredential: (credential: Credential, authorization: string) => Promise<UnumDto<boolean>>;
//# sourceMappingURL=verifyCredential.d.ts.map