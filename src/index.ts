import express from 'express';
import { initServer, CustError, customErrFormatter } from 'library-issuer-verifier-utility';

import { registerVerifier } from './registerVerifier';
import { sendRequest } from './sendRequest';
import { verifyPresentation } from './verifyPresentation';
import { verifyNoPresentation } from './verifyNoPresentation';

const app = initServer();

app.post('/api/register', registerVerifier);
app.post('/api/sendRequest', sendRequest);
app.post('/api/verifyPresentation', verifyPresentation);
app.post('/api/verifyNoPresentation', verifyNoPresentation);

app.use((err: CustError, req: express.Request, res: express.Response, next: express.NextFunction) => {
  customErrFormatter(err, res);
  next(err);
});

export { app };
