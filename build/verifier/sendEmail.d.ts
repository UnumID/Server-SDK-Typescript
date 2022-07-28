import { UnumDto } from '../types';
export interface EmailResponseBody {
    success: boolean;
}
/**
 * Handler to send an email using UnumID's SaaS.
 * Designed to be used with a deeplink which creates a templated message.
 * @param authorization
 * @param to
 * @param deeplink
 */
export declare const sendEmail: (authorization: string, to: string, deeplink: string) => Promise<UnumDto<undefined>>;
//# sourceMappingURL=sendEmail.d.ts.map