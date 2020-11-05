import request from 'supertest';

import * as hlpr from 'library-issuer-verifier-utility';
import { app } from '../src/index';
import {
  dummyAuthToken,
  dummyVerifierApiKey,
  makeDummyVerifier,
  makeDummyVerifierResponse
} from './mocks';

jest.mock('library-issuer-verifier-utility', () => ({
  ...jest.requireActual('library-issuer-verifier-utility'),
  makeRESTCall: jest.fn()
}));

const mockMakeRESTCall = hlpr.makeRESTCall as jest.Mock;

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
  const name = 'First Unumid Verifier';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const url = 'https://customer-api.dev-unumid.org/presentation';
  let response: request.Response;

  beforeEach(async () => {
    const dummyVerifier = makeDummyVerifier({ name, customerUuid, url });
    const dummyVerifierResponse = makeDummyVerifierResponse({ verifier: dummyVerifier, authToken: dummyAuthToken });
    mockMakeRESTCall.mockResolvedValueOnce(dummyVerifierResponse);
    response = await callApi(name, customerUuid, dummyVerifierApiKey, url);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns an ecc keypair', async () => {
    expect(response.body.keys.signing.privateKey).toBeDefined();
    expect(response.body.keys.signing.publicKey).toBeDefined();
  });

  it('returns a 200 status code', () => {
    expect(response.status).toBe(200);
  });

  it('returns verifier details', async () => {
    expect(response.body).toHaveProperty('uuid');
    expect(response.body).toHaveProperty('did');
    expect(response.body.name).toBe(name);
    expect(response.body.customerUuid).toBe(customerUuid);
  });
});

describe('POST /api/register Verifier - Failure cases', () => {
  const name = 'First Unumid Verifier';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const url = 'https://customer-api.dev-unumid.org/presentation';

  it('returns a 400 status code with a descriptive error message when name is missing', async () => {
    const response = await callApi('', customerUuid, dummyVerifierApiKey, url);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid Verifier Options: name is required.');
  });

  it('returns a 400 status code with a descriptive error message when cusotmerUuid is missing', async () => {
    const response = await callApi(name, '', dummyVerifierApiKey, url);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid Verifier Options: customerUuid is required.');
  });

  it('returns a 401 status code with a descriptive error message when apiKey is missing', async () => {
    const response = await callApi(name, customerUuid, '', url);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Not authenticated.');
  });

  it('returns a 400 status code with a descriptive error message when url is missing', async () => {
    const response = await callApi(name, customerUuid, dummyVerifierApiKey, undefined as unknown as string);

    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual('Invalid Verifier Options: url is required.');
  });
});

describe('POST /api/register Verifier - Failure cases - SaaS Errors', () => {
  const name = 'First Unumid Verifier';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const url = 'https://customer-api.dev-unumid.org/presentation';

  it('returns a 403 status code if the customerUuid is not valid', async () => {
    const dummyResponseError = new hlpr.CustError(403, 'Forbidden');
    mockMakeRESTCall.mockRejectedValueOnce(dummyResponseError);
    const response = await callApi(name, '123', dummyVerifierApiKey, url);

    expect(response.status).toBe(403);
  });

  it('returns a 403 status code if the verifier Api Key is not valid', async () => {
    const dummyResponseError = new hlpr.CustError(403, 'Forbidden');
    mockMakeRESTCall.mockRejectedValueOnce(dummyResponseError);
    const response = await callApi(name, customerUuid, 'abc', url);

    expect(response.status).toBe(403);
  });
});
