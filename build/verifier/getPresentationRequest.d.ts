import { PresentationRequestDto, PresentationRequestRepoDto } from '@unumid/types';
import { RESTResponse } from '../types';
/**
 * Helper to get presentationRequests by id from Saas' PresentationRequestRepo
 * @param authorization
 * @param id
 * @returns
 */
export declare function getPresentationRequest(authorization: string, id: string): Promise<RESTResponse<PresentationRequestRepoDto>>;
/**
 * Helper to extract the presentationRequest from the PresentationRequestRepo's response, which is a map keyed on version.
 * @param presentationRequestResponse
 * @returns
 */
export declare function extractPresentationRequest(presentationRequestResponse: PresentationRequestRepoDto): PresentationRequestDto;
/**
 * Helper to handle converting the stringified date attributes to real Date objects so the proto serializer doesn't complain when going into a byte array for the signature check.
 * @param presentationRequestDto
 * @returns
 */
export declare function handleConvertingPresentationRequestDateAttributes(presentationRequestDto: PresentationRequestDto): PresentationRequestDto;
//# sourceMappingURL=getPresentationRequest.d.ts.map