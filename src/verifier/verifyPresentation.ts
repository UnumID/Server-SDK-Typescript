
import { DecryptedPresentation, UnumDto, VerifiedStatus } from '../types';
import { Presentation, CredentialRequest, PresentationRequestDto, EncryptedData, PresentationRequest, PresentationPb, PresentationRequestPb, ProofPb, UnsignedPresentationRequestPb, JSONObj, CredentialRequestPb } from '@unumid/types';
// import { Presentation, EncryptedData, PresentationPb, PresentationRequestPb, ProofPb, UnsignedPresentationRequestPb, JSONObj, CredentialRequestPb } from '@unumid/types';
// import { PresentationRequestDto, PresentationRequest, CredentialRequest } from '@unumid/types-v2';
import { requireAuth } from '../requireAuth';
import { CryptoError, decrypt, decryptBytes } from '@unumid/library-crypto';
import logger from '../logger';
import { verifyNoPresentationHelper } from './verifyNoPresentationHelper';
import { verifyPresentationHelper } from './verifyPresentationHelper';
import { CustError } from '../utils/error';
import { isArrayEmpty } from '../utils/helpers';
import { omit } from 'lodash';
import { getDIDDoc, getKeyFromDIDDoc } from '../utils/didHelper';
import { configData } from '../config';
import { doVerify } from '../utils/verify';
import { handleAuthToken } from '../utils/networkRequestHelper';
import { validateProof } from './validateProof';
import { convertProof } from '../utils/convertToProtobuf';

function isDeclinedPresentation (presentation: Presentation | PresentationPb): presentation is Presentation {
  return isArrayEmpty(presentation.verifiableCredential);
}

/**
 * Validates the presentation object has the proper attributes.
 * @param presentation Presentation
 */
const validatePresentation = (presentation: PresentationPb): PresentationPb => {
  // const context = (presentation as Presentation)['@context'] ? (presentation as Presentation)['@context'] : (presentation as PresentationPb).context;
  const { type, proof, presentationRequestUuid, verifierDid, context } = presentation;

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

  if (!presentationRequestUuid) {
    throw new CustError(400, 'Invalid Presentation: presentationRequestUuid is required.');
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

  // // HACK ALERT: Handling converting string dates to Date. Note: only needed for now when using Protos with Date attributes
  // // when we move to full grpc this will not be needed because not longer using json.
  // if (!uuid) {
  //   presentation.uuid = '';
  // }

  // Check proof object is formatted correctly
  const updatedProof = validateProof(proof);
  presentation.proof = updatedProof;

  return presentation;
};

/**
 * Validates the presentation object has the proper attributes.
 * @param presentation Presentation
 */
const validatePresentationRequest = (presentationRequest: PresentationRequest): PresentationRequestPb => {
  const { proof, credentialRequests, holderAppUuid, verifier } = presentationRequest;

  // validate required fields
  if (!credentialRequests) {
    throw new CustError(400, 'Invalid PresentationRequest: credentialRequests is required.');
  }

  if (!holderAppUuid) {
    throw new CustError(400, 'Invalid PresentationRequest: holderAppUuid is required.');
  }

  if (!proof) {
    throw new CustError(400, 'Invalid PresentationRequest: proof is required.');
  }

  if (!verifier) {
    throw new CustError(400, 'Invalid PresentationRequest: verifier is required.');
  }

  if (isArrayEmpty(credentialRequests)) {
    throw new CustError(400, 'Invalid Presentation: credentialRequests must be a non-empty array.');
  } else {
    validateCredentialRequests(presentationRequest.credentialRequests);
  }

  // Check proof object is formatted correctly while converting to protobuf type
  const result: PresentationRequestPb = {
    ...presentationRequest,
    proof: validateProof(convertProof(proof)),
    expiresAt: presentationRequest.expiresAt ? presentationRequest.expiresAt : undefined,
    metadata: presentationRequest.metadata ? presentationRequest.metadata : undefined
  };

  return result;
};

/**
 * Validates the attributes for a credential request to UnumID's SaaS.
 * @param credentials JSONObj
 */
// const validateCredentialInput = (credentials: JSONObj): JSONObj => {
// TODO return a VerifiedStatus type with additional any array for passing back the type conforming objects
const validateCredentialRequests = (requests: CredentialRequest[]): void => {
  // const retObj: JSONObj = { valid: true };
  // const retObj: JSONObj = { valid: true, stringifiedDates: false, resultantCredentials: [] };
  // const result: CredentialRequestPb[] = [];
  // const retObj: JSONObj = { valid: true, resultantCredentials: [] };

  if (isArrayEmpty(requests)) {
    // retObj.valid = false;
    // retObj.msg = 'Invalid PresentationRequest: credentialRequests must be a non-empty array.';

    // return (retObj);
    throw new CustError(400, 'Invalid PresentationRequest: verifiableCredential must be a non-empty array.');
  }

  const totCred = requests.length;
  for (let i = 0; i < totCred; i++) {
    const credPosStr = '[' + i + ']';
    const request = requests[i];
    // const convertedRequest = request;

    if (!request.type) {
      throw new CustError(400, `Invalid PresentationRequest CredentialRequest${credPosStr}: type must be defined.`);
    }

    if (typeof request.type !== 'string') {
      throw new CustError(400, `Invalid PresentationRequest CredentialRequest${credPosStr}: type must be a string.`);
    }

    if (!request.issuers) {
      throw new CustError(400, `Invalid PresentationRequest CredentialRequest${credPosStr}: issuers must be defined.`);
    }

    // if (typeof credential === 'string') {
    //   retObj.stringifiedCredentials = true; // setting so know to add the object version of the stringified vc's
    //   credential = JSON.parse(credential);
    // }

    // Validate the existence of elements in Credential object
    // const invalidMsg = `Invalid verifiableCredential${credPosStr}:`;
    // if (!credential['@context']) {
    // if (!request.context) {
    //   retObj.valid = false;
    //   retObj.msg = `${invalidMsg} @context is required.`;
    //   break;
    // }

    // if (!credential.credentialStatus) {
    //   retObj.valid = false;
    //   retObj.msg = `${invalidMsg} credentialStatus is required.`;
    //   break;
    // }

    // if (!credential.credentialSubject) {
    //   retObj.valid = false;
    //   retObj.msg = `${invalidMsg} credentialSubject is required.`;
    //   break;
    // }

    // if (!credential.issuer) {
    //   retObj.valid = false;
    //   retObj.msg = `${invalidMsg} issuer is required.`;
    //   break;
    // }

    // if (!credential.type) {
    //   retObj.valid = false;
    //   retObj.msg = `${invalidMsg} type is required.`;
    //   break;
    // }

    // if (!credential.id) {
    //   retObj.valid = false;
    //   retObj.msg = `${invalidMsg} id is required.`;
    //   break;
    // }

    // if (!credential.issuanceDate) {
    //   retObj.valid = false;
    //   retObj.msg = `${invalidMsg} issuanceDate is required.`;
    //   break;
    // }

    // // HACK ALERT: Handling converting string dates to Date. Note: only needed for now when using Protos with Date attributes
    // // when we move to full grpc this will not be needed because not longer using json.
    // if (typeof credential.expirationDate === 'string') {
    //   retObj.stringifiedDates = true;
    //   credential.issuanceDate = new Date(credential.issuanceDate);
    // }

    // if (typeof credential.expirationDate === 'string') {
    //   retObj.stringifiedDates = true;
    //   credential.expirationDate = new Date(credential.expirationDate);
    // }

    // if (!credential.proof) {
    //   retObj.valid = false;
    //   retObj.msg = `${invalidMsg} proof is required.`;
    //   break;
    // }

    // // Check @context is an array and not empty
    // if (isArrayEmpty(credential.context)) {
    //   retObj.valid = false;
    //   retObj.msg = `${invalidMsg} @context must be a non-empty array.`;
    //   break;
    // }

    // // Check CredentialStatus object has id and type elements.
    // if (!credential.credentialStatus.id || !credential.credentialStatus.type) {
    //   retObj.valid = false;
    //   retObj.msg = `${invalidMsg} credentialStatus must contain id and type properties.`;
    //   break;
    // }

    // // Check credentialSubject object has id element.
    // // if (!credential.credentialSubject.id) {
    // const credentialSubject: CredentialSubject = convertCredentialSubject(credential.credentialSubject);
    // if (!credentialSubject.id) {
    //   retObj.valid = false;
    //   retObj.msg = `${invalidMsg} credentialSubject must contain id property.`;
    //   break;
    // }

    // // Check type is an array and not empty
    // if (isArrayEmpty(credential.type)) {
    //   retObj.valid = false;
    //   retObj.msg = `${invalidMsg} type must be a non-empty array.`;
    //   break;
    // }

    // // Check that proof object is valid
    // credential.proof = validateProof(credential.proof);

    // // HACK ALERT continued: this is assuming that if one credential date attribute is a string then all of them are.
    // // this resultantCredentials array is then take the place of the creds in the presentation
    // if (retObj.stringifiedDates) {
    //   // Adding the credential to the result list so can use the fully created objects downstream
    //   retObj.resultantCredentials.push(credential);
    // }
  }
};
/**
 * Verify the PresentationRequest signature as a way to side step verifier MITM attacks where an entity spoofs requests.
 */
async function verifyPresentationRequest (authorization: string, presentationRequest: PresentationRequestPb): Promise<UnumDto<VerifiedStatus>> {
// async function verifyPresentationRequest (authorization: string, presentationRequest: PresentationRequest): Promise<UnumDto<VerifiedStatus>> {
  if (!presentationRequest.proof) {
    throw new CustError(400, 'Invalid PresentationRequest: proof is required.');
  }

  // if (!presentationRequest.metadata) {
  //   presentationRequest.metadata = { fields: {} };
  // }

  const { proof: { verificationMethod, signatureValue } } = presentationRequest;
  // const proof = presentationRequest.proof as ProofPb;
  // const { verificationMethod, signatureValue } = proof;

  const didDocumentResponse = await getDIDDoc(configData.SaaSUrl, authorization as string, verificationMethod);

  if (didDocumentResponse instanceof Error) {
    throw didDocumentResponse;
  }

  const authToken: string = handleAuthToken(didDocumentResponse, authorization);
  const publicKeyInfos = getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');

  const { publicKey, encoding } = publicKeyInfos[0];

  const unsignedPresentationRequest: UnsignedPresentationRequestPb = omit(presentationRequest, 'proof');
  // // convert to the protobuf object
  // const unsignedPresentationRequest: UnsignedPresentationRequestPb = {
  //   ...presentationRequest,
  //   createdAt: new Date(presentationRequest.createdAt),
  //   updatedAt: new Date(presentationRequest.updatedAt),
  //   expiresAt: presentationRequest.expiresAt ? new Date(presentationRequest.expiresAt as Date) : undefined,
  //   credentialRequests: {
  //     ...presentationRequest.credentialRequests,
  //     proof: {
  //       ...presentationRequest.credentialRequests.proof

  //     }
  //   }
  // };

  // convert to bytes
  const bytes: Uint8Array = UnsignedPresentationRequestPb.encode(unsignedPresentationRequest).finish();

  // verify the byte array
  const isVerified = doVerify(signatureValue, bytes, publicKey, encoding);

  if (!isVerified) {
    const result: UnumDto<VerifiedStatus> = {
      authToken,
      body: {
        isVerified: false,
        message: 'PresentationRequest signature can not be verified.'
      }
    };
    return result;
  }

  const result: UnumDto<VerifiedStatus> = {
    authToken,
    body: {
      isVerified: true
    }
  };
  return result;
}

/**
 * Handler to send information regarding the user agreeing to share a credential Presentation.
 * @param authorization: string
 * @param encryptedPresentation: EncryptedData
 * @param verifierDid: string
 */
export const verifyPresentation = async (authorization: string, encryptedPresentation: EncryptedData, verifierDid: string, encryptionPrivateKey: string, presentationRequest?: PresentationRequestDto): Promise<UnumDto<DecryptedPresentation>> => {
  try {
    requireAuth(authorization);

    if (!encryptedPresentation) {
      throw new CustError(400, 'encryptedPresentation is required.');
    }

    if (!verifierDid) { // verifier did
      throw new CustError(400, 'verifier is required.');
    }

    if (!encryptionPrivateKey) {
      throw new CustError(400, 'verifier encryptionPrivateKey is required.');
    }

    if (presentationRequest && presentationRequest.verifier.did !== verifierDid) {
      throw new CustError(400, `verifier provided, ${verifierDid}, does not match the presentation request verifier, ${presentationRequest.verifier.did}.`);
    }

    // decrypt the presentation
    // const presentation = <PresentationPb> decrypt(encryptionPrivateKey, encryptedPresentation);
    const presentationBytes = decryptBytes(encryptionPrivateKey, encryptedPresentation);
    const presentation: PresentationPb = PresentationPb.decode(presentationBytes);

    // validate presentation
    validatePresentation(presentation);

    // verify the presentation request uuid match
    if (presentationRequest && presentationRequest.presentationRequest.uuid !== presentation.presentationRequestUuid) {
      throw new CustError(400, `presentation request uuid provided, ${presentationRequest.presentationRequest.uuid}, does not match the presentationRequestUuid that the presentation was in response to, ${presentation.presentationRequestUuid}.`);
    }

    // verify the presentation request signature if present
    if (presentationRequest && presentationRequest.presentationRequest) {
      // validate the provided presentation request
      const presentationRequestPb: PresentationRequestPb = validatePresentationRequest(presentationRequest.presentationRequest);

      // const requestVerificationResult = await verifyPresentationRequest(authorization, presentationRequest.presentationRequest);
      const requestVerificationResult = await verifyPresentationRequest(authorization, presentationRequestPb);
      authorization = requestVerificationResult.authToken;

      // if invalid then can stop here but still send back the decrypted presentation with the verification results
      if (!requestVerificationResult.body.isVerified) {
        const type = isDeclinedPresentation(presentation) ? 'DeclinedPresentation' : 'VerifiablePresentation';
        const result: UnumDto<DecryptedPresentation> = {
          authToken: requestVerificationResult.authToken,
          body: {
            ...requestVerificationResult.body,
            type,
            presentation: presentation
          }
        };

        return result;
      }
    }

    if (isDeclinedPresentation(presentation)) {
      const verificationResult: UnumDto<VerifiedStatus> = await verifyNoPresentationHelper(authorization, presentation, verifierDid);
      const result: UnumDto<DecryptedPresentation> = {
        authToken: verificationResult.authToken,
        body: {
          ...verificationResult.body,
          type: 'DeclinedPresentation',
          presentation: presentation
        }
      };

      return result;
    }

    const credentialRequests: CredentialRequest[] | undefined = presentationRequest?.presentationRequest.credentialRequests;
    const verificationResult: UnumDto<VerifiedStatus> = await verifyPresentationHelper(authorization, presentation, verifierDid, credentialRequests);
    const result: UnumDto<DecryptedPresentation> = {
      authToken: verificationResult.authToken,
      body: {
        ...verificationResult.body,
        type: 'VerifiablePresentation',
        presentation: presentation
      }
    };

    return result;
  } catch (error) {
    if (error instanceof CryptoError) {
      logger.error('Crypto error handling encrypted presentation', error);
    } else {
      logger.error('Error handling encrypted presentation request to UnumID Saas.', error);
    }

    throw error;
  }
};
