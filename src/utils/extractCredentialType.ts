
import { isArrayNotEmpty } from './helpers';

/**
 * Handler to extract credential credential type, removing the W3C prefix 'VerifiableCredential'.
 * @param string[] type
 */
export const extractCredentialType = (type: string[]): string[] => {
  const result = isArrayNotEmpty(type) && type[0] === 'VerifiableCredential' ? type.slice(1) : type;

  return result;
};
