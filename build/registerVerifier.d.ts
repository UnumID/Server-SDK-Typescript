import * as express from 'express';
import { RegisteredVerifierDto } from './types';
/**
 * Request middleware for registering a Verifier with UnumID's SaaS.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export declare const registerVerifierRequest: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>;
/**
 * Handler for registering a Verifier with UnumID's SaaS.
 * @param name
 * @param customerUuid
 * @param url
 * @param apiKey
 */
export declare const registerVerifier: (name: string, customerUuid: string, url: string, apiKey: string) => Promise<RegisteredVerifierDto>;
//# sourceMappingURL=registerVerifier.d.ts.map