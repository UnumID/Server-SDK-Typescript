import request from 'supertest';

import * as utilLib from 'library-issuer-verifier-utility';
import {
  dummyAuthToken,
  dummyVerifierApiKey,
  makeDummyVerifier,
  makeDummyVerifierResponse
} from './mocks';
import { registerVerifier } from '../src/verifier/registerVerifier';
import { VerifierDto, RegisteredVerifier } from '../src/types';

jest.mock('library-issuer-verifier-utility', () => ({
  ...jest.requireActual('library-issuer-verifier-utility'),
  makeNetworkRequest: jest.fn()
}));

const mockMakeNetworkRequest = utilLib.makeNetworkRequest as jest.Mock;

describe('registerVerifier', () => {
  const name = 'First Unumid Verifier';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const url = 'https://customer-api.dev-unumid.org/presentation';
  let responseDto: VerifierDto<RegisteredVerifier>, responseAuthToken: string, response: RegisteredVerifier;

  beforeEach(async () => {
    const dummyVerifier = makeDummyVerifier({ name, customerUuid, url });
    const dummyVerifierResponse = makeDummyVerifierResponse({ verifier: dummyVerifier, authToken: dummyAuthToken });
    mockMakeNetworkRequest.mockResolvedValueOnce(dummyVerifierResponse);
    responseDto = await registerVerifier(name, customerUuid, url, dummyVerifierApiKey);
    response = responseDto.body;
    responseAuthToken = responseDto.authToken;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns an ecc keypair', async () => {
    expect(response.keys.signing.privateKey).toBeDefined();
    expect(response.keys.signing.publicKey).toBeDefined();
  });

  it('returns verifier details', async () => {
    expect(response).toHaveProperty('uuid');
    expect(response).toHaveProperty('did');
    expect(response.name).toBe(name);
    expect(response.customerUuid).toBe(customerUuid);
  });

  it('returns the auth token', () => {
    expect(responseAuthToken).toEqual(dummyAuthToken);
  });
});

describe('registerVerifier - Failure cases', () => {
  const name = 'First Unumid Verifier';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const url = 'https://customer-api.dev-unumid.org/presentation';

  it('returns a CustError with a descriptive error message if name is missing', async () => {
    try {
      await registerVerifier('', customerUuid, url, dummyVerifierApiKey);
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(400, 'Invalid Verifier Options: name is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid Verifier Options: name is required.');
    }
  });

  it('returns a CustError with a descriptive error message if customerUuid is missing', async () => {
    try {
      await registerVerifier(name, '', url, dummyVerifierApiKey);
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(400, 'Invalid Verifier Options: customerUuid is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid Verifier Options: customerUuid is required.');
    }
  });

  it('returns a CustError with a descriptive error message if url is missing', async () => {
    try {
      await registerVerifier(name, customerUuid, '', dummyVerifierApiKey);
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(400, 'Invalid Verifier Options: url is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid Verifier Options: url is required.');
    }
  });

  it('returns a CustError with a descriptive error message if apiKey is missing', async () => {
    try {
      await registerVerifier(name, customerUuid, url, '');
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(401, 'Not authenticated: apiKey is required.'));
      expect(e.code).toEqual(401);
      expect(e.message).toEqual('Not authenticated: apiKey is required.');
    }
  });
});

describe('registerVerifier - Failure cases - SaaS Errors', () => {
  const name = 'First Unumid Verifier';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const url = 'https://customer-api.dev-unumid.org/presentation';

  it('Response code should be 403 when uuid is not valid', async () => {
    mockMakeNetworkRequest.mockRejectedValueOnce(new utilLib.CustError(403, 'Forbidden'));
    try {
      await registerVerifier(name, '123', url, dummyVerifierApiKey);
    } catch (e) {
      expect(e.code).toBe(403);
    }
  });

  it('Response code should be 403 when API Key is not valid', async () => {
    mockMakeNetworkRequest.mockRejectedValueOnce(new utilLib.CustError(403, 'Forbidden'));

    try {
      await registerVerifier(name, customerUuid, url, 'abc');
    } catch (e) {
      expect(e.code).toBe(403);
    }
  });
});
