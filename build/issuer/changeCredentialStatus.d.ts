import { UnumDto } from '../types';
import { CredentialStatusOptions } from '@unumid/types';
/**
 * Handler to change a credential's status. It relays the updated credential metadata to UnumID's SaaS.
 * @param authorization string // auth string
 * @param credentialId string // id of credential to revoke
 * @param status CredentialStatusOptions // status to update the credential to (defaults to 'revoked')
 */
export declare const changeCredentialStatus: (authorization: string, credentialId: string, status?: CredentialStatusOptions) => Promise<UnumDto<undefined>>;
//# sourceMappingURL=changeCredentialStatus.d.ts.map