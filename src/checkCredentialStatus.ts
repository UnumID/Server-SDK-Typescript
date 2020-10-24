import { makeRESTCall } from 'library-issuer-verifier-utility';

import { VerifiableCredential, CredentialStatus } from './types';
import { configData } from './config';

export const checkCredentialStatus = async (credential: VerifiableCredential): Promise<boolean> => {
  const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';
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
