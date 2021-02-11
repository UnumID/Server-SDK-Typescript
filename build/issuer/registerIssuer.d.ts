import { RegisteredIssuer, IssuerDto } from '../types';
/**
 * Handles registering an Issuer with UnumID's SaaS.
 * @param name string
 * @param customerUuid string
 * @param apiKey string
 */
export declare const registerIssuer: (name: string, customerUuid: string, apiKey: string) => Promise<IssuerDto<RegisteredIssuer>>;
//# sourceMappingURL=registerIssuer.d.ts.map