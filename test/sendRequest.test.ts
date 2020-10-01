import request from 'supertest';

import * as hlpr from 'library-issuer-verifier-utility';
import { app } from '../src/index';
import { PresentationRequestWithDeeplink } from '../src/types';

const callSendRequests = (verifier: hlpr.JSONObj, credentialRequests: hlpr.JSONObj[],
  metadata: Record<string, unknown>, expiresAt: string, eccPrivateKey: string, authToken: string): Promise<hlpr.JSONObj> => {
  return (request(app)
    .post('/api/sendRequest')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      verifier,
      credentialRequests,
      metadata,
      expiresAt,
      eccPrivateKey
    })
  );
};

const populateMockData = (): hlpr.JSONObj => {
  const verifier: hlpr.JSONObj = {
    name: 'Dummy Verifier',
    did: 'did:unum:a40e162e-3297-4834-a1a3-a15e96554fac',
    url: 'https://api-demo.dev-unumid.org'
  };

  const credentialRequests: hlpr.JSONObj[] = [{
    type: 'DummyCredential',
    issuers: hlpr.JSONObj = [{
      did: 'did:unum:042b9089-9ee9-4217-844f-b01965cf569a',
      name: 'Dummy Issuer'
    }]
  }];
  const eccPrivateKey = '-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIKgEnAHdkJOWCr2HxgThssEnn4+4dXh+AXCK2ORgiM69oAoGCCqGSM49\nAwEHoUQDQgAEl1ZqPBLIa8QxEEx7nNWsVPnUd59UtVmRLS7axzA5VPeVOs2FIGkT\nFx+RgfZSF6J4kXd7F+/pd03fPV/lu/lJpA==\n-----END EC PRIVATE KEY-----\n';
  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';

  return ({
    verifier,
    credentialRequests,
    eccPrivateKey,
    authToken
  });
};

describe('POST /api/sendRequest', () => {
  let createProofSpy, restCallSpy, preReq: PresentationRequestWithDeeplink, response: hlpr.JSONObj;
  const { verifier, credentialRequests, eccPrivateKey, authToken } = populateMockData();
  let metadata, expiresAt;

  beforeEach(() => {
    createProofSpy = jest.spyOn(hlpr, 'createProof', 'get');
    restCallSpy = jest.spyOn(hlpr, 'makeRESTCall', 'get');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Send request after signing the data', async () => {
    response = await callSendRequests(verifier, credentialRequests, metadata, expiresAt, eccPrivateKey, authToken);
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

describe('POST /api/sendRequest with expiry date and metadata', () => {
  let createProofSpy, restCallSpy, preReq: PresentationRequestWithDeeplink, response: hlpr.JSONObj;
  const { verifier, credentialRequests, eccPrivateKey, authToken } = populateMockData();
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
    response = await callSendRequests(verifier, credentialRequests, metadata, expiresAt, eccPrivateKey, authToken);
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
  const { verifier, credentialRequests, eccPrivateKey, authToken } = populateMockData();
  const metadata = {};
  const expiresAt = '2021-10-26T23:07:12.770Z';

  it('returns a 400 status code with a descriptive error message when verifier is missing', async () => {
    response = await callSendRequests(undefined, credentialRequests, metadata, expiresAt, eccPrivateKey, authToken);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid PresentationRequest options: verifier is required.');
  });

  it('returns a 400 status code with a descriptive error message when verifier is not formatted correctly', async () => {
    response = await callSendRequests({}, credentialRequests, metadata, expiresAt, eccPrivateKey, authToken);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid PresentationRequest options: verifier is not correctly formatted.');
  });

  it('returns a 400 status code with a descriptive error message when credentialRequests is missing', async () => {
    response = await callSendRequests(verifier, undefined, metadata, expiresAt, eccPrivateKey, authToken);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid PresentationRequest options: credentialRequests is required.');
  });

  it('returns a 400 status code with a descriptive error message when credentialRequests is not an array', async () => {
    response = await callSendRequests(verifier, {} as Array<unknown>, metadata, expiresAt, eccPrivateKey, authToken);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid PresentationRequest options: credentialRequests must be an array.');
  });

  it('returns a 400 status code with a descriptive error message when credentialRequests array is empty', async () => {
    response = await callSendRequests(verifier, [], metadata, expiresAt, eccPrivateKey, authToken);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid PresentationRequest options: credentialRequests array must not be empty.');
  });

  it('returns a 400 status code with a descriptive error message when eccPrivateKey is missing', async () => {
    response = await callSendRequests(verifier, credentialRequests, metadata, expiresAt, '', authToken);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid PresentationRequest options: eccPrivateKey is required.');
  });

  it('returns a 401 status code when Authorization header is missing', async () => {
    response = await callSendRequests(verifier, credentialRequests, metadata, expiresAt, eccPrivateKey, '');

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Not authenticated.');
  });
});

describe('POST /api/sendRequest - Failure cases for credentialRequests element', () => {
  let response: hlpr.JSONObj;
  const { verifier, credentialRequests, eccPrivateKey, authToken } = populateMockData();
  const metadata = {};
  const expiresAt = '2021-10-26T23:07:12.770Z';

  it('returns a 400 status code with a descriptive error message when credentialRequests type is missing', async () => {
    response = await callSendRequests(verifier, [{ issuers: credentialRequests[0].issuers }], metadata, expiresAt, eccPrivateKey, authToken);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid credentialRequest: type is required.');
  });

  it('returns a 400 status code with a descriptive error message when credentialRequests issuers is missing', async () => {
    response = await callSendRequests(verifier, [{ type: credentialRequests[0].type, issuers: undefined }], metadata, expiresAt, eccPrivateKey, authToken);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid credentialRequest: issuers is required.');
  });

  it('returns a 400 status code with a descriptitve error message when credentialRequest issuers is not an array', async () => {
    response = await callSendRequests(verifier, [{ type: 'DummyCredential', issuers: {} }], metadata, expiresAt, eccPrivateKey, authToken);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid credentialRequest: issuers must be an array.');
  });

  it('returns a 400 status code with a descriptive error message when credentialRequest issuers array is empty', async () => {
    response = await callSendRequests(verifier, [{ type: 'DummyCredential', issuers: [] }], metadata, expiresAt, eccPrivateKey, authToken);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid credentialRequest: issuers array must not be empty.');
  });

  it('returns a 400 status code with a descriptive error message when issuer did is missing', async () => {
    response = await callSendRequests(verifier, [{ type: 'DummyCredential', issuers: [{ name: 'Dummy Issuer' }] }], metadata, expiresAt, eccPrivateKey, authToken);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid issuer: did and name are required.');
  });

  it('returns a 400 status code with a descriptive error message when issuer name is missing', async () => {
    response = await callSendRequests(verifier, [{ type: 'DummyCredential', issuers: [{ did: 'did:unum:042b9089-9ee9-4217-844f-b01965cf569a' }] }], metadata, expiresAt, eccPrivateKey, authToken);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid issuer: did and name are required.');
  });
});

describe('POST /api/sendRequest - Failure cases - SaaS Errors', () => {
  let response: hlpr.JSONObj;
  const { verifier, credentialRequests, eccPrivateKey, authToken } = populateMockData();
  const metadata = {};
  const expiresAt = '2021-10-26T23:07:12.770Z';

  const stCode = 401;
  const stCode1 = 400;

  it('Response code should be ' + stCode + ' when invalid auth token is passed', async () => {
    response = await callSendRequests(verifier, credentialRequests, metadata, expiresAt, eccPrivateKey, 'jkaskdhf');

    expect(response.statusCode).toBe(stCode);
  });

  let verifier1 = { name: verifier.name, did: 'did', url: verifier.url };
  it('Response code should be ' + stCode1 + ' when invalid did is passed in verifier object', async () => {
    response = await callSendRequests(verifier1, credentialRequests, metadata, expiresAt, eccPrivateKey, authToken);

    expect(response.statusCode).toBe(stCode1);
  });

  verifier1 = { name: verifier.name, did: verifier.did, url: 'url' };
  it('Response code should be ' + stCode1 + ' when invalid url is passed in verifier object', async () => {
    response = await callSendRequests(verifier1, credentialRequests, metadata, expiresAt, eccPrivateKey, authToken);

    expect(response.statusCode).toBe(stCode1);
  });

  credentialRequests[0].issuers[0].did = 'did';
  it('Response code should be ' + stCode1 + ' when invalid did in issuers object is passed', async () => {
    response = await callSendRequests(verifier1, credentialRequests, metadata, expiresAt, eccPrivateKey, authToken);

    expect(response.statusCode).toBe(stCode1);
  });
});
