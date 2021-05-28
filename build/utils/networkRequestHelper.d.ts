import { RESTData, RESTResponse } from '../types';
import { JSONObj } from '@unumid/types';
/**
 * Helper to handle network requests.
 * @param inputObj
 */
export declare const makeNetworkRequest: <T = unknown>(inputObj: RESTData) => Promise<RESTResponse<T>>;
/**
 * Helper to handle safe auth token handling in responses from UnumID's Saas via makeNetworkRequest
 * @param response JSONObj
 */
export declare const handleAuthTokenHeader: (response: JSONObj, existingAuthToken?: string | undefined) => string;
//# sourceMappingURL=networkRequestHelper.d.ts.map