import * as utilLib from '@unumid/library-issuer-verifier-utility';
import { NoPresentation, Presentation, VerifiedStatus, UnumDto } from '../../src/index';
import { verifyCredential } from '../../src/verifier/verifyCredential';
import { isCredentialExpired } from '../../src/verifier/isCredentialExpired';
import { checkCredentialStatus } from '../../src/verifier/checkCredentialStatus';
import { dummyAuthToken, dummyRsaPrivateKey, dummyRsaPublicKey, makeDummyDidDocument } from './mocks';
import { encrypt } from '@unumid/library-crypto';
import { omit } from 'lodash';
import { DecryptedPresentation } from '../../src/types';
import { verifyPresentation } from '../../src/verifier/verifyPresentation';
import { verifyNoPresentationHelper } from '../../src/verifier/verifyNoPresentationHelper';

jest.mock('@unumid/library-issuer-verifier-utility', () => ({
  ...jest.requireActual('@unumid/library-issuer-verifier-utility'),
  getDIDDoc: jest.fn(),
  doVerify: jest.fn(),
  makeNetworkRequest: jest.fn()
}));

jest.mock('../../src/verifier/verifyCredential');
jest.mock('../../src/verifier/isCredentialExpired');
jest.mock('../../src/verifier/checkCredentialStatus');

const mockVerifyCredential = verifyCredential as jest.Mock;
const mockIsCredentialExpired = isCredentialExpired as jest.Mock;
const mockCheckCredentialStatus = checkCredentialStatus as jest.Mock;
const mockGetDIDDoc = utilLib.getDIDDoc as jest.Mock;
const mockDoVerify = utilLib.doVerify as jest.Mock;
const mockMakeNetworkRequest = utilLib.makeNetworkRequest as jest.Mock;

const callVerifyEncryptedPresentation = (context, type, verifiableCredentials, presentationRequestUuid, proof, verifier, auth = ''): Promise<UnumDto<DecryptedPresentation>> => {
  const presentation: Presentation = {
    '@context': context,
    type,
    verifiableCredentials,
    presentationRequestUuid,
    proof,
    uuid: 'a'
  };

  const encryptedPresentation = encrypt(`did:unum:${utilLib.getUUID()}`, dummyRsaPublicKey, presentation, 'pem');
  return verifyPresentation(auth, encryptedPresentation, verifier, dummyRsaPrivateKey);
};

const copyCredentialObj = (credential: utilLib.JSONObj, elemName: string, elemValue = ''): utilLib.JSONObj => {
  const newCred: utilLib.JSONObj = [
    {
      '@context': credential['@context'],
      credentialStatus: credential.credentialStatus,
      credentialSubject: credential.credentialSubject,
      issuer: credential.issuer,
      type: credential.type,
      id: credential.id,
      issuanceDate: credential.issuanceDate,
      proof: credential.proof
    }
  ];

  newCred[0][elemName] = elemValue;
  return (newCred);
};

const populateMockData = (): utilLib.JSONObj => {
  const context: string[] = ['https://www.w3.org/2018/credentials/v1'];
  const type: string[] = ['VerifiablePresentation'];
  const verifiableCredentials: utilLib.JSONObj[] = [
    {
      '@context': [
        'https://www.w3.org/2018/credentials/v1'
      ],
      credentialStatus: {
        id: 'https://api.dev-unumid.org//credentialStatus/b2acd26a-ab18-4d18-9ad1-3b77f55c564b',
        type: 'CredentialStatus'
      },
      credentialSubject: {
        id: 'did:unum:3ff2f020-50b0-4f4c-a267-a9f104aedcd8',
        test: 'test'
      },
      issuer: 'did:unum:2e05967f-216f-44c4-ae8e-d6f71cd17c5a',
      type: [
        'VerifiableCredential',
        'TestCredential'
      ],
      id: 'b2acd26a-ab18-4d18-9ad1-3b77f55c564b',
      issuanceDate: '2020-09-03T18:42:30.645Z',
      proof: {
        created: '2020-09-03T18:42:30.658Z',
        signatureValue: '381yXYx2wa7qR4XMEWeLPWVR7xhksi4684VCZL7Yx9jXneVMxXoa3eT3dA5QU1tofsH4XrGbU8d4pNTiLRpa8iUWvWmAdnfE',
        unsignedValue: 'todo',
        type: 'secp256r1Signature2020',
        verificationMethod: 'did:unum:2e05967f-216f-44c4-ae8e-d6f71cd17c5a',
        proofPurpose: 'AssertionMethod'
      }
    }
  ];
  const presentationRequestUuid = '0cebee3b-3295-4ef6-a4d6-7dfea413b3aa';
  const proof: utilLib.JSONObj = {
    created: '2020-09-03T18:50:52.105Z',
    signatureValue: 'iKx1CJLYue7vopUo2fqGps3TWmxqRxoBDTupumLkaNp2W3UeAjwLUf5WxLRCRkDzEFeKCgT7JdF5fqbpvqnBZoHyYzWYbmW4YQ',
    type: 'secp256r1Signature2020',
    verificationMethod: 'did:unum:3ff2f020-50b0-4f4c-a267-a9f104aedcd8',
    proofPurpose: 'AssertionMethod'
  };
  const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';
  const verifier = 'did:unum:dd407b1a-ee7f-46a2-af2a-ccbb48cbb0dc';
  return ({
    context,
    type,
    verifiableCredentials,
    presentationRequestUuid,
    proof,
    authHeader,
    verifier
  });
};

describe('verifyEncryptedPresentation - Success Scenario', () => {
  let response: UnumDto<DecryptedPresentation>;
  let verStatus: boolean;

  const { context, type, verifiableCredentials, presentationRequestUuid, proof, authHeader, verifier } = populateMockData();

  beforeAll(async () => {
    const dummySubjectDidDoc = await makeDummyDidDocument();

    const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
    mockGetDIDDoc.mockResolvedValueOnce({ body: dummySubjectDidDoc, headers: dummyResponseHeaders });
    mockDoVerify.mockReturnValueOnce(true);
    mockVerifyCredential.mockResolvedValue({ authToken: dummyAuthToken, body: true });
    mockIsCredentialExpired.mockReturnValue(false);
    mockCheckCredentialStatus.mockReturnValue({ authToken: dummyAuthToken, body: { status: 'valid' } });
    mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers: dummyResponseHeaders });
    response = await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
    verStatus = response.body.isVerified;
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('gets the subject did document', () => {
    expect(mockGetDIDDoc).toBeCalled();
  });

  it('verifies the presentation', () => {
    expect(mockDoVerify).toBeCalled();
  });

  it('verifies each credential', () => {
    verifiableCredentials.forEach((vc) => {
      expect(mockVerifyCredential).toBeCalledWith(vc, authHeader);
    });
  });

  it('checks if each credential is expired', () => {
    verifiableCredentials.forEach((vc) => {
      expect(mockIsCredentialExpired).toBeCalledWith(vc);
    });
  });

  it('checks the status of each credential', () => {
    verifiableCredentials.forEach((vc) => {
      expect(mockCheckCredentialStatus).toBeCalledWith(authHeader, vc.id);
    });
  });

  it('Result should be true', () => {
    expect(verStatus).toBeDefined();
    expect(verStatus).toBe(true);
  });

  it('returns the x-auth-token header returned from the SaaS api in the x-auth-token header', () => {
    expect(response.authToken).toEqual(dummyAuthToken);
  });

  it('does not return an x-auth-token header if the SaaS does not return an x-auth-token header', async () => {
    const dummySubjectDidDoc = await makeDummyDidDocument();
    const dummyApiResponse = { body: dummySubjectDidDoc };
    mockMakeNetworkRequest.mockResolvedValueOnce(dummyApiResponse);
    mockGetDIDDoc.mockResolvedValue({ body: dummySubjectDidDoc, authToken: undefined });
    mockCheckCredentialStatus.mockReturnValue({ authToken: undefined, body: true });
    mockVerifyCredential.mockResolvedValue({ authToken: undefined, body: true });
    response = await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
    expect(response.authToken).toBeUndefined();
  });
});

describe('verifyEncryptedPresentation - Failure Scenarios', () => {
  let response: UnumDto<DecryptedPresentation>;
  let verStatus: boolean;
  const { context, type, verifiableCredentials, presentationRequestUuid, proof, authHeader, verifier } = populateMockData();

  beforeAll(async () => {
    const dummySubjectDidDoc = await makeDummyDidDocument();

    const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
    mockGetDIDDoc.mockResolvedValueOnce({ body: dummySubjectDidDoc, headers: dummyResponseHeaders });
    mockDoVerify.mockReturnValueOnce(false);
    mockVerifyCredential.mockResolvedValue({ authToken: dummyAuthToken, body: false });
    mockIsCredentialExpired.mockReturnValue(true);
    mockCheckCredentialStatus.mockReturnValue({ authToken: dummyAuthToken, body: false });
    verifiableCredentials[0].proof.verificationMethod = proof.verificationMethod;
    response = await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
    verStatus = response.body.isVerified;
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('gets the subject did document', () => {
    expect(mockGetDIDDoc).toBeCalled();
  });

  it('verifies the presentation', () => {
    expect(mockDoVerify).toBeCalled();
  });

  it('Result should be false', () => {
    expect(verStatus).toBeDefined();
    expect(verStatus).toBe(false);
  });

  it('returns a 404 status code if the did document has no public keys', async () => {
    const dummyDidDocWithoutKeys = {
      ...makeDummyDidDocument(),
      publicKey: []
    };
    const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
    mockGetDIDDoc.mockResolvedValueOnce({ body: dummyDidDocWithoutKeys, headers: dummyResponseHeaders });
    const response = await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
    expect(response.body.isVerified).toBe(false);
    expect(response.body.message).toBe('Public key not found for the DID associated with the proof.verificationMethod');
  });

  it('returns a 404 status code if the did document is not found', async () => {
    mockGetDIDDoc.mockResolvedValueOnce(new utilLib.CustError(404, 'DID Document not found.'));

    try {
      await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toEqual(404);
    }
  });
});

describe('verifyEncryptedPresentation - Validation Failures', () => {
  const { context, type, verifiableCredentials, presentationRequestUuid, proof, authHeader, verifier } = populateMockData();

  it('returns a 400 status code with a descriptive error message when @context is missing', async () => {
    try {
      await callVerifyEncryptedPresentation('', type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid Presentation: @context is required.');
    }
  });

  it('returns a 400 status code with a descriptive error message when type is missing', async () => {
    try {
      await callVerifyEncryptedPresentation(context, '', verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid Presentation: type is required.');
    }
  });

  it('returns a 400 status code with a descriptive error message when verifiableCredentials is missing', async () => {
    try {
      await callVerifyEncryptedPresentation(context, type, '', presentationRequestUuid, proof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid Presentation: verifiableCredentials is required.');
    }
  });

  it('returns a 400 status code with a descriptive error message when presentationRequestUuid is missing', async () => {
    try {
      await callVerifyEncryptedPresentation(context, type, verifiableCredentials, '', proof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid Presentation: presentationRequestUuid is required.');
    }
  });

  it('returns a 400 status code with a descriptive error message when proof is missing', async () => {
    try {
      await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, '', verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid Presentation: proof is required.');
    }
  });

  it('returns a 400 status code with a descriptive error message when @context is not an array', async () => {
    try {
      await callVerifyEncryptedPresentation('https://www.w3.org/2018/credentials/v1', type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid Presentation: @context must be a non-empty array.');
    }
  });

  it('returns a 400 status code with a descriptive error message when @context array is empty', async () => {
    try {
      await callVerifyEncryptedPresentation([], type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid Presentation: @context must be a non-empty array.');
    }
  });

  it('returns a 400 status code with a descriptive error message when type is not an array', async () => {
    try {
      await callVerifyEncryptedPresentation(context, 'VerifiablePresentation', verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid Presentation: type must be a non-empty array.');
    }
  });

  it('returns a 400 status code with a descriptive error message when type is empty', async () => {
    try {
      await callVerifyEncryptedPresentation(context, [], verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid Presentation: type must be a non-empty array.');
    }
  });

  it('returns a 400 status code with a descriptive error message when verifiableCredentials is not an array', async () => {
    try {
      await callVerifyEncryptedPresentation(context, type, 'verifiableCredentials', presentationRequestUuid, proof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid Presentation: verifiableCredentials must be a non-empty array.');
    }
  });

  it('returns a 400 status code with a descriptive error message when verifiableCredentials array is empty', async () => {
    try {
      await callVerifyEncryptedPresentation(context, type, [], presentationRequestUuid, proof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid Presentation: verifiableCredentials must be a non-empty array.');
    }
  });

  it('returns a 401 status code if x-auth-token header is missing', async () => {
    try {
      await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, proof, verifier, '');
      fail();
    } catch (e) {
      expect(e.code).toEqual(401);
    }
  });
});

describe('verifyEncryptedPresentation - Validation for verifiableCredentials object', () => {
  let response: utilLib.JSONObj, preReq: utilLib.JSONObj;
  const { context, type, verifiableCredentials, presentationRequestUuid, proof, authHeader, verifier } = populateMockData();

  let cred;
  it('Response code should be ' + 400 + ' when @context is not passed', async () => {
    cred = copyCredentialObj(verifiableCredentials[0], '@context');
    try {
      await callVerifyEncryptedPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid verifiableCredentials[0]: @context is required.');
    }
  });

  it('Response code should be ' + 400 + ' when credentialStatus is not passed', async () => {
    cred = copyCredentialObj(verifiableCredentials[0], 'credentialStatus');
    try {
      await callVerifyEncryptedPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid verifiableCredentials[0]: credentialStatus is required.');
    }
  });

  it('Response code should be ' + 400 + ' when credentialSubject is not passed', async () => {
    cred = copyCredentialObj(verifiableCredentials[0], 'credentialSubject');
    try {
      await callVerifyEncryptedPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid verifiableCredentials[0]: credentialSubject is required.');
    }
  });

  it('Response code should be ' + 400 + ' when issuer is not passed', async () => {
    cred = copyCredentialObj(verifiableCredentials[0], 'issuer');
    try {
      await callVerifyEncryptedPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid verifiableCredentials[0]: issuer is required.');
    }
  });

  it('Response code should be ' + 400 + ' when type is not passed', async () => {
    cred = copyCredentialObj(verifiableCredentials[0], 'type');
    try {
      await callVerifyEncryptedPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid verifiableCredentials[0]: type is required.');
    }
  });

  it('Response code should be ' + 400 + ' when id is not passed', async () => {
    cred = copyCredentialObj(verifiableCredentials[0], 'id');
    try {
      await callVerifyEncryptedPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid verifiableCredentials[0]: id is required.');
    }
  });

  it('Response code should be ' + 400 + ' when issuanceDate is not passed', async () => {
    cred = copyCredentialObj(verifiableCredentials[0], 'issuanceDate');
    try {
      await callVerifyEncryptedPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid verifiableCredentials[0]: issuanceDate is required.');
    }
  });

  it('Response code should be ' + 400 + ' when proof is not passed', async () => {
    cred = copyCredentialObj(verifiableCredentials[0], 'proof');
    try {
      await callVerifyEncryptedPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid verifiableCredentials[0]: proof is required.');
    }
  });
});

describe('verifyEncryptedPresentation - Validation for proof object', () => {
  const { context, type, verifiableCredentials, presentationRequestUuid, proof, authHeader, verifier } = populateMockData();

  it('returns a 400 status code with a descriptive error message when created is missing', async () => {
    const invalidProof = { created: '', signatureValue: proof.signatureValue, type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
    try {
      await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, invalidProof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid Presentation: proof.created is required.');
    }
  });

  it('returns a 400 status code with a descriptive error message when signatureValue is missing', async () => {
    const invalidProof = { created: proof.created, signatureValue: '', type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
    try {
      await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, invalidProof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid Presentation: proof.signatureValue is required.');
    }
  });

  it('returns a 400 status code with a descriptive error message when type is missing', async () => {
    const invalidProof = { created: proof.created, signatureValue: proof.signatureValue, type: '', verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
    try {
      await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, invalidProof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid Presentation: proof.type is required.');
    }
  });

  it('returns a 400 status code with a descriptive error message when verificationMethod is missing', async () => {
    const invalidProof = { created: proof.created, signatureValue: proof.signatureValue, type: proof.type, verificationMethod: '', proofPurpose: proof.proofPurpose };
    try {
      await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, invalidProof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid Presentation: proof.verificationMethod is required.');
    }
  });

  it('returns a 400 status code with a descriptive error message when proofPurpose is missing', async () => {
    const invalidProof = { created: proof.created, signatureValue: proof.signatureValue, type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: '' };
    try {
      await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, invalidProof, verifier, authHeader);
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
      expect(e.message).toBe('Invalid Presentation: proof.proofPurpose is required.');
    }
  });
});

const dummyNoPresentation: NoPresentation = {
  holder: 'did:unum:50fb0b5b-79ff-4db9-9f33-d93feab702db',
  presentationRequestUuid: 'd5cc3673-d72f-45fa-bc87-36c305f8d0a5',
  type: [
    'NoPresentation',
    'NoPresentation'
  ],
  proof: {
    signatureValue: 'AN1rKvtGeqaB4L16dr2gwF9jZF77hdhrb8iBsTgUTt2XqUyoJYnfQQmczxMuKLM2zWU6E6DSSaqzWVsisbD3VhG8taLWGx6BY',
    unsignedValue: 'unsigned sig value',
    created: '2020-09-29T00:05:57.107Z',
    type: 'secp256r1signature2020',
    verificationMethod: 'did:unum:50fb0b5b-79ff-4db9-9f33-d93feab702db',
    proofPurpose: 'assertionMethod'
  }
};

const dummyNoPresentationWithoutType = omit(dummyNoPresentation, 'type') as NoPresentation;
const dummyNoPresentationWithoutRequestUuid = omit(dummyNoPresentation, 'presentationRequestUuid') as NoPresentation;
const dummyNoPresentationWithoutHolder = omit(dummyNoPresentation, 'holder') as NoPresentation;
const dummyNoPresentationWithoutProof = omit(dummyNoPresentation, 'proof') as NoPresentation;

const dummyNoPresentationBadType = { ...dummyNoPresentation, type: {} } as NoPresentation;
const dummyNoPresentationBadTypeKeywordMissing = { ...dummyNoPresentation, type: ['No Presenation'] } as NoPresentation;
const dummyNoPresentationBadRequestUuid = { ...dummyNoPresentation, presentationRequestUuid: {} } as NoPresentation;
const dummyNoPresentationBadHolder = { ...dummyNoPresentation, holder: {} } as NoPresentation;
const dummyNoPresentationBadProof = { ...dummyNoPresentation, proof: {} } as NoPresentation;

const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';
const verifier = 'did:unum:dd407b1a-ee7f-46a2-af2a-ccbb48cbb0dc';

const callVerifyNoPresentation = (
  noPresentation: NoPresentation,
  verifier: string,
  authHeader?: string
): Promise<UnumDto<VerifiedStatus>> => {
  return verifyNoPresentationHelper(authHeader, noPresentation, verifier);
};

describe('verifyNoPresentation', () => {
  beforeAll(async () => {
    const dummyDidDoc = await makeDummyDidDocument({ id: dummyNoPresentation.holder });
    const headers = { 'x-auth-token': dummyAuthToken };
    mockGetDIDDoc.mockResolvedValue({ body: dummyDidDoc, headers });
    mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('success', () => {
    let response: UnumDto<VerifiedStatus>, responseAuthToken: string;

    beforeEach(async () => {
      mockDoVerify.mockReturnValue(true);
      response = await callVerifyNoPresentation(dummyNoPresentation, verifier, authHeader);
      responseAuthToken = response.authToken;
    });

    it('gets the holder did', () => {
      expect(mockGetDIDDoc).toBeCalled();
    });

    it('verifies the NoPresentation', () => {
      expect(mockDoVerify).toBeCalled();
    });

    it('returns the result of verification', () => {
      expect(response.body.isVerified).toBe(true);
    });

    it('returns the x-auth-token header returned from the SaaS api in the x-auth-token header', () => {
      expect(responseAuthToken).toEqual(dummyAuthToken);
    });

    it('does not return an x-auth-token header if the SaaS does not return an x-auth-token header', async () => {
      const dummySubjectDidDoc = await makeDummyDidDocument();
      const dummyApiResponse = { body: dummySubjectDidDoc };
      mockMakeNetworkRequest.mockResolvedValueOnce(dummyApiResponse);
      mockGetDIDDoc.mockResolvedValue({ body: dummySubjectDidDoc });
      response = await callVerifyNoPresentation(dummyNoPresentation, verifier, authHeader);
      expect(response.authToken).toBeUndefined();
    });
  });

  describe('verifyNoPresentation error', () => {
    it('returns a 401 status code if the x-auth-token header is missing', async () => {
      try {
        await callVerifyNoPresentation(dummyNoPresentation, verifier, '');
        fail();
      } catch (e) {
        expect(e.code).toEqual(401);
      }
    });

    it('returns a 400 status code with a descriptive error message if type is missing', async () => {
      try {
        await callVerifyNoPresentation(dummyNoPresentationWithoutType, verifier, authHeader);
        fail();
      } catch (e) {
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Invalid Presentation: type is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message if proof is missing', async () => {
      try {
        await callVerifyNoPresentation(dummyNoPresentationWithoutProof, verifier, authHeader);
        fail();
      } catch (e) {
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Invalid Presentation: proof is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message if holder is missing', async () => {
      try {
        await callVerifyNoPresentation(dummyNoPresentationWithoutHolder, verifier, authHeader);
        fail();
      } catch (e) {
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Invalid Presentation: holder is required.');
      }
    });

    it('returns a 400 status code with a descriptive error presentationRequestUuid if holder is missing', async () => {
      try {
        await callVerifyNoPresentation(dummyNoPresentationWithoutRequestUuid, verifier, authHeader);
        fail();
      } catch (e) {
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Invalid Presentation: presentationRequestUuid is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message if type is invalid', async () => {
      try {
        await callVerifyNoPresentation(dummyNoPresentationBadTypeKeywordMissing, verifier, authHeader);
      } catch (e) {
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Invalid type: first element must be \'NoPresentation\'.');
      }
    });

    it('returns a 400 status code with a descriptive error message if type is not an array', async () => {
      try {
        await callVerifyNoPresentation(dummyNoPresentationBadType, verifier, authHeader);
      } catch (e) {
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Invalid Presentation: type must be a non-empty array.');
      }
    });

    it('returns a 400 status code with a descriptive error message if holder is invalid', async () => {
      try {
        await callVerifyNoPresentation(dummyNoPresentationBadHolder, verifier, authHeader);
      } catch (e) {
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Invalid holder: must be a string.');
      }
    });

    it('returns a 400 status code with a descriptive error message if presentationRequestUuid is invalid', async () => {
      try {
        await callVerifyNoPresentation(dummyNoPresentationBadRequestUuid, verifier, authHeader);
      } catch (e) {
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Invalid presentationRequestUuid: must be a string.');
      }
    });

    it('returns a 400 status code if proof is invalid', async () => {
      try {
        await callVerifyNoPresentation(dummyNoPresentationBadProof, verifier, authHeader);
      } catch (e) {
        expect(e.code).toEqual(400);
      }
    });
  });
});
