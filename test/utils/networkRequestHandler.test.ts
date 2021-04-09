import express from 'express';
import { CustError } from '../../src';
import { RESTData, JSONObj } from '../../src/types';
import { makeNetworkRequest } from '../../src/utils/networkRequestHelper';
// import { CustError } from '../../src/utils/error';

// import { JSONObj, RESTData } from '../src/types';
// import { initServer, startServer } from '../src/server';
// import { makeNetworkRequest } from '../src/networkRequestHelper';
// import { CustError, customErrFormatter } from '../src/error';

const portNum = '8080';

const mockAPIDefs = (app: express.Application): void => {
  app.get('/api/test', (req: express.Request, res: express.Response) => {
    res.send({ resp: 'Application running at http://localhost:' + portNum });
  });

  app.get('/api/error', (req: express.Request, res: express.Response) => {
    res
      .status(403)
      .send(new CustError(403, 'Internal Server Error'));
  });

  app.use((err: CustError, req: express.Request, res: express.Response, next: any) => {
    customErrFormatter(err, res);
    next(err);
  });
};

describe('Rest type Call - Success Scenario', () => {
  const app, server;

  beforeAll(async () => {
    app = initServer();
    mockAPIDefs(app);
    server = startServer(portNum, app);
  });

  afterAll(() => {
    server.close();
  });

  it('To Check whether server started', () => {
    expect(app).toBeDefined();
  });

  it('Check the rest end point /api/test is responding', async () => {
    const url = 'http://localhost:' + portNum + '/';
    const restData: RESTData = { method: 'GET', baseUrl: url, endPoint: 'api/test' };

    const respObj: JSONObj = await makeNetworkRequest(restData);

    expect(respObj).toBeDefined();
    expect(respObj.body.resp).toBe('Application running at http://localhost:' + portNum);
  });
});

describe('Rest type Call - Failure Scenario', () => {
  const app, server;

  beforeAll(async () => {
    app = initServer();
    mockAPIDefs(app);
    server = startServer(portNum, app);
  });

  afterAll(() => {
    server.close();
  });

  it('Check the rest end point /api/error to get the error response', async () => {
    const url = 'http://localhost:' + portNum + '/';
    const restData: RESTData = { method: 'GET', baseUrl: url, endPoint: 'api/error' };

    await makeNetworkRequest(restData)
      .catch(error => {
        expect(error).toBeDefined();
      });
  });
});
