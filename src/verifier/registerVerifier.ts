import { configData } from '../config';
import { KeyPairSet, RegisteredVerifier, RESTData, UnumDto } from '../types';
import logger from '../logger';
import { DidKeyType, KeyPair, PublicKeyInfo, VerifierOptions, VersionInfo, JSONObj } from '@unumid/types';
import { CustError } from '..';
import { createKeyPairSet } from '../utils/createKeyPairs';
import { getUUID } from '../utils/helpers';
import { makeNetworkRequest, handleAuthTokenHeader } from '../utils/networkRequestHelper';
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
 * Currently creates a key pair set. One for signing and the other for encryption.
 * Flexible in supporting future keys for other purposes.
 * @param kpSet KeyPairSet
 */
const constructKeyObjs = (kpSet: KeyPairSet): Array<PublicKeyInfo> => {
  const signKey = constructKeyObj(kpSet.signing, 'secp256r1');
  const encKey = constructKeyObj(kpSet.encryption, 'RSA');

  return [signKey, encKey];
};

/**
 * Validates request input parameters.
 * @param req Request
 */
const validateInParams = (url: string, apiKey: string, versionInfo: VersionInfo[]): void => {
  if (!url) {
    throw new CustError(400, 'Invalid Verifier Options: url is required.');
  }

  if (!apiKey) {
    throw new CustError(401, 'Not authenticated: apiKey is required.');
  }

  validateVersionInfo(versionInfo);
};

/**
 * Handler for registering a Verifier with UnumID's SaaS.
 * @param customerUuid
 * @param url
 * @param apiKey
 * @param versionInfo
 */
export const registerVerifier = async (apiKey: string, url: string, versionInfo: VersionInfo[] = [{ target: { version: '1.0.0' }, sdkVersion: '3.0.0' }]): Promise<UnumDto<RegisteredVerifier>> => {
  try {
    validateInParams(url, apiKey, versionInfo);

    const kpSet: KeyPairSet = await createKeyPairSet();
    const verifierOpt: VerifierOptions = { url, publicKeyInfo: constructKeyObjs(kpSet), versionInfo };
    const restData: RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'verifier',
      header: { Authorization: 'Bearer ' + apiKey },
      data: verifierOpt
    };

    const restResp: JSONObj = await makeNetworkRequest(restData);

    const authToken: string = handleAuthTokenHeader(restResp);

    const verifierResp: UnumDto<RegisteredVerifier> = {
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
        url,
        versionInfo,
        apiKey
      }
    };

    return verifierResp;
  } catch (error) {
    logger.error(`Error registering verifier ${apiKey}. ${error}`);
    throw error;
  }
};
