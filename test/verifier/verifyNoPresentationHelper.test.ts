import { omit } from 'lodash';

import { VerifiedStatus, UnumDto } from '../../src/types';
import { dummyAuthToken, dummyVerifierDid, makeDummyDidDocument } from './mocks';
import { NoPresentation } from '@unumid/types';
import { verifyNoPresentationHelper as verifyNoPresentation } from '../../src/verifier/verifyNoPresentationHelper';
import { getDIDDoc } from '../../src/utils/didHelper';
import { makeNetworkRequest } from '../../src/utils/networkRequestHelper';
import { doVerify } from '../../src/utils/verify';

jest.mock('../../src/utils/didHelper', () => {
  const actual = jest.requireActual('../../src/utils/didHelper');
  return {
    ...actual,
    getDIDDoc: jest.fn()
  };
});

jest.mock('../../src/utils/verify', () => {
  const actual = jest.requireActual('../../src/utils/verify');
  return {
    ...actual,
    doVerify: jest.fn(() => actual.doVerify)
  };
});

jest.mock('../../src/utils/networkRequestHelper', () => ({
  ...jest.requireActual('../../src/utils/networkRequestHelper'),
  makeNetworkRequest: jest.fn()
}));

const mockGetDIDDoc = getDIDDoc as jest.Mock;
const mockDoVerify = doVerify as jest.Mock;
const mockMakeNetworkRequest = makeNetworkRequest as jest.Mock;

const callVerifyNoPresentation = (
  noPresentation: NoPresentation,
  verifier: string,
  authHeader?: string
): Promise<UnumDto<VerifiedStatus>> => {
  return verifyNoPresentation(authHeader, noPresentation, verifier);
};

const verifier = 'did:unum:dd407b1a-ee7f-46a2-af2a-ccbb48cbb0dc';
const dummyNoPresentation: NoPresentation = {
  holder: 'did:unum:50fb0b5b-79ff-4db9-9f33-d93feab702db',
  presentationRequestUuid: 'd5cc3673-d72f-45fa-bc87-36c305f8d0a5',
  type: [
    'NoPresentation',
    'NoPresentation'
  ],
  verifierDid: verifier,
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
const dummyNoPresentationBadTypeKeywordMissing = { ...dummyNoPresentation, type: ['No No Presenation'] } as NoPresentation;
const dummyNoPresentationBadRequestUuid = { ...dummyNoPresentation, presentationRequestUuid: {} } as NoPresentation;
const dummyNoPresentationBadHolder = { ...dummyNoPresentation, holder: {} } as NoPresentation;
const dummyNoPresentationBadProof = { ...dummyNoPresentation, proof: {} } as NoPresentation;

const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';

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
