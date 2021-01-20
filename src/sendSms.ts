import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { CustError, isArrayEmpty, isArrayNotEmpty, makeNetworkRequest } from 'library-issuer-verifier-utility';

import { configData } from './config';
import logger from './logger';
import { requireAuth } from './requireAuth';
import { UnumDto } from './types';

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
 * Handler to send a SMS using UnumID's SaaS.
 * Designed to be used to present a deeplink.
 *
 * @param authorization
 * @param to
 * @param msg
 */
export const sendSms = async (authorization: string, to: string, msg: string): Promise<UnumDto<undefined>> => {
  try {
    const body = { to, msg };

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

    if (!apiResponse.body.success) {
      throw new CustError(500, 'Unknown error during sendSms');
    }

    const authTokenResp = apiResponse.headers && apiResponse.headers['x-auth-token'] ? apiResponse.headers['x-auth-token'] : '';

    // Ensuring that the authToken attribute is presented as a string or undefined. The header values can be a string | string[] so hence the complex ternary.
    const authToken: string = <string>(isArrayEmpty(authTokenResp) && authTokenResp ? authTokenResp : (isArrayNotEmpty(authTokenResp) ? authTokenResp[0] : undefined));

    const result: UnumDto<undefined> = {
      authToken,
      body: undefined
    };

    return result;
  } catch (e) {
    logger.error(`Error during sendSms to UnumID Saas. Error: ${e}`);
    throw e;
  }
};
