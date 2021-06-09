import { omit } from 'lodash';

import { VerifiedStatus, UnumDto } from '../../src/types';
import { dummyAuthToken, dummyVerifierDid, makeDummyDidDocument, makeDummyPresentation } from './mocks';
import { verifyNoPresentationHelper as verifyNoPresentation } from '../../src/verifier/verifyNoPresentationHelper';
import { getDIDDoc } from '../../src/utils/didHelper';
import { makeNetworkRequest } from '../../src/utils/networkRequestHelper';
import { doVerify } from '../../src/utils/verify';
import { PresentationPb } from '@unumid/types';

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
  noPresentation: PresentationPb,
  verifier: string,
  authHeader?: string
): Promise<UnumDto<VerifiedStatus>> => {
  return verifyNoPresentation(authHeader, noPresentation, verifier);
};

const verifier = 'did:unum:dd407b1a-ee7f-46a2-af2a-ccbb48cbb0dc';

describe('verifyNoPresentation', () => {
  let dummyNoPresentation;

  let dummyNoPresentationWithoutType;
  let dummyNoPresentationWithoutRequestId;
  let dummyNoPresentationWithoutHolder;
  let dummyNoPresentationWithoutProof;

  let dummyNoPresentationBadType;
  let dummyNoPresentationBadTypeKeywordMissing;
  let dummyNoPresentationBadRequestId;
  let dummyNoPresentationBadHolder;
  let dummyNoPresentationBadProof;

  const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';

  beforeAll(async () => {
    const dummyNoPresentation = await makeDummyPresentation({ verifierDid: verifier, context: [], type: ['NoPresentation', 'NoPresentation'], verifiableCredential: [] });

    dummyNoPresentationWithoutType = omit(dummyNoPresentation, 'type') as PresentationPb;
    dummyNoPresentationWithoutRequestId = omit(dummyNoPresentation, 'presentationRequestId') as PresentationPb;
    dummyNoPresentationWithoutHolder = omit(dummyNoPresentation, 'holder') as PresentationPb;
    dummyNoPresentationWithoutProof = omit(dummyNoPresentation, 'proof') as PresentationPb;

    dummyNoPresentationBadType = { ...dummyNoPresentation, type: {} } as PresentationPb;
    dummyNoPresentationBadTypeKeywordMissing = { ...dummyNoPresentation, type: ['No No Presenation'] } as PresentationPb;
    dummyNoPresentationBadRequestId = { ...dummyNoPresentation, presentationRequestId: {} } as PresentationPb;
    dummyNoPresentationBadHolder = { ...dummyNoPresentation, holder: {} } as PresentationPb;
    dummyNoPresentationBadProof = { ...dummyNoPresentation, proof: {} } as PresentationPb;

    // const dummyDidDoc = await makeDummyDidDocument({ id: dummyNoPresentation.holder });
    const dummyDidDoc = await makeDummyDidDocument({ });
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
      const dummyNoPresentationLocal = await makeDummyPresentation({ verifierDid: verifier, context: [], type: ['NoPresentation', 'NoPresentation'], verifiableCredential: [] });
      response = await callVerifyNoPresentation(dummyNoPresentationLocal, verifier, authHeader);
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
      const dummyNoPresentationLocal = await makeDummyPresentation({ context: [], type: ['NoPresentation', 'NoPresentation'], verifiableCredential: [] });
      response = await callVerifyNoPresentation(dummyNoPresentationLocal, verifier, authHeader);

      expect(response.authToken).toBe(authHeader);
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

    it('returns a 400 status code with a descriptive error presentationRequestUuid if holder is missing', async () => {
      try {
        await callVerifyNoPresentation(dummyNoPresentationWithoutRequestId, verifier, authHeader);
        fail();
      } catch (e) {
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Invalid Presentation: presentationRequestId is required.');
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

    it('returns a 400 status code with a descriptive error message if presentationRequestId is invalid', async () => {
      try {
        await callVerifyNoPresentation(dummyNoPresentationBadRequestId, verifier, authHeader);
      } catch (e) {
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Invalid presentationRequestId: must be a string.');
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
