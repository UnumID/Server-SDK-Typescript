import { makeNetworkRequest } from '@unumid/library-issuer-verifier-utility';

import { checkCredentialStatus } from '../../src/verifier/checkCredentialStatus';
import { configData } from '../../src/config';
import { makeDummyUnsignedCredential, makeDummyCredential, dummyAuthToken } from './mocks';

jest.mock('@unumid/library-issuer-verifier-utility', () => ({
  ...jest.requireActual('@unumid/library-issuer-verifier-utility'),
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

    await checkCredentialStatus(credential1, authHeader);
    expect(mockMakeNetworkRequest).toBeCalled();

    const receivedArgs = mockMakeNetworkRequest.mock.calls[0][0];
    expect(receivedArgs.baseUrl).toEqual(configData.SaaSUrl);
    expect(receivedArgs.endPoint).toEqual(`credentialStatus/${credential1.id}`);
  });

  it('returns true if the credential status is valid', async () => {
    mockMakeNetworkRequest.mockResolvedValueOnce({ body: { status: 'valid' } });
    const isValid = await checkCredentialStatus(credential1, authHeader);
    expect(isValid.body).toBe(true);
  });

  it('returns false if the credential status is revoked', async () => {
    mockMakeNetworkRequest.mockResolvedValueOnce({ body: { status: 'revoked' } });

    const isValid = await checkCredentialStatus(credential2, authHeader);
    expect(isValid.body).toBe(false);
  });
});
