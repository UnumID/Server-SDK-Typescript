import { configData } from '../config';
import { IssuerOptions, KeyPairSet, RegisteredIssuer, RESTData, UnumDto } from '../types';

import logger from '../logger';
import { DidKeyType, JSONObj, KeyPair, PublicKeyInfo } from '@unumid/types';
import { getUUID } from '../utils/helpers';
import { CustError } from '../utils/error';
import { createKeyPairSet } from '../utils/createKeyPairs';
import { handleAuthToken, makeNetworkRequest } from '../utils/networkRequestHelper';

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
 * @param name
 * @param customerUuid
 * @param apiKey
 */
export const registerIssuer = async (name: string, customerUuid: string, apiKey: string): Promise<UnumDto<RegisteredIssuer>> => {
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

    const authToken: string = handleAuthToken(restResp, ''); // no existing auth token

    if (!authToken) {
      throw new CustError(500, 'Unable to parse auth token something went wrong');
    }

    const issuerResp: UnumDto<RegisteredIssuer> = {
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
    logger.error(`Error registering an Issuer with UnumID SaaS. ${error}`);
    throw error;
  }
};
