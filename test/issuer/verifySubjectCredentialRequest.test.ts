import { verifyNoPresentationHelper } from '../../src/verifier/verifyNoPresentationHelper';

import { getUUID } from '../../src/utils/helpers';
import { PresentationPb, JSONObj, Presentation } from '@unumid/types';
import { checkCredentialStatus, UnumDto, VerifiedStatus, CustError, verifyPresentation } from '../../src';
import { getDIDDoc } from '../../src/utils/didHelper';
import { makeNetworkRequest } from '../../src/utils/networkRequestHelper';
import { doVerify } from '../../src/utils/verify';
import { isCredentialExpired } from '../../src/verifier/isCredentialExpired';
import { verifyCredential } from '../../src/verifier/verifyCredential';
import { verifySubjectCredentialRequest, verifySubjectCredentialRequests } from '../../src/issuer/verifySubjectCredentialRequest';
import { makeDummyUnsignedCredential, makeDummyCredential, dummyCredentialRequest, makeDummyDidDocument, dummyAuthToken, dummyIssuerDid, makeDummySubjectCredentialRequest, dummySubjectDid } from './mocks';
import { encryptBytes } from '@unumid/library-crypto';
import { createKeyPairSet } from '../../src/utils/createKeyPairs';

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

// const verifySubjectCredentialRequest = async (context, type, verifiableCredential, presentationRequestId, proof, verifier, auth = '', credentialRequests): Promise<UnumDto<VerifiedStatus>> => {
//   const presentation: PresentationPb = await makeDummyPresentation({
//     context,
//     type,
//     verifiableCredential,
//     presentationRequestId,
//     verifierDid: verifier
//   });

//   return verifySubjectCredentialRequest(auth, presentation, verifier, credentialRequests);
// };

// const verifySubjectCredentialRequest = (context, type, verifiableCredential, presentationRequestId, proof, verifier, auth = '', credentialRequests): Promise<UnumDto<VerifiedStatus>> => {
//   const presentation: PresentationPb = {
//     context,
//     type,
//     verifiableCredential,
//     presentationRequestId,
//     verifierDid: verifier,
//     proof
//   };
//   return verifySubjectCredentialRequest(auth, presentation, verifier, credentialRequests);
// };

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

  const presentationRequestUuid = '0cebee3b-3295-4ef6-a4d6-7dfea413b3ab';
  const presentationRequestId = '0cebee3b-3295-4ef6-a4d6-7dfea413b3aa';
  const verifier = 'did:unum:f2054199-1069-4337-a588-83d099e79d44';

  const credentialRequest = dummyCredentialRequest;
  const credentialRequests = [credentialRequest];
  // const presentationRequest = await makeDummyUnsignedPresentationRequest({ uuid: presentationRequestUuid, id: presentationRequestId, verifier, credentialRequests });
  // const presentationRequestDto = await makeDummyPresentationRequestResponse({ unsignedPresentationRequest: presentationRequest });
  // const proof = (await presentationRequestDto).presentationRequest.proof;

  // const unsignedPresentation = await makeDummyUnsignedPresentation({ verifierDid: verifier, context, type, verifiableCredential: verifiableCredential, presentationRequestId });
  // const presentation = await makeDummyPresentation({ verifierDid: verifier, context, type, verifiableCredential: verifiableCredential, presentationRequestId });

  const keyPair = await createKeyPairSet('pem');
  const subjectCredentialRequest = await makeDummySubjectCredentialRequest(dummyCredentialRequest, keyPair.signing.privateKey, dummySubjectDid);
  const subjectCredentialRequests = [subjectCredentialRequest];

  const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';

  return ({
    context,
    type,
    verifiableCredential,
    presentationRequestId,
    credentialRequests,
    subjectCredentialRequest,
    subjectCredentialRequests,
    // presentationRequest,
    // presentationRequestDto,
    // proof,
    authHeader,
    verifier
    // presentation,
    // unsignedPresentation
  });
};

describe('verifySubjectCredentialRequest', () => {
  let context, type, verifiableCredential, presentationRequestId, proof, authHeader, verifier, credentialRequests, subjectCredentialRequests, subjectCredentialRequest, presentationRequest, unsignedPresentationRequest, presentation, unsignedPresentation;

  beforeAll(async () => {
  // const presentationRequest = makeDummyPresentationRequestResponse();
    const dummyData = await populateMockData();
    context = dummyData.context;
    type = dummyData.type;
    verifiableCredential = dummyData.verifiableCredential;
    presentationRequestId = dummyData.presentationRequestId;
    proof = dummyData.proof;
    authHeader = dummyData.authHeader;
    verifier = dummyData.verifier;
    credentialRequests = dummyData.credentialRequests;
    subjectCredentialRequests = dummyData.subjectCredentialRequests;
    subjectCredentialRequest = dummyData.subjectCredentialRequest;
    // presentationRequestDto = dummyData.presentationRequestDto;
    // presentationRequest = dummyData.presentationRequestDto.presentationRequest;
    // unsignedPresentationRequest = dummyData.presentationRequest;
    // unsignedPresentation = dummyData.unsignedPresentation;

    presentation = dummyData.presentation;
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('verifySubjectCredentialRequests - Success Scenario with verifiableCredentialsString', () => {
    let response: UnumDto<VerifiedStatus>;
    let verStatus: boolean;

    // const { context, type, verifiableCredential, verifiableCredentialString, presentationRequestId, proof, authHeader, verifier, credentialRequests } = populateMockData();

    beforeAll(async () => {
      const dummySubjectDidDoc = await makeDummyDidDocument();

      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDIDDoc.mockResolvedValueOnce({ body: dummySubjectDidDoc, headers: dummyResponseHeaders });
      mockDoVerify.mockResolvedValue(true);
      // mockVerifyCredential.mockResolvedValue({ authToken: dummyAuthToken, body: true });
      // mockIsCredentialExpired.mockReturnValue(false);
      // mockCheckCredentialStatus.mockReturnValue({ authToken: dummyAuthToken, body: { status: 'valid' } });
      mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers: dummyResponseHeaders });
      response = await verifySubjectCredentialRequests(dummyAuthToken, subjectCredentialRequests);
      verStatus = response.body.isVerified;
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('gets the subject did document', () => {
      expect(mockGetDIDDoc).toBeCalled();
    });

    it('verifies the SubjectCredentialRequest', () => {
      expect(mockDoVerify).toBeCalled();
    });

    // it('verifies each credential', () => {
    //   verifiableCredential.forEach((vc) => {
    //     expect(mockVerifyCredential).toBeCalledWith(vc, authHeader);
    //   });
    // });

    // it('checks if each credential is expired', () => {
    //   verifiableCredential.forEach((vc) => {
    //     expect(mockIsCredentialExpired).toBeCalledWith(vc);
    //   });
    // });

    // it('checks the status of each credential', () => {
    //   verifiableCredential.forEach((vc) => {
    //     expect(mockCheckCredentialStatus).toBeCalledWith(authHeader, vc.id);
    //   });
    // });

    it('Result should be true', () => {
      expect(verStatus).toBeDefined();
      expect(verStatus).toBe(true);
    });

    it('returns the x-auth-token header returned from the SaaS api in the x-auth-token header', () => {
      expect(response.authToken).toEqual(dummyAuthToken);
    });

    // todo?
    // it('does not return an x-auth-token header if the SaaS does not return an x-auth-token header', async () => {
    //   const dummySubjectDidDoc = await makeDummyDidDocument();
    //   const dummyApiResponse = { body: dummySubjectDidDoc };
    //   mockMakeNetworkRequest.mockResolvedValueOnce(dummyApiResponse);
    //   mockGetDIDDoc.mockResolvedValue({ body: dummySubjectDidDoc, authToken: undefined });
    //   // mockCheckCredentialStatus.mockReturnValue({ authToken: undefined, body: { status: 'valid' } });
    //   // mockVerifyCredential.mockResolvedValue({ authToken: undefined, body: true });
    //   mockDoVerify.mockReturnValueOnce(true);
    //   response = await verifySubjectCredentialRequests(dummyAuthToken, subjectCredentialRequests);
    //   expect(response.authToken).toBeUndefined();
    // });
  });

  describe('verifySubjectCredentialRequests - Failure Scenarios', () => {
    let response: UnumDto<VerifiedStatus>;
    let verStatus: boolean;
    // const { context, type, verifiableCredential, presentationRequestId, proof, invalidProof, authHeader, verifier, credentialRequests } = populateMockData();

    beforeAll(async () => {
      const dummySubjectDidDoc = await makeDummyDidDocument();
      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };

      mockDoVerify.mockReturnValue(false);
      // mockVerifyCredential.mockResolvedValue({ authToken: dummyAuthToken, body: false });
      // mockIsCredentialExpired.mockReturnValue(true);
      // mockCheckCredentialStatus.mockReturnValue({ authToken: dummyAuthToken, body: { status: 'revoked' } });
      // verifiableCredential[0].proof.verificationMethod = proof.verificationMethod;
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('gets the subject did document', async () => {
      const dummySubjectDidDoc = await makeDummyDidDocument();
      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDIDDoc.mockResolvedValue({ body: dummySubjectDidDoc, headers: dummyResponseHeaders });
      response = await verifySubjectCredentialRequests(dummyAuthToken, subjectCredentialRequests);
      verStatus = response.body.isVerified;
      expect(mockGetDIDDoc).toBeCalled();
    });

    it('verifies the subject credential request', async () => {
      expect(mockDoVerify).toBeCalled();
    });

    it('Result should be true', () => {
      expect(verStatus).toBeDefined();
      expect(verStatus).toBe(false);
    });

    it('returns a isVerified false with proper message if the did document has no public keys', async () => {
      const dummyDidDocWithoutKeys = {
        ...await makeDummyDidDocument(),
        publicKey: []
      };
      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDIDDoc.mockResolvedValue({ body: dummyDidDocWithoutKeys, headers: dummyResponseHeaders });
      const response = await verifySubjectCredentialRequests(dummyAuthToken, subjectCredentialRequests);
      expect(response.body.isVerified).toBe(false);
      expect(response.body.message).toBe(`Public key not found for the subject did ${subjectCredentialRequests[0].proof.verificationMethod}`);
    });

    it('returns a 404 status code if the did document is not found', async () => {
      mockGetDIDDoc.mockResolvedValue(new CustError(404, 'DID Document not found.'));

      try {
        response = await verifySubjectCredentialRequests(dummyAuthToken, subjectCredentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toEqual(404);
      }
    });
  });

  describe('verifySubjectCredentialRequest - Validation Failures', () => {
    // const { context, type, verifiableCredential, presentationRequestId, proof, authHeader, verifier, credentialRequests } = populateMockData();

    it('returns a 400 status code with a descriptive error message when subjectCredentialRequests is not a non empty array', async () => {
      try {
        await verifySubjectCredentialRequests(dummyAuthToken, []);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('subjectCredentialRequests must be a non-empty array.');
      }
    });

    it('returns a 400 status code with a descriptive error message when proof is missing', async () => {
      try {
        await verifySubjectCredentialRequests(dummyAuthToken, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid SubjectCredentialRequest[0]: proof must be defined.');
      }
    });

    it('returns a 400 status code with a descriptive error message when type is missing', async () => {
      const badRequest = {
        ...subjectCredentialRequest,
        type: undefined
      };
      try {
        await verifySubjectCredentialRequests(dummyAuthToken, [badRequest]);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid SubjectCredentialRequest[0]: type must be defined.');
      }
    });

    it('returns a 400 status code with a descriptive error message when type is not a string', async () => {
      const badRequest = {
        ...subjectCredentialRequest,
        type: []
      };
      try {
        await verifySubjectCredentialRequests(dummyAuthToken, [badRequest]);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid SubjectCredentialRequest[0]: type must be a string.');
      }
    });

    it('returns a 400 status code with a descriptive error message when issuers is missing', async () => {
      const badRequest = {
        ...subjectCredentialRequest,
        issuers: undefined
      };

      try {
        await verifySubjectCredentialRequests(dummyAuthToken, [badRequest]);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid SubjectCredentialRequest[0]: issuers must be defined.');
      }
    });

    it('returns a 401 status code if x-auth-token header is missing', async () => {
      try {
        await verifySubjectCredentialRequests('', credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toEqual(401);
      }
    });
  });
});
