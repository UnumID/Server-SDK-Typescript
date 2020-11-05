import request from 'supertest';
import * as helper from 'library-issuer-verifier-utility';

import { app } from '../src';
import { makeDummyVerifierApiKey } from './mocks';

jest.mock('library-issuer-verifier-utility', () => {
  const actual = jest.requireActual('library-issuer-verifier-utility');
  return {
    ...actual,
    makeRESTCall: jest.fn()
  };
});

const mockMakeRESTCall = helper.makeRESTCall as jest.Mock;

const callApi = (customerUuid, customerApiKey): Promise<helper.RESTResponse> => {
  return request(app)
    .post('/api/createVerifierApiKey')
    .send({ customerUuid, customerApiKey });
};

describe('POST /api/createVerifierApiKey', () => {
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const customerApiKey = '/7uLH4LB+etgKb5LUR5vm2cebS49EmPwxmBoS/TpfXM=';

  beforeAll(() => {
    const dummyResponse = { body: makeDummyVerifierApiKey() };
    mockMakeRESTCall.mockResolvedValue(dummyResponse);
  });

  it('calls the saas to create a verifier api key', async () => {
    await callApi(customerUuid, customerApiKey);
    expect(mockMakeRESTCall).toBeCalled();
  });

  it('returns a 201 status', async () => {
    const response = await callApi(customerUuid, customerApiKey);
    expect(response.statusCode).toBe(201);
  });

  it('returns the verifier api key', async () => {
    const response = await callApi(customerUuid, customerApiKey);
    expect(response.body.verifierApiKey).toBeDefined();
  });

  describe('Error cases', () => {
    it('returns a 400 status code with a descriptive message when customerUuid is missing', async () => {
      const response = await callApi(undefined, customerApiKey);
      expect(response.statusCode).toEqual(400);
      expect(response.body.message).toEqual('Invalid Verifier API Key options: customerUuid is required.');
    });

    it('returns a 401 status code if customerApiKey is missing', async () => {
      const response = await callApi(customerUuid, undefined);
      expect(response.statusCode).toEqual(401);
      expect(response.body.message).toEqual('Not authenticated.');
    });
  });
});
