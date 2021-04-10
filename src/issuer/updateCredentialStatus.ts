import { configData } from '../config';
import { requireAuth } from '../requireAuth';

import { JSONObj, RESTData, UnumDto } from '../types';
import logger from '../logger';
import { CredentialStatusOptions, _CredentialStatusOptions } from '@unumid/types';
import { CustError } from '../utils/error';
import { handleAuthToken, makeNetworkRequest } from '../utils/networkRequestHelper';

/**
 * Helper to validate request inputs.
 * @param req Request
 */
const validateInputs = (credentialId: string, status: CredentialStatusOptions): void => {
  // Credential ID is mandatory.
  if (!credentialId) {
    throw new CustError(400, 'credentialId is required.');
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
export const updateCredentialStatus = async (authorization: string, credentialId: string, status: CredentialStatusOptions = 'revoked'): Promise<UnumDto<undefined>> => {
  try {
    requireAuth(authorization);

    validateInputs(credentialId, status);

    const restData: RESTData = {
      method: 'PATCH',
      baseUrl: configData.SaaSUrl,
      endPoint: 'credentialStatus/' + credentialId,
      header: { Authorization: authorization },
      data: { status }
    };

    // make request to SaaS to update the CredentialStatus
    const response: JSONObj = await makeNetworkRequest<{ success: boolean }>(restData);

    const authToken: string = handleAuthToken(response);

    const revokedCredential: UnumDto<undefined> = {
      authToken,
      body: undefined
    };

    return revokedCredential;
  } catch (error) {
    logger.error(`Error revoking a credential with UnumID SaaS. ${error}`);
    throw error;
  }
};
