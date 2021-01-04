import request from 'supertest';

import * as utilLib from 'library-issuer-verifier-utility';
import { app } from '../src/index';
import { verifyCredential } from '../src/verifyCredential';
import { isCredentialExpired } from '../src/isCredentialExpired';
import { checkCredentialStatus } from '../src/checkCredentialStatus';
import { dummyAuthToken, makeDummyDidDocument } from './mocks';

jest.mock('library-issuer-verifier-utility', () => ({
  ...jest.requireActual('library-issuer-verifier-utility'),
  getDIDDoc: jest.fn(),
  doVerify: jest.fn(),
  makeNetworkRequest: jest.fn()
}));

jest.mock('../src/verifyCredential');
jest.mock('../src/isCredentialExpired');
jest.mock('../src/checkCredentialStatus');

const mockVerifyCredential = verifyCredential as jest.Mock;
const mockIsCredentialExpired = isCredentialExpired as jest.Mock;
const mockCheckCredentialStatus = checkCredentialStatus as jest.Mock;
const mockGetDIDDoc = utilLib.getDIDDoc as jest.Mock;
const mockDoVerify = utilLib.doVerify as jest.Mock;
const mockMakeNetworkRequest = utilLib.makeNetworkRequest as jest.Mock;

const callVerifyPresentation = (context, type, verifiableCredential, presentationRequestUuid, proof, verifier, auth = ''): Promise<utilLib.JSONObj> => {
  const presentation = {
    '@context': context,
    type,
    verifiableCredential,
    presentationRequestUuid,
    proof
  };
  return (request(app)
    .post('/api/verifyPresentation')
    .set('Content-Type', 'application/json')
    .set('Authorization', auth)
    .send({ presentation, verifier })
  );
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
  const verifiableCredential: utilLib.JSONObj[] = [
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
    verifiableCredential,
    presentationRequestUuid,
    proof,
    authHeader,
    verifier
  });
};

describe('POST /api/verifyPresentation - Success Scenario', () => {
  let response: utilLib.JSONObj;
  let verStatus;

  const { context, type, verifiableCredential, presentationRequestUuid, proof, authHeader, verifier } = populateMockData();

  beforeAll(async () => {
    const dummySubjectDidDoc = await makeDummyDidDocument();

    const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
    mockGetDIDDoc.mockResolvedValueOnce({ body: dummySubjectDidDoc, headers: dummyResponseHeaders });
    mockDoVerify.mockReturnValueOnce(true);
    mockVerifyCredential.mockResolvedValue(true);
    mockIsCredentialExpired.mockReturnValue(false);
    mockCheckCredentialStatus.mockReturnValue(true);
    mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers: dummyResponseHeaders });
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof, verifier, authHeader);
    verStatus = response.body.verifiedStatus;
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
    verifiableCredential.forEach((vc) => {
      expect(mockVerifyCredential).toBeCalledWith(vc, authHeader);
    });
  });

  it('checks if each credential is expired', () => {
    verifiableCredential.forEach((vc) => {
      expect(mockIsCredentialExpired).toBeCalledWith(vc);
    });
  });

  it('checks the status of each credential', () => {
    verifiableCredential.forEach((vc) => {
      expect(mockCheckCredentialStatus).toBeCalledWith(vc, authHeader);
    });
  });

  it('Response status code should be 200', () => {
    expect(response.statusCode).toBe(200);
  });

  it('Result should be true', () => {
    expect(verStatus).toBeDefined();
    expect(verStatus).toBe(true);
  });

  it('returns the x-auth-token header returned from the SaaS api in the x-auth-token header', () => {
    expect(response.headers['x-auth-token']).toEqual(dummyAuthToken);
  });

  it('does not return an x-auth-token header if the SaaS does not return an x-auth-token header', async () => {
    const dummySubjectDidDoc = await makeDummyDidDocument();
    const dummyApiResponse = { body: dummySubjectDidDoc };
    mockMakeNetworkRequest.mockResolvedValueOnce(dummyApiResponse);
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof, verifier, authHeader);
    expect(response.headers['x-auth-token']).toBeUndefined();
  });
});

describe('POST /api/verifyPresentation - Failure Scenarios', () => {
  let response: utilLib.JSONObj;
  let verStatus: boolean;
  const { context, type, verifiableCredential, presentationRequestUuid, proof, authHeader, verifier } = populateMockData();

  beforeAll(async () => {
    const dummySubjectDidDoc = await makeDummyDidDocument();

    const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
    mockGetDIDDoc.mockResolvedValueOnce({ body: dummySubjectDidDoc, headers: dummyResponseHeaders });
    mockDoVerify.mockReturnValueOnce(false);
    mockVerifyCredential.mockResolvedValue(false);
    mockIsCredentialExpired.mockReturnValue(true);
    mockCheckCredentialStatus.mockReturnValue(false);
    verifiableCredential[0].proof.verificationMethod = proof.verificationMethod;
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof, verifier, authHeader);
    verStatus = response.body.verifiedStatus;
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

  it('Response status code should be 200', () => {
    expect(response.statusCode).toBe(200);
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

    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof, verifier, authHeader);
    expect(response.statusCode).toEqual(404);
  });

  it('returns a 404 status code if the did document is not found', async () => {
    mockGetDIDDoc.mockResolvedValueOnce(new utilLib.CustError(404, 'DID Document not found.'));

    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof, verifier, authHeader);
    expect(response.statusCode).toEqual(404);
  });
});

describe('POST /api/verifyPresentation - Validation Failures', () => {
  let response: utilLib.JSONObj, preReq: utilLib.JSONObj;
  const { context, type, verifiableCredential, presentationRequestUuid, proof, authHeader, verifier } = populateMockData();

  it('returns a 400 status code with a descriptive error message when @context is missing', async () => {
    response = await callVerifyPresentation('', type, verifiableCredential, presentationRequestUuid, proof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: @context is required.');
  });

  it('returns a 400 status code with a descriptive error message when type is missing', async () => {
    response = await callVerifyPresentation(context, '', verifiableCredential, presentationRequestUuid, proof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: type is required.');
  });

  it('returns a 400 status code with a descriptive error message when verifiableCredential is missing', async () => {
    response = await callVerifyPresentation(context, type, '', presentationRequestUuid, proof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: verifiableCredential is required.');
  });

  it('returns a 400 status code with a descriptive error message when presentationRequestUuid is missing', async () => {
    response = await callVerifyPresentation(context, type, verifiableCredential, '', proof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: presentationRequestUuid is required.');
  });

  it('returns a 400 status code with a descriptive error message when proof is missing', async () => {
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, '', verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: proof is required.');
  });

  it('returns a 400 status code with a descriptive error message when @context is not an array', async () => {
    response = await callVerifyPresentation('https://www.w3.org/2018/credentials/v1', type, verifiableCredential, presentationRequestUuid, proof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: @context must be a non-empty array.');
  });

  it('returns a 400 status code with a descriptive error message when @context array is empty', async () => {
    response = await callVerifyPresentation([], type, verifiableCredential, presentationRequestUuid, proof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: @context must be a non-empty array.');
  });

  it('returns a 400 status code with a descriptive error message when type is not an array', async () => {
    response = await callVerifyPresentation(context, 'VerifiablePresentation', verifiableCredential, presentationRequestUuid, proof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: type must be a non-empty array.');
  });

  it('returns a 400 status code with a descriptive error message when type array is empty', async () => {
    response = await callVerifyPresentation(context, [], verifiableCredential, presentationRequestUuid, proof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: type must be a non-empty array.');
  });

  it('returns a 400 status code with a descriptive error message when verifiableCredential is not an array', async () => {
    response = await callVerifyPresentation(context, type, 'verifiableCredential', presentationRequestUuid, proof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: verifiableCredential must be a non-empty array.');
  });

  it('returns a 400 status code with a descriptive error message when verifiableCredential array is empty', async () => {
    response = await callVerifyPresentation(context, type, [], presentationRequestUuid, proof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: verifiableCredential must be a non-empty array.');
  });

  it('returns a 401 status code if x-auth-token header is missing', async () => {
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof, verifier, '');
    preReq = response.body;

    expect(response.statusCode).toBe(401);
    expect(preReq.message).toBe('Not authenticated.');
  });
});

describe('POST /api/verifyPresentation - Validation for verifiableCredential object', () => {
  let response: utilLib.JSONObj, preReq: utilLib.JSONObj;
  const { context, type, verifiableCredential, presentationRequestUuid, proof, authHeader, verifier } = populateMockData();

  let cred;
  it('Response code should be ' + 400 + ' when @context is not passed', async () => {
    cred = copyCredentialObj(verifiableCredential[0], '@context');
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid verifiableCredential[0]: @context is required.');
  });

  it('Response code should be ' + 400 + ' when credentialStatus is not passed', async () => {
    cred = copyCredentialObj(verifiableCredential[0], 'credentialStatus');
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid verifiableCredential[0]: credentialStatus is required.');
  });

  it('Response code should be ' + 400 + ' when credentialSubject is not passed', async () => {
    cred = copyCredentialObj(verifiableCredential[0], 'credentialSubject');
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid verifiableCredential[0]: credentialSubject is required.');
  });

  it('Response code should be ' + 400 + ' when issuer is not passed', async () => {
    cred = copyCredentialObj(verifiableCredential[0], 'issuer');
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid verifiableCredential[0]: issuer is required.');
  });

  it('Response code should be ' + 400 + ' when type is not passed', async () => {
    cred = copyCredentialObj(verifiableCredential[0], 'type');
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid verifiableCredential[0]: type is required.');
  });

  it('Response code should be ' + 400 + ' when id is not passed', async () => {
    cred = copyCredentialObj(verifiableCredential[0], 'id');
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid verifiableCredential[0]: id is required.');
  });

  it('Response code should be ' + 400 + ' when issuanceDate is not passed', async () => {
    cred = copyCredentialObj(verifiableCredential[0], 'issuanceDate');
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid verifiableCredential[0]: issuanceDate is required.');
  });

  it('Response code should be ' + 400 + ' when proof is not passed', async () => {
    cred = copyCredentialObj(verifiableCredential[0], 'proof');
    response = await callVerifyPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid verifiableCredential[0]: proof is required.');
  });
});

describe('POST /api/verifyPresentation - Validation for proof object', () => {
  let response: utilLib.JSONObj, preReq: utilLib.JSONObj;
  const { context, type, verifiableCredential, presentationRequestUuid, proof, authHeader, verifier } = populateMockData();

  it('returns a 400 status code with a descriptive error message when created is missing', async () => {
    const invalidProof = { created: '', signatureValue: proof.signatureValue, type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, invalidProof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: proof.created is required.');
  });

  it('returns a 400 status code with a descriptive error message when signatureValue is missing', async () => {
    const invlaidProof = { created: proof.created, signatureValue: '', type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, invlaidProof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: proof.signatureValue is required.');
  });

  it('returns a 400 status code with a descriptive error message when type is missing', async () => {
    const invalidProof = { created: proof.created, signatureValue: proof.signatureValue, type: '', verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, invalidProof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: proof.type is required.');
  });

  it('returns a 400 status code with a descriptive error message when verificationMethod is missing', async () => {
    const invalidProof = { created: proof.created, signatureValue: proof.signatureValue, type: proof.type, verificationMethod: '', proofPurpose: proof.proofPurpose };
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, invalidProof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: proof.verificationMethod is required.');
  });

  it('returns a 400 status code with a descriptive error message when proofPurpose is missing', async () => {
    const invalidProof = { created: proof.created, signatureValue: proof.signatureValue, type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: '' };
    response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, invalidProof, verifier, authHeader);
    preReq = response.body;

    expect(response.statusCode).toBe(400);
    expect(preReq.message).toBe('Invalid Presentation: proof.proofPurpose is required.');
  });
});
