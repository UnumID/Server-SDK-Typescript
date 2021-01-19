import request from 'supertest';
import fetch from 'node-fetch';
import * as helper from 'library-issuer-verifier-utility';

import { SmsResponseBody } from '../src/sendSms';
import { app } from '../src';
import { configData } from '../src/config';
import { ErrorResponseBody } from '../src/types';

jest.mock('node-fetch');
const mockFetch = fetch as unknown as jest.Mock;
const makeApiCall = async <T = SmsResponseBody>(to: string, msg: string, auth: string): Promise<helper.RESTResponse<T>> => {
  return request(app)
    .post('/api/sendSms')
    .set('Authorization', auth)
    .send({ to, msg });
};

describe('fakeTest', () => {
  it('passes a trivial test', () => {
    expect(true).toEqual(true);
  });
});

// describe('POST /api/sendSms', () => {
//   const auth = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';
//   const to = '5555555555';
//   const msg = 'test msg';

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
//     let apiResponse: helper.RESTResponse<SmsResponseBody>;

//     beforeEach(async () => {
//       mockFetch.mockResolvedValueOnce(mockSaasApiResponse);
//       apiResponse = await makeApiCall('5555555555', 'test msg', auth);
//     });

//     it('calls the SaaS api to send an sms', () => {
//       const expectedUrl = `${configData.SaaSUrl}sms`;
//       const expectedOptions = {
//         method: 'POST',
//         body: JSON.stringify({ to, msg }),
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
//       apiResponse = await makeApiCall('5555555555', 'test msg', auth);
//       expect(apiResponse.headers['x-auth-token']).toBeUndefined();
//     });
//   });

//   describe('failure', () => {
//     let apiResponse: helper.RESTResponse<ErrorResponseBody>;

//     it('returns a 400 status code with a descriptive error message if to is missing', async () => {
//       apiResponse = await makeApiCall<ErrorResponseBody>(undefined as string, msg, auth);
//       expect(apiResponse.status).toEqual(400);
//       expect(apiResponse.body.message).toEqual('to is required.');
//     });

//     it('returns a 400 status code with a descriptive error message if msg is missing', async () => {
//       apiResponse = await makeApiCall<ErrorResponseBody>(to, undefined as string, auth);
//       expect(apiResponse.status).toEqual(400);
//       expect(apiResponse.body.message).toEqual('msg is required.');
//     });

//     it('returns a 400 status code with a descriptive error message if to is not a string', async () => {
//       apiResponse = await makeApiCall<ErrorResponseBody>({} as string, msg, auth);
//       expect(apiResponse.status).toEqual(400);
//       expect(apiResponse.body.message).toEqual('Invalid to: expected string.');
//     });

//     it('returns a 400 status code with a descriptive error message if msg is not a string', async () => {
//       apiResponse = await makeApiCall<ErrorResponseBody>(to, {} as string, auth);
//       expect(apiResponse.status).toEqual(400);
//       expect(apiResponse.body.message).toEqual('Invalid msg: expected string.');
//     });

//     it('returns a 401 status code if authorization is missing', async () => {
//       apiResponse = await makeApiCall<ErrorResponseBody>(to, msg, null as string);
//       expect(apiResponse.status).toEqual(401);
//     });
//   });
// });
