import request from 'supertest';
import fetch from 'node-fetch';
import * as helper from 'library-issuer-verifier-utility';

import { EmailResponseBody } from '../src/sendEmail';
import { app } from '../src';
import { configData } from '../src/config';
import { ErrorResponseBody } from '../src/types';

jest.mock('node-fetch');
const mockFetch = fetch as unknown as jest.Mock;
const makeApiCall = async <T = EmailResponseBody>(to: string, from: string, replyTo: string, subject: string, textBody: string, auth: string): Promise<helper.RESTResponse<T>> => {
  return request(app)
    .post('/api/sendEmail')
    .set('Authorization', auth)
    .send({ to, from, replyTo, subject, textBody });
};

describe('POST /api/sendEmail', () => {
  const auth = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';
  const to = 'test+to@unumid.org';
  const from = 'test+from@unumid.org';
  const replyTo = 'test+reply@unumid.org';
  const subject = 'subject';
  const textBody = 'message';

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
    let apiResponse: helper.RESTResponse<EmailResponseBody>;

    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce(mockSaasApiResponse);
      apiResponse = await makeApiCall(to, from, replyTo, subject, textBody, auth);
    });

    it('calls the SaaS api to send an email', () => {
      const expectedUrl = `${configData.SaaSUrl}email`;
      const expectedOptions = {
        method: 'POST',
        body: JSON.stringify({ to, from, replyTo, subject, textBody }),
        headers: { Authorization: auth, 'Content-Type': 'application/json' }
      };

      expect(fetch).toBeCalledWith(expectedUrl, expectedOptions);
    });

    it('returns a 200 status code', () => {
      expect(apiResponse.status).toEqual(200);
    });

    it('returns the response from the SaaS api', () => {
      expect(apiResponse.body).toEqual(mockSaasResponseBody);
    });

    it('returns the x-auth-token header returned from the SaaS api in the x-auth-token header', () => {
      expect(apiResponse.headers['x-auth-token']).toEqual(mockSaasResponseHeaders['x-auth-token']);
    });

    it('does not return an x-auth-token header if the SaaS does not return an x-auth-token header', async () => {
      const mockSaasApiResponse = {
        json: () => (mockSaasResponseBody),
        headers: { raw: () => ({}) },
        ok: true
      };
      mockFetch.mockResolvedValueOnce(mockSaasApiResponse);
      apiResponse = await makeApiCall(to, from, replyTo, subject, textBody, auth);
      expect(apiResponse.headers['x-auth-token']).toBeUndefined();
    });
  });

  describe('failure', () => {
    let apiResponse: helper.RESTResponse<ErrorResponseBody>;

    // Missing request params
    it('returns a 400 status code with a descriptive error message if to is missing', async () => {
      apiResponse = await makeApiCall<ErrorResponseBody>(undefined as string, from, replyTo, subject, textBody, auth);
      expect(apiResponse.status).toEqual(400);
      expect(apiResponse.body.message).toEqual('to is required.');
    });

    it('returns a 400 status code with a descriptive error message if from is missing', async () => {
      apiResponse = await makeApiCall<ErrorResponseBody>(to, undefined as string, replyTo, subject, textBody, auth);
      expect(apiResponse.status).toEqual(400);
      expect(apiResponse.body.message).toEqual('from is required.');
    });

    it('returns a 400 status code with a descriptive error message if replyTo is missing', async () => {
      apiResponse = await makeApiCall<ErrorResponseBody>(to, from, undefined as string, subject, textBody, auth);
      expect(apiResponse.status).toEqual(400);
      expect(apiResponse.body.message).toEqual('replyTo is required.');
    });

    it('returns a 400 status code with a descriptive error message if subject is missing', async () => {
      apiResponse = await makeApiCall<ErrorResponseBody>(to, from, replyTo, undefined as string, textBody, auth);
      expect(apiResponse.status).toEqual(400);
      expect(apiResponse.body.message).toEqual('subject is required.');
    });

    it('returns a 400 status code with a descriptive error message if textBody is missing', async () => {
      apiResponse = await makeApiCall<ErrorResponseBody>(to, from, replyTo, subject, undefined as string, auth);
      expect(apiResponse.status).toEqual(400);
      expect(apiResponse.body.message).toEqual('textBody is required.');
    });

    // Wrong type request params
    it('returns a 400 status code with a descriptive error message if to is not a string', async () => {
      apiResponse = await makeApiCall<ErrorResponseBody>({} as string, from, replyTo, subject, textBody, auth);
      expect(apiResponse.status).toEqual(400);
      expect(apiResponse.body.message).toEqual('Invalid to: expected string.');
    });

    it('returns a 400 status code with a descriptive error message if from is not a string', async () => {
      apiResponse = await makeApiCall<ErrorResponseBody>(to, {} as string, replyTo, subject, textBody, auth);
      expect(apiResponse.status).toEqual(400);
      expect(apiResponse.body.message).toEqual('Invalid from: expected string.');
    });

    it('returns a 400 status code with a descriptive error message if replyTo is not a string', async () => {
      apiResponse = await makeApiCall<ErrorResponseBody>(to, from, {} as string, subject, textBody, auth);
      expect(apiResponse.status).toEqual(400);
      expect(apiResponse.body.message).toEqual('Invalid replyTo: expected string.');
    });

    it('returns a 400 status code with a descriptive error message if subject is not a string', async () => {
      apiResponse = await makeApiCall<ErrorResponseBody>(to, from, replyTo, {} as string, textBody, auth);
      expect(apiResponse.status).toEqual(400);
      expect(apiResponse.body.message).toEqual('Invalid subject: expected string.');
    });

    it('returns a 400 status code with a descriptive error message if textBody is not a string', async () => {
      apiResponse = await makeApiCall<ErrorResponseBody>(to, from, replyTo, subject, {} as string, auth);
      expect(apiResponse.status).toEqual(400);
      expect(apiResponse.body.message).toEqual('Invalid textBody: expected string.');
    });

    // Missing auth header
    it('returns a 401 status code if authorization is missing', async () => {
      apiResponse = await makeApiCall<ErrorResponseBody>(to, from, replyTo, subject, textBody, null as string);
      expect(apiResponse.status).toEqual(401);
    });
  });
});
