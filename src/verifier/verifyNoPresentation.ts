import {
  CustError,
  getKeyFromDIDDoc,
  doVerify,
  getDIDDoc,
  makeNetworkRequest,
  RESTData,
  JSONObj,
  isArrayEmpty,
  handleAuthToken
} from 'library-issuer-verifier-utility';
import { omit } from 'lodash';

import { NoPresentation, Receipt, VerifierDto } from '../types';
import { validateProof } from './validateProof';
import { configData } from '../config';
import { requireAuth } from '../requireAuth';
import logger from '../logger';

/**
 * Validates the NoPresentation type to ensure the necessary attributes.
 * @param noPresentation NoPresentation
 */
export const validateNoPresentationParams = (noPresentation: NoPresentation): void => {
  const {
    type,
    holder,
    proof,
    presentationRequestUuid
  } = noPresentation;

  if (!type) {
    throw new CustError(400, 'Invalid Presentation: type is required.');
  }

  if (isArrayEmpty(type)) {
    throw new CustError(400, 'Invalid Presentation: type must be a non-empty array.');
  }

  if (!proof) {
    throw new CustError(400, 'Invalid Presentation: proof is required.');
  }

  if (!holder) {
    throw new CustError(400, 'Invalid Presentation: holder is required.');
  }

  if (!presentationRequestUuid) {
    throw new CustError(400, 'Invalid Presentation: presentationRequestUuid is required.');
  }

  if (type[0] !== 'NoPresentation') {
    throw new CustError(400, 'Invalid type: first element must be \'NoPresentation\'.');
  }

  if (typeof holder !== 'string') {
    throw new CustError(400, 'Invalid holder: must be a string.');
  }

  if (typeof presentationRequestUuid !== 'string') {
    throw new CustError(400, 'Invalid presentationRequestUuid: must be a string.');
  }

  validateProof(proof);
};

/**
 * Handler for when a user does not agree to share the information in the credential request.
 * @param authorization
 * @param noPresentation
 * @param verifier
 */
export const verifyNoPresentation = async (authorization: string, noPresentation: NoPresentation, verifier: string): Promise<VerifierDto<Receipt>> => {
  try {
    requireAuth(authorization);

    validateNoPresentationParams(noPresentation);

    const { proof: { verificationMethod, signatureValue } } = noPresentation;

    const didDocumentResponse = await getDIDDoc(configData.SaaSUrl, authorization as string, verificationMethod);

    if (didDocumentResponse instanceof Error) {
      throw didDocumentResponse;
    }

    const publicKeyInfos = getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');

    const { publicKey, encoding } = publicKeyInfos[0];

    const unsignedNoPresentation = omit(noPresentation, 'proof');

    const isVerified = doVerify(signatureValue, unsignedNoPresentation, publicKey, encoding);

    const receiptOptions = {
      type: noPresentation.type,
      verifier,
      subject: noPresentation.holder,
      data: {
        isVerified
      }
    };

    const receiptCallOptions: RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'receipt',
      header: { Authorization: authorization },
      data: receiptOptions
    };

    const resp: JSONObj = await makeNetworkRequest<JSONObj>(receiptCallOptions);

    const authToken: string = handleAuthToken(resp);

    const result: VerifierDto<Receipt> = {
      authToken,
      body: {
        uuid: resp.body.uuid,
        createdAt: resp.body.createdAt,
        updatedAt: resp.body.updatedAt,
        type: resp.body.type,
        subject: resp.body.subject,
        issuer: resp.body.issuer,
        isVerified
      }
    };

    return result;
  } catch (e) {
    logger.error(`Error sending a verifyNoPresentation request to UnumID Saas. Error ${e}`);
    throw e;
  }
};
