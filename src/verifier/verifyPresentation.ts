
import { DecryptedPresentation, UnumDto, VerifiedStatus } from '../types';
import { Presentation, CredentialRequest, PresentationRequestDto, EncryptedData, PresentationRequest, PresentationPb, PresentationRequestPb, ProofPb, UnsignedPresentationRequestPb } from '@unumid/types';
import { requireAuth } from '../requireAuth';
import { CryptoError, decrypt } from '@unumid/library-crypto';
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

function isDeclinedPresentation (presentation: Presentation | PresentationPb): presentation is Presentation {
  return isArrayEmpty(presentation.verifiableCredential);
}

/**
 * Validates the presentation object has the proper attributes.
 * @param presentation Presentation
 */
const validatePresentation = (presentation: Presentation | PresentationPb): void => {
  const context = (presentation as Presentation)['@context'] ? (presentation as Presentation)['@context'] : (presentation as PresentationPb).context;
  const { type, proof, presentationRequestUuid, verifierDid } = presentation;

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

  if (!presentationRequestUuid) {
    throw new CustError(400, 'Invalid Presentation: presentationRequestUuid is required.');
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

  // Check proof object is formatted correctly
  validateProof(proof);
};

/**
 * Validates the presentation object has the proper attributes.
 * @param presentation Presentation
 */
const validatePresentationRequest = (presentationRequest: PresentationRequestPb): void => {
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
  }

  // Check proof object is formatted correctly
  validateProof(proof);
};

/**
 * Verify the PresentationRequest signature as a way to side step verifier MITM attacks where an entity spoofs requests.
 * TODO: this actually needs to be versioned.... because the holder might have grabbed the v1 PresentationRequest
 */
async function verifyPresentationRequest (authorization: string, presentationRequest: PresentationRequestPb): Promise<UnumDto<VerifiedStatus>> {
  if (!presentationRequest.proof) {
    throw new CustError(400, 'Invalid PresentationRequest: proof is required.');
  }

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
    const presentation = <PresentationPb> decrypt(encryptionPrivateKey, encryptedPresentation);

    // validate presentation
    validatePresentation(presentation);

    // verify the presentation request uuid match
    if (presentationRequest && presentationRequest.presentationRequest.uuid !== presentation.presentationRequestUuid) {
      throw new CustError(400, `presentation request uuid provided, ${presentationRequest.presentationRequest.uuid}, does not match the presentationRequestUuid that the presentation was in response to, ${presentation.presentationRequestUuid}.`);
    }

    // verify the presentation request signature if present
    if (presentationRequest && presentationRequest.presentationRequest) {
      const requestVerificationResult = await verifyPresentationRequest(authorization, presentationRequest.presentationRequest);
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
