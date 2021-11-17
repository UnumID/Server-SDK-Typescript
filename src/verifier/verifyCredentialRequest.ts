
import { DecryptedPresentation, UnumDto, VerifiedStatus } from '../types';
import { Presentation, CredentialRequest, PresentationRequestDto, EncryptedData, PresentationRequest, PresentationPb, PresentationRequestPb, ProofPb, UnsignedPresentationRequestPb, JSONObj, CredentialRequestPb, WithVersion } from '@unumid/types';
import { requireAuth } from '../requireAuth';
import { CryptoError, decrypt, decryptBytes } from '@unumid/library-crypto';
import logger from '../logger';
import { verifyNoPresentationHelper } from './verifyNoPresentationHelper';
// import { verifyCredentialHelper } from './verifyCredentialHelper';
import { CustError } from '../utils/error';
import { isArrayEmpty, isArrayNotEmpty } from '../utils/helpers';
import { omit } from 'lodash';
import { getDIDDoc, getKeyFromDIDDoc } from '../utils/didHelper';
import { configData } from '../config';
import { doVerify } from '../utils/verify';
import { handleAuthTokenHeader } from '../utils/networkRequestHelper';
import { validateProof } from './validateProof';
import { convertProof } from '../utils/convertToProtobuf';
import { sendPresentationVerifiedReceipt } from './sendPresentationVerifiedReceipt';
import { extractPresentationRequest, getPresentationRequest } from './getPresentationRequest';

function isDeclinedPresentation (credential: Presentation | PresentationPb): credential is Presentation {
  return isArrayEmpty(credential.verifiableCredential);
}

/**
 * Validates the credential object has the proper attributes.
 * @param credential Presentation
 */
// const validateCredential = (credential: PresentationPb): PresentationPb => {
//   // const context = (credential as Presentation)['@context'] ? (credential as Presentation)['@context'] : (credential as PresentationPb).context;
//   const { type, proof, credentialRequestId, verifierDid, context } = credential;

//   // validate required fields
//   if (!context) {
//     throw new CustError(400, 'Invalid Presentation: context is required.');
//   }

//   if (!type) {
//     throw new CustError(400, 'Invalid Presentation: type is required.');
//   }

//   if (!proof) {
//     throw new CustError(400, 'Invalid Presentation: proof is required.');
//   }

//   if (!credentialRequestId) {
//     throw new CustError(400, 'Invalid Presentation: credentialRequestId is required.');
//   }

//   if (!verifierDid) {
//     throw new CustError(400, 'Invalid Presentation: verifierDid is required.');
//   }

//   if (isArrayEmpty(context)) {
//     throw new CustError(400, 'Invalid Presentation: context must be a non-empty array.');
//   }

//   if (isArrayEmpty(type)) {
//     throw new CustError(400, 'Invalid Presentation: type must be a non-empty array.');
//   }

//   // // HACK ALERT: Handling converting string dates to Date. Note: only needed for now when using Protos with Date attributes
//   // // when we move to full grpc this will not be needed because not longer using json.
//   // if (!uuid) {
//   //   credential.uuid = '';
//   // }

//   // Check proof object is formatted correctly
//   const updatedProof = validateProof(proof);
//   credential.proof = updatedProof;

//   return credential;
// };

/**
 * Validates the credential request object has the proper attributes.
 * @param credential Presentation
 */
const validateCredentialRequest = (credentialRequest: WithVersion<PresentationRequest>): PresentationRequestPb => {
  const { proof, credentialRequests, holderAppUuid, verifier } = credentialRequest;

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

  validateCredentialRequests(credentialRequest.credentialRequests);

  // Check proof object is formatted correctly while converting to protobuf type
  const result: PresentationRequestPb = {
    ...credentialRequest,
    proof: validateProof(convertProof(proof)),
    expiresAt: credentialRequest.expiresAt ? credentialRequest.expiresAt : undefined,
    metadata: credentialRequest.metadata ? credentialRequest.metadata : undefined
  };

  return result;
};

/**
 * Validates the attributes for a credential request to UnumID's SaaS.
 * @param requests CredentialRequest
 */
const validateCredentialRequests = (requests: CredentialRequest[]): void => {
  if (isArrayEmpty(requests)) {
    throw new CustError(400, 'Invalid PresentationRequest: verifiableCredential must be a non-empty array.');
  }

  const totCred = requests.length;
  for (let i = 0; i < totCred; i++) {
    const credPosStr = '[' + i + ']';
    const request = requests[i];

    if (!request.type) {
      throw new CustError(400, `Invalid PresentationRequest CredentialRequest${credPosStr}: type must be defined.`);
    }

    if (typeof request.type !== 'string') {
      throw new CustError(400, `Invalid PresentationRequest CredentialRequest${credPosStr}: type must be a string.`);
    }

    if (!request.issuers) {
      throw new CustError(400, `Invalid PresentationRequest CredentialRequest${credPosStr}: issuers must be defined.`);
    }
  }
};
/**
 * Verify the PresentationRequest signature as a way to side step verifier MITM attacks where an entity spoofs requests.
 */
async function verifyCredentialRequest (authorization: string, credentialRequest: PresentationRequestPb): Promise<UnumDto<VerifiedStatus>> {
  if (!credentialRequest.proof) {
    throw new CustError(400, 'Invalid PresentationRequest: proof is required.');
  }

  const { proof: { verificationMethod, signatureValue } } = credentialRequest;

  const didDocumentResponse = await getDIDDoc(configData.SaaSUrl, authorization as string, verificationMethod);

  if (didDocumentResponse instanceof Error) {
    throw didDocumentResponse;
  }

  const authToken: string = handleAuthTokenHeader(didDocumentResponse, authorization);
  const publicKeyInfos = getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');

  const { publicKey, encoding } = publicKeyInfos[0];

  const unsignedPresentationRequest: UnsignedPresentationRequestPb = omit(credentialRequest, 'proof');

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
export const verifyCredential = async (authorization: string, encryptedPresentation: EncryptedData, verifierDid: string, encryptionPrivateKey: string, credentialRequest?: PresentationRequestDto): Promise<UnumDto<DecryptedPresentation>> => {
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

    if (credentialRequest && credentialRequest.verifier.did !== verifierDid) {
      throw new CustError(400, `verifier provided, ${verifierDid}, does not match the credential request verifier, ${credentialRequest.verifier.did}.`);
    }

    // decrypt the credential
    const credentialBytes = decryptBytes(encryptionPrivateKey, encryptedPresentation);
    const credential: PresentationPb = PresentationPb.decode(credentialBytes);

    if (configData.debug) {
      logger.debug(`Decrypted Presentation: ${JSON.stringify(credential)}`);
    }

    // validate credential
    validateCredential(credential);

    if (!credentialRequest) {
      // grab the credential request from Unum ID SaaS for verification purposes
      const credentialRequestResponse = await getPresentationRequest(authorization, credential.credentialRequestId);

      authorization = handleAuthTokenHeader(credentialRequestResponse, authorization);
      credentialRequest = extractPresentationRequest(credentialRequestResponse.body);
    }

    // verify the credential request uuid match
    if (credentialRequest.credentialRequest.id !== credential.credentialRequestId) {
      throw new CustError(400, `credential request id provided, ${credentialRequest.credentialRequest.id}, does not match the credentialRequestId that the credential was in response to, ${credential.credentialRequestId}.`);
    }

    // verify the credential request signature
    if (credentialRequest.credentialRequest) {
      // validate the provided credential request
      const credentialRequestPb: PresentationRequestPb = validateCredentialRequest(credentialRequest.credentialRequest);

      const requestVerificationResult: UnumDto<VerifiedStatus> = await verifyCredentialRequest(authorization, credentialRequestPb);
      authorization = requestVerificationResult.authToken;

      // if invalid then can stop here but still send back the decrypted credential with the verification results
      if (!requestVerificationResult.body.isVerified) {
        // handle sending back the PresentationVerified receipt with the request verification failure reason
        const authToken = await handlePresentationVerificationReceipt(requestVerificationResult.authToken, credential, verifierDid, requestVerificationResult.body.message as string, credentialRequest.credentialRequest.uuid);

        const type = isDeclinedPresentation(credential) ? 'DeclinedPresentation' : 'VerifiablePresentation';
        const result: UnumDto<DecryptedPresentation> = {
          authToken,
          body: {
            ...requestVerificationResult.body,
            type,
            credential: credential
          }
        };

        return result;
      }
    }

    if (isDeclinedPresentation(credential)) {
      const verificationResult: UnumDto<VerifiedStatus> = await verifyNoPresentationHelper(authorization, credential, verifierDid, credentialRequest.credentialRequest.uuid);
      const result: UnumDto<DecryptedPresentation> = {
        authToken: verificationResult.authToken,
        body: {
          ...verificationResult.body,
          type: 'DeclinedPresentation',
          credential: credential
        }
      };

      return result;
    }

    const credentialRequests: CredentialRequest[] = credentialRequest.credentialRequest.credentialRequests;
    const verificationResult: UnumDto<VerifiedStatus> = await verifyCredentialHelper(authorization, credential, verifierDid, credentialRequests, credentialRequest.credentialRequest.uuid);
    const result: UnumDto<DecryptedPresentation> = {
      authToken: verificationResult.authToken,
      body: {
        ...verificationResult.body,
        type: 'VerifiablePresentation',
        credential: credential
      }
    };

    return result;
  } catch (error) {
    if (error instanceof CryptoError) {
      logger.error(`Crypto error handling encrypted credential ${error}`);
    } if (error instanceof TypeError) {
      logger.error(`Type error handling decoding credential, credential or proof from bytes to protobufs ${error}`);
    } else {
      logger.error(`Error handling encrypted credential. ${error}`);
    }

    throw error;
  }
};

/**
 * Handle sending back the PresentationVerified receipt with the request verification failure reason
 */
async function handlePresentationVerificationReceipt (authToken: string, credential: PresentationPb, verifier: string, message: string, requestUuid: string) {
  try {
    const credentialTypes = credential.verifiableCredential && isArrayNotEmpty(credential.verifiableCredential) ? credential.verifiableCredential.flatMap(cred => cred.type.slice(1)) : []; // cut off the preceding 'VerifiableCredential' string in each array
    const credentialIds = credential.verifiableCredential && isArrayNotEmpty(credential.verifiableCredential) ? credential.verifiableCredential.flatMap(cred => cred.id) : [];
    const issuers = credential.verifiableCredential && isArrayNotEmpty(credential.verifiableCredential) ? credential.verifiableCredential.map(cred => cred.issuer) : [];
    const reply = isDeclinedPresentation(credential) ? 'declined' : 'approved';
    const proof = credential.proof as ProofPb; // existence has already been validated

    return sendPresentationVerifiedReceipt(authToken, verifier, proof.verificationMethod, reply, false, credential.credentialRequestId, requestUuid, message, issuers, credentialTypes, credentialIds);
  } catch (e) {
    logger.error('Something went wrong handling the PresentationVerification receipt for the a failed request verification');
  }

  return authToken;
}
