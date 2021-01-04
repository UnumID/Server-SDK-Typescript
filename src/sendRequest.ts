import * as express from 'express';
import { configData } from './config';
import { requireAuth } from './requireAuth';
import { getUUID, createProof, CustError, RESTData, makeNetworkRequest } from 'library-issuer-verifier-utility';

import {
  PresentationRequestResponse,
  SendRequestReqBody,
  SignedPresentationRequest,
  UnsignedPresentationRequest
} from './types';

type SendRequestReqType = express.Request<Record<string, unknown>, PresentationRequestResponse, SendRequestReqBody>

/**
 * Constructs an unsigned PresentationRequest from the incoming request body.
 * @param reqBody SendRequestReqBody
 */
export const constructUnsignedPresentationRequest = (reqBody: SendRequestReqBody): UnsignedPresentationRequest => {
  const {
    verifier,
    holderAppUuid,
    credentialRequests,
    metadata,
    expiresAt,
    createdAt,
    updatedAt
  } = reqBody;

  const uuid = getUUID();

  // any/all default values must be set before signing, or signature will always fail to verify
  const now = new Date();
  const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
  const defaultCreatedAt = now;
  const defaultUpdatedAt = now;
  const defaultExpiresAt = tenMinutesFromNow;
  const credentialRequestsWithDefaults = credentialRequests.map(cr => {
    return cr.required ? cr : { ...cr, required: false };
  });

  return {
    credentialRequests: credentialRequestsWithDefaults,
    createdAt: createdAt || defaultCreatedAt,
    updatedAt: updatedAt || defaultUpdatedAt,
    expiresAt: expiresAt || defaultExpiresAt,
    holderAppUuid,
    metadata: metadata || {},
    uuid,
    verifier
  };
};

/**
 * Signs an unsigned PresentationRequest and attaches the resulting Proof
 * @param unsignedPresentationRequest UnsignedPresentationRequest
 * @param privateKey String
 */
export const constructSignedPresentationRequest = (unsignedPresentationRequest: UnsignedPresentationRequest, privateKey: string): SignedPresentationRequest => {
  const proof = createProof(
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
    throw new CustError(400, 'Invalid PresentationRequest options: verifier is required.');
  }

  if (typeof verifier !== 'string') {
    throw new CustError(400, 'Invalid PresentationRequest options: verifier must be a string.');
  }

  if (!holderAppUuid) {
    throw new CustError(400, 'Invalid PresentationRequest options: holderAppUuid is required.');
  }

  if (typeof holderAppUuid !== 'string') {
    throw new CustError(400, 'Invalid PresentationRequest options: holderAppUuid must be a string.');
  }

  if (!credentialRequests) {
    throw new CustError(400, 'Invalid PresentationRequest options: credentialRequests is required.');
  }

  // credentialRequests input element must be an array
  if (!Array.isArray(credentialRequests)) {
    throw new CustError(400, 'Invalid PresentationRequest options: credentialRequests must be an array.');
  }

  const totCredReqs = credentialRequests.length;
  if (totCredReqs === 0) {
    throw new CustError(400, 'Invalid PresentationRequest options: credentialRequests array must not be empty.');
  }

  // credentialRequests input element should have type and issuer elements
  for (let i = 0; i < totCredReqs; i++) {
    const credentialRequest = credentialRequests[i];

    if (!credentialRequest.type) {
      throw new CustError(400, 'Invalid credentialRequest: type is required.');
    }

    if (!credentialRequest.issuers) {
      throw new CustError(400, 'Invalid credentialRequest: issuers is required.');
    }

    // credentialRequests.issuers input element must be an array
    if (!Array.isArray(credentialRequest.issuers)) {
      throw new CustError(400, 'Invalid credentialRequest: issuers must be an array.');
    }

    const totIssuers = credentialRequest.issuers.length;
    if (totIssuers === 0) {
      throw new CustError(400, 'Invalid credentialRequest: issuers array must not be empty.');
    }

    for (const issuer of credentialRequest.issuers) {
      if (typeof issuer !== 'string') {
        throw new CustError(400, 'Invalid issuer: must be a string.');
      }
    }
  }

  // ECC Private Key is mandatory input parameter
  if (!eccPrivateKey) {
    throw new CustError(400, 'Invalid PresentationRequest options: eccPrivateKey is required.');
  }
};

/**
 * Request middleware for sending a PresentationRequest to UnumID's SaaS.
 *
 * Note: handler for /api/sendRequest route
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export const sendRequest = async (req: SendRequestReqType, res: express.Response<PresentationRequestResponse>, next: express.NextFunction): Promise<void> => {
  try {
    const { body, headers: { authorization } } = req;

    requireAuth(authorization);

    // Validate inputs
    validateSendRequestBody(body);

    const unsignedPresentationRequest = constructUnsignedPresentationRequest(body);

    // Create the signed presentation object from the unsignedPresentation object
    const signedPR = constructSignedPresentationRequest(unsignedPresentationRequest, req.body.eccPrivateKey);

    const restData: RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'presentationRequest',
      header: { Authorization: authorization },
      data: signedPR
    };

    const restResp = await makeNetworkRequest<PresentationRequestResponse>(restData);

    // Copy only the required elemnts from the body of the response got from SaaS REST call
    const presentationRequestResponse = restResp.body;

    // Set the X-Auth-Token header alone
    res.setHeader('Content-Type', 'application/json');
    const authToken = restResp.headers['x-auth-token'];

    if (authToken) {
      res.setHeader('x-auth-token', restResp.headers['x-auth-token']);
    }

    res.send(presentationRequestResponse);
  } catch (error) {
    next(error);
  }
};
