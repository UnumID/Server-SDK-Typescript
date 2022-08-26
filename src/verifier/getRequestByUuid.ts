import { PresentationRequestDto } from '@unumid/types';
import { configData } from '../config';
import { RESTData, UnumDto } from '../types';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';
import logger from '../logger';
import { requireAuth } from '../requireAuth';

/**
 * Handler for getting a PresentationRequest from UnumID's saas by its uuid
 * @param authorization
 * @param uuid
 * @returns UnumDto<PresentationRequestDto>
*/
export const getPresentationRequestByUuid = async (
  authorization: string,
  uuid: string
): Promise<UnumDto<PresentationRequestDto>> => {
  try {
    requireAuth(authorization);
    const data: RESTData = {
      method: 'GET',
      baseUrl: configData.SaaSUrl,
      endPoint: `presentationRequest/${uuid}`,
      header: { Authorization: authorization }
    };

    const response = await makeNetworkRequest<PresentationRequestDto>(data);
    // console.log('response', response);
    const authToken = handleAuthTokenHeader(response, authorization);

    return { body: response.body, authToken };
  } catch (e) {
    logger.error(`Error getting request from UnumID SaaS. ${e}`);
    throw e;
  }
};
