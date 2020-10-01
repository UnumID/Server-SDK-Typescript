import { Request, Response, NextFunction } from 'express';
import { CustError, getKeyFromDIDDoc, doVerify, getDIDDoc } from 'library-issuer-verifier-utility';
import { omit } from 'lodash';

import { NoPresentation } from './types';
import { validateProof } from './validateProof';
import { configData } from './config';
import { requireAuth } from './requireAuth';

export const validateNoPresentationParams = (noPresentation: NoPresentation): void => {
  const {
    type,
    holder,
    proof,
    presentationRequestUuid
  } = noPresentation;

  if (!type) {
    throw new CustError(400, 'type is required.');
  }

  if (!proof) {
    throw new CustError(400, 'proof is required.');
  }

  if (!holder) {
    throw new CustError(400, 'holder is required.');
  }

  if (!presentationRequestUuid) {
    throw new CustError(400, 'presentationRequestUuid is required.');
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

  if (!validateProof(proof)) {
    throw new CustError(400, 'Invalid proof.');
  }
};

export const verifyNoPresentation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const noPresentation = req.body;

    const { authorization } = req.headers;

    requireAuth(authorization);

    validateNoPresentationParams(noPresentation);

    const { proof: { verificationMethod, signatureValue } } = noPresentation;

    const didDocumentResponse = await getDIDDoc(configData.SaaSUrl, authorization as string, verificationMethod);
    const publicKeyInfos = getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');

    const { publicKey, encoding } = publicKeyInfos[0];

    const unsignedNoPresentation = omit(noPresentation, 'proof');

    const isVerified = doVerify(signatureValue, unsignedNoPresentation, publicKey, encoding);

    res.setHeader('x-auth-token', didDocumentResponse.headers['x-auth-token']);
    res.send({ isVerified });
  } catch (e) {
    next(e);
  }
};
