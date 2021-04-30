import { Credential } from '@unumid/types';

/**
 * Helper to assess the expiration status of a credential.
 * @param credential VerifiableCredential
 */
export const isCredentialExpired = (credential: Credential): boolean => {
  const { expirationDate } = credential;

  if (!expirationDate) {
    return false;
  }

  return new Date(expirationDate).getTime() < new Date().getTime();
};
