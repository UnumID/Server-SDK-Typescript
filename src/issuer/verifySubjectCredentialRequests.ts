
import { RESTData, UnumDto, VerifiedStatus } from '../types';
import { JSONObj, ReceiptOptions, ReceiptSubjectCredentialRequestVerifiedData, PublicKeyInfo, UnsignedSubjectCredentialRequests, SubjectCredentialRequests, CredentialRequest } from '@unumid/types';
import { requireAuth } from '../requireAuth';
import { CustError } from '../utils/error';
import { isArrayEmpty } from '../utils/helpers';
import { omit } from 'lodash';
import { getDidDocPublicKeys } from '../utils/didHelper';
import { configData } from '../config';
import { doVerify } from '../utils/verify';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';
import { validateProof } from '../verifier/validateProof';
import logger from '../logger';

/**
 * Verify the CredentialRequests signatures.
 */
export async function verifySubjectCredentialRequests (authorization: string, issuerDid: string, subjectDid: string, subjectCredentialRequests: SubjectCredentialRequests): Promise<UnumDto<VerifiedStatus>> {
  requireAuth(authorization);

  // validate credentialRequests input; and grab the subjectDid for reference later
  validateSubjectCredentialRequests(subjectCredentialRequests, subjectDid);

  const result: UnumDto<VerifiedStatus> = await verifySubjectCredentialRequestsHelper(authorization, issuerDid, subjectCredentialRequests);
  let authToken = result.authToken;
  const { isVerified, message } = result.body;

  // handle sending back the ReceiptSubjectCredentialRequestVerifiedData receipt with the verification status
  authToken = await handleSubjectCredentialsRequestsVerificationReceipt(authToken, issuerDid, subjectDid, subjectCredentialRequests, isVerified, message);

  return {
    ...result,
    authToken
  };
}

/**
 * Validates the attributes for a credential request to UnumID's SaaS.
 * @param requests CredentialRequest
 */
const validateSubjectCredentialRequests = (requests: SubjectCredentialRequests, subjectDid: string): string => {
  if (!requests) {
    throw new CustError(400, 'SubjectCredentialRequests must be defined.');
  }

  if (isArrayEmpty(requests.credentialRequests)) {
    throw new CustError(400, 'Subject credentialRequests must be a non-empty array.');
  }

  if (!requests.proof) {
    throw new CustError(400, 'Invalid SubjectCredentialRequest: proof must be defined.');
  }

  validateProof(requests.proof);

  // handle validating the subject did is the identical to that of the proof
  if (subjectDid !== requests.proof.verificationMethod.split('#')[0]) {
    throw new CustError(400, `Invalid SubjectCredentialRequest: provided subjectDid, ${subjectDid}, must match that of the credential requests' signer, ${requests.proof.verificationMethod}.`);
  }

  for (let i = 0; i < requests.credentialRequests.length; i++) {
    const request = requests.credentialRequests[i];

    if (!request.type) {
      throw new CustError(400, `Invalid SubjectCredentialRequest[${i}]: type must be defined.`);
    }

    if (typeof request.type !== 'string') {
      throw new CustError(400, `Invalid SubjectCredentialRequest[${i}]: type must be a string.`);
    }

    if (!((request.required === false || request.required === true))) {
      throw new CustError(400, `Invalid SubjectCredentialRequest[${i}]: required must be defined.`);
    }

    if (!request.issuers) {
      throw new CustError(400, `Invalid SubjectCredentialRequest[${i}]: issuers must be defined.`);
    }
  }

  // return the subjectDid for reference now that have validated all the same across all requests
  return subjectDid;
};

async function verifySubjectCredentialRequestsHelper (authToken: string, issuerDid: string, subjectCredentialRequests: SubjectCredentialRequests): Promise<UnumDto<VerifiedStatus>> {
  const verificationMethod = subjectCredentialRequests.proof?.verificationMethod as string;
  const signatureValue = subjectCredentialRequests.proof?.signatureValue as string;

  const publicKeyInfoResponse: UnumDto<PublicKeyInfo[]> = await getDidDocPublicKeys(authToken, verificationMethod, 'secp256r1');
  const publicKeyInfoList: PublicKeyInfo[] = publicKeyInfoResponse.body;
  authToken = publicKeyInfoResponse.authToken;

  if (publicKeyInfoList.length === 0) {
    return {
      authToken,
      body: {
        isVerified: false,
        message: `Public key not found for the subject did ${verificationMethod}`
      }
    };
  }

  let isVerified = false;

  const unsignedSubjectCredentialRequests: UnsignedSubjectCredentialRequests = omit(subjectCredentialRequests, 'proof');

  // convert to bytes
  const bytes: Uint8Array = UnsignedSubjectCredentialRequests.encode(unsignedSubjectCredentialRequests).finish();

  // check all the public keys to see if any work, stop if one does
  for (const publicKeyInfo of publicKeyInfoList) {
    // verify the signature. call is backwards compatible with old signature base58 encoding.
    isVerified = doVerify(signatureValue, bytes, publicKeyInfo);
    if (isVerified) break;
  }

  if (!isVerified) {
    return {
      authToken,
      body: {
        isVerified: false,
        message: 'SubjectCredentialRequests signature can not be verified.'
      }
    };
  }

  return {
    authToken,
    body: {
      isVerified: true
    }
  };
}

/**
 * Handle sending back the SubjectCredentialRequestVerified receipt
 */
async function handleSubjectCredentialsRequestsVerificationReceipt (authorization: string, issuerDid: string, subjectDid: string, subjectCredentialRequests: SubjectCredentialRequests, isVerified: boolean, message?:string): Promise<string> {
  try {
    const requestInfo: CredentialRequest[] = subjectCredentialRequests.credentialRequests;

    const data: ReceiptSubjectCredentialRequestVerifiedData = {
      isVerified,
      requestInfo,
      reason: message
    };

    const receiptOptions: ReceiptOptions<ReceiptSubjectCredentialRequestVerifiedData> = {
      type: 'SubjectCredentialRequestVerified',
      issuer: issuerDid,
      subject: subjectDid,
      data
    };

    const receiptCallOptions: RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'receipt',
      header: { Authorization: authorization },
      data: receiptOptions
    };

    const resp: JSONObj = await makeNetworkRequest<JSONObj>(receiptCallOptions);

    const authToken = handleAuthTokenHeader(resp, authorization);

    return authToken;
  } catch (e) {
    logger.error(`Error sending SubjectCredentialRequestVerification Receipt to Unum ID SaaS. Error ${e}`);
  }

  return authorization;
}
