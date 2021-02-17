import { configData } from '../config';
import { requireAuth } from '../requireAuth';

import { CustError, RESTData, makeNetworkRequest, JSONObj, handleAuthToken } from 'library-issuer-verifier-utility';
import { IssuerDto } from '../types';
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
 * Handler to revoke credentials. It relays the revoke credential metadata to UnumID's SaaS.
 * @param authorization
 * @param credentialId
 */
export const revokeCredential = async (authorization: string, credentialId: string): Promise<IssuerDto<undefined>> => {
  try {
    requireAuth(authorization);

    validateInputs(credentialId);

    const restData: RESTData = {
      method: 'PATCH',
      baseUrl: configData.SaaSUrl,
      endPoint: 'credentialStatus/' + credentialId,
      header: { Authorization: authorization },
      data: { status: 'revoked' }
    };

    // make request to SaaS to update the CredentialStatus
    const response: JSONObj = await makeNetworkRequest<{ success: boolean }>(restData);

    const authToken: string = handleAuthToken(response);

    const revokedCredential: IssuerDto<undefined> = {
      authToken,
      body: undefined
    };

    return revokedCredential;
  } catch (error) {
    logger.error('Error revoking a credential with UnumID SaaS', error);
    throw error;
  }
};
