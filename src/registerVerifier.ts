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
const validateInParamsRequest = (req: express.Request): void => {
  const { name, customerUuid, apiKey, url } = req.body;

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
    throw new CustError(401, 'Not authenticated.');
  }
};

/**
 * Request middleware for registering a Verifier with UnumID's SaaS.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export const registerVerifierRequest = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    validateInParamsRequest(req);

    const { name, customerUuid, url } = req.body;

    const kpSet: KeyPairSet = await createKeyPairSet();
    const verifierOpt: VerifierOptions = { name, customerUuid, url, publicKeyInfo: constructKeyObjs(kpSet) };
    const restData: RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'verifier',
      header: { Authorization: 'Bearer ' + req.body.apiKey },
      data: verifierOpt
    };

    const restResp: JSONObj = await makeNetworkRequest(restData);

    // Copy only the required elemnts from the body of the response got from SaaS REST call
    const verifierResp: JSONObj = {} as JSONObj;
    verifierResp.uuid = restResp.body.uuid;
    verifierResp.customerUuid = restResp.body.customerUuid;
    verifierResp.did = restResp.body.did;
    verifierResp.name = restResp.body.name;
    verifierResp.createdAt = restResp.body.createdAt;
    verifierResp.updatedAt = restResp.body.updatedAt;

    // Populate the key info into the response got from SaaS
    verifierResp.keys = kpSet;

    // Set the X-Auth-Token header alone
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('x-auth-token', restResp.headers['x-auth-token']);

    res.send(verifierResp);
  } catch (error) {
    next(error);
  }
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
    throw new CustError(401, 'Not authenticated.');
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
      uuid: restResp.uuid,
      customerUuid: restResp.customerUuid,
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
