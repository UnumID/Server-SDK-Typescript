import { UnumDto, VerifiedStatus } from '../types';
import { PresentationPb } from '@unumid/types';
/**
 * Validates the NoPresentation type to ensure the necessary attributes.
 * @param noPresentation NoPresentation
 */
export declare const validateNoPresentationParams: (noPresentation: PresentationPb) => PresentationPb;
/**
 * Handler for when a user does not agree to share the information in the credential request.
 * @param authToken
 * @param noPresentation
 * @param verifier
 */
export declare const verifyNoPresentationHelper: (authToken: string, noPresentation: PresentationPb, verifier: string, requestUuid: string) => Promise<UnumDto<VerifiedStatus>>;
//# sourceMappingURL=verifyNoPresentationHelper.d.ts.map