import { CredentialSubject, JSONObj, Presentation, Proof, Credential } from '@unumid/types';
import { extractCredentialInfo } from '../../src';
import { createKeyPairSet } from '../../src/utils/createKeyPairs';
import { makeDummyCredential, makeDummyUnsignedCredential } from '../issuer/mocks';

const dummyCredentialSubject: CredentialSubject = {
  id: 'did:unum:3ff2f020-50b0-4f4c-a267-a9f104aedcd8',
  test: 'test'
};

const populateMockData = async (): Promise<JSONObj> => {
  const context: string[] = ['https://www.w3.org/2018/credentials/v1'];
  const type: string[] = ['VerifiablePresentation'];

  const unsignedCredential = makeDummyUnsignedCredential();

  const keys = await createKeyPairSet();
  const credOptions: DummyCredentialOptions = {
    unsignedCredential,
    privateKey: keys.signing.privateKey,
    privateKeyId: keys.signing.id,
    encoding: 'pem'
  };

  const cred = await makeDummyCredential(credOptions);
  const verifiableCredential: Credential[] = [cred];

  const subjectDid = 'did:unum:3ff2f020-50b0-4f4c-a267-a9f104aedcd8';

  const proof: Proof = {
    created: new Date().toISOString(),
    signatureValue: 'signedvalue....',
    type: 'secp256r1Signature2020',
    verificationMethod: `${subjectDid}#${keys.signing.id}`,
    proofPurpose: 'assertionMethod'
  };

  return ({
    context,
    type,
    verifiableCredential,
    proof
  });
};

describe('extractCredentialInfo', () => {
  it('from a Presentation', async () => {
    const { context, type, verifiableCredential, presentationRequestUuid, proof, verifier } = await populateMockData();
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
