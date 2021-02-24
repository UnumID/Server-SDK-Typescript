import * as utilLib from '@unumid/library-issuer-verifier-utility';
import { RegisteredIssuer, UnumDto } from '../../src/types';
import { makeDummyIssuerResponse, dummyIssuerApiKey, makeDummyIssuer, dummyAuthToken } from './mocks';
import { registerIssuer } from '../../src/issuer/registerIssuer';

jest.mock('@unumid/library-issuer-verifier-utility', () => {
  const actual = jest.requireActual('@unumid/library-issuer-verifier-utility');

  return {
    ...actual,
    makeNetworkRequest: jest.fn(),
    createKeyPairSet: jest.fn(actual.createKeyPairSet)
  };
});

const mockMakeNetworkRequest = utilLib.makeNetworkRequest as jest.Mock;
const mockCreateKeyPairSet = utilLib.createKeyPairSet as jest.Mock;

describe('registerIssuer', () => {
  let response: RegisteredIssuer, responseAuthToken: string, responseDto: UnumDto<RegisteredIssuer>;
  const name = 'First Unumid Issuer';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';

  beforeEach(async () => {
    const dummyIssuer = makeDummyIssuer({ name, customerUuid });
    const dummyIssuerResponse = makeDummyIssuerResponse({ issuer: dummyIssuer }); // Already has the auth header as part of the dummy function call.
    mockMakeNetworkRequest.mockResolvedValueOnce(dummyIssuerResponse);

    responseDto = await registerIssuer(name, customerUuid, dummyIssuerApiKey);
    response = responseDto.body;
    responseAuthToken = responseDto.authToken;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates keypairs', () => {
    expect(mockCreateKeyPairSet).toBeCalled();
  });

  it('calls the saas to register the issuer', () => {
    expect(mockMakeNetworkRequest).toBeCalled();
  });

  it('returns the auth token', () => {
    expect(responseAuthToken).toEqual(dummyAuthToken);
  });

  it('responds with keys and other details', async () => {
    expect(response).toHaveProperty('uuid');
    expect(response).toHaveProperty('did');
    expect(response.name).toBe('First Unumid Issuer');
    expect(response.customerUuid).toBe('5e46f1ba-4c82-471d-bbc7-251924a90532');
    expect(response.keys.signing.privateKey).toBeDefined();
    expect(response.keys.signing.publicKey).toBeDefined();
    expect(response.keys.encryption.privateKey).toBeDefined();
    expect(response.keys.encryption.publicKey).toBeDefined();
  });
});

describe('registerIssuer - Failure cases', () => {
  let newIssuer: utilLib.JSONObj;
  let reqBody: utilLib.JSONObj;
  const name = 'First Unumid Issuer';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';

  it('returns a CustError with a descriptive error message if name is missing', async () => {
    try {
      await registerIssuer('', customerUuid, dummyIssuerApiKey);
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(400, 'Invalid Issuer: name is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid Issuer: name is required.');
    }
  });

  it('returns a CustError with a descriptive error message if customerUuid is missing', async () => {
    try {
      await registerIssuer(name, '', dummyIssuerApiKey);
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(400, 'Invalid Issuer: customerUuid is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid Issuer: customerUuid is required.');
    }
  });

  it('returns a CustError with a descriptive error message if apiKey is missing', async () => {
    try {
      await registerIssuer(name, customerUuid, '');
      fail();
    } catch (e) {
      expect(e).toEqual(new utilLib.CustError(401, 'Not authenticated: apiKey is required'));
      expect(e.code).toEqual(401);
      expect(e.message).toEqual('Not authenticated: apiKey is required');
    }
  });
});

describe('registerIssuer - Failure cases - SaaS Errors', () => {
  const name = 'First Unumid Issuer';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';

  it('Response code should be 403 when uuid is not valid', async () => {
    mockMakeNetworkRequest.mockRejectedValueOnce(new utilLib.CustError(403, 'Forbidden'));
    try {
      await registerIssuer(name, '123', dummyIssuerApiKey);
    } catch (e) {
      expect(e.code).toBe(403);
    }
  });

  it('Response code should be 403 when API Key is not valid', async () => {
    mockMakeNetworkRequest.mockRejectedValueOnce(new utilLib.CustError(403, 'Forbidden'));

    try {
      await registerIssuer(name, customerUuid, 'abc');
    } catch (e) {
      expect(e.code).toBe(403);
    }
  });
});
