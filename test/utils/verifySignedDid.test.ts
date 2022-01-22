
import { JSONObj, SignedDidDocument } from '@unumid/types';
import { UnumDto, VerifiedStatus, CustError, verifySignedDid } from '../../src';
import { getDidDocPublicKeys } from '../../src/utils/didHelper';
import { makeNetworkRequest } from '../../src/utils/networkRequestHelper';
import { doVerify } from '../../src/utils/verify';
import { makeDummyUnsignedCredential, makeDummyCredential, dummyCredentialRequest, makeDummyDidDocument, dummyAuthToken, dummyIssuerDid, makeDummySubjectCredentialRequest, dummySubjectDid, makeDummySignedDidDocument, makeDummySubjectCredentialRequests } from '../issuer/mocks';
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
  const keyPair2 = await createKeyPairSet('pem');
  const publicKeys = [{
    signing: {
      publicKey: keyPair.signing.publicKey
    },
    encryption: {
      publicKey: keyPair.encryption.publicKey
    }
  },
  {
    signing: {
      publicKey: keyPair2.signing.publicKey
    },
    encryption: {
      publicKey: keyPair2.encryption.publicKey
    }
  }
  ];
  const didId = 'did:unum:f2054199-1069-4337-a588-83d099e79d44';
  const unsignedDidDocument = await makeDummyDidDocument({ id: didId }, keyPair.signing.privateKey, keyPair.signing.publicKey);
  const signedDidDocument = await makeDummySignedDidDocument(unsignedDidDocument, keyPair.signing.privateKey, unsignedDidDocument.id);
  // const subjectCredentialRequests = await makeDummySubjectCredentialRequests([dummyCredentialRequest], keyPair.signing.privateKey, dummySubjectDid);

  const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';

  return ({
    context,
    type,
    verifiableCredential,
    presentationRequestId,
    credentialRequests,
    // subjectCredentialRequests,
    authHeader,
    verifier,
    unsignedDidDocument,
    signedDidDocument
  });
};

describe('verifySignedDid', () => {
  let signedDidDocument, unsignedDidDocument;

  beforeAll(async () => {
    const dummyData = await populateMockData();

    unsignedDidDocument = dummyData.unsignedDidDocument;
    signedDidDocument = dummyData.signedDidDocument;
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('verifySignedDid - Success Scenario', () => {
    let response: UnumDto<VerifiedStatus>;
    let verStatus: boolean;

    beforeAll(async () => {
      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDidDocKeys.mockResolvedValue({ body: [unsignedDidDocument.publicKey], authToken: dummyAuthToken });
      mockDoVerify.mockResolvedValue(true);
      mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers: dummyResponseHeaders });
      response = await verifySignedDid(dummyAuthToken, dummyIssuerDid, signedDidDocument);
      verStatus = response.body.isVerified;
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('gets the subject did document', () => {
      expect(mockGetDidDocKeys).toBeCalled();
    });

    it('verifies the SignedDidDocument', () => {
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

  describe('verifySignedDid - Failure Scenarios', () => {
    let response: UnumDto<VerifiedStatus>;
    let verStatus: boolean;

    beforeAll(async () => {
      mockDoVerify.mockReturnValue(false);
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('gets the subject did document', async () => {
      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDidDocKeys.mockResolvedValue({ body: [unsignedDidDocument.publicKey], authToken: dummyAuthToken });
      response = await verifySignedDid(dummyAuthToken, dummyIssuerDid, signedDidDocument);
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
      // mockGetDidDocKeys.mockResolvedValue({ body: [], authToken: dummyAuthToken });
      mockGetDidDocKeys.mockImplementation(() => {
        throw new CustError(404, 'public keys not found for the DID');
      });
      try {
        response = await verifySignedDid(dummyAuthToken, dummyIssuerDid, signedDidDocument);
        fail();
      } catch (e) {
        // expect(response.body.isVerified).toBe(false);
        expect(e.message).toBe('public keys not found for the DID');
      }

      // expect(response.body.isVerified).toBe(false);
      // expect(response.body.message).toBe('public keys not found for the DID');
    });

    it('returns a 404 status code if the did document is not found', async () => {
      mockGetDidDocKeys.mockImplementation(() => {
        throw new CustError(404, 'DID Document not found.');
      });

      try {
        response = await verifySignedDid(dummyAuthToken, dummyIssuerDid, signedDidDocument);
        fail();
      } catch (e) {
        expect(e.code).toEqual(404);
      }
    });
  });

  describe('verifySignedDid - Validation Failures', () => {
    it('returns a 400 status code with a descriptive error message when didDocument is missing', async () => {
      try {
        await verifySignedDid(dummyAuthToken, dummyIssuerDid, undefined);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('SignedDid is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when proof is missing', async () => {
      try {
        const badRequest: SignedDidDocument = {
          ...signedDidDocument,
          proof: undefined
        };
        await verifySignedDid(dummyAuthToken, dummyIssuerDid, badRequest);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('proof is required.');
      }
    });
  });
});
