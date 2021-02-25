import fetch from 'node-fetch';
import * as utilLib from '@unumid/library-issuer-verifier-utility';

import { sendSms } from '../../src/verifier/sendSms';
import { configData } from '../../src/config';
import { ErrorResponseBody, UnumDto } from '../../src/types';

jest.mock('node-fetch');
const mockFetch = fetch as unknown as jest.Mock;
const makeApiCall = async <T = undefined> (to: string, msg: string, auth: string): Promise<UnumDto<T>> => {
  return sendSms(auth, to, msg);
};

describe('sendSms', () => {
  const auth = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';
  const to = '5555555555';
  const msg = 'test msg';

  afterEach(() => {
    mockFetch.mockClear();
  });

  describe('sendSms success', () => {
    const mockSaasResponseBody = { success: true };
    const mockSaasResponseHeaders = { 'x-auth-token': auth };
    const mockSaasApiResponse = {
      json: () => (mockSaasResponseBody),
      headers: { raw: () => mockSaasResponseHeaders },
      ok: true
    };
    let apiResponse: UnumDto<undefined>, apiResponseAuthToken: string;

    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce(mockSaasApiResponse);
      apiResponse = await makeApiCall('5555555555', 'test msg', auth);
      apiResponseAuthToken = apiResponse.authToken;
    });

    it('calls the SaaS api to send an sms', () => {
      const expectedUrl = `${configData.SaaSUrl}sms`;
      const expectedOptions = {
        method: 'POST',
        body: JSON.stringify({ to, msg }),
        headers: { Authorization: auth, 'Content-Type': 'application/json' }
      };

      expect(fetch).toBeCalledWith(expectedUrl, expectedOptions);
    });

    it('returns the response from the SaaS api', () => {
      const UnumDtoResponse: UnumDto<undefined> = { authToken: auth, body: undefined };
      expect(apiResponse).toEqual(UnumDtoResponse);
    });

    it('returns the x-auth-token header returned from the SaaS api in the x-auth-token header', () => {
      expect(apiResponseAuthToken).toEqual(auth);
    });

    it('returns the auth token with an array x-auth-token header', async () => {
      const mockSaasApiResponse = {
        json: () => (mockSaasResponseBody),
        headers: { raw: () => ({ 'x-auth-token': [auth] }) },
        ok: true
      };
      mockFetch.mockResolvedValueOnce(mockSaasApiResponse);
      apiResponse = await makeApiCall('5555555555', 'test msg', auth);
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
      apiResponse = await makeApiCall('5555555555', 'test msg', auth);
      apiResponseAuthToken = apiResponse.authToken;
      expect(apiResponseAuthToken).toBe(undefined);
    });
  });

  describe('sendSms failure', () => {
    // Missing request params
    it('returns a CustError with a descriptive error message if to is missing', async () => {
      try {
        await makeApiCall<ErrorResponseBody>(undefined as string, msg, auth);
        fail();
      } catch (e) {
        expect(e).toEqual(new utilLib.CustError(400, 'to is required.'));
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('to is required.');
      }
    });

    it('returns a CustError with a descriptive error message if msg is missing', async () => {
      try {
        await makeApiCall<ErrorResponseBody>(to, undefined as string, auth);
        fail();
      } catch (e) {
        expect(e).toEqual(new utilLib.CustError(400, 'msg is required.'));
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('msg is required.');
      }
    });

    // Wrong type request params
    it('returns a CustError with a descriptive error message if to is not a string', async () => {
      try {
        await makeApiCall<ErrorResponseBody>({} as string, msg, auth);
        fail();
      } catch (e) {
        expect(e).toEqual(new utilLib.CustError(400, 'Invalid to: expected string.'));
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Invalid to: expected string.');
      }
    });

    it('returns a CustError with a descriptive error message if msg is not a string', async () => {
      try {
        await makeApiCall<ErrorResponseBody>(to, {} as string, auth);
        fail();
      } catch (e) {
        expect(e).toEqual(new utilLib.CustError(400, 'Invalid msg: expected string.'));
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Invalid msg: expected string.');
      }
    });

    // Missing auth header
    it('returns a CustError with a descriptive error message if authorization is missing', async () => {
      try {
        await makeApiCall<ErrorResponseBody>(to, msg, null as string);
        fail();
      } catch (e) {
        expect(e).toEqual(new utilLib.CustError(401, 'No authentication string. Not authenticated.'));
        expect(e.code).toEqual(401);
        expect(e.message).toEqual('No authentication string. Not authenticated.');
      }
    });
  });
});
