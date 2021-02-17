import { RegisteredIssuer, UnumDto } from '../types';
/**
 * Handles registering an Issuer with UnumID's SaaS.
 * @param name string
 * @param customerUuid string
 * @param apiKey string
 */
export declare const registerIssuer: (name: string, customerUuid: string, apiKey: string) => Promise<UnumDto<RegisteredIssuer>>;
//# sourceMappingURL=registerIssuer.d.ts.map