
import { CredentialSubject, JSONObj } from '@unumid/types';
import { omit } from 'lodash';
import { CustError } from './error';

/**
 * Handler to convert the JSON representation of the CredentialSubject into a Typescript interface, CredentialSubject
 */
// export const convertCredentialSubject = (input: JSON): CredentialSubject => {
export const convertCredentialSubject = (input: string): CredentialSubject => {
  if (typeof input !== 'string') {
    throw new CustError(400, `CredentialSubject is not a string: ${input}`);
  }

  const obj = JSON.parse(input);
  const claims = omit(obj, 'id');

  const result: CredentialSubject = {
    id: obj.id,
    ...claims
  };

  return result;
};
