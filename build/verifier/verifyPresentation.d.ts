import { DecryptedPresentation, UnumDto } from '../types';
import { PresentationRequestDto } from '@unumid/types';
import { EncryptedData } from '@unumid/library-issuer-verifier-utility';
/**
 * Handler to send information regarding the user agreeing to share a credential Presentation.
 * @param authorization: string
 * @param encryptedPresentation: EncryptedData
 * @param verifierDid: string
 */
export declare const verifyPresentation: (authorization: string, encryptedPresentation: EncryptedData, verifierDid: string, encryptionPrivateKey: string, presentationRequest?: PresentationRequestDto | undefined) => Promise<UnumDto<DecryptedPresentation>>;
//# sourceMappingURL=verifyPresentation.d.ts.map