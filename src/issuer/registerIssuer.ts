import { configData } from '../config';
import { IssuerOptions, RegisteredIssuer, IssuerDto } from '../types';

import { KeyPair, PublicKeyInfo, getUUID, KeyPairSet, CustError, createKeyPairSet, RESTData, JSONObj, makeNetworkRequest, DidKeyType, handleAuthToken } from 'library-issuer-verifier-utility';
import logger from '../logger';

/**
 * Creates an object to encapsulate key information.
 * @param kp KeyPair
 * @param type DidKeyType
 */
const constructKeyObj = (kp: KeyPair, type: DidKeyType): PublicKeyInfo => {
  return {
    id: getUUID(),
    encoding: 'pem',
    type: type,
    status: 'valid',
    publicKey: kp.publicKey
  };
};

/**
 * Creates a key pair set. One for signing and the other for encryption.
 * @param kpSet KeyPairSet
 */
const constructKeyObjs = (kpSet: KeyPairSet): Array<PublicKeyInfo> => {
  const signKey = constructKeyObj(kpSet.signing, 'secp256r1');
  const encKey = constructKeyObj(kpSet.encryption, 'RSA');

  return [signKey, encKey];
};

/**
 * Validates request input parameters.
 * @param name: string
 * @param customerUuid string
 * @param apiKey string
 */
const validateInParams = (name: string, customerUuid: string, apiKey: string) => {
  if (!name) {
    throw new CustError(400, 'Invalid Issuer: name is required.');
  }

  if (!customerUuid) {
    throw new CustError(400, 'Invalid Issuer: customerUuid is required.');
  }

  if (!apiKey) {
    throw new CustError(401, 'Not authenticated: apiKey is required');
  }
};

/**
 * Handles registering an Issuer with UnumID's SaaS.
 * @param name string
 * @param customerUuid string
 * @param apiKey string
 */
export const registerIssuer = async (name: string, customerUuid: string, apiKey: string): Promise<IssuerDto<RegisteredIssuer>> => {
  try {
    validateInParams(name, customerUuid, apiKey);

    const kpSet: KeyPairSet = await createKeyPairSet();
    const issuerOpt: IssuerOptions = {
      name,
      customerUuid,
      publicKeyInfo: constructKeyObjs(kpSet)
    };
    const restData: RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'issuer',
      header: { Authorization: 'Bearer ' + apiKey },
      data: issuerOpt
    };

    const restResp: JSONObj = await makeNetworkRequest(restData);

    const authToken: string = handleAuthToken(restResp);

    const issuerResp: IssuerDto<RegisteredIssuer> = {
      authToken,
      body: {
        uuid: restResp.body.uuid,
        customerUuid: restResp.body.customerUuid,
        did: restResp.body.did,
        name: restResp.body.name,
        createdAt: restResp.body.createdAt,
        updatedAt: restResp.body.updatedAt,
        isAuthorized: restResp.body.isAuthorized,
        keys: kpSet
      }
    };

    return issuerResp;
  } catch (error) {
    logger.error(`Error registering an Issuer with UnumID SaaS. Error: ${error}`);
    throw error;
  }
};
