
import { JSONObj, SignedDidDocument } from '@unumid/types';
import { UnumDto, VerifiedStatus, CustError, verifySubjectDidDocument } from '../../src';
import { getDIDDoc } from '../../src/utils/didHelper';
import { makeNetworkRequest } from '../../src/utils/networkRequestHelper';
import { doVerify } from '../../src/utils/verify';
import { makeDummyUnsignedCredential, makeDummyCredential, dummyCredentialRequest, makeDummyDidDocument, dummyAuthToken, dummyIssuerDid, makeDummySubjectCredentialRequest, dummySubjectDid, makeDummySignedDidDocument } from '../issuer/mocks';
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

const mockGetDIDDoc = getDIDDoc as jest.Mock;
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
    verifier,
    unsignedDidDocument,
    signedDidDocument
  });
};

describe('verifySubjectDidDocument', () => {
  let credentialRequests, subjectCredentialRequests, subjectCredentialRequest, signedDidDocument, unsignedDidDocument;

  beforeAll(async () => {
    const dummyData = await populateMockData();

    // credentialRequests = dummyData.credentialRequests;
    // subjectCredentialRequests = dummyData.subjectCredentialRequests;
    // subjectCredentialRequest = dummyData.subjectCredentialRequest;
    unsignedDidDocument = dummyData.unsignedDidDocument;
    signedDidDocument = dummyData.signedDidDocument;
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('verifySubjectDidDocument - Success Scenario', () => {
    let response: UnumDto<VerifiedStatus>;
    let verStatus: boolean;

    beforeAll(async () => {
    //   const dummySubjectDidDoc = await makeDummyDidDocument();

      //   const didId = 'did:unum:f2054199-1069-4337-a588-83d099e79d44';
      //   const keyPair = await createKeyPairSet('pem');
      //   const unsignedDidDocument = await makeDummyDidDocument({ id: didId }, keyPair.signing.privateKey, keyPair.signing.publicKey);
      //   const dummySubjectDidDoc = await makeDummySignedDidDocument(unsignedDidDocument, keyPair.signing.privateKey, unsignedDidDocument.id);
      //   const signedDidDocument = await makeDummySignedDidDocument(dummySubjectDidDoc, keyPair.signing.privateKey, unsignedDidDocument.id);

      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDIDDoc.mockResolvedValueOnce({ body: unsignedDidDocument, headers: dummyResponseHeaders });
      mockDoVerify.mockResolvedValue(true);
      mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers: dummyResponseHeaders });
      response = await verifySubjectDidDocument(dummyAuthToken, dummyIssuerDid, signedDidDocument);
      verStatus = response.body.isVerified;
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('gets the subject did document', () => {
      expect(mockGetDIDDoc).toBeCalled();
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

  describe('verifySubjectDidDocument - Failure Scenarios', () => {
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
    //   const dummySubjectDidDoc = await makeDummyDidDocument();
      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDIDDoc.mockResolvedValue({ body: unsignedDidDocument, headers: dummyResponseHeaders });
      response = await verifySubjectDidDocument(dummyAuthToken, dummyIssuerDid, signedDidDocument);
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
      response = await verifySubjectDidDocument(dummyAuthToken, dummyIssuerDid, signedDidDocument);
      expect(response.body.isVerified).toBe(false);
      expect(response.body.message).toBe(`Public key not found for the subject did ${signedDidDocument.proof.verificationMethod}`);
    });

    it('returns a 404 status code if the did document is not found', async () => {
      mockGetDIDDoc.mockResolvedValue(new CustError(404, 'DID Document not found.'));

      try {
        response = await verifySubjectDidDocument(dummyAuthToken, dummyIssuerDid, signedDidDocument);
        fail();
      } catch (e) {
        expect(e.code).toEqual(404);
      }
    });
  });

  describe('verifySubjectDidDocument - Validation Failures', () => {
    it('returns a 400 status code with a descriptive error message when didDocument is missing', async () => {
      try {
        await verifySubjectDidDocument(dummyAuthToken, dummyIssuerDid, undefined);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('SignedDidDocument is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when proof is missing', async () => {
      try {
        const badRequest: SignedDidDocument = {
          ...signedDidDocument,
          proof: undefined
        };
        await verifySubjectDidDocument(dummyAuthToken, dummyIssuerDid, badRequest);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('proof is required.');
      }
    });

    // it('returns a 400 status code with a descriptive error message when type is missing', async () => {
    //   const badRequest: SignedDidDocument = {
    //     ...signedDidDocument,
    //     type: undefined
    //   };
    //   try {
    //     await verifySubjectDidDocument(dummyAuthToken, dummyIssuerDid, [badRequest]);
    //     fail();
    //   } catch (e) {
    //     expect(e.code).toBe(400);
    //     expect(e.message).toBe('Invalid SubjectCredentialRequest[0]: type must be defined.');
    //   }
    // });

    // it('returns a 400 status code with a descriptive error message when type is not a string', async () => {
    //   const badRequest = {
    //     ...subjectCredentialRequest,
    //     type: []
    //   };
    //   try {
    //     await verifySubjectDidDocument(dummyAuthToken, dummyIssuerDid, [badRequest]);
    //     fail();
    //   } catch (e) {
    //     expect(e.code).toBe(400);
    //     expect(e.message).toBe('Invalid SubjectCredentialRequest[0]: type must be a string.');
    //   }
    // });

    // it('returns a 400 status code with a descriptive error message when issuers is missing', async () => {
    //   const badRequest = {
    //     ...subjectCredentialRequest,
    //     issuers: undefined
    //   };

    //   try {
    //     await verifySubjectDidDocument(dummyAuthToken, dummyIssuerDid, [badRequest]);
    //     fail();
    //   } catch (e) {
    //     expect(e.code).toBe(400);
    //     expect(e.message).toBe('Invalid SubjectCredentialRequest[0]: issuers must be defined.');
    //   }
    // });

    // it('returns a 401 status code if x-auth-token header is missing', async () => {
    //   try {
    //     await verifySubjectDidDocument('', dummyIssuerDid, credentialRequests);
    //     fail();
    //   } catch (e) {
    //     expect(e.code).toEqual(401);
    //   }
    // });
  });
});
