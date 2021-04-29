import { RegisteredVerifier, UnumDto } from '../types';
import { VersionInfo } from '@unumid/types';
/**
 * Handler for registering a Verifier with UnumID's SaaS.
 * @param name
 * @param customerUuid
 * @param url
 * @param apiKey
 * @param versionInfo
 */
export declare const registerVerifier: (name: string, customerUuid: string, url: string, apiKey: string, versionInfo?: VersionInfo[]) => Promise<UnumDto<RegisteredVerifier>>;
//# sourceMappingURL=registerVerifier.d.ts.map