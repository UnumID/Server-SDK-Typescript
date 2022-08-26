import { CredentialInfo } from '../types';
import { Presentation, PresentationPb } from '@unumid/types';
/**
 * Handler to extract credential reporting information meant to be relied to UnumID's SaaS for the enhanced analytics dashboard.
 * @param presentation // a post decrypted and verified presentation object;
 */
export declare const extractCredentialInfo: (presentation: Presentation | PresentationPb) => CredentialInfo;
//# sourceMappingURL=extractCredentialInfo.d.ts.map