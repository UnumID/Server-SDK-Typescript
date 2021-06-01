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

const verifier = 'did:unum:dd407b1a-ee7f-46a2-af2a-ccbb48cbb0dc';

// const dummyNoPresentation: NoPresentation = {
//   holder: 'did:unum:50fb0b5b-79ff-4db9-9f33-d93feab702db',
//   presentationRequestUuid: 'd5cc3673-d72f-45fa-bc87-36c305f8d0a5',
//   type: [
//     'NoPresentation',
//     'NoPresentation'
//   ],
//   verifierDid: verifier,
//   proof: {
//     signatureValue: 'AN1rKvtGeqaB4L16dr2gwF9jZF77hdhrb8iBsTgUTt2XqUyoJYnfQQmczxMuKLM2zWU6E6DSSaqzWVsisbD3VhG8taLWGx6BY',
//     unsignedValue: 'unsigned sig value',
//     created: '2020-09-29T00:05:57.107Z',
//     type: 'secp256r1signature2020',
//     verificationMethod: 'did:unum:50fb0b5b-79ff-4db9-9f33-d93feab702db',
//     proofPurpose: 'assertionMethod'
//   }
// };

// const dummyNoPresentationWithoutType = omit(dummyNoPresentation, 'type') as NoPresentation;
// const dummyNoPresentationWithoutRequestUuid = omit(dummyNoPresentation, 'presentationRequestUuid') as NoPresentation;
// const dummyNoPresentationWithoutHolder = omit(dummyNoPresentation, 'holder') as NoPresentation;
// const dummyNoPresentationWithoutProof = omit(dummyNoPresentation, 'proof') as NoPresentation;

// const dummyNoPresentationBadType = { ...dummyNoPresentation, type: {} } as NoPresentation;
// const dummyNoPresentationBadTypeKeywordMissing = { ...dummyNoPresentation, type: ['No Presenation'] } as NoPresentation;
// const dummyNoPresentationBadRequestUuid = { ...dummyNoPresentation, presentationRequestUuid: {} } as NoPresentation;
// const dummyNoPresentationBadHolder = { ...dummyNoPresentation, holder: {} } as NoPresentation;
// const dummyNoPresentationBadProof = { ...dummyNoPresentation, proof: {} } as NoPresentation;

// const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';

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

const callVerifyEncryptedPresentation = async (context, type, verifiableCredential, presentationRequestUuid, proof, verifier, auth = '', presentationRequest?, contextLiteral?): Promise<UnumDto<DecryptedPresentation>> => {
  // const presentation: PresentationPb = {
  //   context,
  //   type,
  //   verifiableCredential,
  //   presentationRequestUuid,
  //   verifierDid: verifier,
  //   proof
  // };

  const presentation: PresentationPb = await makeDummyPresentation({
    context,
    contextLiteral,
    type,
    verifiableCredential,
    presentationRequestUuid,
    verifierDid: verifier
  });

  // const encryptedPresentation = encrypt(`did:unum:${getUUID()}`, dummyRsaPublicKey, presentation, 'pem');
  const bytes: Uint8Array = PresentationPb.encode(presentation).finish();
  const encryptedPresentation = encryptBytes(`did:unum:${getUUID()}`, dummyRsaPublicKey, bytes, 'pem');
  return verifyPresentation(auth, encryptedPresentation, verifier, dummyRsaPrivateKey, presentationRequest);
};

const callVerifyEncryptedPresentationManual = (context, type, verifiableCredential, presentationRequestUuid, proof, verifier, auth = '', presentationRequest?): Promise<UnumDto<DecryptedPresentation>> => {
  const presentation: PresentationPb = {
    context,
    type,
    verifiableCredential,
    presentationRequestUuid,
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

  const presentationRequestUuid = '0cebee3b-3295-4ef6-a4d6-7dfea413b3aa';
  const verifier = 'did:unum:f2054199-1069-4337-a588-83d099e79d44';
  // const presentationRequest = makeDummyPresentationRequestResponse();
  const presentationRequest = await makeDummyUnsignedPresentationRequest({ uuid: presentationRequestUuid, verifier });
  // const presentationRequestUuid = presentationRequest.uuid;
  const presentationRequestDto = await makeDummyPresentationRequestResponse({ unsignedPresentationRequest: presentationRequest });
  const proof = (await presentationRequestDto).presentationRequest.proof;

  const unsignedPresentation = await makeDummyUnsignedPresentation({ verifierDid: verifier, context, type, verifiableCredential: verifiableCredentials, presentationRequestUuid });
  const presentation = await makeDummyPresentation({ verifierDid: verifier, context, type, verifiableCredential: verifiableCredentials, presentationRequestUuid });

  const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';

  return ({
    context,
    type,
    verifiableCredentials,
    presentationRequestUuid,
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

    // const dummySubjectDidDoc = await makeDummyDidDocument();

  // const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
  // mockGetDIDDoc.mockResolvedValueOnce({ body: dummySubjectDidDoc, headers: dummyResponseHeaders });
  // mockDoVerify.mockReturnValueOnce(true);
  // mockVerifyCredential.mockResolvedValue({ authToken: dummyAuthToken, body: true });
  // mockIsCredentialExpired.mockReturnValue(false);
  // mockCheckCredentialStatus.mockReturnValue({ authToken: dummyAuthToken, body: { status: 'valid' } });
  // mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers: dummyResponseHeaders });
  // response = await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
  // verStatus = response.body.isVerified;
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
      response = await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
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
      response = await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
      expect(response.authToken).toBeUndefined();
    });
  });

  describe('verifyEncryptedPresentation - Failure Scenarios', () => {
    // let response: UnumDto<DecryptedPresentation>;
    // let verStatus: boolean;
    // let context, type, verifiableCredentials, presentationRequestUuid, proof, authHeader, verifier;

    beforeAll(async () => {
      // const dummyData = await populateMockData();
      // context = dummyData.context;
      // type = dummyData.type;
      // verifiableCredentials = dummyData.verifiableCredentials;
      // presentationRequestUuid = dummyData.presentationRequestUuid;
      // proof = dummyData.proof;
      // authHeader = dummyData.authHeader;
      // verifier = dummyData.verifier;

      const dummySubjectDidDoc = await makeDummyDidDocument();

      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDIDDoc.mockResolvedValueOnce({ body: dummySubjectDidDoc, headers: dummyResponseHeaders });
      mockDoVerify.mockReturnValueOnce(false);
      mockVerifyCredential.mockResolvedValue({ authToken: dummyAuthToken, body: false });
      mockIsCredentialExpired.mockReturnValue(true);
      mockCheckCredentialStatus.mockReturnValue({ authToken: dummyAuthToken, body: false });
      verifiableCredentials[0].proof.verificationMethod = proof.verificationMethod;
      response = await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
      verStatus = response.body.isVerified;
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    // beforeEach(async () => {
    //   const dummySubjectDidDoc = await makeDummyDidDocument();
    //   const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
    //   mockGetDIDDoc.mockResolvedValueOnce({ body: dummySubjectDidDoc, headers: dummyResponseHeaders });
    //   mockDoVerify.mockReturnValueOnce(true);
    //   mockVerifyCredential.mockResolvedValue({ authToken: dummyAuthToken, body: true });
    //   mockIsCredentialExpired.mockReturnValue(false);
    //   mockCheckCredentialStatus.mockReturnValue({ authToken: dummyAuthToken, body: { status: 'valid' } });
    //   mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers: dummyResponseHeaders });
    //   response = await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
    //   verStatus = response.body.isVerified;
    // });

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
      const response = await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
      expect(response.body.isVerified).toBe(false);
      expect(response.body.message).toBe('Public key not found for the DID associated with the proof.verificationMethod');
    });

    it('returns a 404 status code if the did document is not found', async () => {
      mockGetDIDDoc.mockResolvedValueOnce(new CustError(404, 'DID Document not found.'));

      try {
        await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
        fail();
      } catch (e) {
        expect(e.code).toEqual(404);
      }
    });
  });

  describe('verifyEncryptedPresentation - Validation Failures', () => {
    // const { context, type, verifiableCredentials, presentationRequestUuid, proof, authHeader, verifier, presentationRequest } = populateMockData();

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

    it('returns a 400 status code with a descriptive error message when if presentationRequest uuid provided does not match is the presentation presentationRequestUuid.', async () => {
      try {
        await callVerifyEncryptedPresentation(context, type, verifiableCredentials, 'uuid:123', proof, verifier, authHeader, presentationRequestDto);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe(`presentation request uuid provided, ${presentationRequestDto.presentationRequest.uuid}, does not match the presentationRequestUuid that the presentation was in response to, uuid:123.`);
      }
    });
  });

  // describe('verifyEncryptedPresentation - Decrypted presentation validation Failures', () => {
  //   // let context, type, verifiableCredentials, presentationRequestUuid, proof, authHeader, verifier;

  //   // const { context, type, verifiableCredentials, presentationRequestUuid, proof, authHeader, verifier } = populateMockData();

  //   it('returns a 400 status code with a descriptive error message when context is missing', async () => {
  //     try {
  //       await callVerifyEncryptedPresentation(undefined, type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader, undefined, true);
  //       fail();
  //     } catch (e) {
  //       expect(e.code).toBe(400);
  //       expect(e.message).toBe('Invalid Presentation: context is required.');
  //     }
  //   });

  //   it('returns a 400 status code with a descriptive error message when type is missing', async () => {
  //     try {
  //       await callVerifyEncryptedPresentation(context, '', verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
  //       fail();
  //     } catch (e) {
  //       expect(e.code).toBe(400);
  //       expect(e.message).toBe('Invalid Presentation: type is required.');
  //     }
  //   });

  //   // it('returns a 400 status code with a descriptive error message when verifiableCredentials is in an improper format', async () => {
  //   //   try {
  //   //     await callVerifyEncryptedPresentation(context, type, undefined, presentationRequestUuid, proof, verifier, authHeader);
  //   //     fail();
  //   //   } catch (e) {
  //   //     expect(e.code).toBe(400);
  //   //     expect(e.message).toBe('Invalid Declined Presentation: verifiableCredential must be undefined or empty.');
  //   //   }
  //   // });

  //   it('returns a 400 status code with a descriptive error message when presentationRequestUuid is missing', async () => {
  //     try {
  //       await callVerifyEncryptedPresentation(context, type, verifiableCredentials, '', proof, verifier, authHeader);
  //       fail();
  //     } catch (e) {
  //       expect(e.code).toBe(400);
  //       expect(e.message).toBe('Invalid Presentation: presentationRequestUuid is required.');
  //     }
  //   });

  //   // it('returns a 400 status code with a descriptive error message when proof is missing', async () => {
  //   //   try {
  //   //     await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, '', verifier, authHeader);
  //   //     fail();
  //   //   } catch (e) {
  //   //     expect(e.code).toBe(400);
  //   //     expect(e.message).toBe('Invalid Presentation: proof is required.');
  //   //   }
  //   // });

  //   // it('returns a 400 status code with a descriptive error message when context is not an array', async () => {
  //   //   try {
  //   //     await callVerifyEncryptedPresentation('https://www.w3.org/2018/credentials/v1', type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
  //   //     fail();
  //   //   } catch (e) {
  //   //     expect(e.code).toBe(400);
  //   //     expect(e.message).toBe('Invalid Presentation: context must be a non-empty array.');
  //   //   }
  //   // });

  //   it('returns a 400 status code with a descriptive error message when @context array is empty', async () => {
  //     try {
  //       await callVerifyEncryptedPresentation([], type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
  //       fail();
  //     } catch (e) {
  //       expect(e.code).toBe(400);
  //       expect(e.message).toBe('Invalid Presentation: context must be a non-empty array.');
  //     }
  //   });

  //   it('returns a 400 status code with a descriptive error message when type is not an array', async () => {
  //     try {
  //       // Note: the string is actually turned into an array of chars so the non-empty test does not work.
  //       await callVerifyEncryptedPresentation(context, 'VerifiablePresentation', verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
  //       fail();
  //     } catch (e) {
  //       expect(e.code).toBe(400);
  //       // expect(e.message).toBe('Invalid Presentation: type must be a non-empty array.');
  //       expect(e.message).toBe('Invalid Presentation: type\'s first array element must be VerifiablePresentation.');
  //     }
  //   });

  //   it('returns a 400 status code with a descriptive error message when type is empty', async () => {
  //     try {
  //       await callVerifyEncryptedPresentation(context, [], verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
  //       fail();
  //     } catch (e) {
  //       expect(e.code).toBe(400);
  //       expect(e.message).toBe('Invalid Presentation: type must be a non-empty array.');
  //     }
  //   });

  //   // it('returns a 400 status code with a descriptive error message when verifiableCredentials is not an array', async () => {
  //   //   try {
  //   //     await callVerifyEncryptedPresentation(context, type, undefined, presentationRequestUuid, proof, verifier, authHeader);
  //   //     fail();
  //   //   } catch (e) {
  //   //     expect(e.code).toBe(400);
  //   //     expect(e.message).toBe('Invalid Presentation: verifiableCredentials must be a non-empty array.');
  //   //   }
  //   // });

  //   // it('returns a 400 status code with a descriptive error message when verifiableCredentials array is empty', async () => {
  //   //   try {
  //   //     await callVerifyEncryptedPresentation(context, type, [], presentationRequestUuid, proof, verifier, authHeader);
  //   //     fail();
  //   //   } catch (e) {
  //   //     expect(e.code).toBe(400);
  //   //     expect(e.message).toBe('Invalid Presentation: verifiableCredential must be undefined or empty.');
  //   //   }
  //   // });

  //   it('returns a 401 status code if x-auth-token header is missing', async () => {
  //     try {
  //       await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, proof, verifier, '');
  //       fail();
  //     } catch (e) {
  //       expect(e.code).toEqual(401);
  //     }
  //   });
  // });

  // describe('verifyEncryptedPresentation - Validation for verifiableCredential object', () => {
  //   // let response: JSONObj, preReq: JSONObj;
  //   // let context, type, verifiableCredentials, presentationRequestUuid, proof, authHeader, verifier;
  //   // const { context, type, verifiableCredentials, presentationRequestUuid, proof, authHeader, verifier } = populateMockData();

  //   let cred;
  //   it('Response code should be ' + 400 + ' when context is not passed', async () => {
  //     cred = copyCredentialObj(verifiableCredentials[0], 'context');
  //     try {
  //       await callVerifyEncryptedPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
  //       fail();
  //     } catch (e) {
  //       expect(e.code).toBe(400);
  //       expect(e.message).toBe('Invalid verifiableCredential[0]: context is required.');
  //     }
  //   });

  //   it('Response code should be ' + 400 + ' when credentialStatus is not passed', async () => {
  //     cred = copyCredentialObj(verifiableCredentials[0], 'credentialStatus');
  //     try {
  //       await callVerifyEncryptedPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
  //       fail();
  //     } catch (e) {
  //       // Note: this is actually thrown from the test helper but due to needing to encrypted but still ought to be what is thrown via the real verifyPresentation.
  //       expect(e.code).toBe('ERR_INVALID_ARG_TYPE');
  //       // expect(e.message).toBe('The "string" argument must be of type string or an instance of Buffer or ArrayBuffer. Received undefined');
  //       // expect(e.message).toBe('Type error handling decoding presentation, credential or proof from bytes to protobufs');
  //       // expect(e.message).toBe('Invalid verifiableCredential[0]: credentialStatus is required.');
  //     }
  //   });

  //   it('Response code should be ' + 400 + ' when credentialSubject is not passed', async () => {
  //     cred = copyCredentialObj(verifiableCredentials[0], 'credentialSubject');
  //     try {
  //       await callVerifyEncryptedPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
  //       fail();
  //     } catch (e) {
  //       expect(e.code).toBe(400);
  //       expect(e.message).toBe('Invalid verifiableCredential[0]: credentialSubject is required.');
  //     }
  //   });

  //   it('Response code should be ' + 400 + ' when issuer is not passed', async () => {
  //     cred = copyCredentialObj(verifiableCredentials[0], 'issuer');
  //     try {
  //       await callVerifyEncryptedPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
  //       fail();
  //     } catch (e) {
  //       expect(e.code).toBe(400);
  //       expect(e.message).toBe('Invalid verifiableCredential[0]: issuer is required.');
  //     }
  //   });

  //   it('Response code should be ' + 400 + ' when type is not passed', async () => {
  //     cred = copyCredentialObj(verifiableCredentials[0], 'type', undefined);
  //     try {
  //       await callVerifyEncryptedPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
  //       fail();
  //     } catch (e) {
  //       expect(e.code).toBe(400);
  //       expect(e.message).toBe('Invalid verifiableCredential[0]: type must be a non-empty array.');
  //     }
  //   });

  //   it('Response code should be ' + 400 + ' when id is not passed', async () => {
  //     cred = copyCredentialObj(verifiableCredentials[0], 'id');
  //     try {
  //       await callVerifyEncryptedPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
  //       fail();
  //     } catch (e) {
  //       expect(e.code).toBe(400);
  //       expect(e.message).toBe('Invalid verifiableCredential[0]: id is required.');
  //     }
  //   });

  //   it('Response code should be ' + 400 + ' when issuanceDate is not passed', async () => {
  //     cred = copyCredentialObj(verifiableCredentials[0], 'issuanceDate');
  //     try {
  //       await callVerifyEncryptedPresentation(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
  //       fail();
  //     } catch (e) {
  //       expect(e.code).toBe(400);
  //       expect(e.message).toBe('Invalid verifiableCredential[0]: issuanceDate is required.');
  //     }
  //   });

  //   it('Response code should be ' + 400 + ' when proof is not passed', async () => {
  //     cred = copyCredentialObj(verifiableCredentials[0], 'proof');
  //     try {
  //       await callVerifyEncryptedPresentationManual(context, type, cred, presentationRequestUuid, proof, verifier, authHeader);
  //       fail();
  //     } catch (e) {
  //       // Note: this is actually thrown from the test helper but due to needing to encrypted but still ought to be what is thrown via the real verifyPresentation.
  //       expect(e.code).toBe('ERR_INVALID_ARG_TYPE');
  //       // expect(e.message).toBe('The "string" argument must be of type string or an instance of Buffer or ArrayBuffer. Received undefined');
  //       // expect(e.message).toBe('Type error handling decoding presentation, credential or proof from bytes to protobufs');
  //     }
  //   });
  // });

  describe('verifyEncryptedPresentation - presentationRequestSignature check', () => {
  // const { context, type, verifiableCredential, presentationRequestUuid, proof, authHeader, verifier } = populateMockData();
    // let context, type, verifiableCredentials, presentationRequestUuid, proof, authHeader, verifier;

    it('returns response body with proper validation error message if presentation request signature can not be verified', async () => {
      const dummyDidDoc = await makeDummyDidDocument();
      const headers = { 'x-auth-token': dummyAuthToken };
      mockGetDIDDoc.mockResolvedValue({ body: dummyDidDoc, headers });
      mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers });
      mockDoVerify.mockReturnValueOnce(false);

      // const presentation: PresentationPb = {
      //   context,
      //   type,
      //   verifiableCredential: verifiableCredentials,
      //   presentationRequestUuid,
      //   verifierDid: verifier,
      //   proof
      // };

      // const bytes = PresentationPb.encode(presentation).finish();
      // const encryptedPresentation = encrypt(`did:unum:${getUUID()}`, dummyRsaPublicKey, presentation, 'pem');
      const bytes: Uint8Array = PresentationPb.encode(presentation).finish();
      const encryptedPresentation = encryptBytes(`did:unum:${getUUID()}`, dummyRsaPublicKey, bytes, 'pem');

      const fakeBadPresentationRequestDto = {
        presentationRequest: {
          // uuid: presentationRequestUuid,
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
      // const response = await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
      const response = await verifyPresentation(authHeader, encryptedPresentation, verifier, dummyRsaPrivateKey, fakeBadPresentationRequestDto);

      expect(response.body.isVerified).toBe(false);
      expect(response.body.message).toBe('PresentationRequest signature can not be verified.');
    });
  });

  describe('verifyEncryptedPresentation - Validation for proof object', () => {
    // beforeAll(async () => {
    // // const presentationRequest = makeDummyPresentationRequestResponse();
    //   const dummyData = await populateMockData();
    //   context = dummyData.context;
    //   type = dummyData.type;
    //   verifiableCredentials = dummyData.verifiableCredentials;
    //   presentationRequestUuid = dummyData.presentationRequestUuid;
    //   proof = dummyData.proof;
    //   authHeader = dummyData.authHeader;
    //   verifier = dummyData.verifier;

    //   // const dummySubjectDidDoc = await makeDummyDidDocument();

    // // const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
    // // mockGetDIDDoc.mockResolvedValueOnce({ body: dummySubjectDidDoc, headers: dummyResponseHeaders });
    // // mockDoVerify.mockReturnValueOnce(true);
    // // mockVerifyCredential.mockResolvedValue({ authToken: dummyAuthToken, body: true });
    // // mockIsCredentialExpired.mockReturnValue(false);
    // // mockCheckCredentialStatus.mockReturnValue({ authToken: dummyAuthToken, body: { status: 'valid' } });
    // // mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers: dummyResponseHeaders });
    // // response = await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
    // // verStatus = response.body.isVerified;
    // });

    // afterAll(() => {
    //   jest.clearAllMocks();
    // });

    beforeEach(async () => {
      const dummySubjectDidDoc = await makeDummyDidDocument();
      const dummyResponseHeaders = { 'x-auth-token': dummyAuthToken };
      mockGetDIDDoc.mockResolvedValue({ body: dummySubjectDidDoc, headers: dummyResponseHeaders });
      mockDoVerify.mockReturnValueOnce(true);
      mockVerifyCredential.mockResolvedValue({ authToken: dummyAuthToken, body: true });
      mockIsCredentialExpired.mockReturnValue(false);
      mockCheckCredentialStatus.mockReturnValue({ authToken: dummyAuthToken, body: { status: 'valid' } });
      mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers: dummyResponseHeaders });
      // response = await callVerifyEncryptedPresentation(context, type, verifiableCredentials, presentationRequestUuid, proof, verifier, authHeader);
      // verStatus = response.body.isVerified;
    });

    it('returns a 400 status code with a descriptive error message when created is missing', async () => {
      try {
        const invalidProof = { created: undefined, signatureValue: proof.signatureValue, type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
        // const badProofPresentation = {
        //   ...unsignedPresentation,
        //   proof: invalidProof
        // };

        // // const encryptedPresentation = encrypt(`did:unum:${getUUID()}`, dummyRsaPublicKey, presentation, 'pem');
        // const bytes: Uint8Array = PresentationPb.encode(badProofPresentation).finish();
        // const encryptedPresentation = encryptBytes(`did:unum:${getUUID()}`, dummyRsaPublicKey, bytes, 'pem');
        // await verifyPresentation(authHeader, encryptedPresentation, verifier, dummyRsaPrivateKey, presentationRequest);

        await callVerifyEncryptedPresentationManual(context, type, verifiableCredentials, presentationRequestUuid, invalidProof, verifier, authHeader);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: proof.created is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when signatureValue is missing', async () => {
      const invalidProof = { created: new Date(proof.created), signatureValue: '', type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
      try {
        await callVerifyEncryptedPresentationManual(context, type, verifiableCredentials, presentationRequestUuid, invalidProof, verifier, authHeader);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: proof.signatureValue is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when type is missing', async () => {
      const invalidProof = { created: new Date(proof.created), signatureValue: proof.signatureValue, type: '', verificationMethod: proof.verificationMethod, proofPurpose: proof.proofPurpose };
      try {
        await callVerifyEncryptedPresentationManual(context, type, verifiableCredentials, presentationRequestUuid, invalidProof, verifier, authHeader);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: proof.type is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when verificationMethod is missing', async () => {
      const invalidProof = { created: new Date(proof.created), signatureValue: proof.signatureValue, type: proof.type, verificationMethod: '', proofPurpose: proof.proofPurpose };
      try {
        await callVerifyEncryptedPresentationManual(context, type, verifiableCredentials, presentationRequestUuid, invalidProof, verifier, authHeader);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: proof.verificationMethod is required.');
      }
    });

    it('returns a 400 status code with a descriptive error message when proofPurpose is missing', async () => {
      const invalidProof = { created: new Date(proof.created), signatureValue: proof.signatureValue, type: proof.type, verificationMethod: proof.verificationMethod, proofPurpose: '' };
      try {
        await callVerifyEncryptedPresentationManual(context, type, verifiableCredentials, presentationRequestUuid, invalidProof, verifier, authHeader);
        fail();
      } catch (e) {
        expect(e.code).toBe(400);
        expect(e.message).toBe('Invalid Presentation: proof.proofPurpose is required.');
      }
    });
  });

  // const callVerifyNoPresentation = (
  //   noPresentation: NoPresentation,
  //   verifier: string,
  //   authHeader?: string
  // ): Promise<UnumDto<VerifiedStatus>> => {
  //   return verifyNoPresentationHelper(authHeader, noPresentation, verifier);
  // };

  // describe('verifyPresentation', () => {
  //   beforeAll(async () => {
  //     const dummyDidDoc = await makeDummyDidDocument({ id: dummyNoPresentation.holder });
  //     const headers = { 'x-auth-token': dummyAuthToken };
  //     mockGetDIDDoc.mockResolvedValue({ body: dummyDidDoc, headers });
  //     mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers });
  //   });

  //   afterAll(() => {
  //     jest.clearAllMocks();
  //   });

  //   describe('success', () => {
  //     let response: UnumDto<VerifiedStatus>, responseAuthToken: string;

  //     beforeEach(async () => {
  //       mockDoVerify.mockReturnValue(true);
  //       response = await callVerifyNoPresentation(dummyNoPresentation, verifier, authHeader);
  //       responseAuthToken = response.authToken;
  //     });

  //     it('gets the holder did', () => {
  //       expect(mockGetDIDDoc).toBeCalled();
  //     });

  //     it('verifies the NoPresentation', () => {
  //       expect(mockDoVerify).toBeCalled();
  //     });

  //     it('returns the result of verification', () => {
  //       expect(response.body.isVerified).toBe(true);
  //     });

  //     it('returns the x-auth-token header returned from the SaaS api in the x-auth-token header', () => {
  //       expect(responseAuthToken).toEqual(dummyAuthToken);
  //     });

//     it('does not return an x-auth-token header if the SaaS does not return an x-auth-token header', async () => {
//       const dummySubjectDidDoc = await makeDummyDidDocument();
//       const dummyApiResponse = { body: dummySubjectDidDoc };
//       mockMakeNetworkRequest.mockResolvedValueOnce(dummyApiResponse);
//       mockGetDIDDoc.mockResolvedValue({ body: dummySubjectDidDoc });
//       response = await callVerifyNoPresentation(dummyNoPresentation, verifier, authHeader);
//       expect(response.authToken).toBeUndefined();
//     });
//   });
// });
});
