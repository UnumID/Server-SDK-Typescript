import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { CustError, makeNetworkRequest } from 'library-issuer-verifier-utility';

import { configData } from './config';
import logger from './logger';
import { requireAuth } from './requireAuth';
import { AuthDto } from './types';

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

/**
 * Validates the EmailRequestBody attributes.
 * @param body EmailRequestBody
 */
const validateEmailRequestBodyRequest = (body: EmailRequestBody): void => {
  const { to, subject, textBody, htmlBody } = body;

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

/**
 * Request middleware to send an email using UnumID's SaaS.
 *
 * Note: the email with have a from attribute: no-reply@unumid.org
 * If you would like to have your own domain you will need to handle this email functionality independently.
 * @param req SendEmailRequest
 * @param res SendEmailResponse
 * @param next NextFunction
 */
export const sendEmailRequest = async (req: SendEmailRequest, res: SendEmailResponse, next: NextFunction): Promise<void> => {
  try {
    const { body, headers: { authorization } } = req;

    requireAuth(authorization);
    validateEmailRequestBodyRequest(body);

    const data = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'email',
      header: { Authorization: authorization },
      data: body
    };

    const apiResponse = await makeNetworkRequest<EmailResponseBody>(data);

    const authToken = apiResponse.headers['x-auth-token'];

    if (authToken) {
      res.setHeader('x-auth-token', apiResponse.headers['x-auth-token']);
    }

    res.json(apiResponse.body);
  } catch (e) {
    next(e);
  }
};

/**
 * Validates the EmailRequestBody attributes.
 * @param body EmailRequestBody
 */
const validateEmailRequestBody = (to: string, subject: string, textBody: string, htmlBody: string): void => {
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

/**
 * Handler to send an email using UnumID's SaaS.
 * @param authorization
 * @param to
 * @param subject
 * @param textBody
 * @param htmlBody
 */
export const sendEmail = async (authorization: string, to: string, subject: string, textBody: string, htmlBody: string): Promise<AuthDto> => {
  try {
    requireAuth(authorization);
    validateEmailRequestBody(to, subject, textBody, htmlBody);

    const data = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'email',
      header: { Authorization: authorization },
      data: { to, subject, textBody, htmlBody }
    };

    const apiResponse = await makeNetworkRequest<EmailResponseBody>(data);

    const authToken = apiResponse.headers['x-auth-token'];
    const result: AuthDto = {
      authToken: authToken
    };

    return result;
  } catch (e) {
    logger.error(`Error sendingEmail through UnumID's saas. Error: ${e}`);
    throw e;
  }
};
