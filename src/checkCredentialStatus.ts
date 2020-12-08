import { makeRESTCall } from 'library-issuer-verifier-utility';

import { VerifiableCredential, CredentialStatus } from './types';
import { configData } from './config';

export const checkCredentialStatus = async (credential: VerifiableCredential, authHeader: string): Promise<boolean> => {
  const options = {
    baseUrl: configData.SaaSUrl,
    endPoint: `credentialStatus/${credential.id}`,
    method: 'GET',
    header: { Authorization: authHeader }
  };

  const credentialStatusResponse = await makeRESTCall<CredentialStatus>(options);
  const credentialStatus = credentialStatusResponse.body;

  return credentialStatus.status === 'valid';
};
