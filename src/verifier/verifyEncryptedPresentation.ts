
import { DecryptedPresentation, Presentation, PresentationOrNoPresentation, UnumDto } from '../types';
import { validateProof } from './validateProof';
import { requireAuth } from '../requireAuth';
import { CryptoError, decrypt } from '@unumid/library-crypto';
import { JSONObj, CustError, isArrayEmpty, EncryptedData } from '@unumid/library-issuer-verifier-utility';
import logger from '../logger';
import { NoPresentation, VerifiedStatus, verifyNoPresentation, verifyPresentation } from '..';

/**
 * Validates the attributes for a credential request to UnumID's SaaS.
 * @param credentials JSONObj
 */
const validateCredentialInput = (credentials: JSONObj): JSONObj => {
  const retObj: JSONObj = { valStat: true };

  if (isArrayEmpty(credentials)) {
    retObj.valStat = false;
    retObj.msg = 'Invalid Presentation: verifiableCredentials must be a non-empty array.';

    return (retObj);
  }

  const totCred = credentials.length;
  for (let i = 0; i < totCred; i++) {
    const credPosStr = '[' + i + ']';
    const credential = credentials[i];

    // Validate the existance of elements in verifiableCredential object
    const invalidMsg = `Invalid verifiableCredentials${credPosStr}:`;
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
  }

  return (retObj);
};

/**
 * Validates the presentation object has the proper attributes.
 * @param presentation Presentation
 */
const validatePresentation = (presentation: Presentation): void => {
  const context = presentation['@context'];
  const { type, verifiableCredentials, proof, presentationRequestUuid } = presentation;
  let retObj: JSONObj = {};

  // validate required fields
  if (!context) {
    throw new CustError(400, 'Invalid Presentation: @context is required.');
  }

  if (!type) {
    throw new CustError(400, 'Invalid Presentation: type is required.');
  }

  if (!verifiableCredentials) {
    throw new CustError(400, 'Invalid Presentation: verifiableCredentials is required.');
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

  retObj = validateCredentialInput(verifiableCredentials);
  if (!retObj.valStat) {
    throw new CustError(400, retObj.msg);
  }

  // Check proof object is formatted correctly
  validateProof(proof);
};

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
          type: 'NoPresentation'
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
