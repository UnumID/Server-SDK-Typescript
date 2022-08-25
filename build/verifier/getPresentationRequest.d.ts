import { PresentationRequestEnriched } from '@unumid/types';
import { RESTResponse } from '../types';
/**
 * Helper to get presentationRequests by id from Saas' PresentationRequestRepo
 * @param authorization
 * @param id
 * @returns
 */
export declare function getPresentationRequest(authorization: string, id: string, version?: string): Promise<RESTResponse<PresentationRequestEnriched[]>>;
/**
 * Helper to extract the presentationRequest from the PresentationRequestRepo's response, which is a map keyed on version.
 * @param presentationRequestResponse
 * @returns
 */
export declare function extractPresentationRequest(presentationRequestResponse: PresentationRequestEnriched[]): PresentationRequestEnriched;
/**
 * Helper to handle converting the stringified date attributes to real Date objects so the proto serializer doesn't complain when going into a byte array for the signature check.
 * @param presentationRequestDto
 * @returns
 */
export declare function handleConvertingPresentationRequestDateAttributes(presentationRequestDto: PresentationRequestEnriched): PresentationRequestEnriched;
//# sourceMappingURL=getPresentationRequest.d.ts.map