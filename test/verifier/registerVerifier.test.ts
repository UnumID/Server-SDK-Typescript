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
  const url = 'https://customer-api.dev-unum.id/presentation';
  const versionInfo: VersionInfo[] = [{
    target: {
      version: '2.0.0'
    },
    sdkVersion: '2.0.0' // server sdk
  }, {
    target: {
      url: 'https://customer-api.dev-unum.id/presentationV1'
    },
    sdkVersion: '1.0.0' // server sdk
  }];

  let responseDto: UnumDto<RegisteredVerifier>, responseAuthToken: string, response: RegisteredVerifier;

  beforeEach(async () => {
    const dummyVerifier = makeDummyVerifier({ name, customerUuid, url });
    const dummyVerifierResponse = makeDummyVerifierResponse({ verifier: dummyVerifier, authToken: dummyAuthToken });
    mockMakeNetworkRequest.mockResolvedValue(dummyVerifierResponse);

    responseDto = await registerVerifier(url, dummyVerifierApiKey, versionInfo);
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

  // it('returns verifier details default versionInfo', async () => {
  //   responseDto = await registerVerifier(name, customerUuid, url, dummyVerifierApiKey);
  //   response = responseDto.body;
  //   responseAuthToken = responseDto.authToken;
  //   expect(response.versionInfo).toStrictEqual([{ target: { version: '1.0.0' }, sdkVersion: '2.0.0' }]);
  // });

  it('returns the auth token', () => {
    expect(responseAuthToken).toEqual(dummyAuthToken);
  });
});

describe('registerVerifier - Failure cases', () => {
  const name = 'First Unumid Verifier';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const url = 'https://customer-api.dev-unum.id/presentation';

  it('returns a CustError with a descriptive error message if url is missing', async () => {
    try {
      await registerVerifier('', dummyVerifierApiKey);
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(400, 'Invalid Verifier Options: url is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid Verifier Options: url is required.');
    }
  });

  it('returns a CustError with a descriptive error message if apiKey is missing', async () => {
    try {
      await registerVerifier(url, '');
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(401, 'Not authenticated: apiKey is required.'));
      expect(e.code).toEqual(401);
      expect(e.message).toEqual('Not authenticated: apiKey is required.');
    }
  });

  it('returns a CustError with a descriptive error message if versionInfo target is missing', async () => {
    // const badVersionInfo: VersionInfo[] = [{ target: { version: '1.0.x' }, sdkVersion: '3.0.0' }];
    const badVersionInfo: VersionInfo[] = [{ sdkVersion: '3.0.0' }];
    try {
      await registerVerifier(url, dummyVerifierApiKey, badVersionInfo);
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(400, '\'versionInfo[0].target\' must be defined.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('\'versionInfo[0].target\' must be defined.');
    }
  });

  it('returns a CustError with a descriptive error message if versionInfo url or version is missing', async () => {
    const badVersionInfo: VersionInfo[] = [{ target: { hat: '1.0.x' }, sdkVersion: '3.0.0' }];
    try {
      await registerVerifier(url, dummyVerifierApiKey, badVersionInfo);
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(400, '\'versionInfo[0].target.version\' or \'versionInfo[0].target.url\' must be defined.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('\'versionInfo[0].target.version\' or \'versionInfo[0].target.url\' must be defined.');
    }
  });

  it('returns a CustError with a descriptive error message if versionInfo version is not in semver notation', async () => {
    const badVersionInfo: VersionInfo[] = [{ target: { version: '1.0.x' }, sdkVersion: '3.0.0' }];
    try {
      await registerVerifier(url, dummyVerifierApiKey, badVersionInfo);
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(400, '\'versionInfo[0].target.version\' must be valid semver notation.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('\'versionInfo[0].target.version\' must be valid semver notation.');
    }
  });

  it('returns a CustError with a descriptive error message if versionInfo sdkVersion is not in semver notation', async () => {
    const badVersionInfo: VersionInfo[] = [{ target: { version: '1.0.0' }, sdkVersion: '3.0.x' }];
    try {
      await registerVerifier(url, dummyVerifierApiKey, badVersionInfo);
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(400, '\'versionInfo[0].sdkVersion\' must be valid semver notation.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('\'versionInfo[0].sdkVersion\' must be valid semver notation.');
    }
  });
});

describe('registerVerifier - Failure cases - SaaS Errors', () => {
  const name = 'First Unumid Verifier';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const url = 'https://customer-api.dev-unum.id/presentation';

  it('Response code should be 403 when API Key is not valid', async () => {
    mockMakeNetworkRequest.mockRejectedValueOnce(new CustError(403, 'Forbidden'));

    try {
      await registerVerifier(url, 'abc');
    } catch (e) {
      expect(e.code).toBe(403);
    }
  });
});
