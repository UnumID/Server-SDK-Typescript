import { JSONObj, PresentationRequestDto, PresentationRequestDtoPb, WithVersion } from '@unumid/types';
import { PresentationRequest } from '@unumid/types/build/protos/presentation';
import { configData } from '../config';
import logger from '../logger';
import { PresentationRequestRepoDto, RESTData, RESTResponse, UnumDto } from '../types';
import { CustError } from '../utils/error';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';

export async function getPresentationRequest (authorization: string, id: string): Promise<RESTResponse<PresentationRequestRepoDto>> {
  const receiptCallOptions: RESTData = {
    method: 'GET',
    baseUrl: configData.SaaSUrl,
    endPoint: `presentationRequestRepository/${id}`,
    header: { Authorization: authorization }
  };

  try {
    const resp = await makeNetworkRequest<PresentationRequestRepoDto>(receiptCallOptions);

    return resp;
  } catch (e) {
    logger.error(`Error getting PresentationRequest ${id} from Unum ID SaaS, ${configData.SaaSUrl}. Error ${e}`);
    throw e;
  }
}

export function extractPresentationRequest (presentationRequestResponse: RESTResponse<PresentationRequestRepoDto>): WithVersion<PresentationRequest> {
  const presentationRequest = presentationRequestResponse.body.presentationRequests['3.0.0'];

  // need to convert the times to Date objects for proto handling
  const result = {
    ...presentationRequest,
    createdAt: new Date(presentationRequest.createdAt),
    updateAt: new Date(presentationRequest.updatedAt)
  };

  return result;
}
