
import { JSONObj } from '@unumid/types';
import { UnumDto, VerifiedStatus, CustError } from '../../src';
import { getDIDDoc, getDidDocPublicKeys } from '../../src/utils/didHelper';
import { makeNetworkRequest } from '../../src/utils/networkRequestHelper';
import { doVerify } from '../../src/utils/verify';
import { verifySubjectCredentialRequests } from '../../src/issuer/verifySubjectCredentialRequests';
import { makeDummyUnsignedCredential, makeDummyCredential, dummyCredentialRequest, makeDummyDidDocument, dummyAuthToken, dummyIssuerDid, makeDummySubjectCredentialRequest, dummySubjectDid } from './mocks';
import { createKeyPairSet } from '../../src/utils/createKeyPairs';

jest.mock('../../src/utils/didHelper', () => {
  const actual = jest.requireActual('../../src/utils/didHelper');
  return {
    ...actual,
    getDidDocPublicKeys: jest.fn()
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

const mockGetDidDocKeys = getDidDocPublicKeys as jest.Mock;
const mockDoVerify = doVerify as jest.Mock;
const mockMakeNetworkRequest = makeNetworkRequest as jest.Mock;

const populateMockData = async (): Promise<JSONObj> => {
  const context: string[] = ['https://www.w3.org/2018/credentials/v1'];
  const type: string[] = ['VerifiablePresentation'];
  const unsignedCredential = await makeDummyUnsignedCredential();
  const signedCredential = await makeDummyCredential({ unsignedCredential });
  const verifiableCredential = [signedCredential];

  const presentationRequestId = '0cebee3b-3295-4ef6-a4d6-7dfea413b3aa';
  const verifier = 'did:unum:f2054199-1069-4337-a588-83d099e79d44';

  const credentialRequest = dummyCredentialRequest;
  const credentialRequests = [credentialRequest];

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
    authHeader,
    verifier
  });
};

describe('verifySubjectCredentialRequest', () => {
  let credentialRequests, subjectCredentialRequests, subjectCredentialRequest;

  beforeAll(async () => {
    const dummyData = await populateMockData();

    credentialRequests = dummyData.credentialRequests;
    subjectCredentialRequests = dummyData.subjectCredentialRequests;
    subjectCredentialRequest = dummyData.subjectCredentialRequest;
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('verifySubjectCredentialRequests - Success Scenario', () => {
    let response: UnumDto<VerifiedStatus>;
    let verStatus: boolean;

    beforeAll(async () => {
      const dummySubjectDidDoc = await makeDummyDidDocument();

      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDidDocKeys.mockResolvedValue({ authToken: dummyAuthToken, body: [dummySubjectDidDoc.publicKey] });
      mockDoVerify.mockResolvedValue(true);
      mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers: dummyResponseHeaders });
      response = await verifySubjectCredentialRequests(dummyAuthToken, dummyIssuerDid, dummySubjectDid, subjectCredentialRequests);
      verStatus = response.body.isVerified;
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('gets the subject did document', () => {
      expect(mockGetDidDocKeys).toBeCalled();
    });

    it('verifies the SubjectCredentialRequest', () => {
      expect(mockDoVerify).toBeCalled();
    });

    it('Result should be true', () => {
      expect(verStatus).toBeDefined();
      expect(verStatus).toBe(true);
    });

    it('returns the x-auth-token header returned from the SaaS api in the x-auth-token header', () => {
      expect(response.authToken).toEqual(dummyAuthToken);
    });
  });

  describe('verifySubjectCredentialRequests - Failure Scenarios', () => {
    let response: UnumDto<VerifiedStatus>;
    let verStatus: boolean;
    // const { context, type, verifiableCredential, presentationRequestId, proof, invalidProof, authHeader, verifier, credentialRequests } = populateMockData();

    beforeAll(async () => {
      mockDoVerify.mockReturnValue(false);
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('gets the subject did document', async () => {
      const dummySubjectDidDoc = await makeDummyDidDocument();
      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDidDocKeys.mockResolvedValue({ authToken: dummyAuthToken, body: [dummySubjectDidDoc.publicKey] });
      response = await verifySubjectCredentialRequests(dummyAuthToken, dummyIssuerDid, dummySubjectDid, subjectCredentialRequests);
      verStatus = response.body.isVerified;
      expect(mockGetDidDocKeys).toBeCalled();
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
      mockGetDidDocKeys.mockResolvedValue({ authToken: dummyAuthToken, body: [] });
      const response = await verifySubjectCredentialRequests(dummyAuthToken, dummyIssuerDid, dummySubjectDid, subjectCredentialRequests);
      expect(response.body.isVerified).toBe(false);
      expect(response.body.message).toBe(`Public key not found for the subject did ${subjectCredentialRequests[0].proof.verificationMethod}`);
    });

    it('returns a 404 status code if the did document is not found', async () => {
      mockGetDidDocKeys.mockImplementation(() => {
        throw new CustError(404, 'DID Document not found.');
      });

      try {
        response = await verifySubjectCredentialRequests(dummyAuthToken, dummyIssuerDid, dummySubjectDid, subjectCredentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toEqual(404);
      }
    });
  });

  describe('verifySubjectCredentialRequest - Validation Failures', () => {
    it('returns a 400 status code with a descriptive error message when subjectCredentialRequests is not a non empty array', async () => {
      try {
        await verifySubjectCredentialRequests(dummyAuthToken, dummyIssuerDid, dummySubjectDid, []);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('subjectCredentialRequests must be a non-empty array.');
      }
    });

    it('returns a 400 status code with a descriptive error message when proof is missing', async () => {
      try {
        const badRequest = {
          ...subjectCredentialRequest,
          proof: undefined
        };
        await verifySubjectCredentialRequests(dummyAuthToken, dummyIssuerDid, dummySubjectDid, [badRequest]);
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
        await verifySubjectCredentialRequests(dummyAuthToken, dummyIssuerDid, dummySubjectDid, [badRequest]);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid SubjectCredentialRequest[0]: type must be defined.');
      }
    });

    it('returns a 400 status code with a descriptive error message when required is missing', async () => {
      const badRequest = {
        ...subjectCredentialRequest,
        required: undefined
      };
      try {
        await verifySubjectCredentialRequests(dummyAuthToken, dummyIssuerDid, dummySubjectDid, [badRequest]);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid SubjectCredentialRequest[0]: required must be defined.');
      }
    });

    it('returns a 400 status code with a descriptive error message when type is not a string', async () => {
      const badRequest = {
        ...subjectCredentialRequest,
        type: []
      };
      try {
        await verifySubjectCredentialRequests(dummyAuthToken, dummyIssuerDid, dummySubjectDid, [badRequest]);
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
        await verifySubjectCredentialRequests(dummyAuthToken, dummyIssuerDid, dummySubjectDid, [badRequest]);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid SubjectCredentialRequest[0]: issuers must be defined.');
      }
    });

    it('returns a 401 status code if x-auth-token header is missing', async () => {
      try {
        await verifySubjectCredentialRequests('', dummyIssuerDid, dummySubjectDid, credentialRequests);
        fail();
      } catch (e) {
        expect(e.code).toEqual(401);
      }
    });
  });
});
