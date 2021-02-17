import { NoPresentation, UnumDto } from '../types';
import { VerifiedStatus } from '..';
/**
 * Validates the NoPresentation type to ensure the necessary attributes.
 * @param noPresentation NoPresentation
 */
export declare const validateNoPresentationParams: (noPresentation: NoPresentation) => void;
/**
 * Handler for when a user does not agree to share the information in the credential request.
 * @param authorization
 * @param noPresentation
 * @param verifier
 */
export declare const verifyNoPresentation: (authorization: string, noPresentation: NoPresentation, verifier: string) => Promise<UnumDto<VerifiedStatus>>;
//# sourceMappingURL=verifyNoPresentation.d.ts.map