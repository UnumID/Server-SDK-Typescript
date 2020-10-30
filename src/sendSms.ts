import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { CustError, makeRESTCall } from 'library-issuer-verifier-utility';

import { configData } from './config';
import { requireAuth } from './requireAuth';

interface SmsRequestBody {
  to: string;
  msg: string;
}

export interface SmsResponseBody {
  success: boolean;
}

type SendSmsRequest = Request<ParamsDictionary, SmsResponseBody, SmsRequestBody>;
type SendSmsResponse = Response<SmsResponseBody>;

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

export const sendSms = async (req: SendSmsRequest, res: SendSmsResponse, next: NextFunction): Promise<void> => {
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

    const apiResponse = await makeRESTCall<SmsResponseBody>(data);

    res.setHeader('x-auth-token', apiResponse.headers['x-auth-token']);
    res.json(apiResponse.body);
  } catch (e) {
    next(e);
  }
};
