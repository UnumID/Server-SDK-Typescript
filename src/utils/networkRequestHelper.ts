import fetch from 'node-fetch';

import { RESTData, RESTResponse } from '../types';
import { CustError } from './error';
import logger from '../logger';
import { isArrayEmpty, isArrayNotEmpty } from './helpers';
import { JSONObj } from '@unumid/types';
import { versionList } from './versionList';

/**
 * Helper to handle network requests.
 * @param inputObj
 */
export const makeNetworkRequest = async <T = unknown> (inputObj: RESTData): Promise<RESTResponse<T>> => {
  const restHdr: JSONObj = (!inputObj.header ? {} as JSONObj : inputObj.header);
  // Always set the content-type in the header
  restHdr['Content-Type'] = 'application/json';

  const url = inputObj.baseUrl + inputObj.endPoint;
  const options = {
    method: inputObj.method,
    body: JSON.stringify(inputObj.data),
    headers: {
      ...restHdr,
      version: restHdr.version ? restHdr.version : versionList[versionList.length - 1] // The api version to hit the UnumID SaaS with in the this version of the SDK
    }
  };
  const respObj = {} as RESTResponse<T>;

  logger.debug(`Making ${inputObj.method} request to url: ${url}`);

  const res = await fetch(url, options);

  const responseJson = await res.json();
  // res.ok will be true for success scenario, otherwise, it will be false.
  if (res.ok) {
    logger.debug(`Successful call to ${url}.`);

    // Response object will have both header and body for success scenario
    respObj.headers = res.headers.raw();
    respObj.body = responseJson;

    return (respObj);
  } else {
    logger.error(`Error in call to ${url}. Error: ${responseJson.code} ${responseJson.message}`);
    throw new CustError(responseJson.code, responseJson.message);
  }
};

/**
 * Helper to handle safe auth token handling in responses from UnumID's Saas via makeNetworkRequest
 * @param response JSONObj
 */
export const handleAuthToken = (response:JSONObj, existingAuthToken?:string): string => {
  const authTokenResp = response && response.headers && response.headers['x-auth-token'] ? response.headers['x-auth-token'] : '';

  // Ensuring that the authToken attribute is presented as a string or undefined. The header values can be a string | string[] so hence the complex ternary.
  const authToken: string = <string>(isArrayEmpty(authTokenResp) && authTokenResp ? authTokenResp : (isArrayNotEmpty(authTokenResp) ? authTokenResp[0] : undefined));
  // If authToken is undefined see if the input existing auth token is a valid Bearer token (not an admin key), if an admin key just return undefined, otherwise return a properly formatted Bearer token for use in subsequent requests or the existing, inputting token.
  const result = authToken ? (authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`) : (existingAuthToken?.startsWith('Bearer ') ? existingAuthToken : authToken);
  return result;
};
