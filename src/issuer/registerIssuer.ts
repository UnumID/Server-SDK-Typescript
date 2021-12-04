import { configData } from '../config';
import { KeyPairSet, RegisteredIssuer, RESTData, UnumDto } from '../types';

import logger from '../logger';
import { DidKeyType, IssuerOptions, JSONObj, KeyPair, PublicKeyInfo, VersionInfo } from '@unumid/types';
import { getUUID } from '../utils/helpers';
import { CustError } from '../utils/error';
import { createKeyPairSet } from '../utils/createKeyPairs';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';
import { validateVersionInfo } from '../utils/validateVersionInfo';

/**
 * Creates an object to encapsulate key information after key pair creation.
 * @param kp KeyPair
 * @param type DidKeyType
 */
const constructKeyObj = (kp: KeyPair, type: DidKeyType): PublicKeyInfo => {
  const now = new Date();
  return {
    id: getUUID(),
    encoding: 'pem',
    type: type,
    status: 'valid',
    publicKey: kp.publicKey,
    createdAt: now,
    updatedAt: now
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
 * @param customerUuid string
 * @param apiKey string
 */
const validateInParams = (customerUuid: string, apiKey: string, url: string, versionInfo: VersionInfo[]) => {
  if (!customerUuid) {
    throw new CustError(400, 'Invalid Issuer: customerUuid is required.');
  }

  if (!apiKey) {
    throw new CustError(401, 'Not authenticated: apiKey is required');
  }

  if (!url) {
    throw new CustError(400, 'Invalid Issuer: url is required.');
  }

  validateVersionInfo(versionInfo);
};

/**
 * Handles registering an Issuer with UnumID's SaaS.
 * @param customerUuid
 * @param apiKey
 */
export const registerIssuer = async (customerUuid: string, apiKey: string, url:string, versionInfo: VersionInfo[] = [{ target: { version: '1.0.0' }, sdkVersion: '3.0.0' }]): Promise<UnumDto<RegisteredIssuer>> => {
  try {
    validateInParams(customerUuid, apiKey, url, versionInfo);

    const kpSet: KeyPairSet = await createKeyPairSet();
    const issuerOpt: IssuerOptions = {
      customerUuid,
      publicKeyInfo: constructKeyObjs(kpSet),
      url,
      versionInfo
    };

    const restData: RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'issuer',
      header: { Authorization: 'Bearer ' + apiKey },
      data: issuerOpt
    };

    const restResp: JSONObj = await makeNetworkRequest(restData);

    const authToken: string = handleAuthTokenHeader(restResp);

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
        keys: kpSet,
        apiKey,
        url: restResp.body.url,
        versionInfo: restResp.body.versionInfo
      }
    };

    return issuerResp;
  } catch (error) {
    logger.error(`Error registering an Issuer with UnumID SaaS. ${error}`);
    throw error;
  }
};
