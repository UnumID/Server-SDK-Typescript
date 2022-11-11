
import { DecryptedPresentation } from '../types';
import { CredentialData, CredentialPb } from '@unumid/types';
import _ from 'lodash';
import { extractCredentialData } from './extractCredentialData';

/**
 * Helper to extract credential data from a DecryptedPresentation
 * @param decryptedPresentation // a post decrypted and verified presentation object;
 */
export const extractPresentationData = (decryptedPresentation: DecryptedPresentation): CredentialData[] => {
  const { presentation, type } = decryptedPresentation;

  if (type === 'DeclinedPresentation') {
    return [];
  }

  const result: CredentialData[] = [];

  presentation.verifiableCredential.forEach((credential: CredentialPb) => {
    result.push(extractCredentialData(credential));
  });

  return result;
};
