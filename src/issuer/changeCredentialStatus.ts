import { configData } from '../config';
import { requireAuth } from '../requireAuth';

import { CustError, RESTData, makeNetworkRequest, JSONObj, handleAuthToken } from '@unumid/library-issuer-verifier-utility';
import { UnumDto } from '../types';
import { CredentialStatusOptions } from '@unumid/types';
import logger from '../logger';

/**
 * Helper to validate request inputs.
 * @param req Request
 */
const validateInputs = (credentialId: string): void => {
  // Credential ID is mandatory.
  if (!credentialId) {
    throw new CustError(400, 'credentialId is required.');
  }
};

/**
 * Handler to change a credential's status. It relays the updated credential metadata to UnumID's SaaS.
 * @param authorization string // auth string
 * @param credentialId string // id of credential to revoke
 * @param status CredentialStatusOptions // status to update the credential to (defaults to 'revoked')
 */
export const changeCredentialStatus = async (authorization: string, credentialId: string, status: CredentialStatusOptions = 'revoked'): Promise<UnumDto<undefined>> => {
  try {
    requireAuth(authorization);

    validateInputs(credentialId);

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
