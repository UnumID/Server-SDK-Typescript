import { Receipt, VerifierDto } from '../types';
import { EncryptedData } from 'library-issuer-verifier-utility';
import { VerifiedStatus } from '..';
/**
 * Handler to send information regarding the user agreeing to share a credential Presentation.
 * @param authorization: string
 * @param encryptedPresentation: EncryptedData
 * @param verifierDid: string
 */
export declare const verifyEncryptedPresentation: (authorization: string, encryptedPresentation: EncryptedData, verifierDid: string, encryptionPrivateKey: string) => Promise<VerifierDto<Receipt | VerifiedStatus>>;
//# sourceMappingURL=verifyEncryptedPresentation.d.ts.map