import * as express from 'express';
import { omit } from 'lodash';

import { configData } from './config';
import { Presentation } from './types';
import { validateProof } from './validateProof';
import { requireAuth } from './requireAuth';
import { verifyCredential } from './verifyCredential';
import { isCredentialExpired } from './isCredentialExpired';
import { checkCredentialStatus } from './checkCredentialStatus';
import { JSONObj, CustError, Proof, getDIDDoc, PublicKeyInfo, getKeyFromDIDDoc, doVerify, RESTData, makeNetworkRequest, isArrayEmpty } from 'library-issuer-verifier-utility';

/**
 * Validates the attributes for a credential request to UnumID's SaaS.
 * @param credentials JSONObj
 */
const validateCredentialInput = (credentials: JSONObj): JSONObj => {
  const retObj: JSONObj = { valStat: true };

  if (isArrayEmpty(credentials)) {
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
    if (isArrayEmpty(credential['@context'])) {
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
    if (isArrayEmpty(credential.type)) {
      retObj.valStat = false;
      retObj.msg = `${invalidMsg} type must be a non-empty array.`;
      break;
    }

    // Check that proof object is valid
    validateProof(credential.proof);
  }

  return (retObj);
};

/**
 * Validates the presentation object has the proper attributes.
 * @param presentation Presentation
 */
const validatePresentation = (presentation: Presentation): void => {
  const context = presentation['@context'];
  const { type, verifiableCredential, proof, presentationRequestUuid } = presentation;
  let retObj: JSONObj = {};

  // validate required fields
  if (!context) {
    throw new CustError(400, 'Invalid Presentation: @context is required.');
  }

  if (!type) {
    throw new CustError(400, 'Invalid Presentation: type is required.');
  }

  if (!verifiableCredential) {
    throw new CustError(400, 'Invalid Presentation: verifiableCredential is required.');
  }

  if (!proof) {
    throw new CustError(400, 'Invalid Presentation: proof is required.');
  }

  if (!presentationRequestUuid) {
    throw new CustError(400, 'Invalid Presentation: presentationRequestUuid is required.');
  }

  if (isArrayEmpty(context)) {
    throw new CustError(400, 'Invalid Presentation: @context must be a non-empty array.');
  }

  if (isArrayEmpty(type)) {
    throw new CustError(400, 'Invalid Presentation: type must be a non-empty array.');
  }

  retObj = validateCredentialInput(verifiableCredential);
  if (!retObj.valStat) {
    throw new CustError(400, retObj.msg);
  }

  // Check proof object is formatted correctly
  validateProof(proof);
};

/**
 * Type to encapsulate the verify presentation request type attributes.
 */
type VerifyPresentationRequestType = express.Request<unknown, { verifiedStatus: boolean }, { presentation: Presentation, verifier: string }>;

/**
 * Request middleware for sending information regarding the user agreeing to share a credential Presentation.
 *
 * Note: The request body is exactly the information sent by the mobile SDK serving the prompt via the deeplink for credential sharing to your application.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export const verifyPresentation = async (req: VerifyPresentationRequestType, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const { authorization } = req.headers;

    requireAuth(authorization);

    // Validate input Object
    const { presentation, verifier } = req.body;

    if (!presentation) {
      throw new CustError(400, 'presentation is required.');
    }

    if (!verifier) {
      throw new CustError(400, 'verifier is required.');
    }

    validatePresentation(presentation);
    const data = omit(presentation, 'proof');

    const proof: Proof = presentation.proof;

    const didDocumentResponse = await getDIDDoc(configData.SaaSUrl, authorization as string, proof.verificationMethod);

    if (didDocumentResponse instanceof Error) {
      throw didDocumentResponse;
    }

    const pubKeyObj: PublicKeyInfo[] = getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');

    if (pubKeyObj.length === 0) {
      throw new CustError(404, 'Public key not found for the DID');
    }

    // Verify the data given.  As of now only one secp256r1 public key is expected.
    // In future, there is a possibility that, more than one secp256r1 public key can be there for a given DID.
    // The same scenario would be handled later.
    // verifiableCredential is an array.  As of now we are verifying the entire credential object together.  We will have to modify
    // this logic to verify each credential present separately.  We can take this up later.
    const isPresentationVerified: boolean = doVerify(proof.signatureValue, data, pubKeyObj[0].publicKey, pubKeyObj[0].encoding);

    let areCredentialsValid = true;

    for (const credential of presentation.verifiableCredential) {
      const isExpired = isCredentialExpired(credential);

      if (isExpired) {
        areCredentialsValid = false;
        break;
      }

      const isStatusValid = await checkCredentialStatus(credential, authorization as string);

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

    const receiptCallOptions: RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'receipt',
      header: { Authorization: authorization },
      data: receiptOptions
    };

    await makeNetworkRequest(receiptCallOptions);

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
