// import { PresentationRequestEnriched } from '@unumid/types';
// import { isDate, isString } from 'lodash';
// import { configData } from '../config';
// import logger from '../logger';
// import { RESTData, RESTResponse } from '../types';
// import { sdkMajorVersion } from '../utils/constants';
// import { CustError } from '../utils/error';
// import { makeNetworkRequest } from '../utils/networkRequestHelper';

// /**
//  * Helper to get presentationRequests by id from Saas' PresentationRequestRepo
//  * @param authorization
//  * @param id
//  * @returns
//  */
// export async function getPresentationRequest (authorization: string, id: string, version = sdkMajorVersion): Promise<RESTResponse<PresentationRequestEnriched[]>> {
//   const receiptCallOptions: RESTData = {
//     method: 'GET',
//     baseUrl: configData.SaaSUrl,
//     endPoint: `presentationRequest?id=${id}&version=${version}`,
//     header: { Authorization: authorization }
//   };

//   try {
//     // note: should only ever return array of length 1.
//     const resp = await makeNetworkRequest<PresentationRequestEnriched[]>(receiptCallOptions);

//     return resp;
//   } catch (e) {
//     logger.error(`Error getting PresentationRequest ${id} from Unum ID SaaS, ${configData.SaaSUrl}. Error ${e}`);
//     throw e;
//   }
// }

// /**
//  * Helper to extract the presentationRequest from the PresentationRequestRepo's response, which is a map keyed on version.
//  * @param presentationRequestResponse
//  * @returns
//  */
// export function extractPresentationRequest (presentationRequestResponse: PresentationRequestEnriched[]): PresentationRequestEnriched {
//   try {
//     const presentationRequestEnrichedDto = presentationRequestResponse[0];

//     // need to convert the times to Date objects for proto handling
//     return handleConvertingPresentationRequestDateAttributes(presentationRequestEnrichedDto);
//   } catch (e) {
//     throw new CustError(500, `Error handling presentation request from Saas: Error ${e}`);
//   }
// }

// /**
//  * Helper to handle converting the stringified date attributes to real Date objects so the proto serializer doesn't complain when going into a byte array for the signature check.
//  * @param presentationRequestDto
//  * @returns
//  */
// export function handleConvertingPresentationRequestDateAttributes (presentationRequestDto: PresentationRequestEnriched): PresentationRequestEnriched {
//   const result = {
//     ...presentationRequestDto,
//     presentationRequest: {
//       ...presentationRequestDto.presentationRequest,
//       createdAt: handleAttributeDateType(presentationRequestDto.presentationRequest.createdAt) as Date, // Despite this ugliness, rather check for presence and handle the undefined directly while not dealing with a whole new type
//       updatedAt: handleAttributeDateType(presentationRequestDto.presentationRequest.updatedAt) as Date,
//       expiresAt: handleAttributeDateType(presentationRequestDto.presentationRequest.expiresAt) as Date
//     }
//   };

//   return result;
// }

// /**
//  * Helper to make the date attribute handling a little easier to follow than a complicate ternary.
//  * @param input
//  * @returns
//  */
// function handleAttributeDateType (input: any): Date | undefined {
//   if (!input) {
//     return undefined;
//   }

//   if (isDate(input)) {
//     return input;
//   }

//   if (isString(input)) {
//     return new Date(input);
//   }

//   logger.error('PresentationRequest date attribute value is not a string, undefined or Date. This should never happen.');
//   return undefined;
// }
