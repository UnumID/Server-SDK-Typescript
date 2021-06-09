import { omit } from 'lodash';

import { configData } from '../config';
import { CredentialStatusInfo, RESTData, UnumDto, VerifiedStatus } from '../types';
import { Presentation, Credential, CredentialRequest, Proof, PublicKeyInfo, JSONObj, CredentialSubject } from '@unumid/types';
import { validateProof } from './validateProof';
import { requireAuth } from '../requireAuth';
import { verifyCredential } from './verifyCredential';
import { isCredentialExpired } from './isCredentialExpired';
import { checkCredentialStatus } from './checkCredentialStatus';
import logger from '../logger';
import { CryptoError } from '@unumid/library-crypto';
import { isArrayEmpty, isArrayNotEmpty } from '../utils/helpers';
import { CustError } from '../utils/error';
import { getDIDDoc, getKeyFromDIDDoc } from '../utils/didHelper';
import { handleAuthToken, makeNetworkRequest } from '../utils/networkRequestHelper';
import { doVerify } from '../utils/verify';
import { convertCredentialSubject } from '../utils/convertCredentialSubject';

/**
 * Validates the attributes for a credential request to UnumID's SaaS.
 * @param credentials JSONObj
 */
const validateCredentialInput = (credentials: JSONObj): JSONObj => {
  const retObj: JSONObj = { valid: true, stringifiedCredentials: false, resultantCredentials: [] };

  if (isArrayEmpty(credentials)) {
    retObj.valid = false;
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

    // Validate the existence of elements in Credential object
    const invalidMsg = `Invalid verifiableCredential${credPosStr}:`;
    if (!credential['@context']) {
      retObj.valid = false;
      retObj.msg = `${invalidMsg} @context is required.`;
      break;
    }

    if (!credential.credentialStatus) {
      retObj.valid = false;
      retObj.msg = `${invalidMsg} credentialStatus is required.`;
      break;
    }

    if (!credential.credentialSubject) {
      retObj.valid = false;
      retObj.msg = `${invalidMsg} credentialSubject is required.`;
      break;
    }

    if (!credential.issuer) {
      retObj.valid = false;
      retObj.msg = `${invalidMsg} issuer is required.`;
      break;
    }

    if (!credential.type) {
      retObj.valid = false;
      retObj.msg = `${invalidMsg} type is required.`;
      break;
    }

    if (!credential.id) {
      retObj.valid = false;
      retObj.msg = `${invalidMsg} id is required.`;
      break;
    }

    if (!credential.issuanceDate) {
      retObj.valid = false;
      retObj.msg = `${invalidMsg} issuanceDate is required.`;
      break;
    }

    if (!credential.proof) {
      retObj.valid = false;
      retObj.msg = `${invalidMsg} proof is required.`;
      break;
    }

    // Check @context is an array and not empty
    if (isArrayEmpty(credential['@context'])) {
      retObj.valid = false;
      retObj.msg = `${invalidMsg} @context must be a non-empty array.`;
      break;
    }

    // Check CredentialStatus object has id and type elements.
    if (!credential.credentialStatus.id || !credential.credentialStatus.type) {
      retObj.valid = false;
      retObj.msg = `${invalidMsg} credentialStatus must contain id and type properties.`;
      break;
    }

    // Check credentialSubject object has id element.
    const credentialSubject: CredentialSubject = convertCredentialSubject(credential.credentialSubject);
    if (!credentialSubject.id) {
      retObj.valid = false;
      retObj.msg = `${invalidMsg} credentialSubject must contain id property.`;
      break;
    }

    // Check type is an array and not empty
    if (isArrayEmpty(credential.type)) {
      retObj.valid = false;
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
  const { type, verifiableCredential, proof, presentationRequestId, verifierDid } = presentation;
  let retObj: JSONObj = {};

  // validate required fields
  if (!context) {
    throw new CustError(400, 'Invalid Presentation: @context is required.');
  }

  if (!type) {
    throw new CustError(400, 'Invalid Presentation: type is required.');
  }

  if (!proof) {
    throw new CustError(400, 'Invalid Presentation: proof is required.');
  }

  if (!presentationRequestId) {
    throw new CustError(400, 'Invalid Presentation: presentationRequestId is required.');
  }

  if (!verifiableCredential || isArrayEmpty(verifiableCredential)) {
    throw new CustError(400, 'Invalid Presentation: verifiableCredential must be a non-empty array.'); // it should never make it here, ought to be in the NoPresentationHelper
  }

  if (!verifierDid) {
    throw new CustError(400, 'Invalid Presentation: verifierDid is required.');
  }

  if (isArrayEmpty(context)) {
    throw new CustError(400, 'Invalid Presentation: @context must be a non-empty array.');
  }

  if (isArrayEmpty(type)) {
    throw new CustError(400, 'Invalid Presentation: type must be a non-empty array.');
  }

  retObj = validateCredentialInput(verifiableCredential);
  if (!retObj.valid) {
    throw new CustError(400, retObj.msg);
  } else if (retObj.stringifiedCredentials) {
    // adding the "objectified" vc, which were sent in string format to appease iOS variable keyed object limitation: https://developer.apple.com/forums/thread/100417
    presentation.verifiableCredential = retObj.resultantCredentials;
  }

  // Check proof object is formatted correctly
  validateProof(proof);

  return presentation;
};

/**
 * Validates that:
 * a. all requested credentials types are present
 * b. credentials are only from list of required issuers, if the list is present
 * @param presentation Presentation
 * @param credentialRequests CredentialRequest[]
 */
function validatePresentationMeetsRequestedCredentials (presentation: Presentation, credentialRequests: CredentialRequest[]) {
  if (!presentation.verifiableCredential) {
    return; // just skip because this is a declined presentation
  }

  for (const requestedCred of credentialRequests) {
    if (requestedCred.required) {
      // check that the request credential is present in the presentation
      const presentationCreds:Credential[] = presentation.verifiableCredential;
      let found = false;
      for (const presentationCred of presentationCreds) {
        // checking required credential types are presents
        if (presentationCred.type.includes(requestedCred.type)) {
          found = true;
        }

        if (found) {
          // checking required issuers are present
          if (isArrayNotEmpty(requestedCred.issuers) && !requestedCred.issuers.includes(presentationCred.issuer)) {
            const errMessage = `Invalid Presentation: credentials provided did not meet issuer requirements, [${presentationCred.issuer}], per the presentation request, [${requestedCred.issuers}].`;
            logger.warn(errMessage);
            throw new CustError(400, errMessage);
          }

          // can break from inner loop because validation has been met.
          break;
        }
      }

      if (!found) {
        const errMessage = `Invalid Presentation: credentials provided did not meet type requirements, [${presentationCreds.map(pc => pc.type.filter(t => t !== 'VerifiableCredential'))}], per the presentation request, [${credentialRequests.map(cr => cr.type)}].`;
        logger.warn(errMessage);
        throw new CustError(400, errMessage);
      }
    }
  }
}

/**
 * Handler to send information regarding the user agreeing to share a credential Presentation.
 * @param authorization
 * @param presentation
 * @param verifier
 */
export const verifyPresentationHelper = async (authorization: string, presentation: Presentation, verifier: string, credentialRequests?: CredentialRequest[]): Promise<UnumDto<VerifiedStatus>> => {
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

    if (!presentation.verifiableCredential) {
      logger.error('The presentation has undefined verifiableCredential attribute, this should have already be checked.');
      throw new CustError(500, 'presentation as an undefined verifiableCredentials'); // this should have already been checked.
    }

    // validate that the verifier did provided matches the verifier did in the presentation
    if (presentation.verifierDid !== verifier) {
      const result: UnumDto<VerifiedStatus> = {
        authToken: authorization,
        body: {
          isVerified: false,
          message: `The presentation was meant for verifier, ${presentation.verifierDid}, not the provided verifier, ${verifier}.`
        }
      };
      return result;
    }

    // if specific credential requests, then need to confirm the presentation provided meets the requirements
    if (isArrayNotEmpty(credentialRequests)) {
      validatePresentationMeetsRequestedCredentials(presentation, credentialRequests as CredentialRequest[]);
    }

    const proof: Proof = presentation.proof;

    // proof.verificationMethod is the subject's did
    const didDocumentResponse = await getDIDDoc(configData.SaaSUrl, authorization as string, proof.verificationMethod);

    if (didDocumentResponse instanceof Error) {
      throw didDocumentResponse;
    }

    let authToken: string = handleAuthToken(didDocumentResponse, authorization); // Note: going to use authToken instead of authorization for subsequent requests in case saas rolls to token.
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
          message: 'Presentation signature can not be verified'
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

      const isStatusValidResponse: UnumDto<CredentialStatusInfo> = await checkCredentialStatus(authToken, credential.id);
      const isStatusValid = isStatusValidResponse.body.status === 'valid';
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
    const credentialTypes = presentation.verifiableCredential.flatMap(cred => cred.type.slice(1)); // cut off the preceding 'VerifiableCredential' string in each array
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
    authToken = handleAuthToken(resp, authToken);

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
