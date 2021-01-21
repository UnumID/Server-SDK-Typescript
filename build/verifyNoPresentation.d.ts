import { NoPresentation, Receipt, VerifierDto } from './types';
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
export declare const verifyNoPresentation: (authorization: string, noPresentation: NoPresentation, verifier: string) => Promise<VerifierDto<Receipt>>;
//# sourceMappingURL=verifyNoPresentation.d.ts.map