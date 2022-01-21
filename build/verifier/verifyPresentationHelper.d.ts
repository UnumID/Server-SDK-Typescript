import { UnumDto, VerifiedStatus } from '../types';
import { CredentialRequest, PresentationPb } from '@unumid/types';
/**
 * Handler to send information regarding the user agreeing to share a credential Presentation.
 * @param authorization
 * @param presentation
 * @param verifier
 */
export declare const verifyPresentationHelper: (authorization: string, presentation: PresentationPb, verifier: string, credentialRequests: CredentialRequest[], requestUuid: string) => Promise<UnumDto<VerifiedStatus>>;
//# sourceMappingURL=verifyPresentationHelper.d.ts.map