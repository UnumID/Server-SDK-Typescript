
import { omit } from 'lodash';

import { UnumDto, VerifiedStatus } from '../types';
import { validateProof } from './validateProof';
import { configData } from '../config';
import { requireAuth } from '../requireAuth';
import logger from '../logger';
import { CustError } from '../utils/error';
import { isArrayEmpty, isArrayNotEmpty } from '../utils/helpers';
import { handleAuthTokenHeader } from '../utils/networkRequestHelper';
import { doVerify } from '../utils/verify';
import { PresentationPb, UnsignedPresentationPb } from '@unumid/types';
import { getDIDDoc, getKeysFromDIDDoc } from '../utils/didHelper';
import { sendPresentationVerifiedReceipt } from './sendPresentationVerifiedReceipt';

/**
 * Validates the NoPresentation type to ensure the necessary attributes.
 * @param noPresentation NoPresentation
 */
export const validateNoPresentationParams = (noPresentation: PresentationPb): PresentationPb => {
  const {
    type,
    proof,
    presentationRequestId,
    verifiableCredential,
    verifierDid
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

  if (!verifierDid) {
    throw new CustError(400, 'Invalid Presentation: verifierDid is required.');
  }

  if (!presentationRequestId) {
    throw new CustError(400, 'Invalid Presentation: presentationRequestId is required.');
  }

  if (typeof presentationRequestId !== 'string') {
    throw new CustError(400, 'Invalid presentationRequestId: must be a string.');
  }

  if (verifiableCredential && isArrayNotEmpty(verifiableCredential)) {
    throw new CustError(400, 'Invalid Declined Presentation: verifiableCredential must be undefined or empty.'); // this should never happen base on upstream logic
  }

  validateProof(proof);

  return noPresentation;
};

/**
 * Handler for when a user does not agree to share the information in the credential request.
 * @param authorization
 * @param noPresentation
 * @param verifier
 */
export const verifyNoPresentationHelper = async (authorization: string, noPresentation: PresentationPb, verifier: string, requestUuid: string): Promise<UnumDto<VerifiedStatus>> => {
  try {
    requireAuth(authorization);

    noPresentation = validateNoPresentationParams(noPresentation);

    if (!noPresentation.proof) {
      throw new CustError(400, 'Invalid Presentation: proof is required.');
    }

    const { proof: { verificationMethod, signatureValue }, verifierDid } = noPresentation;

    // validate that the verifier did provided matches the verifier did in the presentation
    if (verifierDid !== verifier) {
      const message = `The presentation was meant for verifier, ${verifierDid}, not the provided verifier, ${verifier}.`;

      // send PresentationVerified receipt
      const authToken = await sendPresentationVerifiedReceipt(authorization, verifier, noPresentation.proof.verificationMethod, 'declined', false, noPresentation.presentationRequestId, requestUuid, message);

      const result: UnumDto<VerifiedStatus> = {
        authToken,
        body: {
          isVerified: false,
          message
        }
      };
      return result;
    }

    const didDocumentResponse = await getDIDDoc(configData.SaaSUrl, authorization as string, verificationMethod);

    if (didDocumentResponse instanceof Error) {
      throw didDocumentResponse;
    }

    let authToken: string = handleAuthTokenHeader(didDocumentResponse, authorization);
    const publicKeyInfos = getKeysFromDIDDoc(didDocumentResponse.body, 'secp256r1');

    // TODO update DID
    const { publicKey, encoding } = publicKeyInfos[0];

    // remove the proof attribute
    const unsignedNoPresentation: UnsignedPresentationPb = omit(noPresentation, 'proof');

    // create byte array from protobuf helpers
    const bytes = UnsignedPresentationPb.encode(unsignedNoPresentation).finish();

    // verify the signature
    const isVerified = doVerify(signatureValue, bytes, publicKey, encoding);

    const message = isVerified ? undefined : 'Presentation signature can not be verified.'; // the receipt reason, only populated if not verified

    authToken = await sendPresentationVerifiedReceipt(authToken, verifier, noPresentation.proof.verificationMethod, 'declined', isVerified, noPresentation.presentationRequestId, requestUuid, message);

    const result: UnumDto<VerifiedStatus> = {
      authToken,
      body: {
        isVerified,
        message
      }
    };

    return result;
  } catch (e) {
    logger.error(`Error handling a declined presentation verification. Error ${e}`);
    throw e;
  }
};
