import { CustError, handleAuthToken, isArrayEmpty, isArrayNotEmpty, makeNetworkRequest } from 'library-issuer-verifier-utility';

import { configData } from './config';
import logger from './logger';
import { requireAuth } from './requireAuth';
import { VerifierDto } from './types';

interface EmailRequestBody {
  to: string;
  subject: string;
  textBody?: string;
  htmlBody?: string;
}

export interface EmailResponseBody {
  success: boolean;
}

/**
 * Validates the EmailRequestBody attributes.
 * @param body EmailRequestBody
 */
const validateEmailRequestBody = (body: EmailRequestBody): void => {
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
 * Handler to send an email using UnumID's SaaS.
 * @param authorization
 * @param to
 * @param subject
 * @param textBody
 * @param htmlBody
 */
export const sendEmail = async (authorization: string, to: string, subject: string, textBody: string, htmlBody: string): Promise<VerifierDto<undefined>> => {
  try {
    requireAuth(authorization);

    const body: EmailRequestBody = { to, subject, textBody, htmlBody };
    validateEmailRequestBody(body);

    const data = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'email',
      header: { Authorization: authorization },
      data: body
    };

    // const apiResponse = await makeNetworkRequest<EmailResponseBody>(data);
    const apiResponse = await makeNetworkRequest<EmailResponseBody>(data);

    const authToken: string = handleAuthToken(apiResponse);

    const result: VerifierDto<undefined> = {
      // authToken: isArrayEmpty(authToken) ? undefined : authToken[0],
      // authToken: isArrayEmpty(authTokenResp) && authTokenResp ? authTokenResp : (isArrayNotEmpty(authTokenResp) ? authTokenResp[0] : undefined),
      authToken,
      body: undefined
    };

    return result;
  } catch (e) {
    logger.error(`Error sendingEmail through UnumID's saas. Error: ${e}`);
    throw e;
  }
};
