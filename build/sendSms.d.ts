import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { AuthDto } from './types';
interface SmsRequestBody {
    to: string;
    msg: string;
}
export interface SmsResponseBody {
    success: boolean;
}
declare type SendSmsRequest = Request<ParamsDictionary, SmsResponseBody, SmsRequestBody>;
declare type SendSmsResponse = Response<SmsResponseBody>;
/**
 * Request middleware to send a SMS using UnumID's SaaS.
 * Designed to be used to present a deeplink.
 *
 * Note: This message will be delivered from an UnumID associated phone number.
 * @param req
 * @param res
 * @param next
 */
export declare const sendSmsRequest: (req: SendSmsRequest, res: SendSmsResponse, next: NextFunction) => Promise<void>;
/**
 * Handler to send a SMS using UnumID's SaaS.
 * Designed to be used to present a deeplink.
 *
 * @param authorization
 * @param to
 * @param msg
 */
export declare const sendSms: (authorization: string, to: string, msg: string) => Promise<AuthDto>;
export {};
//# sourceMappingURL=sendSms.d.ts.map