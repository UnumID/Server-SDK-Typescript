import { omit } from 'lodash';

import { configData } from '../config';
import { Presentation, UnumDto, VerifiedStatus } from '../types';
import { validateProof } from './validateProof';
import { requireAuth } from '../requireAuth';
import { verifyCredential } from './verifyCredential';
import { isCredentialExpired } from './isCredentialExpired';
import { checkCredentialStatus } from './checkCredentialStatus';
import { JSONObj, CustError, Proof, getDIDDoc, PublicKeyInfo, getKeyFromDIDDoc, doVerify, RESTData, makeNetworkRequest, isArrayEmpty, handleAuthToken } from '@unumid/library-issuer-verifier-utility';
import logger from '../logger';
import { CryptoError } from '@unumid/library-crypto';

/**
 * Validates the attributes for a credential request to UnumID's SaaS.
 * @param credentials JSONObj
 */
const validateCredentialInput = (credentials: JSONObj): JSONObj => {
  const retObj: JSONObj = { valStat: true, stringifiedCredentials: false, resultantCredentials: [] };

  if (isArrayEmpty(credentials)) {
    retObj.valStat = false;
    retObj.msg = 'Invalid Presentation: verifiableCredential must be a non-empty array.';

    return (retObj);
  }

  const totCred = credentials.length;
  for (let i = 0; i < totCred; i++) {
    const credPosStr = '[' + i + ']';
    let credential = credentials[i];

    if (typeof credential === 'string') {
      retObj.stringifiedCredentials = true; // setting so know to add the object version of the stringified vc's
      credential = JSON.parse(credential);
    }

    // Validate the existence of elements in verifiableCredential object
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

    if (retObj.stringifiedCredentials) {
      // Adding the credential to the result list so can use the fully created objects downstream
      retObj.resultantCredentials.push(credential);
    }
  }

  return (retObj);
};

/**
 * Validates the presentation object has the proper attributes.
 * Returns the fully formed verifiableCredential object list if applicable (if was sent as a stringified object)
 * @param presentation Presentation
 */
const validatePresentation = (presentation: Presentation): Presentation => {
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
  } else if (retObj.stringifiedCredentials) {
    // adding the "objectified" vc, which were sent in string format to appease iOS veriable keyed object limitation: https://developer.apple.com/forums/thread/100417
    presentation.verifiableCredential = retObj.resultantCredentials;
  }

  // Check proof object is formatted correctly
  validateProof(proof);

  return presentation;
};

/**
 * Handler to send information regarding the user agreeing to share a credential Presentation.
 * @param authorization
 * @param presentation
 * @param verifier
 */
export const verifyPresentation = async (authorization: string, presentation: Presentation, verifier: string): Promise<UnumDto<VerifiedStatus>> => {
  try {
    requireAuth(authorization);

    if (!presentation) {
      throw new CustError(400, 'presentation is required.');
    }

    if (!verifier) {
      throw new CustError(400, 'verifier is required.');
    }

    const data = omit(presentation, 'proof'); // Note: important that this data variable is created prior to the validation thanks to validatePresentation taking potentially stringified VerifiableCredentials objects array and converting them to proper objects.
    presentation = validatePresentation(presentation);

    const proof: Proof = presentation.proof;

    // proof.verificationMethod is the subject's did
    const didDocumentResponse = await getDIDDoc(configData.SaaSUrl, authorization as string, proof.verificationMethod);

    if (didDocumentResponse instanceof Error) {
      throw didDocumentResponse;
    }

    let authToken: string = handleAuthToken(didDocumentResponse); // Note: going to use authToken instead of authorization for subsequent requests in case saas rolls to token.
    const pubKeyObj: PublicKeyInfo[] = getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');

    if (pubKeyObj.length === 0) {
      const result: UnumDto<VerifiedStatus> = {
        authToken,
        body: {
          isVerified: false,
          message: 'Public key not found for the DID associated with the proof.verificationMethod'
        }
      };
      return result;
    }

    // Verify the data given.  As of now only one secp256r1 public key is expected.
    // In future, there is a possibility that, more than one secp256r1 public key can be there for a given DID.
    // The same scenario would be handled later.
    // verifiableCredential is an array.  As of now we are verifying the entire credential object together.  We will have to modify
    // this logic to verify each credential present separately.  We can take this up later.
    let isPresentationVerified = false;
    try {
      isPresentationVerified = doVerify(proof.signatureValue, data, pubKeyObj[0].publicKey, pubKeyObj[0].encoding, proof.unsignedValue);
    } catch (e) {
      if (e instanceof CryptoError) {
        logger.error(`CryptoError verifying presentation ${presentation.uuid} signature`, e);
      } else {
        logger.error(`Error verifying presentation ${presentation.uuid} signature`, e);
      }

      // need to return the UnumDto with the (potentially) updated authToken
      const result: UnumDto<VerifiedStatus> = {
        authToken,
        body: {
          isVerified: false,
          message: `Exception verifying presentation signature. ${e.message}`
        }
      };
      return result;
    }

    if (!isPresentationVerified) {
      const result: UnumDto<VerifiedStatus> = {
        authToken,
        body: {
          isVerified: false,
          message: 'Presentation signature can no be verified'
        }
      };
      return result;
    }

    let areCredentialsValid = true;

    for (const credential of presentation.verifiableCredential) {
      const isExpired = isCredentialExpired(credential);

      if (isExpired) {
        areCredentialsValid = false;
        break;
      }

      const isStatusValidResponse: UnumDto<boolean> = await checkCredentialStatus(credential, authToken);
      const isStatusValid = isStatusValidResponse.body;
      authToken = isStatusValidResponse.authToken;

      if (!isStatusValid) {
        areCredentialsValid = false;
        break;
      }

      const isVerifiedResponse: UnumDto<boolean> = await verifyCredential(credential, authToken);
      const isVerified = isVerifiedResponse.body;
      authToken = isVerifiedResponse.authToken;

      if (!isVerified) {
        areCredentialsValid = false;
        break;
      }
    }

    if (!areCredentialsValid) {
      const result: UnumDto<VerifiedStatus> = {
        authToken,
        body: {
          isVerified: false,
          message: 'Credential signature can not be verified.'
        }
      };
      return result;
    }

    const isVerified = isPresentationVerified && areCredentialsValid; // always true if here
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
        isVerified
      }
    };

    const receiptCallOptions: RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'receipt',
      header: { Authorization: authToken },
      data: receiptOptions
    };

    const resp: JSONObj = await makeNetworkRequest<JSONObj>(receiptCallOptions);
    authToken = handleAuthToken(resp);

    const result: UnumDto<VerifiedStatus> = {
      authToken,
      body: {
        isVerified
      }
    };

    return result;
  } catch (error) {
    logger.error('Error sending a verifyPresentation request to UnumID Saas.', error);
    throw error;
  }
};
