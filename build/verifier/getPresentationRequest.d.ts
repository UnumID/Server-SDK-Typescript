import { WithVersion } from '@unumid/types';
import { PresentationRequest } from '@unumid/types/build/protos/presentation';
import { PresentationRequestRepoDto, RESTResponse } from '../types';
export declare function getPresentationRequest(authorization: string, id: string): Promise<RESTResponse<PresentationRequestRepoDto>>;
export declare function extractPresentationRequest(presentationRequestResponse: RESTResponse<PresentationRequestRepoDto>): WithVersion<PresentationRequest>;
//# sourceMappingURL=getPresentationRequest.d.ts.map