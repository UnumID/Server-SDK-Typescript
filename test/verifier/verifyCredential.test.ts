import * as utility from '@unumid/library-issuer-verifier-utility';

import { UnumDto, VerifiableCredential } from '../../src/types';
import { verifyCredential } from '../../src/verifier/verifyCredential';
import { makeDummyDidDocument } from './mocks';

// Selective "spyon" mocking example of package.
jest.mock('@unumid/library-issuer-verifier-utility', () => {
  const actual = jest.requireActual('@unumid/library-issuer-verifier-utility');
  return {
    ...actual,
    getDIDDoc: jest.fn(),
    doVerify: jest.fn(() => actual.doVerify)
  };
});

const mockGetDIDDoc = utility.getDIDDoc as jest.Mock;
const mockDoVerify = utility.doVerify as jest.Mock;

describe('verifyCredential', () => {
  const credential: VerifiableCredential =
  {
    '@context': [
      'https://www.w3.org/2018/credentials/v1'
    ],
    credentialStatus: {
      id: 'https://api.dev-unumid.org//credentialStatus/f8287c1e-0c56-460a-92af-5519f5c10cbf',
      type: 'CredentialStatus'
    },
    credentialSubject: {
      id: 'did:unum:5f5eb3dd-d0e0-4356-bfdd-96bc1393c705',
      username: 'Analyst-Shoes-278'
    },
    issuer: 'did:unum:7fc1753e-cdb7-428a-b6ce-eefc0e3634e5',
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
  // {
  //   '@context': [
  //     'https://www.w3.org/2018/credentials/v1'
  //   ],
  //   credentialStatus: {
  //     id: 'https://api.dev-unumid.org//credentialStatus/479ef01b-f105-4be7-a86d-aa74d5cabedc',
  //     type: 'CredentialStatus'
  //   },
  //   credentialSubject: {
  //     id: 'did:unum:118f2cc0-9f4b-42c3-8074-a195f8ee1576',
  //     firstName: 'Jacob'
  //   },
  //   issuer: 'did:unum:61569337-df7c-4bf7-a8aa-61346c0ac0d9',
  //   type: [
  //     'VerifiableCredential',
  //     'FirstNameCredential'
  //   ],
  //   id: '479ef01b-f105-4be7-a86d-aa74d5cabedc',
  //   issuanceDate: new Date('2020-10-23T19:55:13.764Z'),
  //   proof: {
  //     created: new Date('2020-10-23T19:55:13.766Z'),
  //     signatureValue: '381yXZ92emz9ZjAjEGfeNG3xoJ5KGKVTkFqFZ1cBLsPJ6nBU4BKCindCgfo7cfkopZpR3N4aRGgYXu9a8sddRdW8gF5ZhEG2',
  //     type: 'secp256r1Signature2020',
  //     verificationMethod: 'did:unum:61569337-df7c-4bf7-a8aa-61346c0ac0d9',
  //     proofPurpose: 'AssertionMethod'
  //   }
  // };

  const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';

  let isVerified: UnumDto<boolean>;

  beforeAll(async () => {
    const dummyDidDoc = await makeDummyDidDocument({ id: credential.issuer });
    mockGetDIDDoc.mockResolvedValue({ body: dummyDidDoc });
    mockDoVerify.mockReturnValueOnce(true);
    isVerified = await verifyCredential(credential, authHeader);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('gets the did document', () => {
    expect(mockGetDIDDoc).toBeCalled();
  });

  it('verifies the credential', () => {
    expect(utility.doVerify).toBeCalled();
  });

  it('returns true for a valid credential', () => {
    expect(isVerified.body).toBe(true);
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

    mockDoVerify.mockReturnValueOnce(false);
    const isInvalidVerified = await verifyCredential(invalidCredential, authHeader);
    expect(isInvalidVerified.body).toBe(false);
  });

  it('returns false for an invalid credential with a valid unsignedString but non matching coupled object', async () => {
    const invalidCredential: VerifiableCredential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1'
      ],
      credentialStatus: {
        id: 'https://api.dev-unumid.org//credentialStatus/f8287c1e-0c56-460a-92af-5519f5c10cbf',
        type: 'CredentialStatus'
      },
      credentialSubject: {
        id: 'did:unum:5f5eb3dd-d0e0-4356-bfdd-96bc1393c705',
        username: 'Analyst-Shoes-278'
      },
      issuer: 'did:unum:7fc1753e-cdb7-428a-b6ce-eefc0e3634e5',
      type: [
        'VerifiableCredential',
        'UsernameCredentialFooFoo'
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

    mockDoVerify.mockReturnValueOnce(false);
    const isInvalidVerified = await verifyCredential(invalidCredential, authHeader);
    expect(isInvalidVerified.body).toBe(false);
  });

  it('returns true for an valid credential with a valid unsignedString that matches coupled object', async () => {
    const validCredential: VerifiableCredential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1'
      ],
      credentialStatus: {
        id: 'https://api.dev-unumid.org//credentialStatus/f8287c1e-0c56-460a-92af-5519f5c10cbf',
        type: 'CredentialStatus'
      },
      credentialSubject: {
        id: 'did:unum:5f5eb3dd-d0e0-4356-bfdd-96bc1393c705',
        username: 'Analyst-Shoes-278'
      },
      issuer: 'did:unum:7fc1753e-cdb7-428a-b6ce-eefc0e3634e5',
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

    mockDoVerify.mockReturnValueOnce(false);
    const isInvalidVerified = await verifyCredential(validCredential, authHeader);
    expect(isInvalidVerified.body).toBe(false);
  });
});
