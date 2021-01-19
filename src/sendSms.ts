import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { CustError, makeNetworkRequest } from 'library-issuer-verifier-utility';

import { configData } from './config';
import logger from './logger';
import { requireAuth } from './requireAuth';
import { AuthDto } from './types';

interface SmsRequestBody {
  to: string;
  msg: string;
}

export interface SmsResponseBody {
  success: boolean;
}

type SendSmsRequest = Request<ParamsDictionary, SmsResponseBody, SmsRequestBody>;
type SendSmsResponse = Response<SmsResponseBody>;

/**
 * Validates the SmsRequestBody attributes.
 * @param body SmsRequestBody
 */
const validateSmsRequestBody = (body: SmsRequestBody): void => {
  const { to, msg } = body;

  if (!to) {
    throw new CustError(400, 'to is required.');
  }

  if (!msg) {
    throw new CustError(400, 'msg is required.');
  }

  if (typeof to !== 'string') {
    throw new CustError(400, 'Invalid to: expected string.');
  }

  if (typeof msg !== 'string') {
    throw new CustError(400, 'Invalid msg: expected string.');
  }
};

/**
 * Request middleware to send a SMS using UnumID's SaaS.
 * Designed to be used to present a deeplink.
 *
 * Note: This message will be delivered from an UnumID associated phone number.
 * @param req
 * @param res
 * @param next
 */
export const sendSmsRequest = async (req: SendSmsRequest, res: SendSmsResponse, next: NextFunction): Promise<void> => {
  try {
    const { body, headers: { authorization } } = req;

    requireAuth(authorization);
    validateSmsRequestBody(body);

    const data = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'sms',
      header: { Authorization: authorization },
      data: body
    };

    const apiResponse = await makeNetworkRequest<SmsResponseBody>(data);

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
 * Handler to send a SMS using UnumID's SaaS.
 * Designed to be used to present a deeplink.
 *
 * @param authorization
 * @param to
 * @param msg
 */
export const sendSms = async (authorization: string, to: string, msg: string): Promise<AuthDto> => {
  try {
    const body = { authorization, to, msg };

    requireAuth(authorization);
    validateSmsRequestBody(body);

    const data = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'sms',
      header: { Authorization: authorization },
      data: body
    };

    const apiResponse = await makeNetworkRequest<SmsResponseBody>(data);

    if (!apiResponse.success) {
      throw new CustError(500, 'Unknown error during sendSms');
    }

    const authToken = apiResponse.headers['x-auth-token'];

    const result: AuthDto = { authToken };
    return result;
  } catch (e) {
    logger.error(`Error during sendSms to UnumID Saas. Error: ${e}`);
    throw e;
  }
};
