import { configData } from '../config';
import { requireAuth } from '../requireAuth';

import { RESTData, UnumDto } from '../types';
import logger from '../logger';
import { CredentialStatusOptions, JSONObj, _CredentialStatusOptions } from '@unumid/types';
import { CustError } from '../utils/error';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';
import { isArrayEmpty, isArrayNotEmpty } from '../utils/helpers';
import { CredentialStatusesOptions } from '@unumid/types/build/protos/credential';
import { createListQueryString } from '../utils/queryStringHelper';

/**
 * Helper to validate request inputs.
 * @param req Request
 */
const validateInputs = (credentialIds: string[], status: CredentialStatusOptions): void => {
  // Credential ID is mandatory.
  if (isArrayEmpty(credentialIds)) {
    throw new CustError(400, 'credentialIds are required.');
  }

  try {
    _CredentialStatusOptions.check(status);
  } catch (e) {
    throw new CustError(400, 'status does not match a valid CredentialStatusOptions string literal.');
  }
};

/**
 * Handler to change a credential's status. It relays the updated credential metadata to UnumID's SaaS.
 * @param authorization string // auth string
 * @param credentialId string // id of credential to revoke
 * @param status CredentialStatusOptions // status to update the credential to (defaults to 'revoked')
 */
export const updateCredentialStatuses = async (authorization: string, credentialIds: string[], status: CredentialStatusOptions = 'revoked'): Promise<UnumDto<undefined>> => {
  try {
    requireAuth(authorization);

    validateInputs(credentialIds, status);

    // const data: CredentialStatusesOptions = {
    //   status,
    //   credentialIds
    // };
    // const data: CredentialStatusOptions = {
    //   status
    // };

    const query = createListQueryString('credentialId', credentialIds);

    const restData: RESTData = {
      method: 'PATCH',
      baseUrl: configData.SaaSUrl,
      endPoint: `credentialStatus?${query}`,
      header: { Authorization: authorization },
      data: { status }
    };

    // make request to SaaS to update the CredentialStatus
    const response: JSONObj = await makeNetworkRequest<{ success: boolean }>(restData);

    const authToken: string = handleAuthTokenHeader(response, authorization);

    const result: UnumDto<undefined> = {
      authToken,
      body: undefined
    };

    return result;
  } catch (error) {
    logger.error(`Error revoking a credential with UnumID SaaS. ${error}`);
    throw error;
  }
};
