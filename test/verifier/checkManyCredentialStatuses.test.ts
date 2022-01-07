import { v4 } from 'uuid';

import { makeNetworkRequest } from '../../src/utils/networkRequestHelper';
import { checkManyCredentialStatuses } from '../../src/verifier/checkManyCredentialStatuses';
import { configData } from '../../src/config';
import { dummyAuthToken, makeDummyCredential, makeDummyUnsignedCredential } from './mocks';

jest.mock('../../src/utils/networkRequestHelper', () => {
  const actual = jest.requireActual('../../src/utils/networkRequestHelper');

  return {
    ...actual,
    makeNetworkRequest: jest.fn()
  };
});

const mockMakeNetworkRequest = makeNetworkRequest as jest.MockedFunction<typeof makeNetworkRequest>;

describe('checkManyCredentialStatuses', () => {
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

  test('success', async () => {
    expect.assertions(2);
    const now = new Date();
    const credentialStatus1 = {
      uuid: v4(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      status: 'valid',
      credentialId: credential1.id
    };

    const credentialStatus2 = {
      uuid: v4(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      status: 'valid',
      credentialId: credential2.id
    };

    mockMakeNetworkRequest.mockResolvedValueOnce({
      body: [credentialStatus1, credentialStatus2],
      headers: { 'x-auth-token': dummyAuthToken }
    });

    const result = await checkManyCredentialStatuses(authHeader, [credential1.id, credential2.id]);

    expect(mockMakeNetworkRequest).toBeCalledWith({
      baseUrl: configData.SaaSUrl,
      endPoint: `credentialStatus?credentialId=${credential1.id}&credentialId=${credential2.id}`,
      method: 'GET',
      header: { Authorization: authHeader }
    });

    expect(result.body).toEqual({
      [credential1.id]: credentialStatus1,
      [credential2.id]: credentialStatus2
    });
  });
});
