import { makeNetworkRequest } from 'library-issuer-verifier-utility';

import { VerifiableCredential, CredentialStatus } from '../types';
import { configData } from '../config';

/**
 * Helper to check the status of a credential: verified, revoked, etc.
 * @param credential
 * @param authHeader
 */
export const checkCredentialStatus = async (credential: VerifiableCredential, authHeader: string): Promise<boolean> => {
  const options = {
    baseUrl: configData.SaaSUrl,
    endPoint: `credentialStatus/${credential.id}`,
    method: 'GET',
    header: { Authorization: authHeader }
  };

  const credentialStatusResponse = await makeNetworkRequest<CredentialStatus>(options);
  const credentialStatus = credentialStatusResponse.body;

  return credentialStatus.status === 'valid';
};
