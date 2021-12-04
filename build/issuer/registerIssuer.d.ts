import { RegisteredIssuer, UnumDto } from '../types';
import { VersionInfo } from '@unumid/types';
/**
 * Handles registering an Issuer with UnumID's SaaS.
 * @param customerUuid
 * @param apiKey
 */
export declare const registerIssuer: (customerUuid: string, apiKey: string, url: string, versionInfo?: VersionInfo[]) => Promise<UnumDto<RegisteredIssuer>>;
//# sourceMappingURL=registerIssuer.d.ts.map