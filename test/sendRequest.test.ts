import request from 'supertest';

import * as hlpr from 'library-issuer-verifier-utility';
import { app } from '../src/index';
import { PresentationRequestWithDeeplink } from '../src/types';

const callSendRequests = (verifier: hlpr.JSONObj, credentialRequests: hlpr.JSONObj[],
  metadata: string, expiresAt: string, eccPrivateKey: string, authToken: string): Promise<hlpr.JSONObj> => {
  return (request(app)
    .post('/api/sendRequest')
    .set('x-auth-token', authToken)
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
  const metadata, expiresAt;

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
  let preReq: PresentationRequestWithDeeplink, response: hlpr.JSONObj;
  const { verifier, credentialRequests, eccPrivateKey, authToken } = populateMockData();
  const metadata = {};
  const expiresAt = '2021-10-26T23:07:12.770Z';

  const stCode = 404;
  const stCode1 = 401;
  const errMsg = 'Missing required verifier, and/or credentialRequests';
  const errMsg1 = 'Missing required name, did and/or url in verifier input element';
  const errMsg2 = 'credentialRequests input is not an array';
  const errMsg3 = 'credentialRequests input array is empty';

  it('Response code should be ' + stCode + ' when verifier is not passed', async () => {
    response = await callSendRequests('', credentialRequests, metadata, expiresAt, eccPrivateKey, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  it('Response code should be ' + stCode + ' when verifier is passed as empty object', async () => {
    response = await callSendRequests({}, credentialRequests, metadata, expiresAt, eccPrivateKey, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg1);
  });

  it('Response code should be ' + stCode + ' when credentialRequests is not passed', async () => {
    response = await callSendRequests(verifier, '', metadata, expiresAt, eccPrivateKey, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  it('Response code should be ' + stCode + ' when credentialRequests is passed as empty object', async () => {
    response = await callSendRequests(verifier, {}, metadata, expiresAt, eccPrivateKey, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg2);
  });

  it('Response code should be ' + stCode + ' when credentialRequests is passed as empty array', async () => {
    response = await callSendRequests(verifier, [], metadata, expiresAt, eccPrivateKey, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg3);
  });

  it('Response code should be ' + stCode + ' when eccPrivateKey is not passed', async () => {
    response = await callSendRequests(verifier, credentialRequests, metadata, expiresAt, '', authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe('eccPrivateKey input field is mandatory');
  });

  it('Response code should be ' + stCode1 + ' when x-auth-token is not passed in the header', async () => {
    response = await callSendRequests(verifier, credentialRequests, metadata, expiresAt, eccPrivateKey, '');
    preReq = response.body;

    expect(response.statusCode).toBe(stCode1);
    expect(preReq.message).toBe('Request not authenticated');
  });
});

describe('POST /api/sendRequest - Failure cases for credentialRequests element', () => {
  let preReq: PresentationRequestWithDeeplink, response: hlpr.JSONObj;
  const { verifier, credentialRequests, eccPrivateKey, authToken } = populateMockData();
  const metadata = {};
  const expiresAt = '2021-10-26T23:07:12.770Z';

  const stCode = 404;
  const errMsg = 'Missing type and/or issuers in credentialRequests[0] Array input element';
  const errMsg1 = 'issuers element in credentialRequests[0] object is not an Array';
  const errMsg2 = 'credentialRequests[0].issuers input array is empty';
  const errMsg3 = 'Missing name and/or did in one or more issuers Array input element';

  credentialRequests = [{}];
  it('Response code should be ' + stCode + ' when array with empty object is not passed', async () => {
    response = await callSendRequests(verifier, credentialRequests, metadata, expiresAt, eccPrivateKey, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  it('Response code should be ' + stCode + ' when type or issuers element is not passed', async () => {
    response = await callSendRequests(verifier, [{ type: '', issuers: '' }], metadata, expiresAt, eccPrivateKey, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  it('Response code should be ' + stCode + ' when issuers element is not passed', async () => {
    response = await callSendRequests(verifier, [{ type: 'DummyCredential', issuers: '' }], metadata, expiresAt, eccPrivateKey, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  it('Response code should be ' + stCode + ' when type element is not passed', async () => {
    response = await callSendRequests(verifier, [{ type: '', issuers: [{ did: 'did:unum:042b9089-9ee9-4217-844f-b01965cf569a', name: 'Dummy Issuer' }] }], metadata, expiresAt, eccPrivateKey, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg);
  });

  it('Response code should be ' + stCode + ' when issuers element is not an array', async () => {
    response = await callSendRequests(verifier, [{ type: 'DummyCredential', issuers: {} }], metadata, expiresAt, eccPrivateKey, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg1);
  });

  it('Response code should be ' + stCode + ' when issuers element is empty array', async () => {
    response = await callSendRequests(verifier, [{ type: 'DummyCredential', issuers: [] }], metadata, expiresAt, eccPrivateKey, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg2);
  });

  it('Response code should be ' + stCode + ' when issuers element with both name and did are empty', async () => {
    response = await callSendRequests(verifier, [{ type: 'DummyCredential', issuers: [{ did: '', name: '' }] }], metadata, expiresAt, eccPrivateKey, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg3);
  });

  it('Response code should be ' + stCode + ' when issuers element with only name element is passed', async () => {
    response = await callSendRequests(verifier, [{ type: 'DummyCredential', issuers: [{ name: 'Dummy Issuer' }] }], metadata, expiresAt, eccPrivateKey, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg3);
  });

  it('Response code should be ' + stCode + ' when issuers element with only did element is passed', async () => {
    response = await callSendRequests(verifier, [{ type: 'DummyCredential', issuers: [{ did: 'did:unum:042b9089-9ee9-4217-844f-b01965cf569a' }] }], metadata, expiresAt, eccPrivateKey, authToken);
    preReq = response.body;

    expect(response.statusCode).toBe(stCode);
    expect(preReq.message).toBe(errMsg3);
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
