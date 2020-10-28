import * as express from 'express';
import * as hlpr from 'library-issuer-verifier-utility';

import { configData } from './config';
import {
  PresentationRequestResponse,
  SendRequestReqBody,
  SignedPresentationRequest,
  UnsignedPresentationRequest
} from './types';
import { requireAuth } from './requireAuth';

type SendRequestReqType = express.Request<Record<string, unknown>, PresentationRequestResponse, SendRequestReqBody>

// constructs an unsigned PresentationRequest from the incoming request body
export const constructUnsignedPresentationRequest = (reqBody: SendRequestReqBody): UnsignedPresentationRequest => {
  const {
    verifier,
    holderAppUuid,
    credentialRequests,
    metadata,
    expiresAt
  } = reqBody;

  const uuid = hlpr.getUUID();

  return {
    credentialRequests,
    expiresAt,
    holderAppUuid,
    metadata,
    uuid,
    verifier
  };
};

// signs an unsigned PresentationRequest and attaches the resulting Proof
export const constructSignedPresentationRequest = (unsignedPresentationRequest: UnsignedPresentationRequest, privateKey: string): SignedPresentationRequest => {
  const proof = hlpr.createProof(
    unsignedPresentationRequest,
    privateKey,
    unsignedPresentationRequest.verifier,
    'pem'
  );

  const signedPresentationRequest = {
    ...unsignedPresentationRequest,
    proof: proof
  };

  return signedPresentationRequest;
};

// validates incoming request body
const validateSendRequestBody = (sendRequestBody: SendRequestReqBody): void => {
  const {
    verifier,
    credentialRequests,
    eccPrivateKey,
    holderAppUuid
  } = sendRequestBody;

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
};

// handler for /api/sendRequest route
export const sendRequest = async (req: SendRequestReqType, res: express.Response<PresentationRequestResponse>, next: express.NextFunction): Promise<void> => {
  try {
    const { body, headers: { authorization } } = req;

    requireAuth(authorization);

    // Validate inputs
    validateSendRequestBody(body);

    const unsignedPresentationRequest = constructUnsignedPresentationRequest(body);

    // Create the signed presentation object from the unsignedPresentation object
    const signedPR = constructSignedPresentationRequest(unsignedPresentationRequest, req.body.eccPrivateKey);

    const restData: hlpr.RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'presentationRequest',
      header: { Authorization: authorization },
      data: signedPR
    };

    const restResp = await hlpr.makeRESTCall<PresentationRequestResponse>(restData);

    // Copy only the required elemnts from the body of the response got from SaaS REST call
    const presentationRequestResponse = restResp.body;

    // Set the X-Auth-Token header alone
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('x-auth-token', restResp.headers['x-auth-token']);

    res.send(presentationRequestResponse);
  } catch (error) {
    next(error);
  }
};
