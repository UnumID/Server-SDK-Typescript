import * as express from 'express';
import * as hlpr from 'library-issuer-verifier-utility';

import { configData } from './config';
import { UnsignedPresentationRequest, SignedPresentationRequest, PresentationRequestWithDeeplink } from './types';

const validateInParams = (req: express.Request, authToken: string): UnsignedPresentationRequest => {
  const { verifier, credentialRequests, metadata, expiresAt, eccPrivateKey } = req.body;

  // Verifier input element validation
  if (!verifier || !credentialRequests) {
    throw new hlpr.CustError(404, 'Missing required verifier, and/or credentialRequests');
  }

  if (!verifier.name || !verifier.did || !verifier.url) {
    throw new hlpr.CustError(404, 'Missing required name, did and/or url in verifier input element');
  }

  // credentialRequests input element must be an array
  if (!Array.isArray(credentialRequests)) {
    throw new hlpr.CustError(404, 'credentialRequests input is not an array');
  }

  const totCredReqs = credentialRequests.length;
  if (totCredReqs === 0) {
    throw new hlpr.CustError(404, 'credentialRequests input array is empty');
  }

  // credentialRequests input element should have type and issuer elements
  for (let i = 0; i < totCredReqs; i++) {
    const credPosStr = '[' + i + ']';
    if (!credentialRequests[i].type || !credentialRequests[i].issuers) {
      throw new hlpr.CustError(404, 'Missing type and/or issuers in credentialRequests' + credPosStr + ' Array input element');
    }

    // credentialRequests.issuers input element must be an array
    if (!Array.isArray(credentialRequests[i].issuers)) {
      throw new hlpr.CustError(404, 'issuers element in credentialRequests' + credPosStr + ' object is not an Array');
    }

    const totIssuers = credentialRequests[i].issuers.length;
    if (totIssuers === 0) {
      throw new hlpr.CustError(404, 'credentialRequests' + credPosStr + '.issuers input array is empty');
    }
    // credentialRequests.issuers should have did and name attribute
    for (let j = 0; j < totIssuers; j++) {
      if (!credentialRequests[i].issuers[j].did || !credentialRequests[i].issuers[j].name) {
        throw new hlpr.CustError(404, 'Missing name and/or did in one or more issuers Array input element');
      }
    }
  }

  // ECC Private Key is mandatory input parameter
  if (!eccPrivateKey) {
    throw new hlpr.CustError(404, 'eccPrivateKey input field is mandatory');
  }

  // x-auth-token is mandatory
  if (!authToken) {
    throw new hlpr.CustError(401, 'Request not authenticated');
  }

  const unsignedPR: UnsignedPresentationRequest = {
    verifier,
    credentialRequests,
    metadata,
    expiresAt
  };

  return (unsignedPR);
};

const constructSignedPresentation = (unsignedPR: UnsignedPresentationRequest, privateKey: string): SignedPresentationRequest => {
  const proof: hlpr.Proof = hlpr.createProof(unsignedPR, privateKey, unsignedPR.verifier.did);
  const signedPR: SignedPresentationRequest = {
    verifier: unsignedPR.verifier,
    credentialRequests: unsignedPR.credentialRequests,
    metadata: unsignedPR.metadata,
    expiresAt: unsignedPR.expiresAt,
    proof: proof
  };

  return (signedPR);
};

export const sendRequest = async (req: express.Request, res: express.Response, next: any): Promise<void> => {
  try {
    const authToken: string = req.headers['x-auth-token'] as string;

    // Validate inputs and Create the unsignedPresentation Object
    const unsignedPR: UnsignedPresentationRequest = validateInParams(req, authToken);

    // Create the signed presentation object from the unsignedPresentation object
    const signedPR: SignedPresentationRequest = constructSignedPresentation(unsignedPR, req.body.eccPrivateKey);

    const restData: hlpr.RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'presentationRequest',
      header: { Authorization: 'Bearer ' + authToken },
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
