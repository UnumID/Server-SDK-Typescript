import { dummyAuthToken, dummyAdminKey } from './mocks';
import { UnumDto } from '../../src/types';
import { updateCredentialStatuses } from '../../src/issuer/updateCredentialStatuses';
import { makeNetworkRequest } from '../../src/utils/networkRequestHelper';
import { CustError } from '../../src/utils/error';

jest.mock('../../src/utils/networkRequestHelper', () => {
  const actual = jest.requireActual('../../src/utils/networkRequestHelper');
  return {
    ...actual,
    makeNetworkRequest: jest.fn()
  };
});

const mockMakeNetworkRequest = makeNetworkRequest as jest.Mock;

describe('updateCredentialStatuses', () => {
  let response: UnumDto, responseAuthToken: string;
  const credentialIds = ['0eeb8ea2-e02c-492f-8846-aaea12fb0187'];
  const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiaXNzdWVyIiwidXVpZCI6IjU5MDMyMmRiLTJlMDgtNGZjNi1iZTY2LTQ3NGRmMWY3Nzk4YSIsImRpZCI6ImRpZDp1bnVtOmRhOGYyNDJkLTZjZDYtNGUzMC1iNTU3LTNhMzkzZWFkZmMyYyIsImV4cCI6MTU5Njc2NzAzNi45NjQsImlhdCI6MTU5NzE0MzAxNn0.9AwobcQ3a9u4gMCc9b1BtN8VRoiglCJKGtkqB425Zyo';

  beforeEach(async () => {
    const headers = { 'x-auth-token': dummyAuthToken };
    mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers });
    response = await updateCredentialStatuses(authHeader, credentialIds);
    responseAuthToken = response.authToken;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls the saas to revoke the credential', async () => {
    expect(mockMakeNetworkRequest).toBeCalled();
  });

  it('returns the auth token', () => {
    expect(responseAuthToken).toEqual(dummyAuthToken);
  });

  it('does not return an auth token if the SaaS does not return an auth token', async () => {
    mockMakeNetworkRequest.mockResolvedValueOnce({ body: { success: true } });
    response = await updateCredentialStatuses(dummyAdminKey, credentialIds);
    responseAuthToken = response.authToken;
    expect(responseAuthToken).toBeUndefined();
  });
});

describe('updateCredentialStatus - Failure cases', () => {
  const credentialIds = ['0eeb8ea2-e02c-492f-8846-aaea12fb0187'];
  const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiaXNzdWVyIiwidXVpZCI6IjU5MDMyMmRiLTJlMDgtNGZjNi1iZTY2LTQ3NGRmMWY3Nzk4YSIsImRpZCI6ImRpZDp1bnVtOmRhOGYyNDJkLTZjZDYtNGUzMC1iNTU3LTNhMzkzZWFkZmMyYyIsImV4cCI6MTU5Njc2NzAzNi45NjQsImlhdCI6MTU5NzE0MzAxNn0.9AwobcQ3a9u4gMCc9b1BtN8VRoiglCJKGtkqB425Zyo';

  it('returns a CustError with a descriptive error message if the credentialId is missing', async () => {
    try {
      await updateCredentialStatuses(authHeader, '');
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(400, 'none empty credentialIds are required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('credentialId is required.');
    }
  });

  it('returns a CustError with a descriptive error message if the Authorization string is missing', async () => {
    try {
      await updateCredentialStatuses('', credentialIds);
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(401, 'No authentication string. Not authenticated.'));
      expect(e.code).toEqual(401);
      expect(e.message).toEqual('No authentication string. Not authenticated.');
    }
  });

  it('returns a CustError with a descriptive error message if the status is not a valid CredentialStatusOptions string literal', async () => {
    try {
      await updateCredentialStatuses(authHeader, credentialIds, 'fake');
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(400, 'status does not match a valid CredentialStatusOptions string literal.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('status does not match a valid CredentialStatusOptions string literal.');
    }
  });
});
