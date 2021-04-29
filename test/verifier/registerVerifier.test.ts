import {
  dummyAuthToken,
  dummyVerifierApiKey,
  makeDummyVerifier,
  makeDummyVerifierResponse
} from './mocks';
import { registerVerifier } from '../../src/verifier/registerVerifier';
import { UnumDto, RegisteredVerifier } from '../../src/types';
import { CustError } from '../../src/utils/error';
import { mocked } from 'ts-jest/utils';
import { makeNetworkRequest } from '../../src/utils/networkRequestHelper';
import { VersionInfo } from '@unumid/types';

jest.mock('../../src/utils/networkRequestHelper', () => ({
  ...jest.requireActual('../../src/utils/networkRequestHelper'),
  makeNetworkRequest: jest.fn()
}));

/**
 * Mocking only makeNetworkRequest from the the file. Can do that either way with mocked or as jest.Mock
 */
const mockMakeNetworkRequest = mocked(makeNetworkRequest, true);
// const mockMakeNetworkRequest = makeNetworkRequest as jest.Mock;

describe('registerVerifier', () => {
  const name = 'First Unumid Verifier';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const url = 'https://customer-api.dev-unumid.org/presentation';
  const versionInfo: VersionInfo[] = [{
    target: {
      version: '2.0.0'
    },
    sdkVersion: '2.0.0' // server sdk
  }, {
    target: {
      url: 'https://customer-api.dev-unumid.org/presentationV1'
    },
    sdkVersion: '1.0.0' // server sdk
  }];

  let responseDto: UnumDto<RegisteredVerifier>, responseAuthToken: string, response: RegisteredVerifier;

  beforeEach(async () => {
    const dummyVerifier = makeDummyVerifier({ name, customerUuid, url });
    const dummyVerifierResponse = makeDummyVerifierResponse({ verifier: dummyVerifier, authToken: dummyAuthToken });
    mockMakeNetworkRequest.mockResolvedValue(dummyVerifierResponse);

    responseDto = await registerVerifier(name, customerUuid, url, dummyVerifierApiKey, versionInfo);
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
    expect(response.versionInfo).toBe(versionInfo);
  });

  it('returns verifier details default versionInfo', async () => {
    responseDto = await registerVerifier(name, customerUuid, url, dummyVerifierApiKey);
    response = responseDto.body;
    responseAuthToken = responseDto.authToken;
    expect(response.versionInfo).toStrictEqual([{ target: { version: '1.0.0' }, sdkVersion: '2.0.0' }]);
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
      expect(e).toEqual(new CustError(400, 'Invalid Verifier Options: name is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid Verifier Options: name is required.');
    }
  });

  it('returns a CustError with a descriptive error message if customerUuid is missing', async () => {
    try {
      await registerVerifier(name, '', url, dummyVerifierApiKey);
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(400, 'Invalid Verifier Options: customerUuid is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid Verifier Options: customerUuid is required.');
    }
  });

  it('returns a CustError with a descriptive error message if url is missing', async () => {
    try {
      await registerVerifier(name, customerUuid, '', dummyVerifierApiKey);
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(400, 'Invalid Verifier Options: url is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid Verifier Options: url is required.');
    }
  });

  it('returns a CustError with a descriptive error message if apiKey is missing', async () => {
    try {
      await registerVerifier(name, customerUuid, url, '');
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(401, 'Not authenticated: apiKey is required.'));
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
    mockMakeNetworkRequest.mockRejectedValueOnce(new CustError(403, 'Forbidden'));
    try {
      await registerVerifier(name, '123', url, dummyVerifierApiKey);
    } catch (e) {
      expect(e.code).toBe(403);
    }
  });

  it('Response code should be 403 when API Key is not valid', async () => {
    mockMakeNetworkRequest.mockRejectedValueOnce(new CustError(403, 'Forbidden'));

    try {
      await registerVerifier(name, customerUuid, url, 'abc');
    } catch (e) {
      expect(e.code).toBe(403);
    }
  });
});
