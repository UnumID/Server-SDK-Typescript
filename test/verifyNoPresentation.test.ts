import supertest from 'supertest';

import { omit } from 'lodash';

import { app } from '../src';
import { NoPresentation } from '../src/types';
import * as hlpr from 'library-issuer-verifier-utility';
import { dummyAuthToken, makeDummyDidDocument } from './mocks';

jest.mock('library-issuer-verifier-utility', () => {
  const actual = jest.requireActual('library-issuer-verifier-utility');
  return {
    ...actual,
    getDIDDoc: jest.fn(),
    doVerify: jest.fn(() => actual.doVerify),
    makeRESTCall: jest.fn()
  };
});

const mockGetDIDDoc = hlpr.getDIDDoc as jest.Mock;
const mockDoVerify = hlpr.doVerify as jest.Mock;
const mockMakeRESTCall = hlpr.makeRESTCall as jest.Mock;

const callVerifyNoPresentation = (
  noPresentation: NoPresentation,
  verifier: string,
  authHeader?: string
): Promise<Record<string, any>> => {
  return supertest(app)
    .post('/api/verifyNoPresentation')
    .set('Authorization', authHeader)
    .send({ noPresentation, verifier });
};

const dummyNoPresentation: NoPresentation = {
  holder: 'did:unum:50fb0b5b-79ff-4db9-9f33-d93feab702db',
  presentationRequestUuid: 'd5cc3673-d72f-45fa-bc87-36c305f8d0a5',
  type: [
    'NoPresentation',
    'NoPresentation'
  ],
  proof: {
    signatureValue: 'AN1rKvtGeqaB4L16dr2gwF9jZF77hdhrb8iBsTgUTt2XqUyoJYnfQQmczxMuKLM2zWU6E6DSSaqzWVsisbD3VhG8taLWGx6BY',
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
const dummyNoPresentationBadRequestUuid = { ...dummyNoPresentation, presentationRequestUuid: {} } as NoPresentation;
const dummyNoPresentationBadHolder = { ...dummyNoPresentation, holder: {} } as NoPresentation;
const dummyNoPresentationBadProof = { ...dummyNoPresentation, proof: {} } as NoPresentation;

const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';
const verifier = 'did:unum:dd407b1a-ee7f-46a2-af2a-ccbb48cbb0dc';

describe('POST /api/verifyNoPresentation', () => {
  beforeAll(async () => {
    const dummyDidDoc = await makeDummyDidDocument({ id: dummyNoPresentation.holder });
    const headers = { 'x-auth-token': dummyAuthToken };
    mockGetDIDDoc.mockResolvedValue({ body: dummyDidDoc, headers });
    mockMakeRESTCall.mockResolvedValue({ body: { success: true }, headers });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('success', () => {
    let response;

    beforeEach(async () => {
      mockDoVerify.mockReturnValue(true);
      response = await callVerifyNoPresentation(dummyNoPresentation, verifier, authHeader);
    });

    it('gets the holder did', () => {
      expect(mockGetDIDDoc).toBeCalled();
    });

    it('verifies the NoPresentation', () => {
      expect(mockDoVerify).toBeCalled();
    });

    it('returns a 200 status code', () => {
      expect(response.statusCode).toBe(200);
    });

    it('returns the result of verification', () => {
      expect(response.body.isVerified).toBe(true);
    });
  });

  describe('error', () => {
    it('returns a 401 status code if the x-auth-token header is missing', async () => {
      const response = await callVerifyNoPresentation(dummyNoPresentation, verifier, '');
      expect(response.statusCode).toEqual(401);
    });

    it('returns a 400 status code with a descriptive error message if type is missing', async () => {
      const response = await callVerifyNoPresentation(dummyNoPresentationWithoutType, verifier, authHeader);
      expect(response.statusCode).toEqual(400);
      expect(response.body.message).toEqual('type is required.');
    });

    it('returns a 400 status code with a descriptive error message if proof is missing', async () => {
      const response = await callVerifyNoPresentation(dummyNoPresentationWithoutProof, verifier, authHeader);
      expect(response.statusCode).toEqual(400);
      expect(response.body.message).toEqual('proof is required.');
    });

    it('returns a 400 status code with a descriptive error message if holder is missing', async () => {
      const response = await callVerifyNoPresentation(dummyNoPresentationWithoutHolder, verifier, authHeader);
      expect(response.statusCode).toEqual(400);
      expect(response.body.message).toEqual('holder is required.');
    });

    it('returns a 400 status code with a descriptive error message if presentationRequestUuid is missing', async () => {
      const response = await callVerifyNoPresentation(dummyNoPresentationWithoutRequestUuid, verifier, authHeader);
      expect(response.statusCode).toEqual(400);
      expect(response.body.message).toEqual('presentationRequestUuid is required.');
    });

    it('returns a 400 status code with a descriptive error message if type is invalid', async () => {
      const response = await callVerifyNoPresentation(dummyNoPresentationBadType, verifier, authHeader);
      expect(response.statusCode).toEqual(400);
      expect(response.body.message).toEqual('Invalid type: first element must be \'NoPresentation\'.');
    });

    it('returns a 400 status code with a descriptive error message if holder is invalid', async () => {
      const response = await callVerifyNoPresentation(dummyNoPresentationBadHolder, verifier, authHeader);
      expect(response.statusCode).toEqual(400);
      expect(response.body.message).toEqual('Invalid holder: must be a string.');
    });

    it('returns a 400 status code with a descriptive error message if presentationRequestUuid is invalid', async () => {
      const response = await callVerifyNoPresentation(dummyNoPresentationBadRequestUuid, verifier, authHeader);
      expect(response.statusCode).toEqual(400);
      expect(response.body.message).toEqual('Invalid presentationRequestUuid: must be a string.');
    });

    it('returns a 400 status code if proof is invalid', async () => {
      const response = await callVerifyNoPresentation(dummyNoPresentationBadProof, verifier, authHeader);
      expect(response.statusCode).toEqual(400);
    });
  });
});
