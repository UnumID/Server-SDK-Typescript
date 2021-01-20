import * as express from 'express';
import { configData } from './config';
import { RegisteredVerifierDto, VerifierOptions } from './types';
import { KeyPair, PublicKeyInfo, getUUID, KeyPairSet, CustError, createKeyPairSet, RESTData, JSONObj, makeNetworkRequest, DidKeyType } from 'library-issuer-verifier-utility';
import logger from './logger';

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
 * Currently creates a key pair set of one key entity for signing purposes.
 * Flexible in supporting future keys for other purposes.
 * @param kpSet KeyPairSet
 */
const constructKeyObjs = (kpSet: KeyPairSet): Array<PublicKeyInfo> => {
  const signKey = constructKeyObj(kpSet.signing, 'secp256r1');

  return ([signKey]);
};

/**
 * Validates request input parameters.
 * @param req Request
 */
const validateInParams = (name: string, customerUuid: string, url: string, apiKey: string): void => {
  if (!name) {
    throw new CustError(400, 'Invalid Verifier Options: name is required.');
  }

  if (!customerUuid) {
    throw new CustError(400, 'Invalid Verifier Options: customerUuid is required.');
  }

  if (!url) {
    throw new CustError(400, 'Invalid Verifier Options: url is required.');
  }

  if (!apiKey) {
    throw new CustError(401, 'Not authenticated: apiKey is required.');
  }
};

/**
 * Handler for registering a Verifier with UnumID's SaaS.
 * @param name
 * @param customerUuid
 * @param url
 * @param apiKey
 */
export const registerVerifier = async (name: string, customerUuid: string, url: string, apiKey: string): Promise<RegisteredVerifierDto> => {
  try {
    validateInParams(name, customerUuid, url, apiKey);

    const kpSet: KeyPairSet = await createKeyPairSet();
    const verifierOpt: VerifierOptions = { name, customerUuid, url, publicKeyInfo: constructKeyObjs(kpSet) };
    const restData: RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'verifier',
      header: { Authorization: 'Bearer ' + apiKey },
      data: verifierOpt
    };

    const restResp: JSONObj = await makeNetworkRequest(restData);

    const verifierResp: RegisteredVerifierDto = {
      uuid: restResp.body.uuid,
      customerUuid: restResp.body.customerUuid,
      did: restResp.body.did,
      name: restResp.body.name,
      createdAt: restResp.body.createdAt,
      updatedAt: restResp.body.updatedAt,
      isAuthorized: restResp.body.isAuthorized,
      authToken: restResp.headers['x-auth-token'],
      keys: kpSet,
      url
    };

    return verifierResp;
  } catch (error) {
    logger.info(`Error registering verifier ${name}. Error: ${error}`);
    throw error;
  }
};
