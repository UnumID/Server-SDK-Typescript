import { CredentialStatus, CredentialStatusInfo, UnumDto } from '../types';
import { configData } from '../config';
import { makeNetworkRequest, handleAuthToken } from '../utils/networkRequestHelper';

/**
 * Helper to check the status of a credential: verified, revoked, etc.
 * @param credential
 * @param authorization
 */
export const checkCredentialStatus = async (authorization: string, credentialId: string): Promise<UnumDto<CredentialStatusInfo>> => {
  const options = {
    baseUrl: configData.SaaSUrl,
    endPoint: `credentialStatus/${credentialId}`,
    method: 'GET',
    header: { Authorization: authorization }
  };

  const credentialStatusResponse = await makeNetworkRequest<CredentialStatus>(options);
  const credentialStatus = credentialStatusResponse.body;
  const authToken: string = handleAuthToken(credentialStatusResponse);

  const result: UnumDto<CredentialStatusInfo> = {
    authToken,
    body: credentialStatus
  };

  return result;
};
