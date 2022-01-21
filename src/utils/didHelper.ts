import { CredentialSubject, DidDocument, DidKeyType, PublicKeyInfo, Credential, CredentialPb } from '@unumid/types';

import { CustError } from './error';
import logger from '../logger';
import { makeNetworkRequest } from './networkRequestHelper';
import { RESTData, RESTResponse } from '../types';
import { convertCredentialSubject } from './convertCredentialSubject';
import { configData } from '../config';

/**
 * Get a Did document from the did and url provided.
 * @param baseUrl
 * @param authorization
 * @param did
 */
export const getDIDDoc = async (baseUrl: string, authorization: string, did: string): Promise<RESTResponse<DidDocument | PublicKeyInfo> | CustError> => {
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
 * Helper to return the keys in the DID document which corresponds to the type specified.
 * Note: the can be multiple keys of same type on the same DID document.
 * @param didDocument DiDDocument
 * @param type DidKeyType
 */
export const getKeysFromDIDDoc = (didDocument: DidDocument, type: DidKeyType): PublicKeyInfo[] => {
  const publicKeyInfos = didDocument.publicKey.filter(publicKeyInfo => publicKeyInfo.type === type);

  if (publicKeyInfos.length === 0) {
    logger.error(`DidDoc ${didDocument.id} has no ${type} public keys`);
    throw new CustError(500, `DidDoc ${didDocument.id} has no ${type} public keys`);
  }

  return publicKeyInfos;
};

export const getDidDocPublicKeys = async (authorization: string, subjectDid: string): Promise<PublicKeyInfo[]> => {
  // resolve the subject's DID
  const didDocResponse = await getDIDDoc(configData.SaaSUrl, authorization, subjectDid);

  logger.debug(`DidDoc repsonse: ${didDocResponse}`);
  if (didDocResponse instanceof Error) {
    throw didDocResponse;
  }

  // get subject's public key info from its DID document
  const publicKeyInfos = getKeysFromDIDDoc(didDocResponse.body, 'RSA');

  if (publicKeyInfos.length === 0) {
    throw new CustError(404, 'Public key not found for the DID');
  }

  return publicKeyInfos;
};
