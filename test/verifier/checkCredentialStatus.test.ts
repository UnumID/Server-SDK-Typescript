import { makeNetworkRequest } from '../../src/utils/networkRequestHelper';

import { checkCredentialStatus } from '../../src/verifier/checkCredentialStatus';
import { configData } from '../../src/config';
import { makeDummyUnsignedCredential, makeDummyCredential, dummyAuthToken } from './mocks';

jest.mock('../../src/utils/networkRequestHelper', () => ({
  ...jest.requireActual('../../src/utils/networkRequestHelper'),
  makeNetworkRequest: jest.fn()
}));

const mockMakeNetworkRequest = makeNetworkRequest as jest.Mock;

describe('checkCredentialStatus', () => {
  let credential1;
  let credential2;
  const authHeader = `Bearer ${dummyAuthToken}`;

  beforeAll(async () => {
    const unsignedCredential1 = makeDummyUnsignedCredential();
    const unsignedCredential2 = makeDummyUnsignedCredential();
    credential1 = await makeDummyCredential({ unsignedCredential: unsignedCredential1 });
    credential2 = await makeDummyCredential({ unsignedCredential: unsignedCredential2 });
  });

  afterEach(() => {
    mockMakeNetworkRequest.mockClear();
  });

  it('calls the SaaS api to check the credential\'s status', async () => {
    mockMakeNetworkRequest.mockResolvedValueOnce({ body: { status: 'valid' } });

    await checkCredentialStatus(authHeader, credential1.id);
    expect(mockMakeNetworkRequest).toBeCalled();

    const receivedArgs = mockMakeNetworkRequest.mock.calls[0][0];
    expect(receivedArgs.baseUrl).toEqual(configData.SaaSUrl);
    expect(receivedArgs.endPoint).toEqual(`credentialStatus/${credential1.id}`);
  });

  it('returns true if the credential status is valid', async () => {
    mockMakeNetworkRequest.mockResolvedValueOnce({ body: { status: 'valid' } });
    const credentialStatusInfo = await checkCredentialStatus(authHeader, credential1.id);
    expect(credentialStatusInfo.body.status === 'valid').toBe(true);
  });

  it('returns false if the credential status is revoked', async () => {
    mockMakeNetworkRequest.mockResolvedValueOnce({ body: { status: 'revoked' } });

    const credentialStatusInfo = await checkCredentialStatus(authHeader, credential2.id);
    expect(credentialStatusInfo.body.status === 'valid').toBe(false);
  });
});
