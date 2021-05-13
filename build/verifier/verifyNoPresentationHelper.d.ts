import { UnumDto, VerifiedStatus } from '../types';
import { Presentation, PresentationPb } from '@unumid/types';
/**
 * Validates the NoPresentation type to ensure the necessary attributes.
 * @param noPresentation NoPresentation
 */
export declare const validateNoPresentationParams: (noPresentation: Presentation | PresentationPb) => void;
/**
 * Handler for when a user does not agree to share the information in the credential request.
 * @param authorization
 * @param noPresentation
 * @param verifier
 */
export declare const verifyNoPresentationHelper: (authorization: string, noPresentation: PresentationPb, verifier: string) => Promise<UnumDto<VerifiedStatus>>;
//# sourceMappingURL=verifyNoPresentationHelper.d.ts.map