import * as express from 'express';
import { Presentation, ReceiptDto } from './types';
/**
 * Type to encapsulate the verify presentation request type attributes.
 */
declare type VerifyPresentationRequestType = express.Request<unknown, {
    verifiedStatus: boolean;
}, {
    presentation: Presentation;
    verifier: string;
}>;
/**
 * Request middleware for sending information regarding the user agreeing to share a credential Presentation.
 *
 * Note: The request body is exactly the information sent by the mobile SDK serving the prompt via the deeplink for credential sharing to your application.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export declare const verifyPresentationRequest: (req: VerifyPresentationRequestType, res: express.Response, next: express.NextFunction) => Promise<void>;
/**
 * Handler to send information regarding the user agreeing to share a credential Presentation.
 * @param authorization
 * @param presentation
 * @param verifier
 */
export declare const verifyPresentation: (authorization: string, presentation: Presentation, verifier: string) => Promise<ReceiptDto>;
export {};
//# sourceMappingURL=verifyPresentation.d.ts.map