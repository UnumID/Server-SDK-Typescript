
import { CredentialSubject } from '@unumid/types';
import { omit } from 'lodash';

/**
 * Handler to convert the JSON representation of the CredentialSubject into a Typescript interface, CredentialSubject
 */
export const convertCredentialSubject = (input: string): CredentialSubject => {
  const obj = JSON.parse(input);
  const claims = omit(obj, 'id');

  const result: CredentialSubject = {
    id: obj.id,
    ...claims
  };

  return result;
};
