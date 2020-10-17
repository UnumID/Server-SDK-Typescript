import * as express from 'express';
import * as hlpr from 'library-issuer-verifier-utility';

import { configData } from './config';
import { UnsignedPresentationRequest, SignedPresentationRequest, PresentationRequestWithDeeplink } from './types';
import { requireAuth } from './requireAuth';

const validateInParams = (req: express.Request): UnsignedPresentationRequest => {
  const {
    verifier,
    credentialRequests,
    metadata,
    expiresAt,
    eccPrivateKey,
    holderAppUuid
  } = req.body;

  if (!verifier) {
    throw new hlpr.CustError(400, 'Invalid PresentationRequest options: verifier is required.');
  }

  if (typeof verifier !== 'string') {
    throw new hlpr.CustError(400, 'Invalid PresentationRequest options: verifier must be a string.');
  }

  if (!holderAppUuid) {
    throw new hlpr.CustError(400, 'Invalid PresentationRequest options: holderAppUuid is required.');
  }

  if (typeof holderAppUuid !== 'string') {
    throw new hlpr.CustError(400, 'Invalid PresentationRequest options: holderAppUuid must be a string.');
  }

  if (!credentialRequests) {
    throw new hlpr.CustError(400, 'Invalid PresentationRequest options: credentialRequests is required.');
  }

  // credentialRequests input element must be an array
  if (!Array.isArray(credentialRequests)) {
    throw new hlpr.CustError(400, 'Invalid PresentationRequest options: credentialRequests must be an array.');
  }

  const totCredReqs = credentialRequests.length;
  if (totCredReqs === 0) {
    throw new hlpr.CustError(400, 'Invalid PresentationRequest options: credentialRequests array must not be empty.');
  }

  // credentialRequests input element should have type and issuer elements
  for (let i = 0; i < totCredReqs; i++) {
    const credentialRequest = credentialRequests[i];

    if (!credentialRequest.type) {
      throw new hlpr.CustError(400, 'Invalid credentialRequest: type is required.');
    }

    if (!credentialRequest.issuers) {
      throw new hlpr.CustError(400, 'Invalid credentialRequest: issuers is required.');
    }

    // credentialRequests.issuers input element must be an array
    if (!Array.isArray(credentialRequest.issuers)) {
      throw new hlpr.CustError(400, 'Invalid credentialRequest: issuers must be an array.');
    }

    const totIssuers = credentialRequest.issuers.length;
    if (totIssuers === 0) {
      throw new hlpr.CustError(400, 'Invalid credentialRequest: issuers array must not be empty.');
    }

    for (const issuer of credentialRequest.issuers) {
      if (typeof issuer !== 'string') {
        throw new hlpr.CustError(400, 'Invalid issuer: must be a string.');
      }
    }
  }

  // ECC Private Key is mandatory input parameter
  if (!eccPrivateKey) {
    throw new hlpr.CustError(400, 'Invalid PresentationRequest options: eccPrivateKey is required.');
  }

  const unsignedPR: UnsignedPresentationRequest = {
    verifier,
    credentialRequests,
    metadata,
    expiresAt,
    holderAppUuid
  };

  return (unsignedPR);
};

const constructSignedPresentation = (unsignedPR: UnsignedPresentationRequest, privateKey: string): SignedPresentationRequest => {
  const proof: hlpr.Proof = hlpr.createProof(unsignedPR, privateKey, unsignedPR.verifier, 'pem');
  const signedPR: SignedPresentationRequest = {
    verifier: unsignedPR.verifier,
    credentialRequests: unsignedPR.credentialRequests,
    metadata: unsignedPR.metadata,
    expiresAt: unsignedPR.expiresAt,
    holderAppUuid: unsignedPR.holderAppUuid,
    proof: proof
  };

  return (signedPR);
};

export const sendRequest = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const { authorization } = req.headers;

    requireAuth(authorization);

    // Validate inputs and Create the unsignedPresentation Object
    const unsignedPR: UnsignedPresentationRequest = validateInParams(req);

    // Create the signed presentation object from the unsignedPresentation object
    const signedPR: SignedPresentationRequest = constructSignedPresentation(unsignedPR, req.body.eccPrivateKey);

    const restData: hlpr.RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'presentationRequest',
      header: { Authorization: authorization },
      data: signedPR
    };

    const restResp: hlpr.JSONObj = await hlpr.makeRESTCall(restData);

    // Copy only the required elemnts from the body of the response got from SaaS REST call
    const prReqWithDeeplink: PresentationRequestWithDeeplink = restResp.body;

    // Set the X-Auth-Token header alone
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('x-auth-token', restResp.headers['x-auth-token']);

    res.send(prReqWithDeeplink);
  } catch (error) {
    next(error);
  }
};
