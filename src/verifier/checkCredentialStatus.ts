import { handleAuthToken, makeNetworkRequest } from '@unumid/library-issuer-verifier-utility';
import { VerifiableCredential } from '@unumid/types';

import { CredentialStatus, CredentialStatusInfo, UnumDto } from '../types';
import { configData } from '../config';

// /**
//  * Helper to check the status of a credential: verified, revoked, etc.
//  * @param credential
//  * @param authorization
//  */
// export const checkCredentialStatus = async (credential: VerifiableCredential, authorization: string): Promise<UnumDto<boolean>> => {
//   const options = {
//     baseUrl: configData.SaaSUrl,
//     endPoint: `credentialStatus/${credential.id}`,
//     method: 'GET',
//     header: { Authorization: authorization }
//   };

//   const credentialStatusResponse = await makeNetworkRequest<CredentialStatus>(options);
//   const credentialStatus = credentialStatusResponse.body;
//   const authToken: string = handleAuthToken(credentialStatusResponse);

//   const valid = credentialStatus.status === 'valid';
//   const result: UnumDto<boolean> = {
//     authToken,
//     body: valid
//   };

//   return result;
// };

/**
 * Helper to check the status of a credential: verified, revoked, etc.
 * @param credential
 * @param authorization
 */
export const checkCredentialStatus = async (credentialId: string, authorization: string): Promise<UnumDto<CredentialStatusInfo>> => {
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
