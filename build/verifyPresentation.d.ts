import { Presentation, Receipt, UnumDto } from './types';
/**
 * Handler to send information regarding the user agreeing to share a credential Presentation.
 * @param authorization
 * @param presentation
 * @param verifier
 */
export declare const verifyPresentation: (authorization: string, presentation: Presentation, verifier: string) => Promise<UnumDto<Receipt>>;
//# sourceMappingURL=verifyPresentation.d.ts.map