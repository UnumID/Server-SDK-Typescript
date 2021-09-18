import { PresentationRequestDto } from '@unumid/types';
import { PresentationRequestRepoDto, RESTResponse } from '../types';
export declare function getPresentationRequest(authorization: string, id: string): Promise<RESTResponse<PresentationRequestRepoDto>>;
export declare function extractPresentationRequest(presentationRequestResponse: RESTResponse<PresentationRequestRepoDto>): PresentationRequestDto;
//# sourceMappingURL=getPresentationRequest.d.ts.map