import { UnumDto } from '../types';
/**
 * Handler to revoke credentials. It relays the revoke credential metadata to UnumID's SaaS.
 * @param authorization
 * @param credentialId
 */
export declare const revokeCredential: (authorization: string, credentialId: string) => Promise<UnumDto<undefined>>;
//# sourceMappingURL=revokeCredentials.d.ts.map