import { DidDocument, DidKeyType, PublicKeyInfo } from '@unumid/types';

import { CustError } from './error';
import logger from '../logger';
import { makeNetworkRequest } from './networkRequestHelper';
import { RESTData, RESTResponse } from '../types';

/**
 * Get a Did document from the did and url provided.
 * @param baseUrl
 * @param authorization
 * @param did
 */
export const getDIDDoc = async (baseUrl: string, authorization: string, did: string): Promise<RESTResponse<DidDocument> | CustError> => {
  try {
    const restData: RESTData = {
      method: 'GET',
      baseUrl: baseUrl,
      endPoint: 'didDocument/' + did,
      header: { Authorization: authorization }
    };

    const restResp = await makeNetworkRequest<DidDocument>(restData);
    logger.debug('Successfully retrieved did document', restResp.body);

    return (restResp);
  } catch (error) {
    logger.error(`Error getting did document ${did} from ${baseUrl}`, error);
    return (error);
  }
};

/**
 * Helper to get a key from a Did document.
 * Note: Per convention, Did documents have secp256r1 keys for signing / verification and only holder DID Documents have RSA keys.
 * @param didDocument DiDDocument
 * @param type DidKeyType
 */
export const getKeyFromDIDDoc = (didDocument: DidDocument, type: DidKeyType): PublicKeyInfo[] => {
  // return the key in the DID document which corresponds to the type specified.
  return didDocument.publicKey.filter(publicKeyInfo => publicKeyInfo.type === type);
};
