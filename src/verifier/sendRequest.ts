import { configData } from '../config';
import { requireAuth } from '../requireAuth';
import { CryptoError } from '@unumid/library-crypto';
import { PresentationRequestPostDto as PresentationRequestPostDtoDeprecatedV2, UnsignedPresentationRequest as UnsignedPresentationRequestDeprecatedV2, SignedPresentationRequest as SignedPresentationRequestDeprecatedV2, Proof } from '@unumid/types-v2';
import { CredentialRequest, PresentationRequestPostDto, UnsignedPresentationRequestPb, PresentationRequestPb, ProofPb, SignedPresentationRequest, CredentialRequestPb } from '@unumid/types';

import { RESTData, SendRequestReqBody, UnumDto } from '../types';
import logger from '../logger';
import { createProof, createProofPb } from '../utils/createProof';
import { getUUID } from '../utils/helpers';
import { makeNetworkRequest, handleAuthTokenHeader } from '../utils/networkRequestHelper';
import { CustError } from '../utils/error';

/**
 * Constructs an unsigned PresentationRequest from the incoming request body.
 * @param reqBody SendRequestReqBody
 */
export const constructUnsignedPresentationRequest = (reqBody: SendRequestReqBody, version: string): UnsignedPresentationRequestPb => {
  const {
    verifier,
    holderAppUuid,
    credentialRequests,
    metadata,
    expiresAt,
    createdAt,
    updatedAt,
    id
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
    metadata: metadata || { fields: {} }, // fields is necessary for the protobuf Struct definition
    uuid,
    id,
    verifier,
    version
  };
};

/**
 * Signs an unsigned PresentationRequest and attaches the resulting Proof
 * @param unsignedPresentationRequest UnsignedPresentationRequest
 * @param privateKey String
 */
export const constructSignedPresentationRequestDeprecatedV2 = (unsignedPresentationRequest: UnsignedPresentationRequestDeprecatedV2, privateKey: string): SignedPresentationRequestDeprecatedV2 => {
  try {
    const proof: Proof = createProof(
      unsignedPresentationRequest,
      privateKey,
      unsignedPresentationRequest.verifier,
      'pem'
    );

    const signedPresentationRequest: SignedPresentationRequestDeprecatedV2 = {
      ...unsignedPresentationRequest,
      proof: proof
    };

    return signedPresentationRequest;
  } catch (e) {
    if (e instanceof CryptoError) {
      logger.error(`Issue in the crypto lib while creating presentation request ${unsignedPresentationRequest.uuid} proof`, e);
    } else {
      logger.error(`Issue while creating presentation request ${unsignedPresentationRequest.uuid} proof`, e);
    }

    throw e;
  }
};

/**
 * Signs an unsigned PresentationRequest and attaches the resulting Proof
 * @param unsignedPresentationRequest UnsignedPresentationRequest
 * @param privateKey String
 */
export const constructSignedPresentationRequest = (unsignedPresentationRequest: UnsignedPresentationRequestPb, privateKey: string): PresentationRequestPb => {
  try {
    // convert the protobuf to a byte array
    const bytes: Uint8Array = UnsignedPresentationRequestPb.encode(unsignedPresentationRequest).finish();

    const proof: ProofPb = createProofPb(
      bytes,
      privateKey,
      unsignedPresentationRequest.verifier,
      'pem'
    );

    const signedPresentationRequest: PresentationRequestPb = {
      ...unsignedPresentationRequest,
      proof: proof
    };

    return signedPresentationRequest;
  } catch (e) {
    if (e instanceof CryptoError) {
      logger.error(`Issue in the crypto lib while creating presentation request ${unsignedPresentationRequest.uuid} proof`, e);
    } else {
      logger.error(`Issue while creating presentation request ${unsignedPresentationRequest.uuid} proof`, e);
    }

    throw e;
  }
};

// validates incoming request body
const validateSendRequestBody = (sendRequestBody: SendRequestReqBody): SendRequestReqBody => {
  const {
    verifier,
    credentialRequests,
    eccPrivateKey,
    holderAppUuid,
    metadata,
    id
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
        throw new CustError(400, 'Invalid credentialRequest: issuers array element must be a string.');
      }
    }
  }

  // ECC Private Key is mandatory input parameter
  if (!eccPrivateKey) {
    throw new CustError(400, 'Invalid PresentationRequest options: signingPrivateKey is required.');
  }

  // Ensure that metadata object is keyed on fields for Struct protobuf definition
  if (!metadata) {
    sendRequestBody.metadata = {
      fields: {}
    };
  } else if (metadata && !metadata.fields) {
    logger.debug('Adding the root \'fields\' key to the presentation request metadata.');
    sendRequestBody.metadata = {
      fields: sendRequestBody.metadata
    };
  }

  if (!id) {
    throw new CustError(400, 'Invalid PresentationRequest options: id is required.');
  }

  return sendRequestBody;
};

// validates incoming request body
const validateSendRequestBodyDeprecated = (sendRequestBody: SendRequestReqBody): SendRequestReqBody => {
  const {
    verifier,
    credentialRequests,
    eccPrivateKey,
    holderAppUuid,
    metadata,
    id
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
        throw new CustError(400, 'Invalid credentialRequest: issuers array element must be a string.');
      }
    }
  }

  // ECC Private Key is mandatory input parameter
  if (!eccPrivateKey) {
    throw new CustError(400, 'Invalid PresentationRequest options: signingPrivateKey is required.');
  }

  // Ensure that metadata object is keyed on fields for Struct protobuf definition
  if (!metadata) {
    sendRequestBody.metadata = {
      fields: {}
    };
  }

  if (!id) {
    throw new CustError(400, 'Invalid PresentationRequest options: id is required.');
  }

  return sendRequestBody;
};

/**
 * Handler for sending a PresentationRequest to UnumID's SaaS.
 * Middleware function where one can add requests of multiple versions to be encrypted and stored in the SaaS db for versioning needs.
 * @param authorization
 * @param verifier
 * @param credentialRequests
 * @param eccPrivateKey
 * @param holderAppUuid
 */
export const sendRequest = async (
  authorization:string,
  verifier: string,
  credentialRequests: CredentialRequestPb[] | CredentialRequest[],
  eccPrivateKey: string,
  holderAppUuid: string,
  expirationDate?: Date,
  metadata?: Record<string, unknown>
): Promise<UnumDto<PresentationRequestPostDto>> => {
  // create an indentifier that ties together these related requests of different versions.
  const id = getUUID();

  // create and send a v2 presentation request for backwards compatibility
  const responseV2 = await sendRequestDeprecated(authorization, verifier, credentialRequests, eccPrivateKey, holderAppUuid, id, expirationDate, metadata);
  authorization = responseV2.authToken ? responseV2.authToken : authorization;

  const response = sendRequestV3(authorization, verifier, credentialRequests, eccPrivateKey, holderAppUuid, id, expirationDate, metadata);
  return response;
};

/**
 * Handler for sending a PresentationRequest to UnumID's SaaS.
 * @param authorization
 * @param verifier
 * @param credentialRequests
 * @param eccPrivateKey
 * @param holderAppUuid
 */
export const sendRequestV3 = async (
  authorization:string,
  verifier: string,
  credentialRequests: CredentialRequestPb[],
  eccPrivateKey: string,
  holderAppUuid: string,
  id: string,
  expirationDate?: Date,
  metadata?: Record<string, unknown>
): Promise<UnumDto<PresentationRequestPostDto>> => {
  try {
    requireAuth(authorization);

    let body: SendRequestReqBody = { verifier, credentialRequests, eccPrivateKey, holderAppUuid, expiresAt: expirationDate, metadata, id };

    // Validate inputs
    body = validateSendRequestBody(body);

    const unsignedPresentationRequest = constructUnsignedPresentationRequest(body, '3.0.0');

    // Create the signed presentation object from the unsignedPresentation object
    const signedPR: PresentationRequestPb = constructSignedPresentationRequest(unsignedPresentationRequest, eccPrivateKey);

    const restData: RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'presentationRequest',
      header: { Authorization: authorization, version: '3.0.0' },
      data: signedPR
    };

    const restResp = await makeNetworkRequest<PresentationRequestPostDto>(restData);

    const authToken: string = handleAuthTokenHeader(restResp, authorization);

    const presentationRequestResponse: UnumDto<PresentationRequestPostDto> = { body: { ...restResp.body }, authToken };

    return presentationRequestResponse;
  } catch (error) {
    logger.error(`Error sending request to use UnumID Saas. ${error}`);
    throw error;
  }
};

/**
 * Handler for sending a PresentationRequest to UnumID's SaaS.
 * @param authorization
 * @param verifier
 * @param credentialRequests
 * @param eccPrivateKey
 * @param holderAppUuid
 */
export const sendRequestDeprecated = async (
  authorization:string,
  verifier: string,
  credentialRequests: CredentialRequest[],
  eccPrivateKey: string,
  holderAppUuid: string,
  id: string,
  expirationDate?: Date,
  metadata?: Record<string, unknown>
): Promise<UnumDto<PresentationRequestPostDtoDeprecatedV2>> => {
  try {
    requireAuth(authorization);

    const body: SendRequestReqBody = { verifier, credentialRequests, eccPrivateKey, holderAppUuid, expiresAt: expirationDate, metadata, id };

    // Validate inputs
    validateSendRequestBodyDeprecated(body);

    const unsignedPresentationRequest: UnsignedPresentationRequestDeprecatedV2 = constructUnsignedPresentationRequest(body, '2.0.0');

    // Create the signed presentation object from the unsignedPresentation object
    const signedPR = constructSignedPresentationRequestDeprecatedV2(unsignedPresentationRequest, eccPrivateKey);

    const restData: RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'presentationRequest',
      header: { Authorization: authorization, version: '2.0.0' },
      data: signedPR
    };

    const restResp = await makeNetworkRequest<PresentationRequestPostDto>(restData);

    const authToken: string = handleAuthTokenHeader(restResp, authorization);

    const presentationRequestResponse: UnumDto<PresentationRequestPostDto> = { body: { ...restResp.body }, authToken };

    return presentationRequestResponse as UnumDto<PresentationRequestPostDtoDeprecatedV2>;
  } catch (error) {
    logger.error(`Error sending request to use UnumID Saas. ${error}`);
    throw error;
  }
};
