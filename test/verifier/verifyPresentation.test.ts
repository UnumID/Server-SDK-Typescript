import { Presentation, VerifiedStatus, UnumDto, CustError } from '../../src/index';
import { verifyCredential } from '../../src/verifier/verifyCredential';
import { isCredentialExpired } from '../../src/verifier/isCredentialExpired';
import { checkCredentialStatus } from '../../src/verifier/checkCredentialStatus';
import { dummyAuthToken, dummyRsaPrivateKey, dummyRsaPublicKey, dummyVerifierDid, makeDummyCredential, makeDummyDidDocument, makeDummyPresentation, makeDummyPresentationRequestResponse, makeDummyUnsignedCredential, makeDummyUnsignedPresentation, makeDummyUnsignedPresentationRequest } from './mocks';
import { encrypt, encryptBytes } from '@unumid/library-crypto';
import { omit } from 'lodash';
import { DecryptedPresentation } from '../../src/types';
import { verifyPresentation } from '../../src/verifier/verifyPresentation';
import { verifyNoPresentationHelper } from '../../src/verifier/verifyNoPresentationHelper';
import { JSONObj, PresentationPb, PresentationRequestDto } from '@unumid/types';
import { getDIDDoc } from '../../src/utils/didHelper';
import { getUUID } from '../../src/utils/helpers';
import { makeNetworkRequest } from '../../src/utils/networkRequestHelper';
import { doVerify } from '../../src/utils/verify';
import logger from '../../src/logger';

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

const callVerifyEncryptedPresentation = async (context, type, verifiableCredential, presentationRequestId, proof, verifier, auth = '', presentationRequest?, contextLiteral?): Promise<UnumDto<DecryptedPresentation>> => {
  const presentation: PresentationPb = await makeDummyPresentation({
    context,
    contextLiteral,
    type,
    verifiableCredential,
    presentationRequestId,
    verifierDid: verifier
  });

  // const encryptedPresentation = encrypt(`did:unum:${getUUID()}`, dummyRsaPublicKey, presentation, 'pem');
  const bytes: Uint8Array = PresentationPb.encode(presentation).finish();
  const encryptedPresentation = encryptBytes(`did:unum:${getUUID()}`, dummyRsaPublicKey, bytes, 'pem');
  return verifyPresentation(auth, encryptedPresentation, verifier, dummyRsaPrivateKey, presentationRequest);
};

const callVerifyEncryptedPresentationManual = (context, type, verifiableCredential, presentationRequestId, proof, verifier, auth = '', presentationRequest?): Promise<UnumDto<DecryptedPresentation>> => {
  const presentation: PresentationPb = {
    context,
    type,
    verifiableCredential,
    presentationRequestId,
    verifierDid: verifier,
    proof
  };

  // const encryptedPresentation = encrypt(`did:unum:${getUUID()}`, dummyRsaPublicKey, presentation, 'pem');
  try {
    const bytes: Uint8Array = PresentationPb.encode(presentation).finish();
    const encryptedPresentation = encryptBytes(`did:unum:${getUUID()}`, dummyRsaPublicKey, bytes, 'pem');
    return verifyPresentation(auth, encryptedPresentation, verifier, dummyRsaPrivateKey, presentationRequest);
  } catch (e) {
    logger.error(e);
    throw e;
  }
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
  const verifiableCredentials = [signedCredential];

  const presentationRequestUuid = '0cebee3b-3295-4ef6-a4d6-7dfea413b3ab';
  const presentationRequestId = '0cebee3b-3295-4ef6-a4d6-7dfea413b3aa';
  const verifier = 'did:unum:f2054199-1069-4337-a588-83d099e79d44';

  const presentationRequest = await makeDummyUnsignedPresentationRequest({ uuid: presentationRequestUuid, id: presentationRequestId, verifier });

  const presentationRequestDto = await makeDummyPresentationRequestResponse({ unsignedPresentationRequest: presentationRequest });
  const proof = (await presentationRequestDto).presentationRequest.proof;

  const unsignedPresentation = await makeDummyUnsignedPresentation({ verifierDid: verifier, context, type, verifiableCredential: verifiableCredentials, presentationRequestId });
  const presentation = await makeDummyPresentation({ verifierDid: verifier, context, type, verifiableCredential: verifiableCredentials, presentationRequestId });

  const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';

  return ({
    context,
    type,
    verifiableCredentials,
    presentationRequestUuid,
    presentationRequestId,
    presentationRequest,
    presentationRequestDto,
    proof,
    authHeader,
    verifier,
    presentation,
    unsignedPresentation
  });
};

describe('verifyPresentation', () => {
  let response: UnumDto<DecryptedPresentation>;
  let verStatus: boolean;

  let context, type, verifiableCredentials, presentationRequestId, proof, authHeader, verifier, presentationRequestDto, presentationRequest, unsignedPresentationRequest, presentation, unsignedPresentation;

  beforeAll(async () => {
    const dummyData = await populateMockData();
    context = dummyData.context;
    type = dummyData.type;
    verifiableCredentials = dummyData.verifiableCredentials;
    presentationRequestId = dummyData.presentationRequestId;
    proof = dummyData.proof;
    authHeader = dummyData.authHeader;
    verifier = dummyData.verifier;
    presentationRequestDto = dummyData.presentationRequestDto;
    presentationRequest = dummyData.presentationRequestDto.presentationRequest;
    unsignedPresentationRequest = dummyData.presentationRequest;
    unsignedPresentation = dummyData.unsignedPresentation;

    presentation = dummyData.presentation;
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('verifyEncryptedPresentation - Success Scenario', () => {
    beforeEach(async () => {
      const dummySubjectDidDoc = await makeDummyDidDocument();
      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDIDDoc.mockResolvedValueOnce({ body: dummySubjectDidDoc, headers: dummyResponseHeaders });
      mockDoVerify.mockReturnValueOnce(true);
      mockVerifyCredential.mockResolvedValue({ authToken: dummyAuthToken, body: true });
      mockIsCredentialExpired.mockReturnValue(false);
      mockCheckCredentialStatus.mockReturnValue({ authToken: dummyAuthToken, body: { status: 'valid' } });
      mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers: dummyResponseHeaders });
      response = await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestId, proof, verifier, authHeader);
      verStatus = response.body.isVerified;
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
      response = await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestId, proof, verifier, authHeader);
      expect(response.authToken).toBeUndefined();
    });
  });

  describe('verifyEncryptedPresentation - Failure Scenarios', () => {
    beforeAll(async () => {
      const dummySubjectDidDoc = await makeDummyDidDocument();

      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDIDDoc.mockResolvedValueOnce({ body: dummySubjectDidDoc, headers: dummyResponseHeaders });
      mockDoVerify.mockReturnValueOnce(false);
      mockVerifyCredential.mockResolvedValue({ authToken: dummyAuthToken, body: false });
      mockIsCredentialExpired.mockReturnValue(true);
      mockCheckCredentialStatus.mockReturnValue({ authToken: dummyAuthToken, body: false });
      verifiableCredentials[0].proof.verificationMethod = proof.verificationMethod;
      response = await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestId, proof, verifier, authHeader);
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
      const response = await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestId, proof, verifier, authHeader);
      expect(response.body.isVerified).toBe(false);
      expect(response.body.message).toBe('Public key not found for the DID associated with the proof.verificationMethod');
    });

    it('returns a 404 status code if the did document is not found', async () => {
      mockGetDIDDoc.mockResolvedValueOnce(new CustError(404, 'DID Document not found.'));

      try {
        await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestId, proof, verifier, authHeader);
        fail();
      } catch (e) {
        expect(e.code).toEqual(404);
      }
    });
  });

  describe('verifyEncryptedPresentation - Validation Failures', () => {
    // const { context, type, verifiableCredentials, presentationRequestId, proof, authHeader, verifier, presentationRequest } = populateMockData();

    it('returns a 400 status code with a descriptive error message when encryptedPresentation is missing', async () => {
      try {
        await verifyPresentation(authHeader, undefined, verifier, dummyRsaPrivateKey);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('encryptedPresentation is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when encryptionPrivateKey is missing', async () => {
      try {
        await verifyPresentation(authHeader, {}, verifier, undefined);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('verifier encryptionPrivateKey is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when verifierDid is missing', async () => {
      try {
        await verifyPresentation(authHeader, {}, undefined, dummyRsaPrivateKey);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('verifier is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when if presentationRequest is present, presentationRequest verifier did does not match supplied verifier did', async () => {
      const fakeVerifierDid = 'did:1234';
      try {
        await verifyPresentation(authHeader, {}, fakeVerifierDid, dummyRsaPrivateKey, presentationRequestDto);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe(`verifier provided, ${fakeVerifierDid}, does not match the presentation request verifier, did:unum:f2054199-1069-4337-a588-83d099e79d44.`);
      }
    });

    it('returns a 400 status code with a descriptive error message when if presentationRequest uuid provided does not match is the presentation presentationRequestId.', async () => {
      try {
        await callVerifyEncryptedPresentation(context, type, verifiableCredentials, 'uuid:123', proof, verifier, authHeader, presentationRequestDto);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe(`presentation request id provided, ${presentationRequestDto.presentationRequest.id}, does not match the presentationRequestId that the presentation was in response to, uuid:123.`);
      }
    });
  });

  describe('verifyEncryptedPresentation - presentationRequestSignature check', () => {
    it('returns response body with proper validation error message if presentation request signature can not be verified', async () => {
      const dummyDidDoc = await makeDummyDidDocument();
      const headers = { 'x-auth-token': dummyAuthToken };
      mockGetDIDDoc.mockResolvedValue({ body: dummyDidDoc, headers });
      mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers });
      mockDoVerify.mockReturnValueOnce(false);

      const bytes: Uint8Array = PresentationPb.encode(presentation).finish();
      const encryptedPresentation = encryptBytes(`did:unum:${getUUID()}`, dummyRsaPublicKey, bytes, 'pem');

      const fakeBadPresentationRequestDto = {
        presentationRequest: {
          // uuid: presentationRequestId,
          ...presentationRequest,
          proof: {
            ...presentationRequest.proof,
            signatureValue: 'signature'
          }
        },
        verifier: {
          did: verifier
        }
      };

      const response = await verifyPresentation(authHeader, encryptedPresentation, verifier, dummyRsaPrivateKey, fakeBadPresentationRequestDto);

      expect(response.body.isVerified).toBe(false);
      expect(response.body.message).toBe('PresentationRequest signature can not be verified.');
    });
  });

  describe('verifyEncryptedPresentation - Validation for proof object', () => {
    beforeEach(async () => {
      const dummySubjectDidDoc = await makeDummyDidDocument();
      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDIDDoc.mockResolvedValue({ body: dummySubjectDidDoc, headers: dummyResponseHeaders });
      mockDoVerify.mockReturnValueOnce(true);
      mockVerifyCredential.mockResolvedValue({ authToken: dummyAuthToken, body: true });
      mockIsCredentialExpired.mockReturnValue(false);
      mockCheckCredentialStatus.mockReturnValue({ authToken: dummyAuthToken, body: { status: 'valid' } });
      mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers: dummyResponseHeaders });
    });

    it('returns a 400 status code with a descriptive error message when created is missing', async () => {
      try {
        const invalidProof = { created: undefined, signatureValue: proof.signatureValue, type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };

        await callVerifyEncryptedPresentationManual(context, type, verifiableCredentials, presentationRequestId, invalidProof, verifier, authHeader);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: proof.created is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when signatureValue is missing', async () => {
      const invalidProof = { created: new Date(proof.created), signatureValue: '', type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
      try {
        await callVerifyEncryptedPresentationManual(context, type, verifiableCredentials, presentationRequestId, invalidProof, verifier, authHeader);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: proof.signatureValue is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when type is missing', async () => {
      const invalidProof = { created: new Date(proof.created), signatureValue: proof.signatureValue, type: '', verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
      try {
        await callVerifyEncryptedPresentationManual(context, type, verifiableCredentials, presentationRequestId, invalidProof, verifier, authHeader);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: proof.type is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when verificationMethod is missing', async () => {
      const invalidProof = { created: new Date(proof.created), signatureValue: proof.signatureValue, type: proof.type, verificationMethod: '', proofPurpose: proof.proofPurpose };
      try {
        await callVerifyEncryptedPresentationManual(context, type, verifiableCredentials, presentationRequestId, invalidProof, verifier, authHeader);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: proof.verificationMethod is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when proofPurpose is missing', async () => {
      const invalidProof = { created: new Date(proof.created), signatureValue: proof.signatureValue, type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: '' };
      try {
        await callVerifyEncryptedPresentationManual(context, type, verifiableCredentials, presentationRequestId, invalidProof, verifier, authHeader);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: proof.proofPurpose is required.');
      }
    });
  });
});
