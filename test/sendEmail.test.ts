import fetch from 'node-fetch';

import { sendEmail } from '../src/sendEmail';
import { configData } from '../src/config';
import { ErrorResponseBody, VerifierDto } from '../src/types';
import * as utilLib from 'library-issuer-verifier-utility';

jest.mock('node-fetch');
const mockFetch = fetch as unknown as jest.Mock;
const makeApiCall = async <T = undefined>(
  to: string,
  subject: string,
  textBody: string | undefined,
  htmlBody: string | undefined,
  auth: string
): Promise<VerifierDto<T>> => {
  return sendEmail(auth, to, subject, textBody, htmlBody);
};

describe('sendEmail', () => {
  const auth = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';
  const to = 'test+to@unumid.org';
  const subject = 'subject';
  const textBody = 'message';
  const htmlBody = '<div>message</div>';

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
    let apiResponse: VerifierDto, apiResponseAuthToken: string;

    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce(mockSaasApiResponse);
      apiResponse = await makeApiCall(to, subject, textBody, undefined, auth);
      apiResponseAuthToken = apiResponse.authToken;
    });

    it('calls the SaaS api to send an email', () => {
      const expectedUrl = `${configData.SaaSUrl}email`;
      const expectedOptions = {
        method: 'POST',
        body: JSON.stringify({ to, subject, textBody }),
        headers: { Authorization: auth, 'Content-Type': 'application/json' }
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
      apiResponse = await makeApiCall(to, subject, textBody, undefined, auth);
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
      apiResponse = await makeApiCall(to, subject, textBody, undefined, auth);
      apiResponseAuthToken = apiResponse.authToken;
      expect(apiResponseAuthToken).toBe(undefined);
    });
  });

  describe('sendEmail failure', () => {
    // Missing request params
    it('returns a CustError with a descriptive error message if to is missing', async () => {
      try {
        await makeApiCall<ErrorResponseBody>('', subject, textBody, undefined, auth);
        fail();
      } catch (e) {
        expect(e).toEqual(new utilLib.CustError(400, 'to is required.'));
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('to is required.');
      }
    });

    it('returns a CustError with a descriptive error message if subject is missing', async () => {
      try {
        await makeApiCall<ErrorResponseBody>(to, '', textBody, undefined, auth);
        fail();
      } catch (e) {
        expect(e).toEqual(new utilLib.CustError(400, 'subject is required.'));
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('subject is required.');
      }
    });

    it('returns a CustError with a descriptive error message if both textBody and htmlBody are missing', async () => {
      try {
        await makeApiCall<ErrorResponseBody>(to, subject, undefined, undefined, auth);
        fail();
      } catch (e) {
        expect(e).toEqual(new utilLib.CustError(400, 'Either textBody or htmlBody is required.'));
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Either textBody or htmlBody is required.');
      }
    });

    // Wrong type request params
    it('returns a CustError with a descriptive error message if to is not a string', async () => {
      try {
        await makeApiCall<ErrorResponseBody>({} as string, subject, textBody, undefined, auth);
        fail();
      } catch (e) {
        expect(e).toEqual(new utilLib.CustError(400, 'Invalid to: expected string.'));
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Invalid to: expected string.');
      }
    });

    it('returns a CustError with a descriptive error message if subject is not a string', async () => {
      try {
        await makeApiCall<ErrorResponseBody>(to, {} as string, textBody, undefined, auth);
        fail();
      } catch (e) {
        expect(e).toEqual(new utilLib.CustError(400, 'Invalid subject: expected string.'));
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Invalid subject: expected string.');
      }
    });

    it('returns a CustError with a descriptive error message if textBody is present and not a string', async () => {
      try {
        await makeApiCall<ErrorResponseBody>(to, subject, {} as string, undefined, auth);
        fail();
      } catch (e) {
        expect(e).toEqual(new utilLib.CustError(400, 'Invalid textBody: expected string.'));
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Invalid textBody: expected string.');
      }
    });

    it('returns a CustError with a descriptive error message if htmlBody is present and not a string', async () => {
      try {
        await makeApiCall<ErrorResponseBody>(to, subject, undefined, {} as string, auth);
        fail();
      } catch (e) {
        expect(e).toEqual(new utilLib.CustError(400, 'Invalid htmlBody: expected string.'));
        expect(e.code).toEqual(400);
        expect(e.message).toEqual('Invalid htmlBody: expected string.');
      }
    });

    // Missing auth header
    it('returns a CustError with a descriptive error message if authorization is missing', async () => {
      try {
        await makeApiCall<ErrorResponseBody>(to, subject, textBody, undefined, null as string);
        fail();
      } catch (e) {
        expect(e).toEqual(new utilLib.CustError(401, 'No authentication string. Not authenticated.'));
        expect(e.code).toEqual(401);
        expect(e.message).toEqual('No authentication string. Not authenticated.');
      }
    });
  });
});
