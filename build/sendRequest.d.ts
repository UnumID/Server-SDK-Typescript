import * as express from 'express';
import { CredentialRequest, PresentationRequestResponse, SendRequestReqBody, SignedPresentationRequest, UnsignedPresentationRequest, UnumDto } from './types';
declare type SendRequestReqType = express.Request<Record<string, unknown>, PresentationRequestResponse, SendRequestReqBody>;
/**
 * Constructs an unsigned PresentationRequest from the incoming request body.
 * @param reqBody SendRequestReqBody
 */
export declare const constructUnsignedPresentationRequest: (reqBody: SendRequestReqBody) => UnsignedPresentationRequest;
/**
 * Signs an unsigned PresentationRequest and attaches the resulting Proof
 * @param unsignedPresentationRequest UnsignedPresentationRequest
 * @param privateKey String
 */
export declare const constructSignedPresentationRequest: (unsignedPresentationRequest: UnsignedPresentationRequest, privateKey: string) => SignedPresentationRequest;
/**
 * Request middleware for sending a PresentationRequest to UnumID's SaaS.
 *
 * Note: handler for /api/sendRequest route
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export declare const sendRequestRequest: (req: SendRequestReqType, res: express.Response<PresentationRequestResponse>, next: express.NextFunction) => Promise<void>;
/**
 * Handler for sending a PresentationRequest to UnumID's SaaS.
 * @param authorization
 * @param verifier
 * @param credentialRequests
 * @param eccPrivateKey
 * @param holderAppUuid
 */
export declare const sendRequest: (authorization: string, verifier: string, credentialRequests: CredentialRequest[], eccPrivateKey: string, holderAppUuid: string, expirationDate?: Date | undefined, metadata?: Record<string, unknown> | undefined) => Promise<UnumDto<PresentationRequestResponse>>;
export {};
//# sourceMappingURL=sendRequest.d.ts.map