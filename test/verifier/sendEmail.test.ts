import fetch from 'node-fetch';

import { sendEmail } from '../../src/verifier/sendEmail';
import { configData } from '../../src/config';
import { ErrorResponseBody, UnumDto } from '../../src/types';
import { CustError } from '../../src/utils/error';
import { dummyAuthToken } from './mocks';
import { versionList } from '../../src/utils/versionList';

jest.mock('node-fetch');
const mockFetch = fetch as unknown as jest.Mock;

const makeApiCall = async <T = undefined>(to: string, deeplink: string, auth: string): Promise<UnumDto<T>> => {
  return sendEmail(auth, to, deeplink);
};

describe('sendEmail', () => {
  const auth = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';
  const to = 'test+to@unumid.org';
  const deeplink = 'acme://unumid/presentationRequest/89a96361-c46c-4657-a04b-ca2c624e0b94';

  afterEach(() => {
    mockFetch.mockClear();
  });

  describe('success', () => {
    const mockSaasResponseBody = { success: true };
    const mockSaasResponseHeaders = { 'x-auth-token': auth };
    const mockSaasApiResponse = {
      json: () => (mockSaasResponseBody),
      headers: { raw: () => mockSaasResponseHeaders },
      ok: true
    };
    let apiResponse: UnumDto, apiResponseAuthToken: string;

    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce(mockSaasApiResponse);
      apiResponse = await makeApiCall(to, deeplink, auth);
      apiResponseAuthToken = apiResponse.authToken;
    });

    it('calls the SaaS api to send an email', () => {
      const expectedUrl = `${configData.SaaSUrl}email`;
      const expectedOptions = {
        method: 'POST',
        body: JSON.stringify({ to, deeplink }),
        headers: { Authorization: auth, 'Content-Type': 'application/json', version: versionList[versionList.length - 1] }
      };

      expect(fetch).toBeCalledWith(expectedUrl, expectedOptions);
    });

    it('returns the auth token', () => {
      expect(apiResponseAuthToken).toEqual(auth);
    });

    it('returns the auth token with an array x-auth-token header', async () => {
      const mockSaasApiResponse = {
        json: () => (mockSaasResponseBody),
        headers: { raw: () => ({ 'x-auth-token': [auth] }) },
        ok: true
      };
      mockFetch.mockResolvedValueOnce(mockSaasApiResponse);
      apiResponse = await makeApiCall(to, deeplink, auth);
      apiResponseAuthToken = apiResponse.authToken;
      expect(apiResponseAuthToken).toEqual(auth);
    });

    it('does not return an auth token if the SaaS does not return an auth token', async () => {
      const mockSaasApiResponse = {
        json: () => (mockSaasResponseBody),
        headers: { raw: () => ({}) },
        ok: true
      };
      mockFetch.mockResolvedValueOnce(mockSaasApiResponse);
      apiResponse = await makeApiCall(to, deeplink, auth);
      apiResponseAuthToken = apiResponse.authToken;
      expect(apiResponseAuthToken).toBe(dummyAuthToken);
    });
  });

  describe('sendEmail failure', () => {
    // Missing request params
    it('returns a CustError with a descriptive error message if to is missing', async () => {
      try {
        await makeApiCall<ErrorResponseBody>('', deeplink, auth);
        fail();
      } catch (e) {
        expect(e).toEqual(new CustError(400, 'to is required.'));
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('to is required.');
      }
    });

    it('returns a CustError with a descriptive error message if deeplink is missing', async () => {
      try {
        await makeApiCall<ErrorResponseBody>(to, '', auth);
        fail();
      } catch (e) {
        expect(e).toEqual(new CustError(400, 'deeplink is required.'));
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('deeplink is required.');
      }
    });

    // Wrong type request params
    it('returns a CustError with a descriptive error message if to is not a string', async () => {
      try {
        await makeApiCall<ErrorResponseBody>({} as string, deeplink, auth);
        fail();
      } catch (e) {
        expect(e).toEqual(new CustError(400, 'Invalid to: expected string.'));
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Invalid to: expected string.');
      }
    });

    it('returns a CustError with a descriptive error message if deeplink is not a string', async () => {
      try {
        await makeApiCall<ErrorResponseBody>(to, {} as string, auth);
        fail();
      } catch (e) {
        expect(e).toEqual(new CustError(400, 'Invalid deeplink: expected string.'));
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Invalid deeplink: expected string.');
      }
    });

    it('returns a CustError with a descriptive error message if deeplink is improper format', async () => {
      try {
        await makeApiCall<ErrorResponseBody>(to, 'deeplink', auth);
        fail();
      } catch (e) {
        expect(e).toEqual(new CustError(400, 'Invalid deeplink: expected to end in the format presentationRequest/<uuid>.'));
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Invalid deeplink: expected to end in the format presentationRequest/<uuid>.');
      }
    });

    // Missing auth header
    it('returns a CustError with a descriptive error message if authorization is missing', async () => {
      try {
        await makeApiCall<ErrorResponseBody>(to, deeplink, null as string);
        fail();
      } catch (e) {
        expect(e).toEqual(new CustError(401, 'No authentication string. Not authenticated.'));
        expect(e.code).toEqual(401);
        expect(e.message).toEqual('No authentication string. Not authenticated.');
      }
    });
  });
});
