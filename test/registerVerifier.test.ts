import request from 'supertest';

import * as hlpr from 'library-issuer-verifier-utility';
import { app } from '../src/index';

const callApi = (name: string, customerUuid: string, apiKey: string): Promise<hlpr.JSONObj> => {
  return (request(app)
    .post('/api/register')
    .send({
      name,
      customerUuid,
      apiKey
    })
  );
};

describe('POST /api/register Verifier', () => {
  let createTokenSpy, restCallSpy, newVerifier: hlpr.JSONObj, reqBody: hlpr.JSONObj;
  const name = 'First Unumid Verifier';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const customerApiKey = '/7uLH4LB+etgKb5LUR5vm2cebS49EmPwxmBoS/TpfXM=';
  let verifierApiKey;

  beforeEach(async () => {
    createTokenSpy = jest.spyOn(hlpr, 'createToken', 'get');
    restCallSpy = jest.spyOn(hlpr, 'makeRESTCall', 'get');

    const verifierApiKeyResponse = await request(app)
      .post('/api/createVerifierApiKey')
      .send({ customerApiKey, customerUuid });

    verifierApiKey = verifierApiKeyResponse.body.verifierApiKey;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Generates ECC Key pairs', async () => {
    newVerifier = await callApi(name, customerUuid, verifierApiKey);
    reqBody = newVerifier.body;

    expect(createTokenSpy).toBeCalled();
    expect(restCallSpy).toBeCalled();
  });

  it('Response status code should be 200', () => {
    expect(newVerifier.statusCode).toBe(200);
  });

  it('Response should have keys object', () => {
    expect(reqBody.keys).toBeDefined();
  });

  it('It responds with keys and other details needed for registering the Verifier', async () => {
    // make sure we add it correctly
    expect(reqBody).toHaveProperty('uuid');
    expect(reqBody).toHaveProperty('did');
    expect(reqBody.name).toBe('First Unumid Verifier');
    expect(reqBody.customerUuid).toBe('5e46f1ba-4c82-471d-bbc7-251924a90532');
    expect(reqBody.keys.privateKey).toBeDefined();
    expect(reqBody.keys.publicKey).toBeDefined();
  });
});

describe('POST /api/register Verifier - Failure cases', () => {
  let newVerifier: hlpr.JSONObj, reqBody: hlpr.JSONObj;
  const name = 'First Unumid Verifier';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const customerApiKey = '/7uLH4LB+etgKb5LUR5vm2cebS49EmPwxmBoS/TpfXM=';
  let verifierApiKey;

  beforeEach(async () => {
    const verifierApiKeyResponse = await request(app)
      .post('/api/createVerifierApiKey')
      .send({ customerApiKey, customerUuid });

    verifierApiKey = verifierApiKeyResponse.body.verifierApiKey;
  });

  it('returns a 400 status code with a descriptive error message when name is missing', async () => {
    newVerifier = await callApi('', customerUuid, verifierApiKey);
    reqBody = newVerifier.body;

    expect(newVerifier.statusCode).toBe(400);
    expect(reqBody.message).toBe('Invalid Verifier Options: name is required.');
  });

  it('returns a 400 status code with a descriptive error message when cusotmerUuid is missing', async () => {
    newVerifier = await callApi(name, '', verifierApiKey);
    reqBody = newVerifier.body;

    expect(newVerifier.statusCode).toBe(400);
    expect(reqBody.message).toBe('Invalid Verifier Options: customerUuid is required.');
  });

  it('returns a 401 status code with a descriptive error message when apiKey is missing', async () => {
    newVerifier = await callApi(name, customerUuid, '');
    reqBody = newVerifier.body;

    expect(newVerifier.statusCode).toBe(401);
    expect(reqBody.message).toBe('Not authenticated.');
  });
});

describe('POST /api/register Verifier - Failure cases - SaaS Errors', () => {
  let newVerifier: hlpr.JSONObj;
  const name = 'First Unumid Verifier';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const customerApiKey = '/7uLH4LB+etgKb5LUR5vm2cebS49EmPwxmBoS/TpfXM=';
  const stCode = 403;
  let verifierApiKey;

  beforeEach(async () => {
    const verifierApiKeyResponse = await request(app)
      .post('/api/createVerifierApiKey')
      .send({ customerApiKey, customerUuid });
    verifierApiKey = verifierApiKeyResponse.body.verifierApiKey;
  });

  it('Response code should be ' + stCode + ' when uuid is not valid', async () => {
    newVerifier = await callApi(name, '123', verifierApiKey);
    expect(newVerifier.statusCode).toBe(stCode);
  });

  it('Response code should be ' + stCode + ' when API Key is not valid', async () => {
    newVerifier = await callApi(name, customerUuid, 'abc');

    expect(newVerifier.statusCode).toBe(stCode);
  });
});
