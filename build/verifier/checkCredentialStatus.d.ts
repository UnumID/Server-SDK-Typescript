import { CredentialStatusInfo, UnumDto } from '../types';
/**
 * Helper to check the status of a credential: verified, revoked, etc.
 * @param credential
 * @param authorization
 */
export declare const checkCredentialStatus: (credentialId: string, authorization: string) => Promise<UnumDto<CredentialStatusInfo>>;
//# sourceMappingURL=checkCredentialStatus.d.ts.map