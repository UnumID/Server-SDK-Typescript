
import { CredentialSubject, JSONObj } from '@unumid/types';
import { omit } from 'lodash';

/**
 * Handler to convert the JSON representation of the CredentialSubject into a Typescript interface, CredentialSubject
 */
// export const convertCredentialSubject = (input: JSON): CredentialSubject => {
export const convertCredentialSubject = (input: JSONObj): CredentialSubject => {
  const claims = omit(input, 'id');

  const result: CredentialSubject = {
    id: input.id,
    ...claims
  };

  return result;
};
