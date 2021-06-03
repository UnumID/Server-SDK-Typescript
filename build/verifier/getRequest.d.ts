import { PresentationRequestDto } from '@unumid/types';
import { UnumDto } from '../types';
/**
 * Handler for getting a PresentationRequest from UnumID's saas by its uuid
 * @param authorization
 * @param uuid
 * @returns UnumDto<PresentationRequestDto>
*/
export declare const getRequest: (authorization: string, uuid: string) => Promise<UnumDto<PresentationRequestDto>>;
//# sourceMappingURL=getRequest.d.ts.map