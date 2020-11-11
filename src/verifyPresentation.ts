import * as express from 'express';
import * as hlpr from 'library-issuer-verifier-utility';
import stringify from 'fast-json-stable-stringify';
import { omit } from 'lodash';

import { configData } from './config';
import { Presentation } from './types';
import { validateProof } from './validateProof';
import { requireAuth } from './requireAuth';
import logger from './logger';
import { verifyCredential } from './verifyCredential';
import { isCredentialExpired } from './isCredentialExpired';
import { checkCredentialStatus } from './checkCredentialStatus';

const isNotAnEmptyArray = (paramValue: any): boolean => {
  if (!Array.isArray(paramValue)) {
    return (false);
  }

  const arrLen = paramValue.length;
  if (arrLen === 0) {
    return (false);
  }

  return (true);
};

const validateCredentialInput = (credentials: hlpr.JSONObj): hlpr.JSONObj => {
  const retObj: hlpr.JSONObj = { valStat: true };

  if (!isNotAnEmptyArray(credentials)) {
    retObj.valStat = false;
    retObj.msg = 'Invalid Presentation: verifiableCredential must be a non-empty array.';

    return (retObj);
  }

  const totCred = credentials.length;
  for (let i = 0; i < totCred; i++) {
    const credPosStr = '[' + i + ']';
    const credential = credentials[i];

    // Validate the existance of elements in verifiableCredential object
    const invalidMsg = `Invalid verifiableCredential${credPosStr}:`;
    if (!credential['@context']) {
      retObj.valStat = false;
      retObj.msg = `${invalidMsg} @context is required.`;
      break;
    }

    if (!credential.credentialStatus) {
      retObj.valStat = false;
      retObj.msg = `${invalidMsg} credentialStatus is required.`;
      break;
    }

    if (!credential.credentialSubject) {
      retObj.valStat = false;
      retObj.msg = `${invalidMsg} credentialSubject is required.`;
      break;
    }

    if (!credential.issuer) {
      retObj.valStat = false;
      retObj.msg = `${invalidMsg} issuer is required.`;
      break;
    }

    if (!credential.type) {
      retObj.valStat = false;
      retObj.msg = `${invalidMsg} type is required.`;
      break;
    }

    if (!credential.id) {
      retObj.valStat = false;
      retObj.msg = `${invalidMsg} id is required.`;
      break;
    }

    if (!credential.issuanceDate) {
      retObj.valStat = false;
      retObj.msg = `${invalidMsg} issuanceDate is required.`;
      break;
    }

    if (!credential.proof) {
      retObj.valStat = false;
      retObj.msg = `${invalidMsg} proof is required.`;
      break;
    }

    // Check @context is an array and not empty
    if (!isNotAnEmptyArray(credential['@context'])) {
      retObj.valStat = false;
      retObj.msg = `${invalidMsg} @context must be a non-empty array.`;
      break;
    }

    // Check CredentialStatus object has id and type elements.
    if (!credential.credentialStatus.id || !credential.credentialStatus.type) {
      retObj.valStat = false;
      retObj.msg = `${invalidMsg} credentialStatus must contain id and type properties.`;
      break;
    }

    // Check credentialSubject object has id element.
    if (!credential.credentialSubject.id) {
      retObj.valStat = false;
      retObj.msg = `${invalidMsg} credentialSubject must contain id property.`;
      break;
    }

    // Check type is an array and not empty
    if (!isNotAnEmptyArray(credential.type)) {
      retObj.valStat = false;
      retObj.msg = `${invalidMsg} type must be a non-empty array.`;
      break;
    }

    // Check that proof object is valid
    validateProof(credential.proof);
  }

  return (retObj);
};

const validatePresentation = (presentation: Presentation): void => {
  const context = presentation['@context'];
  const { type, verifiableCredential, proof, presentationRequestUuid } = presentation;
  let retObj: hlpr.JSONObj = {};

  // validate required fields
  if (!context) {
    throw new hlpr.CustError(400, 'Invalid Presentation: @context is required.');
  }

  if (!type) {
    throw new hlpr.CustError(400, 'Invalid Presentation: type is required.');
  }

  if (!verifiableCredential) {
    throw new hlpr.CustError(400, 'Invalid Presentation: verifiableCredential is required.');
  }

  if (!proof) {
    throw new hlpr.CustError(400, 'Invalid Presentation: proof is required.');
  }

  if (!presentationRequestUuid) {
    throw new hlpr.CustError(400, 'Invalid Presentation: presentationRequestUuid is required.');
  }

  if (!isNotAnEmptyArray(context)) {
    throw new hlpr.CustError(400, 'Invalid Presentation: @context must be a non-empty array.');
  }

  if (!isNotAnEmptyArray(type)) {
    throw new hlpr.CustError(400, 'Invalid Presentation: type must be a non-empty array.');
  }

  retObj = validateCredentialInput(verifiableCredential);
  if (!retObj.valStat) {
    throw new hlpr.CustError(400, retObj.msg);
  }

  // Check proof object is formatted correctly
  validateProof(proof);
};

type VerifyPresentationRequestType = express.Request<unknown, { verifiedStatus: boolean }, { presentation: Presentation, verifier: string }>;
export const verifyPresentation = async (req: VerifyPresentationRequestType, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const { authorization } = req.headers;

    requireAuth(authorization);

    // Validate input Object
    const { presentation, verifier } = req.body;

    if (!presentation) {
      throw new hlpr.CustError(400, 'presentation is required.');
    }

    if (!verifier) {
      throw new hlpr.CustError(400, 'verifier is required.');
    }

    validatePresentation(presentation);
    const data = omit(presentation, 'proof');

    const proof: hlpr.Proof = presentation.proof;

    const didDocumentResponse = await hlpr.getDIDDoc(configData.SaaSUrl, authorization as string, proof.verificationMethod);
    const pubKeyObj: hlpr.PublicKeyInfo[] = hlpr.getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');

    if (pubKeyObj.length === 0) {
      throw new hlpr.CustError(401, 'Public key not found for the DID');
    }

    // Verify the data given.  As of now only one secp256r1 public key is expected.
    // In future, there is a possibility that, more than one secp256r1 public key can be there for a given DID.
    // The same scenario would be handled later.
    // verifiableCredential is an array.  As of now we are verifying the entire credential object together.  We will have to modify
    // this logic to verify each credential present separately.  We can take this up later.
    const isPresentationVerified: boolean = hlpr.doVerify(proof.signatureValue, data, pubKeyObj[0].publicKey, pubKeyObj[0].encoding);

    let areCredentialsValid = true;

    for (const credential of presentation.verifiableCredential) {
      const isExpired = isCredentialExpired(credential);

      if (isExpired) {
        areCredentialsValid = false;
        break;
      }

      const isStatusValid = await checkCredentialStatus(credential);

      if (!isStatusValid) {
        areCredentialsValid = false;
        break;
      }

      const isVerified = await verifyCredential(credential, authorization as string);
      if (!isVerified) {
        areCredentialsValid = false;
        break;
      }
    }

    const verifiedStatus = isPresentationVerified && areCredentialsValid;

    const credentialTypes = presentation.verifiableCredential.flatMap(cred => cred.type.slice(1));
    const issuers = presentation.verifiableCredential.map(cred => cred.issuer);
    const subject = proof.verificationMethod;
    const receiptOptions = {
      type: ['PresentationVerified'],
      verifier,
      subject,
      data: {
        credentialTypes,
        issuers,
        isVerified: verifiedStatus
      }
    };

    const receiptCallOptions: hlpr.RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'receipt',
      header: { Authorization: authorization },
      data: receiptOptions
    };

    await hlpr.makeRESTCall(receiptCallOptions);

    // Set the X-Auth-Token header alone
    res.setHeader('Content-Type', 'application/json');
    const authToken = didDocumentResponse.headers['x-auth-token'];

    if (authToken) {
      res.setHeader('x-auth-token', didDocumentResponse.headers['x-auth-token']);
    }

    res.send({ verifiedStatus: verifiedStatus });
  } catch (error) {
    next(error);
  }
};
