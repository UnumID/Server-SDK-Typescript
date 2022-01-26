import { RegisteredVerifier, UnumDto } from '../types';
import { VersionInfo } from '@unumid/types';
/**
 * Handler for registering a Verifier with UnumID's SaaS.
 * @param customerUuid
 * @param url
 * @param apiKey
 * @param versionInfo
 */
export declare const registerVerifier: (apiKey: string, url: string, versionInfo?: VersionInfo[]) => Promise<UnumDto<RegisteredVerifier>>;
//# sourceMappingURL=registerVerifier.d.ts.map