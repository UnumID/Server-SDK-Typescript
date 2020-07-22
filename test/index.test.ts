import request from 'supertest';
import { app } from '../src/index';

it('Test to check the Verifier application is up and running', async () => {
  const resp = await request(app).get('/');

  expect(resp.statusCode).toBe(200);
});
