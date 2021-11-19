
import { UnumDto, VerifiedStatus } from '../types';
import { CredentialRequestPb, SubjectCredentialRequest } from '@unumid/types';
import { requireAuth } from '../requireAuth';
// import { verifyCredentialHelper } from './verifyCredentialHelper';
import { CustError } from '../utils/error';
import { isArrayEmpty } from '../utils/helpers';
import { omit } from 'lodash';
import { getDIDDoc, getKeyFromDIDDoc } from '../utils/didHelper';
import { configData } from '../config';
import { doVerify } from '../utils/verify';
import { handleAuthTokenHeader } from '../utils/networkRequestHelper';

/**
 * Validates the attributes for a credential request to UnumID's SaaS.
 * @param requests CredentialRequest
 */
const validateCredentialRequests = (requests: SubjectCredentialRequest[]): void => {
  if (isArrayEmpty(requests)) {
    throw new CustError(400, 'credentialRequests must be a non-empty array.');
  }

  const totCred = requests.length;
  for (let i = 0; i < totCred; i++) {
    const credPosStr = '[' + i + ']';
    const request = requests[i];

    if (!request.proof) {
      throw new CustError(400, `Invalid CredentialRequest${credPosStr}: proof must be defined.`);
    }

    if (!request.type) {
      throw new CustError(400, `Invalid CredentialRequest${credPosStr}: type must be defined.`);
    }

    if (typeof request.type !== 'string') {
      throw new CustError(400, `Invalid CredentialRequest${credPosStr}: type must be a string.`);
    }

    if (!request.issuers) {
      throw new CustError(400, `Invalid CredentialRequest${credPosStr}: issuers must be defined.`);
    }
  }
};
/**
 * Verify the CredentialRequests signatures.
 */
export async function verifySubjectCredentialRequests (authorization: string, credentialRequests: SubjectCredentialRequest[]): Promise<UnumDto<VerifiedStatus>> {
  requireAuth(authorization);

  // validate credentialRequests input
  validateCredentialRequests(credentialRequests);

  let authToken = authorization;
  for (const credentialRequest of credentialRequests) {
    const result: UnumDto<VerifiedStatus> = await verifySubjectCredentialRequest(authToken, credentialRequest);
    authToken = result.authToken;

    // can stop here is not verified
    if (!result.body.isVerified) {
      // handle sending back the PresentationVerified receipt with the verification failure reason
      authToken = await handleSubjectCredentialRequestVerificationReceipt(authToken, credentialRequest, result.body);

      return {
        ...result,
        authToken
      };
    }
  }

  // if made it this far then all SubjectCredentialRequests are verified
  return {
    authToken,
    body: {
      isVerified: true
    }
  };
}

export async function verifySubjectCredentialRequest (authorization: string, credentialRequest: SubjectCredentialRequest): Promise<UnumDto<VerifiedStatus>> {
//   const { proof: { verificationMethod, signatureValue } } = credentialRequest;
  const verificationMethod = credentialRequest.proof?.verificationMethod as string;
  const signatureValue = credentialRequest.proof?.signatureValue as string;

  const didDocumentResponse = await getDIDDoc(configData.SaaSUrl, authorization as string, verificationMethod);

  if (didDocumentResponse instanceof Error) {
    throw didDocumentResponse;
  }

  const authToken: string = handleAuthTokenHeader(didDocumentResponse, authorization);
  const publicKeyInfos = getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');

  if (publicKeyInfos.length === 0) {
    // throw new CustError(404, `Public key not found for the subject did ${verificationMethod}`);
    return {
      authToken,
      body: {
        isVerified: false,
        message: `Public key not found for the subject did ${verificationMethod}`
      }
    };
  }

  const { publicKey, encoding } = publicKeyInfos[0];

  const unsignedCredentialRequest: CredentialRequestPb = omit(credentialRequest, 'proof');

  // convert to bytes
  const bytes: Uint8Array = CredentialRequestPb.encode(unsignedCredentialRequest).finish();

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
 * Handle sending back the SubjectCredentialRequestVerified receipt
 */
async function handleSubjectCredentialRequestVerificationReceipt (authToken: string, credentialRequest: SubjectCredentialRequest, verifiedStatus: VerifiedStatus) {
  // TODO
//   try {
//     const credentialTypes = credential.verifiableCredential && isArrayNotEmpty(credential.verifiableCredential) ? credential.verifiableCredential.flatMap(cred => cred.type.slice(1)) : []; // cut off the preceding 'VerifiableCredential' string in each array
//     const credentialIds = credential.verifiableCredential && isArrayNotEmpty(credential.verifiableCredential) ? credential.verifiableCredential.flatMap(cred => cred.id) : [];
//     const issuers = credential.verifiableCredential && isArrayNotEmpty(credential.verifiableCredential) ? credential.verifiableCredential.map(cred => cred.issuer) : [];
//     const reply = isDeclinedPresentation(credential) ? 'declined' : 'approved';
//     const proof = credential.proof as ProofPb; // existence has already been validated

  //     return sendPresentationVerifiedReceipt(authToken, verifier, proof.verificationMethod, reply, false, credential.credentialRequestId, requestUuid, message, issuers, credentialTypes, credentialIds);
  //   } catch (e) {
  //     logger.error('Something went wrong handling the PresentationVerification receipt for the a failed request verification');
  //   }

  return authToken;
}
