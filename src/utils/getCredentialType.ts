import { CustError } from './error';

/**
 * Removing the w3c credential spec of "VerifiableCredential" from the Unum ID internal type for simplicity.
 * Note: assuming the type is always of length two, first one being "VerifiableCredential" and second one the actually type.
 * @param credential
 */
export const getCredentialType = (credentialTypes: string[]): string => {
  // Removing the w3c credential spec of "VerifiableCredential" from the Unum ID internal type for simplicity
  // const encryptedCredentialTypeFiltered = credential.type.filter(t => t !== 'VerifiableCredential');
  if (credentialTypes.length !== 2) {
    throw new CustError(500, 'Credential type is malformed.');
  }
  const credentialType = credentialTypes[1];

  return credentialType;
};
