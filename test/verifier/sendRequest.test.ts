import * as utilLib from 'library-issuer-verifier-utility';
import { sendRequest } from '../../src/index';
import { PresentationRequestResponse, PresentationRequest, VerifierDto, CredentialRequest } from '../../src/types';
import { dummyAuthToken, makeDummyPresentationRequestResponse } from './mocks';

jest.mock('library-issuer-verifier-utility', () => {
  const actual = jest.requireActual('library-issuer-verifier-utility');

  return {
    ...actual,
    makeNetworkRequest: jest.fn(),
    createProof: jest.fn(() => actual.createProof)
  };
});

const mockMakeNetworkRequest = utilLib.makeNetworkRequest as jest.Mock;

const callSendRequests = (
  verifier: string,
  credentialRequests: CredentialRequest[],
  metadata: Record<string, unknown>,
  expiresAt: Date,
  eccPrivateKey: string,
  holderAppUuid: string,
  authToken: string
): Promise<VerifierDto<PresentationRequestResponse>> => {
  return sendRequest(authToken, verifier, credentialRequests, eccPrivateKey, holderAppUuid, expiresAt, metadata);
};

const populateMockData = (): utilLib.JSONObj => {
  const verifier = 'did:unum:a40e162e-3297-4834-a1a3-a15e96554fac';
  const holderAppUuid = 'a91a5574-e338-46bd-9405-3a72acbd1b6a';
  const credentialRequests: utilLib.JSONObj[] = [{
    type: 'DummyCredential',
    issuers: ['did:unum:042b9089-9ee9-4217-844f-b01965cf569a']
  }];
  const eccPrivateKey = '-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIKgEnAHdkJOWCr2HxgThssEnn4+4dXh+AXCK2ORgiM69oAoGCCqGSM49\nAwEHoUQDQgAEl1ZqPBLIa8QxEEx7nNWsVPnUd59UtVmRLS7axzA5VPeVOs2FIGkT\nFx+RgfZSF6J4kXd7F+/pd03fPV/lu/lJpA==\n-----END EC PRIVATE KEY-----\n';
  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';

  return ({
    verifier,
    credentialRequests,
    eccPrivateKey,
    authToken,
    holderAppUuid
  });
};

describe('sendRequest', () => {
  let apiResponse: VerifierDto<PresentationRequestResponse>, apiResponseAuthToken: string;
  let metadata: Record<string, unknown>, expiresAt: Date;
  let presentationRequestResponse: PresentationRequestResponse;
  let presentationRequest: PresentationRequest;

  const {
    verifier,
    credentialRequests,
    eccPrivateKey,
    authToken,
    holderAppUuid
  } = populateMockData();

  beforeEach(async () => {
    const dummyPresentationRequestResponse = await makeDummyPresentationRequestResponse();
    const headers = { 'x-auth-token': dummyAuthToken };
    const dummyApiResponse = { body: dummyPresentationRequestResponse, headers };
    mockMakeNetworkRequest.mockResolvedValueOnce(dummyApiResponse);
    apiResponse = await callSendRequests(verifier, credentialRequests, metadata, expiresAt, eccPrivateKey, holderAppUuid, authToken);
    apiResponseAuthToken = apiResponse.authToken;

    presentationRequestResponse = apiResponse.body;
    presentationRequest = presentationRequestResponse.presentationRequest;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('signs the request', () => {
    expect(utilLib.createProof).toBeCalled();
  });

  it('sends the request to the saas', () => {
    expect(mockMakeNetworkRequest).toBeCalled();
  });

  it('sets default values before sending the request to the saas', () => {
    const { data } = mockMakeNetworkRequest.mock.calls[0][0];
    expect(data.uuid).toBeDefined();
    expect(data.createdAt).toBeDefined();
    expect(data.updatedAt).toBeDefined();
    expect(data.expiresAt).toBeDefined();
    expect(data.metadata).toBeDefined();
    data.credentialRequests.forEach(cr => {
      expect(cr.required).toBeDefined();
    });
  });

  it('returns the created PresentationRequest', () => {
    expect(presentationRequest).toBeDefined();
    expect(presentationRequest.uuid).toBeDefined();
  });

  it('returns verifier info', () => {
    const { verifier } = presentationRequestResponse;
    expect(verifier).toBeDefined();
    expect(verifier.name).toBeDefined();
    expect(verifier.url).toBeDefined();
    expect(verifier.did).toBeDefined();
    expect(verifier.did).toEqual(presentationRequest.verifier);
  });

  it('returns issuer info', () => {
    const { issuers } = presentationRequestResponse;
    expect(issuers).toBeDefined();
    presentationRequest.credentialRequests.forEach((credentialRequest) => {
      credentialRequest.issuers.forEach(issuerDid => {
        expect(issuers[issuerDid]).toBeDefined();
        expect(issuers[issuerDid].name).toBeDefined();
        expect(issuers[issuerDid].did).toBeDefined();
        expect(issuers[issuerDid].did).toEqual(issuerDid);
      });
    });
  });

  it('returns a deeplink', () => {
    const { deeplink } = presentationRequestResponse;
    expect(deeplink).toBeDefined();
  });

  it('returns a QR code', () => {
    const { qrCode } = presentationRequestResponse;
    expect(qrCode).toBeDefined();
  });

  it('returns the auth token', () => {
    expect(apiResponseAuthToken).toEqual(dummyAuthToken);
  });

  it('returns the auth token with an array x-auth-token header', async () => {
    const headers = { 'x-auth-token': [dummyAuthToken] };
    const dummyApiResponse = { body: {}, headers };
    mockMakeNetworkRequest.mockResolvedValueOnce(dummyApiResponse);
    apiResponse = await callSendRequests(verifier, credentialRequests, metadata, expiresAt, eccPrivateKey, holderAppUuid, authToken);
    apiResponseAuthToken = apiResponse.authToken;
    expect(apiResponseAuthToken).toEqual(dummyAuthToken);
  });

  it('does not return an x-auth-token header if the SaaS does not return an x-auth-token header', async () => {
    const dummyPresentationRequestResponse = await makeDummyPresentationRequestResponse();
    const dummyApiResponse = { body: dummyPresentationRequestResponse };
    mockMakeNetworkRequest.mockResolvedValueOnce(dummyApiResponse);
    apiResponse = await callSendRequests(
      verifier,
      credentialRequests,
      metadata,
      expiresAt,
      eccPrivateKey,
      holderAppUuid,
      authToken
    );
    apiResponseAuthToken = apiResponse.authToken;
    expect(apiResponseAuthToken).toBeUndefined();
  });
});

describe('sendRequest - Failure cases', () => {
  let response: VerifierDto<PresentationRequestResponse>;
  const {
    verifier,
    credentialRequests,
    eccPrivateKey,
    authToken,
    holderAppUuid
  } = populateMockData();
  const metadata = {};
  const expiresAt = new Date('2021-10-26T23:07:12.770Z');

  it('returns a CustError with a descriptive error message if verifier is missing', async () => {
    try {
      await callSendRequests(
        undefined,
        credentialRequests,
        metadata,
        expiresAt,
        eccPrivateKey,
        holderAppUuid,
        authToken
      );
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(400, 'Invalid PresentationRequest options: verifier is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid PresentationRequest options: verifier is required.');
    }
  });

  it('returns a CustError with a descriptive error message if verifier is not a string', async () => {
    try {
      await callSendRequests(
        {} as string,
        credentialRequests,
        metadata,
        expiresAt,
        eccPrivateKey,
        holderAppUuid,
        authToken
      );
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(400, 'Invalid PresentationRequest options: verifier must be a string.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid PresentationRequest options: verifier must be a string.');
    }
  });

  it('returns a CustError with a descriptive error message if credentialRequests is missing', async () => {
    try {
      await callSendRequests(
        verifier,
        undefined,
        metadata,
        expiresAt,
        eccPrivateKey,
        holderAppUuid,
        authToken
      );
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(400, 'Invalid PresentationRequest options: credentialRequests is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid PresentationRequest options: credentialRequests is required.');
    }
  });

  it('returns a CustError with a descriptive error message if credentialRequests is not an array', async () => {
    try {
      await callSendRequests(
        verifier,
        {} as Array<CredentialRequest>,
        metadata,
        expiresAt,
        eccPrivateKey,
        holderAppUuid,
        authToken
      );
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(400, 'Invalid PresentationRequest options: credentialRequests must be an array.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid PresentationRequest options: credentialRequests must be an array.');
    }
  });

  it('returns a CustError with a descriptive error message if credentialRequests array is empty', async () => {
    try {
      await callSendRequests(
        verifier,
        [],
        metadata,
        expiresAt,
        eccPrivateKey,
        holderAppUuid,
        authToken
      );
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(400, 'Invalid PresentationRequest options: credentialRequests array must not be empty.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid PresentationRequest options: credentialRequests array must not be empty.');
    }
  });

  it('returns a CustError with a descriptive error message if eccPrivateKey is missing', async () => {
    try {
      await callSendRequests(
        verifier,
        credentialRequests,
        metadata,
        expiresAt,
        '',
        holderAppUuid,
        authToken
      );
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(400, 'Invalid PresentationRequest options: eccPrivateKey is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid PresentationRequest options: eccPrivateKey is required.');
    }
  });

  it('returns a CustError with a descriptive error message if authorization is missing', async () => {
    try {
      await callSendRequests(
        verifier,
        credentialRequests,
        metadata,
        expiresAt,
        eccPrivateKey,
        holderAppUuid,
        '');
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(401, 'No authentication string. Not authenticated.'));
      expect(e.code).toEqual(401);
      expect(e.message).toEqual('No authentication string. Not authenticated.');
    }
  });
});

describe('sendRequest - Failure cases for credentialRequests element', () => {
  let response: utilLib.JSONObj;
  const {
    verifier,
    credentialRequests,
    eccPrivateKey,
    authToken,
    holderAppUuid
  } = populateMockData();
  const metadata = {};
  const expiresAt = new Date('2021-10-26T23:07:12.770Z');

  it('returns a 400 status code with a descriptive error message when credentialRequests type is missing', async () => {
    const credRequest: CredentialRequest = { issuers: credentialRequests[0].issuers, type: undefined };

    try {
      await callSendRequests(
        verifier,
        [credRequest],
        metadata,
        expiresAt,
        eccPrivateKey,
        holderAppUuid,
        authToken
      );
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(400, 'Invalid credentialRequest: type is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid credentialRequest: type is required.');
    }
  });

  it('returns a 400 status code with a descriptive error message when credentialRequests issuers is missing', async () => {
    const credRequest: CredentialRequest = { issuers: credentialRequests[0].issuers, type: undefined };

    try {
      await callSendRequests(
        verifier,
        [{ type: credentialRequests[0].type, issuers: undefined }],
        metadata,
        expiresAt,
        eccPrivateKey,
        holderAppUuid,
        authToken
      );
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(400, 'Invalid credentialRequest: issuers is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid credentialRequest: issuers is required.');
    }
  });

  it('returns a 400 status code with a descriptive error message when credentialRequests issuers is not an array', async () => {
    const credRequest: CredentialRequest = { issuers: credentialRequests[0].issuers, type: undefined };

    try {
      await callSendRequests(
        verifier,
        [{ type: 'DummyCredential', issuers: {} as [] }],
        metadata,
        expiresAt,
        eccPrivateKey,
        holderAppUuid,
        authToken
      );
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(400, 'Invalid credentialRequest: issuers must be an array.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid credentialRequest: issuers must be an array.');
    }
  });

  it('returns a 400 status code with a descriptive error message when credentialRequests issuers array is empty', async () => {
    const credRequest: CredentialRequest = { issuers: credentialRequests[0].issuers, type: undefined };

    try {
      await callSendRequests(
        verifier,
        [{ type: 'DummyCredential', issuers: [] }],
        metadata,
        expiresAt,
        eccPrivateKey,
        holderAppUuid,
        authToken
      );
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(400, 'Invalid credentialRequest: issuers array must not be empty.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid credentialRequest: issuers array must not be empty.');
    }
  });

  it('returns a 400 status code with a descriptive error message when credentialRequests issuer array element is not a string', async () => {
    const credRequest: CredentialRequest = { issuers: credentialRequests[0].issuers, type: undefined };

    try {
      await callSendRequests(
        verifier,
        [{ type: 'DummyCredential', issuers: [{ name: 'Dummy Issuer' } as unknown as string] }],
        metadata,
        expiresAt,
        eccPrivateKey,
        holderAppUuid,
        authToken
      );
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(400, 'Invalid credentialRequest: issuers array element must be a string.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid credentialRequest: issuers array element must be a string.');
    }
  });

  it('returns a 400 status code with a descriptive error message when holderAppUuid is missing', async () => {
    const credRequest: CredentialRequest = { issuers: credentialRequests[0].issuers, type: undefined };

    try {
      await callSendRequests(
        verifier,
        credentialRequests,
        metadata,
        expiresAt,
        eccPrivateKey,
        undefined as unknown as string,
        authToken
      );
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(400, 'Invalid PresentationRequest options: holderAppUuid is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid PresentationRequest options: holderAppUuid is required.');
    }
  });

  it('returns a 400 status code with a descriptive error message when holderAppUuid is not a string', async () => {
    const credRequest: CredentialRequest = { issuers: credentialRequests[0].issuers, type: undefined };

    try {
      await callSendRequests(
        verifier,
        credentialRequests,
        metadata,
        expiresAt,
        eccPrivateKey,
        {} as string,
        authToken
      );
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(400, 'Invalid PresentationRequest options: holderAppUuid must be a string.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid PresentationRequest options: holderAppUuid must be a string.');
    }
  });
});

describe('sendRequest - Failure cases - SaaS Errors', () => {
  const {
    verifier,
    credentialRequests,
    eccPrivateKey,
    authToken,
    holderAppUuid
  } = populateMockData();
  const metadata = {};
  const expiresAt = new Date('2021-10-26T23:07:12.770Z');

  const stCode = 401;

  it('Response code should be ' + stCode + ' when invalid auth token is passed', async () => {
    mockMakeNetworkRequest.mockRejectedValueOnce(new utilLib.CustError(401, 'Not authenticated.'));
    try {
      await callSendRequests(
        verifier,
        credentialRequests,
        metadata,
        expiresAt,
        eccPrivateKey,
        holderAppUuid,
        'jkaskdhf');
      fail();
    } catch (e) {
      expect(e.code).toBe(stCode);
    }
  });

  it('returns a 400 status code when an invalid verifier did is passed', async () => {
    mockMakeNetworkRequest.mockRejectedValueOnce(new utilLib.CustError(400, 'Invalid \'verifier\': expected string.'));
    try {
      await callSendRequests(
        verifier,
        credentialRequests,
        metadata,
        expiresAt,
        eccPrivateKey,
        holderAppUuid,
        'jkaskdhf');
      fail();
    } catch (e) {
      expect(e.code).toBe(400);
    }
  });

  it('returns a 400 status code when an invalid issuer did is passed', async () => {
    const badCredentialRequests = [{ ...credentialRequests[0], issuers: [{}] }];
    mockMakeNetworkRequest.mockRejectedValueOnce(new utilLib.CustError(400, 'Invalid \'credentialRequests\': expected \'issuers\' to be an array of strings.'));
    try {
      await callSendRequests(
        'did',
        badCredentialRequests,
        metadata,
        expiresAt,
        eccPrivateKey,
        holderAppUuid,
        authToken
      );
    } catch (e) {
      expect(e.code).toBe(400);
    }
  });
});
