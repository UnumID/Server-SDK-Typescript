
import { DecryptedPresentation, PresentationOrNoPresentation, UnumDto } from '../types';
import { Presentation } from '@unumid/types';
import { requireAuth } from '../requireAuth';
import { CryptoError, decrypt } from '@unumid/library-crypto';
import { CustError, EncryptedData } from '@unumid/library-issuer-verifier-utility';
import logger from '../logger';
import { NoPresentation, VerifiedStatus, verifyNoPresentation, verifyPresentation } from '..';

function isPresentation (presentation: PresentationOrNoPresentation): presentation is Presentation {
  return presentation.type[0] === 'VerifiablePresentation';
}

/**
 * Handler to send information regarding the user agreeing to share a credential Presentation.
 * @param authorization: string
 * @param encryptedPresentation: EncryptedData
 * @param verifierDid: string
 */
export const verifyEncryptedPresentation = async (authorization: string, encryptedPresentation: EncryptedData, verifierDid: string, encryptionPrivateKey: string): Promise<UnumDto<DecryptedPresentation>> => {
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

    // decrypt the presentation
    const presentation = <Presentation|NoPresentation> decrypt(encryptionPrivateKey, encryptedPresentation);

    if (!isPresentation(presentation)) {
      const verificationResult: UnumDto<VerifiedStatus> = await verifyNoPresentation(authorization, presentation, verifierDid);
      const result: UnumDto<DecryptedPresentation> = {
        authToken: verificationResult.authToken,
        body: {
          ...verificationResult.body,
          type: 'NoPresentation',
          presentation: presentation
        }
      };

      return result;
    }

    const verificationResult: UnumDto<VerifiedStatus> = await verifyPresentation(authorization, presentation, verifierDid);
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
