import { VerifierDto } from './types';
export interface SmsResponseBody {
    success: boolean;
}
/**
 * Handler to send a SMS using UnumID's SaaS.
 * Designed to be used to present a deeplink.
 *
 * @param authorization
 * @param to
 * @param msg
 */
export declare const sendSms: (authorization: string, to: string, msg: string) => Promise<VerifierDto<undefined>>;
//# sourceMappingURL=sendSms.d.ts.map