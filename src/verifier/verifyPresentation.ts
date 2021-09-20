
import { DecryptedPresentation, UnumDto, VerifiedStatus } from '../types';
import { Presentation, CredentialRequest, PresentationRequestDto, EncryptedData, PresentationRequest, PresentationPb, PresentationRequestPb, ProofPb, UnsignedPresentationRequestPb, JSONObj, CredentialRequestPb, WithVersion } from '@unumid/types';
import { requireAuth } from '../requireAuth';
import { CryptoError, decrypt, decryptBytes } from '@unumid/library-crypto';
import logger from '../logger';
import { verifyNoPresentationHelper } from './verifyNoPresentationHelper';
import { verifyPresentationHelper } from './verifyPresentationHelper';
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

function isDeclinedPresentation (presentation: Presentation | PresentationPb): presentation is Presentation {
  return isArrayEmpty(presentation.verifiableCredential);
}

/**
 * Validates the presentation object has the proper attributes.
 * @param presentation Presentation
 */
const validatePresentation = (presentation: PresentationPb): PresentationPb => {
  // const context = (presentation as Presentation)['@context'] ? (presentation as Presentation)['@context'] : (presentation as PresentationPb).context;
  const { type, proof, presentationRequestId, verifierDid, context } = presentation;

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
 * Validates the presentation request object has the proper attributes.
 * @param presentation Presentation
 */
const validatePresentationRequest = (presentationRequest: WithVersion<PresentationRequest>): PresentationRequestPb => {
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

  validateCredentialRequests(presentationRequest.credentialRequests);

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
async function verifyPresentationRequest (authorization: string, presentationRequest: PresentationRequestPb): Promise<UnumDto<VerifiedStatus>> {
  if (!presentationRequest.proof) {
    throw new CustError(400, 'Invalid PresentationRequest: proof is required.');
  }

  const { proof: { verificationMethod, signatureValue } } = presentationRequest;

  const didDocumentResponse = await getDIDDoc(configData.SaaSUrl, authorization as string, verificationMethod);

  if (didDocumentResponse instanceof Error) {
    throw didDocumentResponse;
  }

  const authToken: string = handleAuthTokenHeader(didDocumentResponse, authorization);
  const publicKeyInfos = getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');

  const { publicKey, encoding } = publicKeyInfos[0];

  const unsignedPresentationRequest: UnsignedPresentationRequestPb = omit(presentationRequest, 'proof');

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
    const presentationBytes = decryptBytes(encryptionPrivateKey, encryptedPresentation);
    const presentation: PresentationPb = PresentationPb.decode(presentationBytes);

    if (process.env.NODE_ENV === 'debug') {
      logger.debug(`Decrypted Presentation: ${JSON.stringify(presentation)}`);
    }

    // validate presentation
    validatePresentation(presentation);

    if (!presentationRequest) {
      // grab the presentation request from Unum ID SaaS for verification purposes
      const presentationRequestResponse = await getPresentationRequest(authorization, presentation.presentationRequestId);

      authorization = handleAuthTokenHeader(presentationRequestResponse, authorization);
      presentationRequest = extractPresentationRequest(presentationRequestResponse.body);
    }

    // verify the presentation request uuid match
    if (presentationRequest.presentationRequest.id !== presentation.presentationRequestId) {
      throw new CustError(400, `presentation request id provided, ${presentationRequest.presentationRequest.id}, does not match the presentationRequestId that the presentation was in response to, ${presentation.presentationRequestId}.`);
    }

    // verify the presentation request signature if present
    if (presentationRequest && presentationRequest.presentationRequest) {
      // validate the provided presentation request
      const presentationRequestPb: PresentationRequestPb = validatePresentationRequest(presentationRequest.presentationRequest);

      const requestVerificationResult = await verifyPresentationRequest(authorization, presentationRequestPb);
      authorization = requestVerificationResult.authToken;

      // if invalid then can stop here but still send back the decrypted presentation with the verification results
      if (!requestVerificationResult.body.isVerified) {
        // handle sending back the PresentationVerified receipt with the request verification failure reason
        const authToken = await handlePresentationVerificationReceipt(requestVerificationResult.authToken, presentation, verifierDid, requestVerificationResult.body.message as string);

        const type = isDeclinedPresentation(presentation) ? 'DeclinedPresentation' : 'VerifiablePresentation';
        const result: UnumDto<DecryptedPresentation> = {
          authToken,
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
      logger.error(`Crypto error handling encrypted presentation ${error}`);
    } if (error instanceof TypeError) {
      logger.error(`Type error handling decoding presentation, credential or proof from bytes to protobufs ${error}`);
    } else {
      logger.error(`Error handling encrypted presentation. ${error}`);
    }

    throw error;
  }
};

/**
 * Handle sending back the PresentationVerified receipt with the request verification failure reason
 */
async function handlePresentationVerificationReceipt (authToken: string, presentation: PresentationPb, verifier: string, message: string) {
  try {
    const credentialTypes = presentation.verifiableCredential && isArrayNotEmpty(presentation.verifiableCredential) ? presentation.verifiableCredential.flatMap(cred => cred.type.slice(1)) : []; // cut off the preceding 'VerifiableCredential' string in each array
    const issuers = presentation.verifiableCredential && isArrayNotEmpty(presentation.verifiableCredential) ? presentation.verifiableCredential.map(cred => cred.issuer) : [];
    const reply = isDeclinedPresentation(presentation) ? 'declined' : 'approved';
    const proof = presentation.proof as ProofPb; // existence has already been validated

    return sendPresentationVerifiedReceipt(authToken, verifier, proof.verificationMethod, reply, false, message, issuers, credentialTypes);
  } catch (e) {
    logger.error('Something went wrong handling the PresentationVerification receipt for the a failed request verification');
  }

  return authToken;
}
