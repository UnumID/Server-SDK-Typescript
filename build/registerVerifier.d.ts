import { RegisteredVerifierDto } from './types';
/**
 * Handler for registering a Verifier with UnumID's SaaS.
 * @param name
 * @param customerUuid
 * @param url
 * @param apiKey
 */
export declare const registerVerifier: (name: string, customerUuid: string, url: string, apiKey: string) => Promise<RegisteredVerifierDto>;
//# sourceMappingURL=registerVerifier.d.ts.map