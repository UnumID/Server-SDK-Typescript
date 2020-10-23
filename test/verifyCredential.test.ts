import * as utility from 'library-issuer-verifier-utility';

import { VerifiableCredential } from '../src/types';
import { verifyCredential } from '../src/verifyCredential';

describe('verifyCredential', () => {
  const credential: VerifiableCredential = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1'
    ],
    credentialStatus: {
      id: 'https://api.dev-unumid.org//credentialStatus/479ef01b-f105-4be7-a86d-aa74d5cabedc',
      type: 'CredentialStatus'
    },
    credentialSubject: {
      id: 'did:unum:118f2cc0-9f4b-42c3-8074-a195f8ee1576',
      firstName: 'Jacob'
    },
    issuer: 'did:unum:61569337-df7c-4bf7-a8aa-61346c0ac0d9',
    type: [
      'VerifiableCredential',
      'FirstNameCredential'
    ],
    id: '479ef01b-f105-4be7-a86d-aa74d5cabedc',
    issuanceDate: new Date('2020-10-23T19:55:13.764Z'),
    proof: {
      created: new Date('2020-10-23T19:55:13.766Z'),
      signatureValue: '381yXZ92emz9ZjAjEGfeNG3xoJ5KGKVTkFqFZ1cBLsPJ6nBU4BKCindCgfo7cfkopZpR3N4aRGgYXu9a8sddRdW8gF5ZhEG2',
      type: 'secp256r1Signature2020',
      verificationMethod: 'did:unum:61569337-df7c-4bf7-a8aa-61346c0ac0d9',
      proofPurpose: 'AssertionMethod'
    }
  };

  const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';

  let getDidDocSpy;
  let verifySpy;
  let isVerified: boolean;

  beforeAll(async () => {
    getDidDocSpy = jest.spyOn(utility, 'getDIDDoc', 'get');
    verifySpy = jest.spyOn(utility, 'doVerify', 'get');

    isVerified = await verifyCredential(credential, authHeader);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('gets the did document', () => {
    expect(getDidDocSpy).toBeCalled();
  });

  it('verifies the credential', () => {
    expect(verifySpy).toBeCalled();
  });

  it('returns true for a valid credential', () => {
    expect(isVerified).toBe(true);
  });

  it('returns false for an invalid credential', async () => {
    const invalidCredential: VerifiableCredential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1'
      ],
      credentialStatus: {
        id: 'https://api.dev-unumid.org//credentialStatus/479ef01b-f105-4be7-a86d-aa74d5cabedc',
        type: 'CredentialStatus'
      },
      credentialSubject: {
        id: 'did:unum:118f2cc0-9f4b-42c3-8074-a195f8ee1576',
        firstName: 'Whoops someone changed the name'
      },
      issuer: 'did:unum:61569337-df7c-4bf7-a8aa-61346c0ac0d9',
      type: [
        'VerifiableCredential',
        'FirstNameCredential'
      ],
      id: '479ef01b-f105-4be7-a86d-aa74d5cabedc',
      issuanceDate: new Date('2020-10-23T19:55:13.764Z'),
      proof: {
        created: new Date('2020-10-23T19:55:13.766Z'),
        signatureValue: '381yXZ92emz9ZjAjEGfeNG3xoJ5KGKVTkFqFZ1cBLsPJ6nBU4BKCindCgfo7cfkopZpR3N4aRGgYXu9a8sddRdW8gF5ZhEG2',
        type: 'secp256r1Signature2020',
        verificationMethod: 'did:unum:61569337-df7c-4bf7-a8aa-61346c0ac0d9',
        proofPurpose: 'AssertionMethod'
      }
    };

    const isInvalidVerified = await verifyCredential(invalidCredential, authHeader);
    expect(isInvalidVerified).toBe(false);
  });
});
