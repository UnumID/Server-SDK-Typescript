
import { DecryptedPresentation, PresentationOrNoPresentation, UnumDto, VerifiedStatus } from '../types';
import { Presentation, CredentialRequest, PresentationRequestDto, EncryptedData } from '@unumid/types';
import { requireAuth } from '../requireAuth';
import { CryptoError, decrypt } from '@unumid/library-crypto';
import logger from '../logger';
import { verifyNoPresentationHelper } from './verifyNoPresentationHelper';
import { verifyPresentationHelper } from './verifyPresentationHelper';
import { CustError } from '../utils/error';
import { isArrayEmpty } from '../utils/helpers';

function isDeclinedPresentation (presentation: Presentation): presentation is Presentation {
  return isArrayEmpty(presentation.verifiableCredential);
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
    const presentation = <Presentation> decrypt(encryptionPrivateKey, encryptedPresentation);

    if (presentationRequest && presentationRequest.presentationRequest.uuid !== presentation.presentationRequestUuid) {
      throw new CustError(400, `presentation request uuid provided, ${presentationRequest.presentationRequest.uuid}, does not match the presentationRequestUuid that the presentation was in response to, ${presentation.presentationRequestUuid}.`);
    }

    const type = isDeclinedPresentation(presentation) ? 'NoPresentation' : 'VerifiablePresentation';
    // if (isDeclinedPresentation(presentation)) {
    //   const verificationResult: UnumDto<VerifiedStatus> = await verifyNoPresentationHelper(authorization, presentation, verifierDid);
    //   const result: UnumDto<DecryptedPresentation> = {
    //     authToken: verificationResult.authToken,
    //     body: {
    //       ...verificationResult.body,
    //       type: 'NoPresentation',
    //       presentation: presentation
    //     }
    //   };

    //   return result;
    // }

    const credentialRequests: CredentialRequest[] | undefined = presentationRequest?.presentationRequest.credentialRequests;
    const verificationResult: UnumDto<VerifiedStatus> = await verifyPresentationHelper(authorization, presentation, verifierDid, credentialRequests);
    const result: UnumDto<DecryptedPresentation> = {
      authToken: verificationResult.authToken,
      body: {
        ...verificationResult.body,
        // type: 'VerifiablePresentation',
        type,
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
