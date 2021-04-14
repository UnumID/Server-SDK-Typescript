import { MessageInput } from '@unumid/types';
import { configData } from '../config';
import logger from '../logger';
import { requireAuth } from '../requireAuth';
import { UnumDto } from '../types';
import { CustError } from '../utils/error';
import { handleAuthToken, makeNetworkRequest } from '../utils/networkRequestHelper';

// interface EmailRequestBody {
//   to: string;
//   subject: string;
//   textBody?: string;
//   htmlBody?: string;
// }

export interface EmailResponseBody {
  success: boolean;
}

/**
 * Validates the EmailRequestBody attributes.
 * @param body EmailRequestBody
 */
const validateEmailRequestBody = (body: MessageInput): void => {
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
 * Handler to send an email using UnumID's SaaS.
 * Designed to be used with a deeplink which creates a templated message.
 * @param authorization
 * @param to
 * @param deeplink
 */
export const sendEmail = async (authorization: string, to: string, deeplink: string): Promise<UnumDto<undefined>> => {
  try {
    requireAuth(authorization);

    const body: MessageInput = { to, deeplink };
    validateEmailRequestBody(body);

    const data = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'email',
      header: { Authorization: authorization },
      data: body
    };

    const apiResponse = await makeNetworkRequest<EmailResponseBody>(data);

    const authToken: string = handleAuthToken(apiResponse);

    const result: UnumDto<undefined> = {
      authToken,
      body: undefined
    };

    return result;
  } catch (e) {
    logger.error(`Error sendingEmail through UnumID's saas. ${e}`);
    throw e;
  }
};
