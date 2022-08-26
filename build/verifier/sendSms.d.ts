import { UnumDto } from '../types';
export interface SmsResponseBody {
    success: boolean;
}
/**
 * Handler to send a SMS using UnumID's SaaS.
 * Designed to be used with a deeplink which creates a templated message.
 * @param authorization
 * @param to
 * @param deeplink
 */
export declare const sendSms: (authorization: string, to: string, deeplink: string) => Promise<UnumDto<undefined>>;
//# sourceMappingURL=sendSms.d.ts.map