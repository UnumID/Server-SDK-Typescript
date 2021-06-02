import { verifyNoPresentationHelper } from '../../src/verifier/verifyNoPresentationHelper';

import { getUUID } from '../../src/utils/helpers';
import { PresentationPb, JSONObj, Presentation } from '@unumid/types';
import { checkCredentialStatus, UnumDto, VerifiedStatus, CustError, verifyPresentation } from '../../src';
import { getDIDDoc } from '../../src/utils/didHelper';
import { makeNetworkRequest } from '../../src/utils/networkRequestHelper';
import { doVerify } from '../../src/utils/verify';
import { isCredentialExpired } from '../../src/verifier/isCredentialExpired';
import { verifyCredential } from '../../src/verifier/verifyCredential';
import { verifyPresentationHelper } from '../../src/verifier/verifyPresentationHelper';
import { makeDummyPresentation, makeDummyUnsignedCredential, makeDummyCredential, dummyCredentialRequest, makeDummyUnsignedPresentationRequest, makeDummyPresentationRequestResponse, makeDummyUnsignedPresentation, makeDummyDidDocument, dummyAuthToken, dummyIssuerDid } from './mocks';
import { encryptBytes } from '@unumid/library-crypto';

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

jest.mock('../../src/verifier/verifyCredential');
jest.mock('../../src/verifier/isCredentialExpired');
jest.mock('../../src/verifier/checkCredentialStatus');

const mockVerifyCredential = verifyCredential as jest.Mock;
const mockIsCredentialExpired = isCredentialExpired as jest.Mock;
const mockCheckCredentialStatus = checkCredentialStatus as jest.Mock;
const mockGetDIDDoc = getDIDDoc as jest.Mock;
const mockDoVerify = doVerify as jest.Mock;
const mockMakeNetworkRequest = makeNetworkRequest as jest.Mock;

const callVerifyPresentation = async (context, type, verifiableCredential, presentationRequestUuid, proof, verifier, auth = '', credentialRequests): Promise<UnumDto<VerifiedStatus>> => {
  const presentation: PresentationPb = await makeDummyPresentation({
    context,
    type,
    verifiableCredential,
    presentationRequestUuid,
    verifierDid: verifier
  });

  return verifyPresentationHelper(auth, presentation, verifier, credentialRequests);
};

const callVerifyPresentationManual = (context, type, verifiableCredential, presentationRequestUuid, proof, verifier, auth = '', credentialRequests): Promise<UnumDto<VerifiedStatus>> => {
  const presentation: PresentationPb = {
    context,
    type,
    verifiableCredential,
    presentationRequestUuid,
    verifierDid: verifier,
    proof
  };
  return verifyPresentationHelper(auth, presentation, verifier, credentialRequests);
};

const copyCredentialObj = (credential: JSONObj, elemName: string, elemValue = ''): JSONObj => {
  const newCred: JSONObj = [
    {
      context: credential.context,
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

const populateMockData = async (): Promise<JSONObj> => {
  const context: string[] = ['https://www.w3.org/2018/credentials/v1'];
  const type: string[] = ['VerifiablePresentation'];
  const unsignedCredential = await makeDummyUnsignedCredential();
  const signedCredential = await makeDummyCredential({ unsignedCredential });
  const verifiableCredential = [signedCredential];

  const presentationRequestUuid = '0cebee3b-3295-4ef6-a4d6-7dfea413b3aa';
  const verifier = 'did:unum:f2054199-1069-4337-a588-83d099e79d44';

  const credentialRequest = dummyCredentialRequest;
  const credentialRequests = [credentialRequest];
  const presentationRequest = await makeDummyUnsignedPresentationRequest({ uuid: presentationRequestUuid, verifier, credentialRequests });
  const presentationRequestDto = await makeDummyPresentationRequestResponse({ unsignedPresentationRequest: presentationRequest });
  const proof = (await presentationRequestDto).presentationRequest.proof;

  const unsignedPresentation = await makeDummyUnsignedPresentation({ verifierDid: verifier, context, type, verifiableCredential: verifiableCredential, presentationRequestUuid });
  const presentation = await makeDummyPresentation({ verifierDid: verifier, context, type, verifiableCredential: verifiableCredential, presentationRequestUuid });

  const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';

  return ({
    context,
    type,
    verifiableCredential,
    presentationRequestUuid,
    credentialRequests,
    presentationRequest,
    presentationRequestDto,
    proof,
    authHeader,
    verifier,
    presentation,
    unsignedPresentation
  });
};

describe('verifyPresentationHelper', () => {
  let context, type, verifiableCredential, presentationRequestUuid, proof, authHeader, verifier, credentialRequests, presentationRequestDto, presentationRequest, unsignedPresentationRequest, presentation, unsignedPresentation;

  beforeAll(async () => {
  // const presentationRequest = makeDummyPresentationRequestResponse();
    const dummyData = await populateMockData();
    context = dummyData.context;
    type = dummyData.type;
    verifiableCredential = dummyData.verifiableCredential;
    presentationRequestUuid = dummyData.presentationRequestUuid;
    proof = dummyData.proof;
    authHeader = dummyData.authHeader;
    verifier = dummyData.verifier;
    credentialRequests = dummyData.credentialRequests;
    presentationRequestDto = dummyData.presentationRequestDto;
    presentationRequest = dummyData.presentationRequestDto.presentationRequest;
    unsignedPresentationRequest = dummyData.presentationRequest;
    unsignedPresentation = dummyData.unsignedPresentation;

    presentation = dummyData.presentation;
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('verifyPresentationHelper - Success Scenario with verifiableCredentialsString', () => {
    let response: UnumDto<VerifiedStatus>;
    let verStatus: boolean;

    // const { context, type, verifiableCredential, verifiableCredentialString, presentationRequestUuid, proof, authHeader, verifier, credentialRequests } = populateMockData();

    beforeAll(async () => {
      const dummySubjectDidDoc = await makeDummyDidDocument();

      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDIDDoc.mockResolvedValueOnce({ body: dummySubjectDidDoc, headers: dummyResponseHeaders });
      mockDoVerify.mockResolvedValue(true);
      mockVerifyCredential.mockResolvedValue({ authToken: dummyAuthToken, body: true });
      mockIsCredentialExpired.mockReturnValue(false);
      mockCheckCredentialStatus.mockReturnValue({ authToken: dummyAuthToken, body: { status: 'valid' } });
      mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers: dummyResponseHeaders });
      response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
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
      mockCheckCredentialStatus.mockReturnValue({ authToken: undefined, body: { status: 'valid' } });
      mockVerifyCredential.mockResolvedValue({ authToken: undefined, body: true });
      mockDoVerify.mockReturnValueOnce(true);
      response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
      expect(response.authToken).toBeUndefined();
    });
  });

  describe('verifyPresentationHelper - Success Scenario', () => {
    let response: UnumDto<VerifiedStatus>;
    let verStatus: boolean;

    // const { context, type, verifiableCredential, verifiableCredentialString, presentationRequestUuid, proof, authHeader, verifier, credentialRequests } = populateMockData();

    beforeAll(async () => {
      const dummySubjectDidDoc = await makeDummyDidDocument();

      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDIDDoc.mockResolvedValueOnce({ body: dummySubjectDidDoc, headers: dummyResponseHeaders });
      mockDoVerify.mockResolvedValue(true);
      mockVerifyCredential.mockResolvedValue({ authToken: dummyAuthToken, body: true });
      mockIsCredentialExpired.mockReturnValue(false);
      mockCheckCredentialStatus.mockReturnValue({ authToken: dummyAuthToken, body: { status: 'valid' } });
      mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers: dummyResponseHeaders });
      response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
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
      mockCheckCredentialStatus.mockReturnValue({ authToken: undefined, body: { status: 'valid' } });
      mockVerifyCredential.mockResolvedValue({ authToken: undefined, body: true });
      mockDoVerify.mockReturnValueOnce(true);
      response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
      expect(response.authToken).toBeUndefined();
    });
  });

  describe('verifyPresentationHelper - Failure Scenarios', () => {
    let response: UnumDto<VerifiedStatus>;
    let verStatus: boolean;
    // const { context, type, verifiableCredential, presentationRequestUuid, proof, invalidProof, authHeader, verifier, credentialRequests } = populateMockData();

    beforeAll(async () => {
      const dummySubjectDidDoc = await makeDummyDidDocument();
      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };

      mockDoVerify.mockReturnValue(false);
      mockVerifyCredential.mockResolvedValue({ authToken: dummyAuthToken, body: false });
      mockIsCredentialExpired.mockReturnValue(true);
      mockCheckCredentialStatus.mockReturnValue({ authToken: dummyAuthToken, body: { status: 'revoked' } });
      verifiableCredential[0].proof.verificationMethod = proof.verificationMethod;
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('gets the subject did document', async () => {
      const dummySubjectDidDoc = await makeDummyDidDocument();
      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDIDDoc.mockResolvedValue({ body: dummySubjectDidDoc, headers: dummyResponseHeaders });
      response = await callVerifyPresentationManual(context, type, verifiableCredential, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
      verStatus = response.body.isVerified;
      expect(mockGetDIDDoc).toBeCalled();
    });

    it('verifies the presentation', async () => {
      expect(mockDoVerify).toBeCalled();
    });

    it('Result should be true', () => {
      expect(verStatus).toBeDefined();
      expect(verStatus).toBe(false);
    });

    it('returns a isVerified false with proper message if the did document has no public keys', async () => {
      const dummyDidDocWithoutKeys = {
        ...makeDummyDidDocument(),
        publicKey: []
      };
      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDIDDoc.mockResolvedValue({ body: dummyDidDocWithoutKeys, headers: dummyResponseHeaders });
      const response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
      expect(response.body.isVerified).toBe(false);
      expect(response.body.message).toBe('Public key not found for the DID associated with the proof.verificationMethod');
    });

    it('returns a 404 status code if the did document is not found', async () => {
      mockGetDIDDoc.mockResolvedValue(new CustError(404, 'DID Document not found.'));

      try {
        await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toEqual(404);
      }
    });

    it('returns a isVerified false with proper message if the verifierDid does not match the one in the presentation.', async () => {
      const dummyDidDocWithoutKeys = {
        ...makeDummyDidDocument(),
        publicKey: []
      };
      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDIDDoc.mockResolvedValueOnce({ body: dummyDidDocWithoutKeys, headers: dummyResponseHeaders });

      const response = await verifyPresentationHelper(authHeader, presentation, 'fakeVerifierDid', credentialRequests);

      // const response = await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
      expect(response.body.isVerified).toBe(false);
      expect(response.body.message).toBe(`The presentation was meant for verifier, ${presentation.verifierDid}, not the provided verifier, fakeVerifierDid.`);
    });
  });

  describe('verifyPresentationHelper - Validation Failures', () => {
    // const { context, type, verifiableCredential, presentationRequestUuid, proof, authHeader, verifier, credentialRequests } = populateMockData();

    it('returns a 400 status code with a descriptive error message when context is missing', async () => {
      try {
        await callVerifyPresentationManual('', type, verifiableCredential, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: context is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when type is missing', async () => {
      try {
        await callVerifyPresentationManual(context, '', verifiableCredential, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: type is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when verifiableCredential is missing', async () => {
      try {
        await callVerifyPresentationManual(context, type, '', presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: verifiableCredential must be a non-empty array.');
      }
    });

    it('returns a 400 status code with a descriptive error message when presentationRequestUuid is missing', async () => {
      try {
        await callVerifyPresentationManual(context, type, verifiableCredential, '', proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: presentationRequestUuid is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when proof is missing', async () => {
      try {
        await callVerifyPresentationManual(context, type, verifiableCredential, presentationRequestUuid, '', verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: proof is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when @context is not an array', async () => {
      try {
        await callVerifyPresentationManual('https://www.w3.org/2018/credentials/v1', type, verifiableCredential, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: context must be a non-empty array.');
      }
    });

    it('returns a 400 status code with a descriptive error message when @context array is empty', async () => {
      try {
        await callVerifyPresentationManual([], type, verifiableCredential, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: context must be a non-empty array.');
      }
    });

    it('returns a 400 status code with a descriptive error message when type is not an array', async () => {
      try {
        await callVerifyPresentationManual(context, 'VerifiablePresentation', verifiableCredential, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: type must be a non-empty array.');
      }
    });

    it('returns a 400 status code with a descriptive error message when type is empty', async () => {
      try {
        await callVerifyPresentationManual(context, [], verifiableCredential, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: type must be a non-empty array.');
      }
    });

    it('returns a 400 status code with a descriptive error message when verifiableCredential is not an array', async () => {
      try {
        await callVerifyPresentationManual(context, type, 'verifiableCredential', presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: verifiableCredential must be a non-empty array.');
      }
    });

    it('returns a 400 status code with a descriptive error message when verifiableCredentials array is empty', async () => {
      try {
        await callVerifyPresentationManual(context, type, undefined, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: verifiableCredential must be a non-empty array.');
      }
    });

    it('returns a 401 status code if x-auth-token header is missing', async () => {
      try {
        await callVerifyPresentation(context, type, verifiableCredential, presentationRequestUuid, proof, verifier, '', credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toEqual(401);
      }
    });
  });

  describe('verifyPresentation - Validation for verifiableCredential object', () => {
    let context, type, verifiableCredentials, presentationRequestUuid, proof, authHeader, verifier, presentationRequestDto, presentationRequest, unsignedPresentationRequest, presentation, unsignedPresentation;

    beforeAll(async () => {
    // const presentationRequest = makeDummyPresentationRequestResponse();
      const dummyData = await populateMockData();
      context = dummyData.context;
      type = dummyData.type;
      verifiableCredentials = dummyData.verifiableCredentials;
      presentationRequestUuid = dummyData.presentationRequestUuid;
      proof = dummyData.proof;
      authHeader = dummyData.authHeader;
      verifier = dummyData.verifier;
      presentationRequestDto = dummyData.presentationRequestDto;
      presentationRequest = dummyData.presentationRequestDto.presentationRequest;
      unsignedPresentationRequest = dummyData.presentationRequest;
      unsignedPresentation = dummyData.unsignedPresentation;

      presentation = dummyData.presentation;
    });

    let cred;
    it('Response code should be ' + 400 + ' when context is not passed', async () => {
      cred = copyCredentialObj(verifiableCredential[0], 'context');
      try {
        await callVerifyPresentationManual(context, type, cred, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid verifiableCredential[0]: context is required.');
      }
    });

    it('Response code should be ' + 400 + ' when credentialStatus is not passed', async () => {
      cred = copyCredentialObj(verifiableCredential[0], 'credentialStatus');
      try {
        await callVerifyPresentationManual(context, type, cred, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid verifiableCredential[0]: credentialStatus is required.');
      }
    });

    it('Response code should be ' + 400 + ' when credentialSubject is not passed', async () => {
      cred = copyCredentialObj(verifiableCredential[0], 'credentialSubject');
      try {
        await callVerifyPresentationManual(context, type, cred, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid verifiableCredential[0]: credentialSubject is required.');
      }
    });

    it('Response code should be ' + 400 + ' when issuer is not passed', async () => {
      cred = copyCredentialObj(verifiableCredential[0], 'issuer');
      try {
        await callVerifyPresentationManual(context, type, cred, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid verifiableCredential[0]: issuer is required.');
      }
    });

    it('Response code should be ' + 400 + ' when type is not passed', async () => {
      cred = copyCredentialObj(verifiableCredential[0], 'type');
      try {
        await callVerifyPresentationManual(context, type, cred, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid verifiableCredential[0]: type is required.');
      }
    });

    it('Response code should be ' + 400 + ' when id is not passed', async () => {
      cred = copyCredentialObj(verifiableCredential[0], 'id');
      try {
        await callVerifyPresentationManual(context, type, cred, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid verifiableCredential[0]: id is required.');
      }
    });

    it('Response code should be ' + 400 + ' when issuanceDate is not passed', async () => {
      cred = copyCredentialObj(verifiableCredential[0], 'issuanceDate');
      try {
        await callVerifyPresentationManual(context, type, cred, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid verifiableCredential[0]: issuanceDate is required.');
      }
    });

    it('Response code should be ' + 400 + ' when proof is not passed', async () => {
      cred = copyCredentialObj(verifiableCredential[0], 'proof');
      try {
        await callVerifyPresentationManual(context, type, cred, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid verifiableCredential[0]: proof is required.');
      }
    });
  });

  describe('verifyPresentation credential matches requests', () => {
    beforeAll(async () => {
      const dummySubjectDidDoc = await makeDummyDidDocument();

      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDIDDoc.mockResolvedValueOnce({ body: dummySubjectDidDoc, headers: dummyResponseHeaders });
      mockDoVerify.mockResolvedValue(true);
      mockVerifyCredential.mockResolvedValue({ authToken: dummyAuthToken, body: true });
      mockIsCredentialExpired.mockReturnValue(false);
      mockCheckCredentialStatus.mockReturnValue({ authToken: dummyAuthToken, body: { status: 'valid' } });
      mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers: dummyResponseHeaders });
    });

    it('Response code should be ' + 400 + ' when credentials do not meet credential request type requirements', async () => {
      const credCopy = JSON.parse(JSON.stringify(verifiableCredential));
      credCopy[0].type = ['VerifiableCredential', 'AddressCredential'];
      try {
        await callVerifyPresentationManual(context, type, credCopy, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: credentials provided did not meet type requirements, [AddressCredential], per the presentation request, [DummyCredential].');
      }
    });

    it('Response code should be ' + 400 + ' when credentials do not meet credential request issuer requirements', async () => {
      const credCopy = JSON.parse(JSON.stringify(verifiableCredential));
      credCopy[0].issuer = 'dummyIssuerDid';
      try {
        await callVerifyPresentationManual(context, type, credCopy, presentationRequestUuid, proof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe(`Invalid Presentation: credentials provided did not meet issuer requirements, [dummyIssuerDid], per the presentation request, [${dummyIssuerDid}].`);
      }
    });
  });

  describe('verifyPresentationHelper - Validation for proof object', () => {
    it('returns a 400 status code with a descriptive error message when created is missing', async () => {
      const invalidProof = { created: '', signatureValue: proof.signatureValue, type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
      try {
        await callVerifyPresentationManual(context, type, verifiableCredential, presentationRequestUuid, invalidProof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: proof.created is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when signatureValue is missing', async () => {
      const invalidProof = { created: proof.created, signatureValue: '', type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
      try {
        await callVerifyPresentationManual(context, type, verifiableCredential, presentationRequestUuid, invalidProof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: proof.signatureValue is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when type is missing', async () => {
      const invalidProof = { created: proof.created, signatureValue: proof.signatureValue, type: '', verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
      try {
        await callVerifyPresentationManual(context, type, verifiableCredential, presentationRequestUuid, invalidProof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: proof.type is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when verificationMethod is missing', async () => {
      const invalidProof = { created: proof.created, signatureValue: proof.signatureValue, type: proof.type, verificationMethod: '', proofPurpose: proof.proofPurpose };
      try {
        await callVerifyPresentationManual(context, type, verifiableCredential, presentationRequestUuid, invalidProof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: proof.verificationMethod is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when proofPurpose is missing', async () => {
      const invalidProof = { created: proof.created, signatureValue: proof.signatureValue, type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: '' };
      try {
        await callVerifyPresentationManual(context, type, verifiableCredential, presentationRequestUuid, invalidProof, verifier, authHeader, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: proof.proofPurpose is required.');
      }
    });
  });
});
