import { CredentialStatusInfo, UnumDto } from '../types';
/**
 * @deprecated prefer checkCredentialStatuses
 * Helper to check the status of a credential: verified, revoked, etc.
 * @param credential
 * @param authorization
 */
export declare const checkCredentialStatus: (authorization: string, credentialId: string) => Promise<UnumDto<CredentialStatusInfo>>;
//# sourceMappingURL=checkCredentialStatus.d.ts.map