import { DecryptedPresentation, UnumDto } from '../types';
import { EncryptedData } from 'library-issuer-verifier-utility';
/**
 * Handler to send information regarding the user agreeing to share a credential Presentation.
 * @param authorization: string
 * @param encryptedPresentation: EncryptedData
 * @param verifierDid: string
 */
export declare const verifyEncryptedPresentation: (authorization: string, encryptedPresentation: EncryptedData, verifierDid: string, encryptionPrivateKey: string) => Promise<UnumDto<DecryptedPresentation>>;
//# sourceMappingURL=verifyEncryptedPresentation.d.ts.map