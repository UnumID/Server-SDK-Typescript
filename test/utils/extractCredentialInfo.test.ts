import { Presentation } from '@unumid/types';
import { extractCredentialInfo } from '../../src';
import { dummyCredentialSubject, populateMockData } from '../verifier/mocks';

describe('extractCredentialInfo', () => {
  const { context, type, verifiableCredential, presentationRequestUuid, proof, verifier } = populateMockData();

  it('from a Presentation', async () => {
    const presentation: Presentation = {
      '@context': context,
      type,
      verifiableCredential,
      presentationRequestUuid,
      verifierDid: verifier,
      proof,
      uuid: 'a'
    };
    const result = extractCredentialInfo(presentation);

    // cred types
    expect(result.credentialTypes[0]).toEqual(verifiableCredential[0].type[1]);

    // subject DID
    expect(result.subjectDid).toEqual(dummyCredentialSubject.id);
  });
});
