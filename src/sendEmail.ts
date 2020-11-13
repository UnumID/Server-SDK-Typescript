import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { CustError, makeRESTCall } from 'library-issuer-verifier-utility';

import { configData } from './config';
import { requireAuth } from './requireAuth';

interface EmailRequestBody {
  to: string;
  subject: string;
  textBody?: string;
  htmlBody?: string;
}

export interface EmailResponseBody {
  success: boolean;
}

type SendEmailRequest = Request<ParamsDictionary, EmailResponseBody, EmailRequestBody>;
type SendEmailResponse = Response<EmailResponseBody>;

const validateEmailRequestBody = (body: EmailRequestBody): void => {
  const { to, subject, textBody, htmlBody } = body;

  // Todo: validate the emails in teh to, from, and replyTo field.

  if (!to) {
    throw new CustError(400, 'to is required.');
  }

  if (!subject) {
    throw new CustError(400, 'subject is required.');
  }

  if (!textBody && !htmlBody) {
    throw new CustError(400, 'Either textBody or htmlBody is required.');
  }

  if (typeof to !== 'string') {
    throw new CustError(400, 'Invalid to: expected string.');
  }

  if (typeof subject !== 'string') {
    throw new CustError(400, 'Invalid subject: expected string.');
  }

  if (textBody && (typeof textBody !== 'string')) {
    throw new CustError(400, 'Invalid textBody: expected string.');
  }

  if (htmlBody && (typeof htmlBody !== 'string')) {
    throw new CustError(400, 'Invalid htmlBody: expected string.');
  }
};

export const sendEmail = async (req: SendEmailRequest, res: SendEmailResponse, next: NextFunction): Promise<void> => {
  try {
    const { body, headers: { authorization } } = req;

    requireAuth(authorization);
    validateEmailRequestBody(body);

    const data = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'email',
      header: { Authorization: authorization },
      data: body
    };

    const apiResponse = await makeRESTCall<EmailResponseBody>(data);

    const authToken = apiResponse.headers['x-auth-token'];

    if (authToken) {
      res.setHeader('x-auth-token', apiResponse.headers['x-auth-token']);
    }

    res.json(apiResponse.body);
  } catch (e) {
    next(e);
  }
};
