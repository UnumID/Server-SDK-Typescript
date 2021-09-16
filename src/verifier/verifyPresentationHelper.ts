import { omit } from 'lodash';

import { configData } from '../config';
import { CredentialStatusInfo, RESTData, UnumDto, VerifiedStatus } from '../types';
import { Presentation, Credential, CredentialRequest, Proof, PublicKeyInfo, JSONObj, PresentationPb, CredentialPb, ProofPb, UnsignedPresentationPb, CredentialSubject } from '@unumid/types';
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
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';
import { doVerify } from '../utils/verify';
import { convertCredentialSubject } from '../utils/convertCredentialSubject';

/**
 * Validates the attributes for a credential from UnumId's Saas
 * @param credentials JSONObj
 */
// TODO return a VerifiedStatus type with additional any array for passing back the type conforming objects
const validateCredentialInput = (credentials: CredentialPb[]): JSONObj => {
  const retObj: JSONObj = { valid: true, stringifiedDates: false, resultantCredentials: [] };

  if (isArrayEmpty(credentials)) {
    retObj.valid = false;
    retObj.msg = 'Invalid Presentation: verifiableCredential must be a non-empty array.';

    return (retObj);
  }

  const totCred = credentials.length;
  for (let i = 0; i < totCred; i++) {
    const credPosStr = '[' + i + ']';
    const credential = credentials[i];

    // Validate the existence of elements in Credential object
    const invalidMsg = `Invalid verifiableCredential${credPosStr}:`;
    if (!credential.context) {
      retObj.valid = false;
      retObj.msg = `${invalidMsg} context is required.`;
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

    // HACK ALERT: Handling converting string dates to Date. Note: only needed for now when using Protos with Date attributes
    // when we move to full grpc this will not be needed because not longer using json.
    if (typeof credential.expirationDate === 'string') {
      retObj.stringifiedDates = true;
      credential.issuanceDate = new Date(credential.issuanceDate);
    }

    if (typeof credential.expirationDate === 'string') {
      retObj.stringifiedDates = true;
      credential.expirationDate = new Date(credential.expirationDate);
    }

    if (!credential.proof) {
      retObj.valid = false;
      retObj.msg = `${invalidMsg} proof is required.`;
      break;
    }

    // Check @context is an array and not empty
    if (isArrayEmpty(credential.context)) {
      retObj.valid = false;
      retObj.msg = `${invalidMsg} context must be a non-empty array.`;
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
    credential.proof = validateProof(credential.proof);

    // HACK ALERT continued: this is assuming that if one credential date attribute is a string then all of them are.
    // this resultantCredentials array is then take the place of the creds in the presentation
    if (retObj.stringifiedDates) {
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
const validatePresentation = (presentation: PresentationPb): PresentationPb => {
  const { type, verifiableCredential, proof, presentationRequestId, verifierDid, context } = presentation;
  let retObj: JSONObj = {};

  // validate required fields
  if (!context) {
    throw new CustError(400, 'Invalid Presentation: context is required.');
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
    throw new CustError(400, 'Invalid Presentation: context must be a non-empty array.');
  }

  if (isArrayEmpty(type)) {
    throw new CustError(400, 'Invalid Presentation: type must be a non-empty array.');
  }

  if (type[0] !== 'VerifiablePresentation') {
    throw new CustError(400, 'Invalid Presentation: type\'s first array element must be VerifiablePresentation.');
  }

  retObj = validateCredentialInput(verifiableCredential);
  if (!retObj.valid) {
    throw new CustError(400, retObj.msg);
  } else if (retObj.stringifiedDates) {
    // adding the credentials, which which now have the proper date attributes, Date for proto encoding for signature verification.
    presentation.verifiableCredential = retObj.resultantCredentials;
  }

  // Check proof object is formatted correctly
  presentation.proof = validateProof(proof);

  return presentation;
};

/**
 * Validates that:
 * a. all requested credentials types are present
 * b. credentials are only from list of required issuers, if the list is present
 * @param presentation Presentation
 * @param credentialRequests CredentialRequest[]
 */
function validatePresentationMeetsRequestedCredentials (presentation: PresentationPb, credentialRequests: CredentialRequest[]) {
  if (!presentation.verifiableCredential) {
    return; // just skip because this is a declined presentation
  }

  for (const requestedCred of credentialRequests) {
    if (requestedCred.required) {
      // check that the request credential is present in the presentation
      const presentationCreds:CredentialPb[] = presentation.verifiableCredential;
      let found = false;
      for (const presentationCred of presentationCreds) {
        // checking required credential types are present
        if (presentationCred.type.includes(requestedCred.type)) {
          found = true;
        }

        if (found) {
          // checking required issuers are present
          if (isArrayNotEmpty(requestedCred.issuers) && !requestedCred.issuers.includes(presentationCred.issuer)) {
            const errMessage = `Invalid Presentation: credentials provided did not meet issuer requirements. Issuers requested: [${requestedCred.issuers}]. Issuer of the credential received: [${presentationCred.issuer}].`;
            logger.warn(errMessage);
            throw new CustError(400, errMessage);
          }

          // can break from inner loop because validation has been met.
          break;
        }
      }

      if (!found) {
        const errMessage = `Invalid Presentation: credentials provided did not meet type requirements. Presented credentials: [${presentationCreds.map(pc => pc.type.filter(t => t !== 'VerifiableCredential'))}]. Requested credentials: [${credentialRequests.map(cr => cr.type)}].`;
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
export const verifyPresentationHelper = async (authorization: string, presentation: PresentationPb, verifier: string, credentialRequests?: CredentialRequest[]): Promise<UnumDto<VerifiedStatus>> => {
  try {
    requireAuth(authorization);

    if (!presentation) {
      throw new CustError(400, 'presentation is required.');
    }

    if (!verifier) {
      throw new CustError(400, 'verifier is required.');
    }

    // Note: important that this data variable is created prior to the validation thanks to validatePresentation taking potentially stringified VerifiableCredentials objects array and converting them to proper objects.
    const data: UnsignedPresentationPb = omit(presentation, 'proof');
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

    if (!presentation.proof) {
      throw new CustError(400, 'presentation proof is required.');
    }

    const proof: ProofPb = presentation.proof;

    // proof.verificationMethod is the subject's did
    const didDocumentResponse = await getDIDDoc(configData.SaaSUrl, authorization as string, proof.verificationMethod);

    if (didDocumentResponse instanceof Error) {
      throw didDocumentResponse;
    }

    let authToken: string = handleAuthTokenHeader(didDocumentResponse, authorization); // Note: going to use authToken instead of authorization for subsequent requests in case saas rolls to token.
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
      // create byte array from protobuf helpers
      const bytes = UnsignedPresentationPb.encode(data).finish();

      // verify the signature
      isPresentationVerified = doVerify(proof.signatureValue, bytes, pubKeyObj[0].publicKey, pubKeyObj[0].encoding);
    } catch (e) {
      if (e instanceof CryptoError) {
        logger.error(`CryptoError verifying presentation ${JSON.stringify(presentation)} signature`, e);
      } else {
        logger.error(`Error verifying presentation ${JSON.stringify(presentation)} signature`, e);
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
        isVerified,
        reply: 'approved'
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
    authToken = handleAuthTokenHeader(resp, authToken);

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
