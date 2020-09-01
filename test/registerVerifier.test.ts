import request from 'supertest';

import * as hlpr from 'library-issuer-verifier-utility';
import { app } from '../src/index';

const callRegIssApi = (name: string, customerUuid: string, apiKey: string): Promise<hlpr.JSONObj> => {
  return (request(app)
    .post('/api/register')
    .send({
      name,
      customerUuid,
      apiKey
    })
  );
};

describe('POST /api/register Verifier', () => {
  let createTokenSpy, restCallSpy, newVerifier: hlpr.JSONObj, reqBody: hlpr.JSONObj;
  const name = 'First Unumid Verifier';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const apiKey = '/7uLH4LB+etgKb5LUR5vm2cebS49EmPwxmBoS/TpfXM=';

  beforeEach(async () => {
    createTokenSpy = jest.spyOn(hlpr, 'createToken', 'get');
    restCallSpy = jest.spyOn(hlpr, 'makeRESTCall', 'get');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Generates ECC Key pairs', async () => {
    newVerifier = await callRegIssApi(name, customerUuid, apiKey);
    reqBody = newVerifier.body;

    expect(createTokenSpy).toBeCalled();
    expect(restCallSpy).toBeCalled();
  });

  it('Response status code should be 200', () => {
    expect(newVerifier.statusCode).toBe(200);
  });

  it('Response should have keys object', () => {
    expect(reqBody.keys).toBeDefined();
  });

  it('It responds with keys and other details needed for registering the Verifier', async () => {
    // make sure we add it correctly
    expect(reqBody).toHaveProperty('uuid');
    expect(reqBody).toHaveProperty('did');
    expect(reqBody.name).toBe('First Unumid Verifier');
    expect(reqBody.customerUuid).toBe('5e46f1ba-4c82-471d-bbc7-251924a90532');
    expect(reqBody.keys.privateKey).toBeDefined();
    expect(reqBody.keys.publicKey).toBeDefined();
  });
});

describe('POST /api/register Verifier - Failure cases', () => {
  let newVerifier: hlpr.JSONObj, reqBody: hlpr.JSONObj;
  const name = 'First Unumid Verifier';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const apiKey = '/7uLH4LB+etgKb5LUR5vm2cebS49EmPwxmBoS/TpfXM=';
  const stCode = 404;
  const errMsg = 'Missing required name, customerUuid, and/or apiKey fields';

  it('Response code should be ' + stCode + ' when name is not passed', async () => {
    newVerifier = await callRegIssApi('', customerUuid, apiKey);
    reqBody = newVerifier.body;

    expect(newVerifier.statusCode).toBe(stCode);
    expect(reqBody.message).toBe(errMsg);
  });

  it('Response code should be ' + stCode + ' when customerUuid is not passed', async () => {
    newVerifier = await callRegIssApi(name, '', apiKey);
    reqBody = newVerifier.body;

    expect(newVerifier.statusCode).toBe(stCode);
    expect(reqBody.message).toBe(errMsg);
  });

  it('Response code should be ' + stCode + ' when apiKey is not passed', async () => {
    newVerifier = await callRegIssApi(name, customerUuid, '');
    reqBody = newVerifier.body;

    expect(newVerifier.statusCode).toBe(stCode);
    expect(reqBody.message).toBe(errMsg);
  });
});

describe('POST /api/register Verifier - Failure cases - SaaS Errors', () => {
  let newVerifier: hlpr.JSONObj;
  const name = 'First Unumid Verifier';
  const customerUuid = '5e46f1ba-4c82-471d-bbc7-251924a90532';
  const apiKey = '/7uLH4LB+etgKb5LUR5vm2cebS49EmPwxmBoS/TpfXM=';
  const stCode = 403;

  it('Response code should be ' + stCode + ' when uuId is not valid', async () => {
    newVerifier = await callRegIssApi(name, '123', apiKey);

    expect(newVerifier.statusCode).toBe(stCode);
  });

  it('Response code should be ' + stCode + ' when API Key is not valid', async () => {
    newVerifier = await callRegIssApi(name, customerUuid, 'abc');

    expect(newVerifier.statusCode).toBe(stCode);
  });
});
