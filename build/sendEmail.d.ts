import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { AuthDto } from './types';
interface EmailRequestBody {
    to: string;
    subject: string;
    textBody?: string;
    htmlBody?: string;
}
export interface EmailResponseBody {
    success: boolean;
}
declare type SendEmailRequest = Request<ParamsDictionary, EmailResponseBody, EmailRequestBody>;
declare type SendEmailResponse = Response<EmailResponseBody>;
/**
 * Request middleware to send an email using UnumID's SaaS.
 *
 * Note: the email with have a from attribute: no-reply@unumid.org
 * If you would like to have your own domain you will need to handle this email functionality independently.
 * @param req SendEmailRequest
 * @param res SendEmailResponse
 * @param next NextFunction
 */
export declare const sendEmailRequest: (req: SendEmailRequest, res: SendEmailResponse, next: NextFunction) => Promise<void>;
/**
 * Handler to send an email using UnumID's SaaS.
 * @param authorization
 * @param to
 * @param subject
 * @param textBody
 * @param htmlBody
 */
export declare const sendEmail: (authorization: string, to: string, subject: string, textBody: string, htmlBody: string) => Promise<AuthDto>;
export {};
//# sourceMappingURL=sendEmail.d.ts.map