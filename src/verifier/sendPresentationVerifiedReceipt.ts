import { JSONObj } from '@unumid/types';
import { configData } from '../config';
import logger from '../logger';
import { RESTData } from '../types';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';

/**
 * Helper to send a PresentationVerified Receipt to the Unum ID SaaS
 * @param authorization
 * @param verifier
 * @param subject
 * @param reply
 * @param isVerified
 * @param reason
 * @param issuers
 * @param credentialTypes
 * @returns
 */
export async function sendPresentationVerifiedReceipt (authorization: string, verifier: string, subject: string, reply: string, isVerified: boolean, reason?: string, issuers: string[] = [], credentialTypes: string[] = []): Promise<string> {
  const receiptOptions = {
    type: 'PresentationVerified',
    verifier,
    subject,
    data: {
      reply,
      isVerified,
      reason,
      credentialTypes,
      issuers
    }
  };

  const receiptCallOptions: RESTData = {
    method: 'POST',
    baseUrl: configData.SaaSUrl,
    endPoint: 'receipt',
    header: { Authorization: authorization },
    data: receiptOptions
  };

  try {
    const resp: JSONObj = await makeNetworkRequest<JSONObj>(receiptCallOptions);

    const authToken = handleAuthTokenHeader(resp, authorization);

    return authToken;
  } catch (e) {
    logger.error(`Error sending PresentationVerified Receipt to Unum ID SaaS. Error ${e}`);
  }

  return authorization;
}
