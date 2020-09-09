import * as express from 'express';
import * as hlpr from 'library-issuer-verifier-utility';

import { configData } from './config';
import { UnsignedPresentation } from './types';

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

// returns the element names for populating the error.  For all validation methods
// type is given as JSON intentionally, as we need to validate the existance of each and every value.
const checkProofObjIsEntered = (proof: hlpr.JSONObj): string => {
  if (!proof.created || !proof.signatureValue || !proof.type || !proof.verificationMethod || !proof.proofPurpose) {
    return ('created, signatureValue, type, verificationMethod, and / or proofPurpose');
  }

  return ('');
};

const validateCredentialInput = (credential: hlpr.JSONObj): hlpr.JSONObj => {
  const retObj: hlpr.JSONObj = { valStat: true };

  if (!isNotAnEmptyArray(credential)) {
    retObj.valStat = false;
    retObj.msg = 'verifiableCredential element is not an array and / or is empty';

    return (retObj);
  }

  const totCred = credential.length;
  for (let i = 0; i < totCred; i++) {
    const credPosStr = '[' + i + ']';

    // Validate the existance of elements in verifiableCredential object
    if (!credential[i]['@context'] || !credential[i].credentialStatus || !credential[i].credentialSubject ||
        !credential[i].issuer || !credential[i].type || !credential[i].id || !credential[i].issuanceDate || !credential[i].proof) {
      retObj.valStat = false;
      retObj.msg = 'context, credentialStatus, credentialSubject, issuer, type, id, issuanceDate and / or proof element in verifiableCredential' + credPosStr + ' is empty';
      break;
    }

    // Check @context is an array and not empty
    if (!isNotAnEmptyArray(credential[i]['@context'])) {
      retObj.valStat = false;
      retObj.msg = 'context element in verifiableCredential' + credPosStr + ' is not an array and / or is empty';
      break;
    }

    // Check CredentialStatus object is having id and type elements.
    if (!credential[i].credentialStatus.id || !credential[i].credentialStatus.type) {
      retObj.valStat = false;
      retObj.msg = 'id and / or type element in credentialStatus of verifiableCredential' + credPosStr + ' is empty';
      break;
    }

    // Check credentialSubject object is having id element.
    if (!credential[i].credentialSubject.id) {
      retObj.valStat = false;
      retObj.msg = 'id element in credentialSubject of verifiableCredential' + credPosStr + ' is empty';
      break;
    }

    // Check type is an array and not empty
    if (!isNotAnEmptyArray(credential[i].type)) {
      retObj.valStat = false;
      retObj.msg = 'type element in verifiableCredential' + credPosStr + ' is not an array and / or is empty';
      break;
    }

    // Check proof object is having required elements
    const msg = checkProofObjIsEntered(credential[i].proof);
    // Non empty string indicates that one of the element is not present
    if (msg) {
      retObj.valStat = false;
      retObj.msg = msg + ' in proof element of verifiableCredential' + credPosStr + ' is empty';
      break;
    }
  }

  return (retObj);
};

const validateInParams = (req: express.Request, authToken: string): UnsignedPresentation => {
  const context = req.body['@context'];
  const { type, verifiableCredential, proof, presentationRequestUuid } = req.body;
  let retObj: hlpr.JSONObj = {};

  // First level input element validation
  if (!context || !type || !verifiableCredential || !proof || !presentationRequestUuid) {
    throw new hlpr.CustError(404, 'Missing required context, type, verifiableCredential, proof and/or presentationRequestUuid');
  }

  if (!isNotAnEmptyArray(context)) {
    throw new hlpr.CustError(404, 'context element is not an array and / or is empty');
  }

  if (!isNotAnEmptyArray(type)) {
    throw new hlpr.CustError(404, 'type element is not an array and / or is empty');
  }

  retObj = validateCredentialInput(verifiableCredential);
  if (!retObj.valStat) {
    throw new hlpr.CustError(404, retObj.msg);
  }

  // Check proof object is having required elements
  const msg = checkProofObjIsEntered(proof);
  // Non empty string indicates that one of the element is not present
  if (msg) {
    throw new hlpr.CustError(404, msg + ' of proof element is empty');
  }

  // x-auth-token is mandatory
  if (!authToken) {
    throw new hlpr.CustError(401, 'Request not authenticated');
  }

  return ({
    '@context': context,
    type,
    verifiableCredential,
    presentationRequestUuid
  });
};

export const verifyPresentation = async (req: express.Request, res: express.Response, next: any): Promise<void> => {
  try {
    const authToken: string = req.headers['x-auth-token'] as string;
    // Validate input Object
    const data: UnsignedPresentation = validateInParams(req, authToken);

    const proof: hlpr.Proof = req.body.proof;
    // Get the key info for verification from the did (req.body.proof.verificationMethod) with key type as 'secp256r1'
    const pubKeyObj: hlpr.PublicKeyInfo[] = await hlpr.getKeyFromDIDDoc(configData.SaaSUrl, authToken, proof.verificationMethod, 'secp256r1');
    if (pubKeyObj.length === 0) {
      throw new hlpr.CustError(401, 'Public key not found for the DID');
    }

    // Verify the data given.  As of now only one secp256r1 public key is expected.
    // In future, there is a possibility that, more than one secp256r1 public key can be there for a given DID.
    // The same scenario would be handled later.
    // verifiableCredential is an array.  As of now we are verifying the entire credential object together.  We will have to modify
    // this logic to verify each credential present separately.  We can take this up later.
    const verifiedStatus: boolean = hlpr.doVerify(proof.signatureValue, data, pubKeyObj[0].publicKey, pubKeyObj[0].encoding);

    // Set the X-Auth-Token header alone
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('x-auth-token', authToken);

    res.send({ verifiedStatus: verifiedStatus });
  } catch (error) {
    next(error);
  }
};
