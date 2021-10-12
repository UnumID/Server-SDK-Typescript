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
//# sourceMappingURL=getPresentationRequest.d.ts.map