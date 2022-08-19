import { DecryptedPresentation, UnumDto } from '../types';
import { EncryptedData } from '@unumid/types';
/**
 * Handler for verifying a provided encrypted Presentation.
 * @param authorization: string
 * @param encryptedPresentation: EncryptedData
 * @param verifierDid: string
 */
export declare const verifyPresentation: (authorization: string, encryptedPresentation: EncryptedData, verifierDid: string, encryptionPrivateKey: string, presentationRequest?: any) => Promise<UnumDto<DecryptedPresentation>>;
//# sourceMappingURL=verifyPresentation.d.ts.map