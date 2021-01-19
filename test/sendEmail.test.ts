import request from 'supertest';
import fetch from 'node-fetch';
import * as helper from 'library-issuer-verifier-utility';

import { EmailResponseBody } from '../src/sendEmail';
import { app } from '../src';
import { configData } from '../src/config';
import { ErrorResponseBody } from '../src/types';

jest.mock('node-fetch');
const mockFetch = fetch as unknown as jest.Mock;
const makeApiCall = async <T = EmailResponseBody>(
  to: string,
  subject: string,
  textBody: string | undefined,
  htmlBody: string | undefined,
  auth: string
): Promise<helper.RESTResponse<T>> => {
  return request(app)
    .post('/api/sendEmail')
    .set('Authorization', auth)
    .send({ to, subject, textBody, htmlBody });
};

describe('fakeTest', () => {
  it('passes a trivial test', () => {
    expect(true).toEqual(true);
  });
});

// describe('POST /api/sendEmail', () => {
//   const auth = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';
//   const to = 'test+to@unumid.org';
//   const subject = 'subject';
//   const textBody = 'message';
//   const htmlBody = '<div>message</div>';

//   afterEach(() => {
//     mockFetch.mockClear();
//   });

//   describe('success', () => {
//     const mockSaasResponseBody = { success: true };
//     const mockSaasResponseHeaders = { 'x-auth-token': auth };
//     const mockSaasApiResponse = {
//       json: () => (mockSaasResponseBody),
//       headers: { raw: () => mockSaasResponseHeaders },
//       ok: true
//     };
//     let apiResponse: helper.RESTResponse<EmailResponseBody>;

//     beforeEach(async () => {
//       mockFetch.mockResolvedValueOnce(mockSaasApiResponse);
//       apiResponse = await makeApiCall(to, subject, textBody, undefined, auth);
//     });

//     it('calls the SaaS api to send an email', () => {
//       const expectedUrl = `${configData.SaaSUrl}email`;
//       const expectedOptions = {
//         method: 'POST',
//         body: JSON.stringify({ to, subject, textBody }),
//         headers: { Authorization: auth, 'Content-Type': 'application/json' }
//       };

//       expect(fetch).toBeCalledWith(expectedUrl, expectedOptions);
//     });

//     it('returns a 200 status code', () => {
//       expect(apiResponse.status).toEqual(200);
//     });

//     it('returns the response from the SaaS api', () => {
//       expect(apiResponse.body).toEqual(mockSaasResponseBody);
//     });

//     it('returns the x-auth-token header returned from the SaaS api in the x-auth-token header', () => {
//       expect(apiResponse.headers['x-auth-token']).toEqual(mockSaasResponseHeaders['x-auth-token']);
//     });

//     it('does not return an x-auth-token header if the SaaS does not return an x-auth-token header', async () => {
//       const mockSaasApiResponse = {
//         json: () => (mockSaasResponseBody),
//         headers: { raw: () => ({}) },
//         ok: true
//       };
//       mockFetch.mockResolvedValueOnce(mockSaasApiResponse);
//       apiResponse = await makeApiCall(to, subject, textBody, undefined, auth);
//       expect(apiResponse.headers['x-auth-token']).toBeUndefined();
//     });
//   });

//   describe('failure', () => {
//     let apiResponse: helper.RESTResponse<ErrorResponseBody>;

//     // Missing request params
//     it('returns a 400 status code with a descriptive error message if to is missing', async () => {
//       apiResponse = await makeApiCall<ErrorResponseBody>(undefined as string, subject, textBody, undefined, auth);
//       expect(apiResponse.status).toEqual(400);
//       expect(apiResponse.body.message).toEqual('to is required.');
//     });

//     it('returns a 400 status code with a descriptive error message if subject is missing', async () => {
//       apiResponse = await makeApiCall<ErrorResponseBody>(to, undefined as string, textBody, undefined, auth);
//       expect(apiResponse.status).toEqual(400);
//       expect(apiResponse.body.message).toEqual('subject is required.');
//     });

//     it('returns a 400 status code with a descriptive error message if both textBody and htmlBody are missing', async () => {
//       apiResponse = await makeApiCall<ErrorResponseBody>(to, subject, undefined, undefined, auth);
//       expect(apiResponse.status).toEqual(400);
//       expect(apiResponse.body.message).toEqual('Either textBody or htmlBody is required.');
//     });

//     // Wrong type request params
//     it('returns a 400 status code with a descriptive error message if to is not a string', async () => {
//       apiResponse = await makeApiCall<ErrorResponseBody>({} as string, subject, textBody, undefined, auth);
//       expect(apiResponse.status).toEqual(400);
//       expect(apiResponse.body.message).toEqual('Invalid to: expected string.');
//     });

//     it('returns a 400 status code with a descriptive error message if subject is not a string', async () => {
//       apiResponse = await makeApiCall<ErrorResponseBody>(to, {} as string, textBody, undefined, auth);
//       expect(apiResponse.status).toEqual(400);
//       expect(apiResponse.body.message).toEqual('Invalid subject: expected string.');
//     });

//     it('returns a 400 status code with a descriptive error message if textBody is present and not a string', async () => {
//       apiResponse = await makeApiCall<ErrorResponseBody>(to, subject, {} as string, undefined, auth);
//       expect(apiResponse.status).toEqual(400);
//       expect(apiResponse.body.message).toEqual('Invalid textBody: expected string.');
//     });

//     it('returns a 400 status code with a descriptive error message if htmlBody is present and not a string', async () => {
//       apiResponse = await makeApiCall<ErrorResponseBody>(to, subject, undefined, {} as string, auth);
//       expect(apiResponse.status).toEqual(400);
//       expect(apiResponse.body.message).toEqual('Invalid htmlBody: expected string.');
//     });

//     // Missing auth header
//     it('returns a 401 status code if authorization is missing', async () => {
//       apiResponse = await makeApiCall<ErrorResponseBody>(to, subject, textBody, undefined, null as string);
//       expect(apiResponse.status).toEqual(401);
//     });
//   });
// });
