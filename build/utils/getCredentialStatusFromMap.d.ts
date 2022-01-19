import { CredentialIdToStatusMap, CredentialStatusInfo } from '@unumid/types';
/**
 * Handler to get a credential status from the response of checkCredentialStatuses.
 *
 * Not much of a utility but very helpful in order to mock response of checkCredentialStatuses in unit tests.
 */
export declare const getCredentialStatusFromMap: (credentialId: string, statusMap: CredentialIdToStatusMap) => CredentialStatusInfo;
//# sourceMappingURL=getCredentialStatusFromMap.d.ts.map