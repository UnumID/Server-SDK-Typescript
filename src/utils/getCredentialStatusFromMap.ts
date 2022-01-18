
import { CredentialIdToStatusMap, CredentialStatusInfo } from '@unumid/types';
import { omit } from 'lodash';
import { CustError } from './error';

/**
 * Handler to get a credential status from the response of checkCredentialStatuses
 */
export const getCredentialStatusFromMap = (credentialId: string, statusMap: CredentialIdToStatusMap): CredentialStatusInfo => {
  if (typeof credentialId !== 'string') {
    throw new CustError(400, `credentialId is not a string: ${credentialId}`);
  }

  return statusMap[credentialId];
};
