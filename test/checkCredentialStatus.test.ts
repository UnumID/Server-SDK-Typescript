import { makeRESTCall } from 'library-issuer-verifier-utility';

import { checkCredentialStatus } from '../src/checkCredentialStatus';
import { configData } from '../src/config';
import { makeDummyUnsignedCredential, makeDummyCredential, dummyAuthToken } from './mocks';

jest.mock('library-issuer-verifier-utility', () => ({
  ...jest.requireActual('library-issuer-verifier-utility'),
  makeRESTCall: jest.fn()
}));

const mockMakeRESTCall = makeRESTCall as jest.Mock;

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
    mockMakeRESTCall.mockClear();
  });

  it('calls the SaaS api to check the credential\'s status', async () => {
    mockMakeRESTCall.mockResolvedValueOnce({ body: { status: 'valid' } });

    await checkCredentialStatus(credential1, authHeader);
    expect(mockMakeRESTCall).toBeCalled();

    const receivedArgs = mockMakeRESTCall.mock.calls[0][0];
    expect(receivedArgs.baseUrl).toEqual(configData.SaaSUrl);
    expect(receivedArgs.endPoint).toEqual(`credentialStatus/${credential1.id}`);
  });

  it('returns true if the credential status is valid', async () => {
    mockMakeRESTCall.mockResolvedValueOnce({ body: { status: 'valid' } });
    const isValid = await checkCredentialStatus(credential1, authHeader);
    expect(isValid).toBe(true);
  });

  it('returns false if the credential status is revoked', async () => {
    mockMakeRESTCall.mockResolvedValueOnce({ body: { status: 'revoked' } });

    const isValid = await checkCredentialStatus(credential2, authHeader);
    expect(isValid).toBe(false);
  });
});
