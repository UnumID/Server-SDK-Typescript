import request from 'supertest';

import * as hlpr from 'library-issuer-verifier-utility';
import { app } from '../src/index';

const callApi = async (name: string, customerUuid: string, apiKey: string, url: string): Promise<request.Response> => {
  return (request(app)
    .post('/api/register')
    .send({
      name,
      customerUuid,
      apiKey,
      url
    })
  );
};

describe('POST /api/register Verifier', () => {
  let createTokenSpy;
  let restCallSpy;
  const name = 'First Unumid Verifier';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const customerApiKey = '/7uLH4LB+etgKb5LUR5vm2cebS49EmPwxmBoS/TpfXM=';
  const url = 'https://customer-api.dev-unumid.org/presentation';
  let verifierApiKey: string;
  let response: request.Response;

  beforeEach(async () => {
    createTokenSpy = jest.spyOn(hlpr, 'createToken', 'get');
    restCallSpy = jest.spyOn(hlpr, 'makeRESTCall', 'get');

    // we need a unique Verifier API Key for each Verifier we want create
    const verifierApiKeyResponse = await request(app)
      .post('/api/createVerifierApiKey')
      .send({ customerApiKey, customerUuid });

    verifierApiKey = verifierApiKeyResponse.body.verifierApiKey;

    response = await callApi(name, customerUuid, verifierApiKey, url);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Generates ECC Key pairs', async () => {
    await callApi(name, customerUuid, verifierApiKey, url);

    expect(createTokenSpy).toBeCalled();
    expect(restCallSpy).toBeCalled();
  });

  it('returns a 200 status code', () => {
    expect(response.status).toBe(200);
  });

  it('responds with keys and other details needed for registering the Verifier', async () => {
    expect(response.body).toHaveProperty('uuid');
    expect(response.body).toHaveProperty('did');
    expect(response.body.name).toBe('First Unumid Verifier');
    expect(response.body.customerUuid).toBe('5e46f1ba-4c82-471d-bbc7-251924a90532');
    expect(response.body.keys.signing.privateKey).toBeDefined();
    expect(response.body.keys.signing.publicKey).toBeDefined();
  });
});

describe('POST /api/register Verifier - Failure cases', () => {
  const name = 'First Unumid Verifier';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const customerApiKey = '/7uLH4LB+etgKb5LUR5vm2cebS49EmPwxmBoS/TpfXM=';
  const url = 'https://customer-api.dev-unumid.org/presentation';
  let verifierApiKey: string;

  beforeEach(async () => {
    // we need a unique Verifier API Key for each verifier we want to create
    const verifierApiKeyResponse = await request(app)
      .post('/api/createVerifierApiKey')
      .send({ customerApiKey, customerUuid });

    verifierApiKey = verifierApiKeyResponse.body.verifierApiKey;
  });

  it('returns a 400 status code with a descriptive error message when name is missing', async () => {
    const response = await callApi('', customerUuid, verifierApiKey, url);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid Verifier Options: name is required.');
  });

  it('returns a 400 status code with a descriptive error message when cusotmerUuid is missing', async () => {
    const response = await callApi(name, '', verifierApiKey, url);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid Verifier Options: customerUuid is required.');
  });

  it('returns a 401 status code with a descriptive error message when apiKey is missing', async () => {
    const response = await callApi(name, customerUuid, '', url);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Not authenticated.');
  });

  it('returns a 400 status code with a descriptive error message when url is missing', async () => {
    const response = await callApi(name, customerUuid, verifierApiKey, undefined as unknown as string);

    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual('Invalid Verifier Options: url is required.');
  });
});

describe('POST /api/register Verifier - Failure cases - SaaS Errors', () => {
  const name = 'First Unumid Verifier';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const customerApiKey = '/7uLH4LB+etgKb5LUR5vm2cebS49EmPwxmBoS/TpfXM=';
  const url = 'https://customer-api.dev-unumid.org/presentation';
  let verifierApiKey: string;

  beforeEach(async () => {
    // we need a unique Verifier API Key for each verifier we want to create
    const verifierApiKeyResponse = await request(app)
      .post('/api/createVerifierApiKey')
      .send({ customerApiKey, customerUuid });
    verifierApiKey = verifierApiKeyResponse.body.verifierApiKey;
  });

  it('returns a 403 status code if the customerUuid is not valid', async () => {
    const response = await callApi(name, '123', verifierApiKey, url);
    expect(response.status).toBe(403);
  });

  it('returns a 403 status code if the verifier Api Key is not valid', async () => {
    const response = await callApi(name, customerUuid, 'abc', url);

    expect(response.status).toBe(403);
  });
});
