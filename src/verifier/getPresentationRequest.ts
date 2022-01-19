import { JSONObj, PresentationRequestDto, PresentationRequestDtoPb, WithVersion, PresentationRequestRepoDto } from '@unumid/types';
import { isString } from 'lodash';
import { configData } from '../config';
import logger from '../logger';
import { RESTData, RESTResponse, UnumDto } from '../types';
import { CustError } from '../utils/error';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';

/**
 * Helper to get presentationRequests by id from Saas' PresentationRequestRepo
 * @param authorization
 * @param id
 * @returns
 */
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

/**
 * Helper to extract the presentationRequest from the PresentationRequestRepo's response, which is a map keyed on version.
 * @param presentationRequestResponse
 * @returns
 */
export function extractPresentationRequest (presentationRequestResponse: PresentationRequestRepoDto): PresentationRequestDto {
// export function extractPresentationRequest (presentationRequestDto: PresentationRequestDto): PresentationRequestDto {
  try {
    const presentationRequestDto = presentationRequestResponse.presentationRequests['3.0.0'];

    // need to convert the times to Date objects for proto handling
    return handleConvertingPresentationRequestDateAttributes(presentationRequestDto);
  } catch (e) {
    throw new CustError(500, `Error handling presentation request from Saas: Error ${e}`);
  }
}

/**
 * Helper to handle converting the stringified date attributes to real Date objects so the proto serializer doesn't complain when going into a byte array for the signature check.
 * @param presentationRequestDto
 * @returns
 */
export function handleConvertingPresentationRequestDateAttributes (presentationRequestDto: PresentationRequestDto): PresentationRequestDto {
  const result = {
    ...presentationRequestDto,
    presentationRequest: {
      ...presentationRequestDto.presentationRequest,
      createdAt: presentationRequestDto.presentationRequest.createdAt && isString(presentationRequestDto.presentationRequest.createdAt) ? new Date(presentationRequestDto.presentationRequest.createdAt) : undefined as any as Date, // Despite this ugliness, rather check for presence and handle the undefined directly while not dealing with a whole new type
      updatedAt: presentationRequestDto.presentationRequest.updatedAt && isString(presentationRequestDto.presentationRequest.updatedAt) ? new Date(presentationRequestDto.presentationRequest.updatedAt) : undefined as any as Date,
      expiresAt: presentationRequestDto.presentationRequest.expiresAt && isString(presentationRequestDto.presentationRequest.expiresAt) ? new Date(presentationRequestDto.presentationRequest.expiresAt) : undefined as any as Date
    }
  };

  return result;
}
