import express from 'express';
import { initServer, CustError, customErrFormatter } from 'library-issuer-verifier-utility';

import { registerVerifier } from './registerVerifier';
import { sendRequest } from './sendRequest';
import { verifyPresentation } from './verifyPresentation';
import logger from './logger';
import { verifyNoPresentation } from './verifyNoPresentation';
import { createVerifierApiKey } from './createVerifierApiKey';
import { sendSms } from './sendSms';
import { sendEmail } from './sendEmail';

const app = initServer();

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { path, body, method, headers } = req;
  logger.info(`${method} ${path}`);
  logger.info(`body: ${JSON.stringify(body)}`);
  logger.info(`headers: ${JSON.stringify(headers)}`);
  next();
});

app.post('/api/register', registerVerifier);
app.post('/api/sendRequest', sendRequest);
app.post('/api/verifyPresentation', verifyPresentation);
app.post('/api/verifyNoPresentation', verifyNoPresentation);
app.post('/api/createVerifierApiKey', createVerifierApiKey);
app.post('/api/sendSms', sendSms);
app.post('/api/sendEmail', sendEmail);

app.use((err: CustError, req: express.Request, res: express.Response, next: express.NextFunction) => {
  customErrFormatter(err, res);
  logger.warn(err);
  next(err);
});

export { app };
