import { RegisteredIssuer, UnumDto } from '../../src/types';
import { makeDummyIssuerResponse, dummyIssuerApiKey, makeDummyIssuer, dummyAuthToken } from './mocks';
import { registerIssuer } from '../../src/issuer/registerIssuer';
import { CustError } from '../../src/utils/error';
import * as createKeyPairs from '../../src/utils/createKeyPairs';
import { makeNetworkRequest } from '../../src/utils/networkRequestHelper';
import { JSONObj, VersionInfo } from '@unumid/types';

jest.mock('../../src/utils/networkRequestHelper', () => ({
  ...jest.requireActual('../../src/utils/networkRequestHelper'),
  makeNetworkRequest: jest.fn()
}));

const createKeyPairSetSpy = jest.spyOn(createKeyPairs, 'createKeyPairSet');

const mockMakeNetworkRequest = makeNetworkRequest as jest.Mock;

describe('registerIssuer', () => {
  let response: RegisteredIssuer, responseAuthToken: string, responseDto: UnumDto<RegisteredIssuer>;
  const name = 'First Unumid Issuer';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';

  beforeEach(async () => {
    const dummyIssuer = makeDummyIssuer({ name, customerUuid });
    const dummyIssuerResponse = makeDummyIssuerResponse({ issuer: dummyIssuer }); // Already has the auth header as part of the dummy function call.
    mockMakeNetworkRequest.mockResolvedValueOnce(dummyIssuerResponse);

    responseDto = await registerIssuer(name, dummyIssuerApiKey);
    response = responseDto.body;
    responseAuthToken = responseDto.authToken;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates keypairs', () => {
    expect(createKeyPairSetSpy).toBeCalled();
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
  let newIssuer: JSONObj;
  let reqBody: JSONObj;
  const name = 'First Unumid Issuer';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const url = 'dummy.com';

  it('returns a CustError with a descriptive error message if apiKey is missing', async () => {
    try {
      await registerIssuer('', url);
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(401, 'Not authenticated: apiKey is required'));
      expect(e.code).toEqual(401);
      expect(e.message).toEqual('Not authenticated: apiKey is required');
    }
  });

  it('returns a CustError with a descriptive error message if url is missing', async () => {
    try {
      await registerIssuer(dummyIssuerApiKey, undefined);
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(400, 'Invalid Issuer: url is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Invalid Issuer: url is required.');
    }
  });

  it('returns a CustError with a descriptive error message if versionInfo target is missing', async () => {
    // const badVersionInfo: VersionInfo[] = [{ target: { version: '1.0.x' }, sdkVersion: '3.0.0' }];
    const badVersionInfo: VersionInfo[] = [{ sdkVersion: '3.0.0' }];
    try {
      await registerIssuer(dummyIssuerApiKey, url, badVersionInfo);
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
      await registerIssuer(dummyIssuerApiKey, url, badVersionInfo);
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
      await registerIssuer(dummyIssuerApiKey, url, badVersionInfo);
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
      await registerIssuer(dummyIssuerApiKey, url, badVersionInfo);
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(400, '\'versionInfo[0].sdkVersion\' must be valid semver notation.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('\'versionInfo[0].sdkVersion\' must be valid semver notation.');
    }
  });
});

describe('registerIssuer - Failure cases - SaaS Errors', () => {
  const name = 'First Unumid Issuer';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const url = 'dummy.com';

  it('Response code should be 403 when API Key is not valid', async () => {
    mockMakeNetworkRequest.mockRejectedValueOnce(new CustError(403, 'Forbidden'));

    try {
      await registerIssuer('abc', url);
    } catch (e) {
      expect(e.code).toBe(403);
    }
  });
});
