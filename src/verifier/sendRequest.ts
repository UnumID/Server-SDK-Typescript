import { configData } from '../config';
import { requireAuth } from '../requireAuth';
import { CryptoError } from '@unumid/library-crypto';
import { CredentialRequest, PresentationRequestPostDto, SignedPresentationRequest, UnsignedPresentationRequest, UnsignedPresentationRequestPb, PresentationRequestPb, ProofPb } from '@unumid/types';

import { RESTData, SendRequestReqBody, UnumDto } from '../types';
import logger from '../logger';
import { createProof, createProofPb } from '../utils/createProof';
import { getUUID } from '../utils/helpers';
import { makeNetworkRequest, handleAuthToken } from '../utils/networkRequestHelper';
import { CustError } from '../utils/error';
import { versionList } from '../utils/versionList';

// /**
//  * Constructs an unsigned PresentationRequest from the incoming request body.
//  * @param reqBody SendRequestReqBody
//  */
// export const constructUnsignedPresentationRequest = (reqBody: SendRequestReqBody): UnsignedPresentationRequest => {
//   const {
//     verifier,
//     holderAppUuid,
//     credentialRequests,
//     metadata,
//     expiresAt,
//     createdAt,
//     updatedAt
//   } = reqBody;

//   const uuid = getUUID();

//   // any/all default values must be set before signing, or signature will always fail to verify
//   const now = new Date();
//   const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
//   const defaultCreatedAt = now;
//   const defaultUpdatedAt = now;
//   const defaultExpiresAt = tenMinutesFromNow;
//   const credentialRequestsWithDefaults = credentialRequests.map(cr => {
//     return cr.required ? cr : { ...cr, required: false };
//   });

//   return {
//     credentialRequests: credentialRequestsWithDefaults,
//     createdAt: createdAt || defaultCreatedAt,
//     updatedAt: updatedAt || defaultUpdatedAt,
//     expiresAt: expiresAt || defaultExpiresAt,
//     holderAppUuid,
//     metadata: metadata || {},
//     uuid,
//     verifier
//   };
// };

/**
 * Constructs an unsigned PresentationRequest from the incoming request body.
 * @param reqBody SendRequestReqBody
 */
export const constructUnsignedPresentationRequest = (reqBody: SendRequestReqBody): UnsignedPresentationRequestPb => {
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

// /**
//  * Signs an unsigned PresentationRequest and attaches the resulting Proof
//  * @param unsignedPresentationRequest UnsignedPresentationRequest
//  * @param privateKey String
//  */
// export const constructSignedPresentationRequest = (unsignedPresentationRequest: UnsignedPresentationRequest, privateKey: string): SignedPresentationRequest => {
//   try {
//     const proof = createProof(
//       unsignedPresentationRequest,
//       privateKey,
//       unsignedPresentationRequest.verifier,
//       'pem'
//     );

//     const signedPresentationRequest = {
//       ...unsignedPresentationRequest,
//       proof: proof
//     };

//     return signedPresentationRequest;
//   } catch (e) {
//     if (e instanceof CryptoError) {
//       logger.error(`Issue in the crypto lib while creating presentation request ${unsignedPresentationRequest.uuid} proof`, e);
//     } else {
//       logger.error(`Issue while creating presentation request ${unsignedPresentationRequest.uuid} proof`, e);
//     }

//     throw e;
//   }
// };

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

    const signedPresentationRequest = {
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
        throw new CustError(400, 'Invalid credentialRequest: issuers array element must be a string.');
      }
    }
  }

  // ECC Private Key is mandatory input parameter
  if (!eccPrivateKey) {
    throw new CustError(400, 'Invalid PresentationRequest options: signingPrivateKey is required.');
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
export const sendRequest = async (
  authorization:string,
  verifier: string,
  credentialRequests: CredentialRequest[],
  eccPrivateKey: string,
  holderAppUuid: string,
  expirationDate?: Date,
  metadata?: Record<string, unknown>
): Promise<UnumDto<PresentationRequestPostDto>> => {
  try {
    requireAuth(authorization);

    const body: SendRequestReqBody = { verifier, credentialRequests, eccPrivateKey, holderAppUuid, expiresAt: expirationDate, metadata };

    // Validate inputs
    validateSendRequestBody(body);

    const unsignedPresentationRequest = constructUnsignedPresentationRequest(body);

    // Create the signed presentation object from the unsignedPresentation object
    const signedPR = constructSignedPresentationRequest(unsignedPresentationRequest, eccPrivateKey);

    const restData: RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'presentationRequest',
      header: { Authorization: authorization, version: versionList[versionList.length - 1] }, // TODO need to setup the saas to handle versioned requests.
      data: signedPR
    };

    const restResp = await makeNetworkRequest<PresentationRequestPostDto>(restData);

    const authToken: string = handleAuthToken(restResp, authorization);

    const presentationRequestResponse: UnumDto<PresentationRequestPostDto> = { body: { ...restResp.body }, authToken };

    return presentationRequestResponse;
  } catch (error) {
    logger.error(`Error sending request to use UnumID Saas. ${error}`);
    throw error;
  }
};
