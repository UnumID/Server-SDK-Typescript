import { UnumDto } from '../types';
export interface EmailResponseBody {
    success: boolean;
}
/**
 * Handler to send an email using UnumID's SaaS.
 * @param authorization
 * @param to
 * @param subject
 * @param textBody
 * @param htmlBody
 */
export declare const sendEmail: (authorization: string, to: string, subject: string, textBody?: string | undefined, htmlBody?: string | undefined) => Promise<UnumDto<undefined>>;
//# sourceMappingURL=sendEmail.d.ts.map