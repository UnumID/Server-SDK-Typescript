import { JSONObj, PresentationRequestDtoPb, WithVersion } from '@unumid/types';
import { isDate, isString } from 'lodash';
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
      createdAt: handleAttributeDateType(presentationRequestDto.presentationRequest.createdAt) as Date, // Despite this ugliness, rather check for presence and handle the undefined directly while not dealing with a whole new type
      updatedAt: handleAttributeDateType(presentationRequestDto.presentationRequest.updatedAt) as Date,
      expiresAt: handleAttributeDateType(presentationRequestDto.presentationRequest.expiresAt) as Date
    }
  };

  return result;
}

/**
 * Helper to make the date attribute handling a little easier to follow than a complicate ternary.
 * @param input
 * @returns
 */
function handleAttributeDateType (input: any): Date | undefined {
  if (!input) {
    return undefined;
  }

  if (isDate(input)) {
    return input;
  }

  if (isString(input)) {
    return new Date(input);
  }

  logger.error('PresentationRequest date attribute value is not a string, undefined or Date. This should never happen.');
  return undefined;
}
