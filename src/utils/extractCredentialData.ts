
import { CredentialData, CredentialPb, CredentialSubject } from '@unumid/types';
import { extractCredentialType } from './extractCredentialType';
import { convertCredentialSubject } from './convertCredentialSubject';
import _ from 'lodash';

/**
 * Helper to extract credential data from a Credential
 * @param credential
 * @returns
 */
export function extractCredentialData (credential: CredentialPb): CredentialData {
  const type = extractCredentialType(credential.type)[0];

  const subject: CredentialSubject = convertCredentialSubject(credential.credentialSubject);
  const _subject = _.omit(subject, 'id');

  return {
    type,
    ..._subject
  };
}
