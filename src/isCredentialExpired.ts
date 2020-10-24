import { VerifiableCredential } from './types';

export const isCredentialExpired = (credential: VerifiableCredential): boolean => {
  const { expirationDate } = credential;

  if (!expirationDate) {
    return false;
  }

  return new Date(expirationDate).getTime() < new Date().getTime();
};
