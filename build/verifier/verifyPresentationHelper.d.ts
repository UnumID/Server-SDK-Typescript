import { UnumDto, VerifiedStatus } from '../types';
import { CredentialRequest, PresentationPb } from '@unumid/types';
/**
 * Handler to send information regarding the user agreeing to share a credential Presentation.
 * @param authToken
 * @param presentation
 * @param verifier
 */
export declare const verifyPresentationHelper: (authToken: string, presentation: PresentationPb, verifier: string, credentialRequests: CredentialRequest[], requestUuid: string) => Promise<UnumDto<VerifiedStatus>>;
//# sourceMappingURL=verifyPresentationHelper.d.ts.map