import { Credential } from '@unumid/types';
import { convertCredentialSubject } from '../../src/utils/convertCredentialSubject';
import { makeDummyCredential, makeDummyCredentialSubject, makeDummyUnsignedCredential } from '../issuer/mocks';

describe('convertCredentialSubject', () => {
  it('from string to CredentialSubject type', async () => {
    const unsignedCredential = makeDummyUnsignedCredential();
    const cred: Credential = await makeDummyCredential({ unsignedCredential });
    const expectedCredentialSubject = makeDummyCredentialSubject();

    const result = convertCredentialSubject(cred.credentialSubject);
    expect(expectedCredentialSubject).toEqual(result);
    expect(JSON.parse(cred.credentialSubject)).toEqual(result);
  });
});
