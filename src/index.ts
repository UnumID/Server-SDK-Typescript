import express from 'express';
import { initServer, CustError, customErrFormatter } from 'library-issuer-verifier-utility';

import { registerVerifier } from './registerVerifier';
import { sendRequest } from './sendRequest';

const app = initServer();

app.post('/api/register', registerVerifier);
app.post('/api/sendRequest', sendRequest);

app.use((err: CustError, req: express.Request, res: express.Response, next: any) => {
  customErrFormatter(err, res);
  next(err);
});

export { app };
