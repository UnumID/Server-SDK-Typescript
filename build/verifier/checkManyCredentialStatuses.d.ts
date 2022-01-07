/**
 * NOTE: This doesn't really belong under /verifier, as it may be used by anyone
 * (and in fact was written for use by subjects in the web wallet server)
 */
import { CredentialIdToStatusMap } from '@unumid/types';
import { UnumDto } from '../types';
/**
 * Function to check the status of one or more credentials by credentialId (valid, revoked, etc)
 * @param {string} authorization
 * @param {string[]} credentialIds
 * @returns {Promise<UnumDto<CredentialIdToStatusMap>>} a promise resolving to an UnumDto containing a list of zero or more CredentialStatuses
 */
export declare const checkManyCredentialStatuses: (authorization: string, credentialIds: string[]) => Promise<UnumDto<CredentialIdToStatusMap>>;
//# sourceMappingURL=checkManyCredentialStatuses.d.ts.map