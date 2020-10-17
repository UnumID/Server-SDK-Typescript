import request from 'supertest';

import * as hlpr from 'library-issuer-verifier-utility';
import { app } from '../src/index';
import { PresentationRequestWithDeeplink } from '../src/types';

const callSendRequests = (
  verifier: string,
  credentialRequests: hlpr.JSONObj[],
  metadata: Record<string, unknown>,
  expiresAt: string,
  eccPrivateKey: string,
  holderAppUuid: string,
  authToken: string
): Promise<hlpr.JSONObj> => {
  return (request(app)
    .post('/api/sendRequest')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      verifier,
      credentialRequests,
      metadata,
      expiresAt,
      eccPrivateKey,
      holderAppUuid
    })
  );
};

const populateMockData = (): hlpr.JSONObj => {
  const verifier = 'did:unum:a40e162e-3297-4834-a1a3-a15e96554fac';
  const holderAppUuid = 'a91a5574-e338-46bd-9405-3a72acbd1b6a';
  const credentialRequests: hlpr.JSONObj[] = [{
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

describe('POST /api/sendRequest', () => {
  let createProofSpy, restCallSpy, preReq: PresentationRequestWithDeeplink, response: hlpr.JSONObj;
  const {
    verifier,
    credentialRequests,
    eccPrivateKey,
    authToken,
    holderAppUuid
  } = populateMockData();
  let metadata;
  let expiresAt;

  beforeEach(async () => {
    createProofSpy = jest.spyOn(hlpr, 'createProof', 'get');
    restCallSpy = jest.spyOn(hlpr, 'makeRESTCall', 'get');

    response = await callSendRequests(
      verifier,
      credentialRequests,
      metadata,
      expiresAt,
      eccPrivateKey,
      holderAppUuid,
      authToken
    );

    preReq = response.body;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Send request after signing the data', async () => {
    expect(createProofSpy).toBeCalled();
    expect(restCallSpy).toBeCalled();
  });

  it('Response status code should be 200', () => {
    expect(response.statusCode).toBe(200);
  });

  it('Response should have uuid, createdAt and updatedAt', () => {
    expect(preReq.uuid).toBeDefined();
    expect(preReq.createdAt).toBeDefined();
    expect(preReq.updatedAt).toBeDefined();
  });

  it('Response should have proof object and deeplink', () => {
    expect(preReq.proof).toBeDefined();
    expect(preReq.deeplink).toBeDefined();
  });
});

describe('POST /api/sendRequest with expiry date and metadata', () => {
  let createProofSpy, restCallSpy, preReq: PresentationRequestWithDeeplink, response: hlpr.JSONObj;
  const {
    verifier,
    credentialRequests,
    eccPrivateKey,
    authToken,
    holderAppUuid
  } = populateMockData();

  const metadata = {};
  const expiresAt = '2021-10-26T23:07:12.770Z';

  beforeEach(() => {
    createProofSpy = jest.spyOn(hlpr, 'createProof', 'get');
    restCallSpy = jest.spyOn(hlpr, 'makeRESTCall', 'get');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Send request after signing the data', async () => {
    response = await callSendRequests(
      verifier,
      credentialRequests,
      metadata,
      expiresAt,
      eccPrivateKey,
      holderAppUuid,
      authToken
    );

    preReq = response.body;

    expect(createProofSpy).toBeCalled();
    expect(restCallSpy).toBeCalled();
  });

  it('Response status code should be 200', () => {
    expect(response.statusCode).toBe(200);
  });

  it('Response should have uuid, createdAt and updatedAt', () => {
    expect(preReq.uuid).toBeDefined();
    expect(preReq.createdAt).toBeDefined();
    expect(preReq.updatedAt).toBeDefined();
  });

  it('Response should have proof object and deeplink', () => {
    expect(preReq.proof).toBeDefined();
    expect(preReq.deeplink).toBeDefined();
  });
});

describe('POST /api/sendRequest - Failure cases', () => {
  let response: hlpr.JSONObj;
  const {
    verifier,
    credentialRequests,
    eccPrivateKey,
    authToken,
    holderAppUuid
  } = populateMockData();
  const metadata = {};
  const expiresAt = '2021-10-26T23:07:12.770Z';

  it('returns a 400 status code with a descriptive error message when verifier is missing', async () => {
    response = await callSendRequests(
      undefined,
      credentialRequests,
      metadata,
      expiresAt,
      eccPrivateKey,
      holderAppUuid,
      authToken
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid PresentationRequest options: verifier is required.');
  });

  it('returns a 400 status code with a descriptive error message when verifier is not a string', async () => {
    response = await callSendRequests(
      {} as string,
      credentialRequests,
      metadata,
      expiresAt,
      eccPrivateKey,
      holderAppUuid,
      authToken
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid PresentationRequest options: verifier must be a string.');
  });

  it('returns a 400 status code with a descriptive error message when credentialRequests is missing', async () => {
    response = await callSendRequests(
      verifier,
      undefined,
      metadata,
      expiresAt,
      eccPrivateKey,
      holderAppUuid,
      authToken
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid PresentationRequest options: credentialRequests is required.');
  });

  it('returns a 400 status code with a descriptive error message when credentialRequests is not an array', async () => {
    response = await callSendRequests(
      verifier,
      {} as Array<unknown>,
      metadata,
      expiresAt,
      eccPrivateKey,
      holderAppUuid,
      authToken
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid PresentationRequest options: credentialRequests must be an array.');
  });

  it('returns a 400 status code with a descriptive error message when credentialRequests array is empty', async () => {
    response = await callSendRequests(
      verifier,
      [],
      metadata,
      expiresAt,
      eccPrivateKey,
      holderAppUuid,
      authToken
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid PresentationRequest options: credentialRequests array must not be empty.');
  });

  it('returns a 400 status code with a descriptive error message when eccPrivateKey is missing', async () => {
    response = await callSendRequests(
      verifier,
      credentialRequests,
      metadata,
      expiresAt,
      '',
      holderAppUuid,
      authToken
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid PresentationRequest options: eccPrivateKey is required.');
  });

  it('returns a 401 status code when Authorization header is missing', async () => {
    response = await callSendRequests(
      verifier,
      credentialRequests,
      metadata,
      expiresAt,
      eccPrivateKey,
      holderAppUuid,
      ''
    );

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Not authenticated.');
  });
});

describe('POST /api/sendRequest - Failure cases for credentialRequests element', () => {
  let response: hlpr.JSONObj;
  const {
    verifier,
    credentialRequests,
    eccPrivateKey,
    authToken,
    holderAppUuid
  } = populateMockData();
  const metadata = {};
  const expiresAt = '2021-10-26T23:07:12.770Z';

  it('returns a 400 status code with a descriptive error message when credentialRequests type is missing', async () => {
    response = await callSendRequests(
      verifier,
      [{ issuers: credentialRequests[0].issuers }],
      metadata,
      expiresAt,
      eccPrivateKey,
      holderAppUuid,
      authToken
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid credentialRequest: type is required.');
  });

  it('returns a 400 status code with a descriptive error message when credentialRequests issuers is missing', async () => {
    response = await callSendRequests(
      verifier,
      [{ type: credentialRequests[0].type, issuers: undefined }],
      metadata,
      expiresAt,
      eccPrivateKey,
      holderAppUuid,
      authToken
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid credentialRequest: issuers is required.');
  });

  it('returns a 400 status code with a descriptitve error message when credentialRequest issuers is not an array', async () => {
    response = await callSendRequests(
      verifier,
      [{ type: 'DummyCredential', issuers: {} }],
      metadata,
      expiresAt,
      eccPrivateKey,
      holderAppUuid,
      authToken
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid credentialRequest: issuers must be an array.');
  });

  it('returns a 400 status code with a descriptive error message when credentialRequest issuers array is empty', async () => {
    response = await callSendRequests(
      verifier,
      [{ type: 'DummyCredential', issuers: [] }],
      metadata,
      expiresAt,
      eccPrivateKey,
      holderAppUuid,
      authToken
    )
    ;

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid credentialRequest: issuers array must not be empty.');
  });

  it('returns a 400 status code with a descriptive error message when issuer is not a string', async () => {
    response = await callSendRequests(
      verifier,
      [{ type: 'DummyCredential', issuers: [{ name: 'Dummy Issuer' }] }],
      metadata,
      expiresAt,
      eccPrivateKey,
      holderAppUuid,
      authToken
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid issuer: must be a string.');
  });

  it('returns a 400 status code with a descriptive error message when holderAppUuid is missing', async () => {
    response = await callSendRequests(
      verifier,
      credentialRequests,
      metadata,
      expiresAt,
      eccPrivateKey,
      undefined as unknown as string,
      authToken
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual('Invalid PresentationRequest options: holderAppUuid is required.');
  });

  it('returns a 400 status code with a descriptive error message when holderAppUuid is not a string', async () => {
    response = await callSendRequests(
      verifier,
      credentialRequests,
      metadata,
      expiresAt,
      eccPrivateKey,
      {} as string,
      authToken
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual('Invalid PresentationRequest options: holderAppUuid must be a string.');
  });
});

describe('POST /api/sendRequest - Failure cases - SaaS Errors', () => {
  let response: hlpr.JSONObj;
  const {
    verifier,
    credentialRequests,
    eccPrivateKey,
    authToken,
    holderAppUuid
  } = populateMockData();
  const metadata = {};
  const expiresAt = '2021-10-26T23:07:12.770Z';

  const stCode = 401;

  it('Response code should be ' + stCode + ' when invalid auth token is passed', async () => {
    response = await callSendRequests(
      verifier,
      credentialRequests,
      metadata,
      expiresAt,
      eccPrivateKey,
      holderAppUuid,
      'jkaskdhf');

    expect(response.statusCode).toBe(stCode);
  });

  it('returns a 400 status code when an invalid verifier did is passed', async () => {
    response = await callSendRequests(
      {} as string,
      credentialRequests,
      metadata,
      expiresAt,
      eccPrivateKey,
      holderAppUuid,
      authToken)
    ;
    expect(response.statusCode).toBe(400);
  });

  it('returns a 400 status code when an invalid issuer did is passed', async () => {
    const badCredentialRequests = [{ ...credentialRequests[0], issuers: [{}] }];
    response = await callSendRequests(
      'did',
      badCredentialRequests,
      metadata,
      expiresAt,
      eccPrivateKey,
      holderAppUuid,
      authToken
    );
    expect(response.statusCode).toBe(400);
  });
});
