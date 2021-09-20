import { PresentationRequestDto, PresentationRequestRepoDto } from '@unumid/types';
import { RESTResponse } from '../types';
export declare function getPresentationRequest(authorization: string, id: string): Promise<RESTResponse<PresentationRequestRepoDto>>;
export declare function extractPresentationRequest(presentationRequestResponse: PresentationRequestRepoDto): PresentationRequestDto;
//# sourceMappingURL=getPresentationRequest.d.ts.map