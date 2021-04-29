import { sign } from '@unumid/library-crypto';
import { CredentialSubject, JSONObj, Presentation, Proof } from '@unumid/types';
import stringify from 'fast-json-stable-stringify';
import { extractCredentialInfo } from '../../src';
import { dummyEccPrivateKey } from '../verifier/mocks';

const dummyCredentialSubject: CredentialSubject = {
  id: 'did:unum:3ff2f020-50b0-4f4c-a267-a9f104aedcd8',
  test: 'test'
};

const populateMockData = (): JSONObj => {
  const context: string[] = ['https://www.w3.org/2018/credentials/v1'];
  const type: string[] = ['VerifiablePresentation'];

  const credentialIssuerDid = 'did:unum:7fc1753e-cdb7-428a-b6ce-eefc0e3634e5'; // could be dummyIssuerDid?
  const verifiableCredentialObj: Credential =
      {
        '@context': [
          'https://www.w3.org/2018/credentials/v1'
        ],
        credentialStatus: {
          id: 'https://api.dev-unumid.org//credentialStatus/f8287c1e-0c56-460a-92af-5519f5c10cbf',
          type: 'CredentialStatus'
        },
        credentialSubject: JSON.stringify(dummyCredentialSubject),
        issuer: credentialIssuerDid,
        type: [
          'VerifiableCredential',
          'UsernameCredential'
        ],
        id: 'f8287c1e-0c56-460a-92af-5519f5c10cbf',
        issuanceDate: new Date('2021-01-09T02:23:54.844Z'),
        expirationDate: new Date('2022-01-09T00:00:00.000Z'),
        proof: {
          created: '2021-01-09T02:23:54.844Z',
          type: 'secp256r1Signature2020',
          verificationMethod: 'did:unum:7fc1753e-cdb7-428a-b6ce-eefc0e3634e5',
          proofPurpose: 'AssertionMethod',
          signatureValue: '381yXZCEPSC9NB2smArjiBtvnGL6LZ2yAUW1qLQfhuZSyeQiCyrFRqkxfPoa1gaLaScR7cFVJmguo1v1JKYH6uEU4Zd32D9C',
          unsignedValue: '{"@context":["https://www.w3.org/2018/credentials/v1"],"credentialStatus":{"id":"https://api.dev-unumid.org//credentialStatus/f8287c1e-0c56-460a-92af-5519f5c10cbf","type":"CredentialStatus"},"credentialSubject":{"id":"did:unum:5f5eb3dd-d0e0-4356-bfdd-96bc1393c705","username":"Analyst-Shoes-278"},"expirationDate":"2022-01-09T00:00:00.000Z","id":"f8287c1e-0c56-460a-92af-5519f5c10cbf","issuanceDate":"2021-01-09T02:23:54.844Z","issuer":"did:unum:7fc1753e-cdb7-428a-b6ce-eefc0e3634e5","proof":{"created":"2021-01-09T02:23:54.844Z","proofPurpose":"AssertionMethod","type":"secp256r1Signature2020","verificationMethod":"did:unum:7fc1753e-cdb7-428a-b6ce-eefc0e3634e5"},"type":["VerifiableCredential","UsernameCredential"]}'
        }
      };
  const verifiableCredential: Credential[] = [verifiableCredentialObj];
  const verifiableCredentialString = [stringify(verifiableCredentialObj)];

  const presentationRequestUuid = '0cebee3b-3295-4ef6-a4d6-7dfea413b3aa';

  const verifier = 'did:unum:dd407b1a-ee7f-46a2-af2a-ccbb48cbb0dc';

  const subjectDid = 'did:unum:3ff2f020-50b0-4f4c-a267-a9f104aedcd8';
  const unsignedPresentation = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    presentationRequestUuid,
    verifiableCredential: [verifiableCredential],
    type: ['VerifiablePresentation']
  };

  const signatureValue = sign(unsignedPresentation, dummyEccPrivateKey, 'base58');

  const proof: Proof = {
    created: new Date().toISOString(),
    signatureValue,
    unsignedValue: stringify(unsignedPresentation),
    type: 'secp256r1Signature2020',
    verificationMethod: subjectDid,
    proofPurpose: 'assertionMethod'
  };

  return ({
    context,
    type,
    verifiableCredential,
    verifiableCredentialString,
    presentationRequestUuid,
    proof,
    verifier
  });
};

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
