import { ExternalChannelMessageInput } from '@unumid/types';

import { configData } from '../config';
import logger from '../logger';
import { requireAuth } from '../requireAuth';
import { UnumDto } from '../types';
import { CustError } from '../utils/error';
import { handleAuthToken, makeNetworkRequest } from '../utils/networkRequestHelper';

export interface SmsResponseBody {
  success: boolean;
}

/**
 * Validates the SmsRequestBody attributes.
 * @param body SmsRequestBody
 */
const validateSmsRequestBody = (body: ExternalChannelMessageInput): void => {
  const { to, deeplink } = body;

  if (!to) {
    throw new CustError(400, 'to is required.');
  }

  if (!deeplink) {
    throw new CustError(400, 'deeplink is required.');
  }

  if (typeof to !== 'string') {
    throw new CustError(400, 'Invalid to: expected string.');
  }

  if (typeof deeplink !== 'string') {
    throw new CustError(400, 'Invalid deeplink: expected string.');
  }

  if (deeplink.split('presentationRequest/').length !== 2) {
    throw new CustError(400, 'Invalid deeplink: expected to end in the format presentationRequest/<uuid>.');
  }
};

/**
 * Handler to send a SMS using UnumID's SaaS.
 * Designed to be used with a deeplink which creates a templated message.
 * @param authorization
 * @param to
 * @param deeplink
 */
export const sendSms = async (authorization: string, to: string, deeplink: string): Promise<UnumDto<undefined>> => {
  try {
    const body = { to, deeplink };

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

    const authToken: string = handleAuthToken(apiResponse);

    const result: UnumDto<undefined> = {
      authToken,
      body: undefined
    };

    return result;
  } catch (e) {
    logger.error(`Error during sendSms to UnumID Saas. ${e}`);
    throw e;
  }
};
