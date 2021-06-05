import { PresentationRequestDto, VersionedPresentationRequestDto } from '@unumid/types';
import { configData } from '../config';
import logger from '../logger';
import { requireAuth } from '../requireAuth';
import { RESTData, UnumDto } from '../types';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';

export const getVersionedRequest = async (
  authorization: string,
  id: string
): Promise<UnumDto<VersionedPresentationRequestDto>> => {
  try {
    requireAuth(authorization);
    const data: RESTData = {
      method: 'GET',
      baseUrl: configData.SaaSUrl,
      endPoint: `presentationRequestRepository/${id}`,
      header: { Authorization: authorization }
    };

    const response = await makeNetworkRequest<VersionedPresentationRequestDto>(data);
    const authToken = handleAuthTokenHeader(response, authorization);

    return { body: response.body, authToken };
  } catch (e) {
    logger.error(`Error getting request(s) from UnumID SaaS. ${e}`);
    throw e;
  }
};
