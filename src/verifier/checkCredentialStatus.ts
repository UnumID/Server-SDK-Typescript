import { handleAuthToken, makeNetworkRequest } from '@unumid/library-issuer-verifier-utility';

import { VerifiableCredential, CredentialStatus, UnumDto } from '../types';
import { configData } from '../config';

/**
 * Helper to check the status of a credential: verified, revoked, etc.
 * @param credential
 * @param authHeader
 */
export const checkCredentialStatus = async (credential: VerifiableCredential, authHeader: string): Promise<UnumDto<boolean>> => {
  const options = {
    baseUrl: configData.SaaSUrl,
    endPoint: `credentialStatus/${credential.id}`,
    method: 'GET',
    header: { Authorization: authHeader }
  };

  const credentialStatusResponse = await makeNetworkRequest<CredentialStatus>(options);
  const credentialStatus = credentialStatusResponse.body;
  const authToken: string = handleAuthToken(credentialStatusResponse);

  const valid = credentialStatus.status === 'valid';
  const result: UnumDto<boolean> = {
    authToken,
    body: valid
  };

  return result;
};
