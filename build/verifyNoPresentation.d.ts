import { Request, Response, NextFunction } from 'express';
import { NoPresentation, ReceiptDto } from './types';
/**
 * Validates the NoPresentation type to ensure the necessary attributes.
 * @param noPresentation NoPresentation
 */
export declare const validateNoPresentationParams: (noPresentation: NoPresentation) => void;
/**
 * Request middleware to handle a user not agreeing to share the information in the credential request.
 *
 * Note: The request body is exaclty the information sent by the mobile SDK serving the prompt via the deeplink for credential sharing to your application.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export declare const verifyNoPresentationRequest: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Handler for when a user does not agree to share the information in the credential request.
 * @param authorization
 * @param noPresentation
 * @param verifier
 */
export declare const verifyNoPresentation: (authorization: string, noPresentation: NoPresentation, verifier: string) => Promise<ReceiptDto>;
//# sourceMappingURL=verifyNoPresentation.d.ts.map