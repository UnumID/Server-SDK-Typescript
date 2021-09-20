import { JSONObj, PresentationRequestDto, PresentationRequestDtoPb, WithVersion, PresentationRequestRepoDto } from '@unumid/types';
import { PresentationRequest } from '@unumid/types/build/protos/presentation';
import { configData } from '../config';
import logger from '../logger';
import { RESTData, RESTResponse, UnumDto } from '../types';
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

export function extractPresentationRequest (presentationRequestResponse: PresentationRequestRepoDto): PresentationRequestDto {
  try {
    const presentationRequestDto = presentationRequestResponse.presentationRequests['3.0.0'];

    // need to convert the times to Date objects for proto handling
    const result = {
      ...presentationRequestDto,
      presentationRequest: {
        ...presentationRequestDto.presentationRequest,
        createdAt: presentationRequestDto.presentationRequest.createdAt ? new Date(presentationRequestDto.presentationRequest.createdAt) : undefined as any as Date, // Despite this ugliness, rather check for presence and handle the undefined directly while not dealing with a whole new type
        updatedAt: presentationRequestDto.presentationRequest.updatedAt ? new Date(presentationRequestDto.presentationRequest.updatedAt) : undefined as any as Date,
        expiresAt: presentationRequestDto.presentationRequest.expiresAt ? new Date(presentationRequestDto.presentationRequest.expiresAt) : undefined as any as Date
      }
    };

    return result;
  } catch (e) {
    throw new CustError(500, `Error handling presentation request from Saas: Error ${e}`);
  }
}
