import express from 'express';
import { initServer, startServer, CustError, customErrFormatter } from 'library-issuer-verifier-utility';

import { configData } from './config';
import { registerVerifier } from './registerVerifier';

const app = initServer();

app.post('/api/register', registerVerifier);
app.use((err: CustError, req: express.Request, res: express.Response, next: any) => {
  customErrFormatter(err, res);
  next(err);
});

startServer(configData.port, app);

export { app };
