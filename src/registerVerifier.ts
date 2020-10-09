import * as express from 'express';
import * as hlpr from 'library-issuer-verifier-utility';

import { configData } from './config';
import { VerifierOptions } from './types';

const constructKeyObj = (kp: hlpr.KeyPair, type: string): hlpr.PublicKeyInfo => {
  return {
    id: hlpr.getUUID(),
    encoding: 'pem',
    type: type,
    status: 'valid',
    publicKey: kp.publicKey
  };
};

const constructKeyObjs = (kpSet: hlpr.KeyPairSet): Array<hlpr.PublicKeyInfo> => {
  const signKey = constructKeyObj(kpSet.signing, 'secp256r1');

  return ([signKey]);
};

const validateInParams = (req: express.Request): void => {
  const { name, customerUuid, apiKey } = req.body;

  if (!name) {
    throw new hlpr.CustError(400, 'Invalid Verifier Options: name is required.');
  }

  if (!customerUuid) {
    throw new hlpr.CustError(400, 'Invalid Verifier Options: customerUuid is required.');
  }

  if (!apiKey) {
    throw new hlpr.CustError(401, 'Not authenticated.');
  }
};

export const registerVerifier = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    validateInParams(req);

    const kpSet: hlpr.KeyPairSet = await hlpr.createToken();
    const verifierOpt: VerifierOptions = { name: req.body.name, customerUuid: req.body.customerUuid, publicKeyInfo: constructKeyObjs(kpSet) };
    const restData: hlpr.RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'verifier',
      header: { Authorization: 'Bearer ' + req.body.apiKey },
      data: verifierOpt
    };

    const restResp: hlpr.JSONObj = await hlpr.makeRESTCall(restData);

    // Copy only the required elemnts from the body of the response got from SaaS REST call
    const verifierResp: hlpr.JSONObj = {} as hlpr.JSONObj;
    verifierResp.uuid = restResp.body.uuid;
    verifierResp.customerUuid = restResp.body.customerUuid;
    verifierResp.did = restResp.body.did;
    verifierResp.name = restResp.body.name;
    verifierResp.createdAt = restResp.body.createdAt;
    verifierResp.updatedAt = restResp.body.updatedAt;

    // Populate the key info into the response got from SaaS
    verifierResp.keys = kpSet.signing;

    // Set the X-Auth-Token header alone
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('x-auth-token', restResp.headers['x-auth-token']);

    res.send(verifierResp);
  } catch (error) {
    next(error);
  }
};
