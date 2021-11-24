
import { RESTData, SubjectCredentialRequestVerifiedStatus, UnumDto, VerifiedStatus } from '../types';
import { CredentialRequestInfoBasic, CredentialRequestPb, JSONObj, ReceiptOptions, SubjectCredentialRequest, ReceiptSubjectCredentialRequestVerifiedData } from '@unumid/types';
import { requireAuth } from '../requireAuth';
import { CustError } from '../utils/error';
import { isArrayEmpty } from '../utils/helpers';
import { omit } from 'lodash';
import { getDIDDoc, getKeyFromDIDDoc } from '../utils/didHelper';
import { configData } from '../config';
import { doVerify } from '../utils/verify';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';
import { validateProof } from '../verifier/validateProof';
import logger from '../logger';

/**
 * Validates the attributes for a credential request to UnumID's SaaS.
 * @param requests CredentialRequest
 */
const validateCredentialRequests = (requests: SubjectCredentialRequest[]): string => {
  if (isArrayEmpty(requests) || !requests) {
    throw new CustError(400, 'subjectCredentialRequests must be a non-empty array.');
  }

  let subjectDid = '';

  for (let i = 0; i < requests.length; i++) {
    const request = requests[i];

    if (!request.proof) {
      throw new CustError(400, `Invalid SubjectCredentialRequest[${i}]: proof must be defined.`);
    }

    validateProof(request.proof);

    if (!request.type) {
      throw new CustError(400, `Invalid SubjectCredentialRequest[${i}]: type must be defined.`);
    }

    if (typeof request.type !== 'string') {
      throw new CustError(400, `Invalid SubjectCredentialRequest[${i}]: type must be a string.`);
    }

    if (!request.issuers) {
      throw new CustError(400, `Invalid SubjectCredentialRequest[${i}]: issuers must be defined.`);
    }

    // handle validating the subject did is the identical fr all requests
    if (i === 0) {
      subjectDid = request.proof.verificationMethod;
    } else {
      if (subjectDid !== request.proof.verificationMethod) {
        throw new CustError(400, 'Invalid SubjectCredentialRequests: subjectDid must identical per batch of requests.');
      }
    }
  }

  // return the subjectDid for reference now that have validated all the same across all requests
  return subjectDid;
};
/**
 * Verify the CredentialRequests signatures.
 */
export async function verifySubjectCredentialRequests (authorization: string, issuerDid: string, credentialRequests: SubjectCredentialRequest[]): Promise<UnumDto<SubjectCredentialRequestVerifiedStatus>> {
  requireAuth(authorization);

  // validate credentialRequests input; and grab the subjectDid for reference later
  const subjectDid = validateCredentialRequests(credentialRequests);

  let authToken = authorization;
  for (const credentialRequest of credentialRequests) {
    const result: UnumDto<SubjectCredentialRequestVerifiedStatus> = await verifySubjectCredentialRequest(authToken, issuerDid, credentialRequest);
    const { isVerified, message } = result.body;
    authToken = result.authToken;

    // can stop here is not verified
    if (!result.body.isVerified) {
      // handle sending back the ReceiptSubjectCredentialRequestVerifiedData receipt with the verification failure reason
      authToken = await handleSubjectCredentialsRequestsVerificationReceipt(authToken, issuerDid, subjectDid, credentialRequests, isVerified, message);

      return {
        ...result,
        authToken
      };
    }
  }

  // if made it this far then all SubjectCredentialRequests are verified
  authToken = await handleSubjectCredentialsRequestsVerificationReceipt(authToken, issuerDid, subjectDid, credentialRequests, true);

  return {
    authToken,
    body: {
      isVerified: true,
      subjectDid
    }
  };
}

export async function verifySubjectCredentialRequest (authorization: string, issuerDid: string, credentialRequest: SubjectCredentialRequest): Promise<UnumDto<SubjectCredentialRequestVerifiedStatus>> {
  const verificationMethod = credentialRequest.proof?.verificationMethod as string;
  const signatureValue = credentialRequest.proof?.signatureValue as string;

  // validate that the issueDid is present in the request issuer array
  if (!credentialRequest.issuers.includes(issuerDid)) {
    return {
      authToken: authorization,
      body: {
        isVerified: false,
        message: `Issuer DID, ${issuerDid}, not found in credential request issuers ${credentialRequest.issuers}`,
        subjectDid: verificationMethod
      }
    };
  }

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
        message: `Public key not found for the subject did ${verificationMethod}`,
        subjectDid: verificationMethod
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
    return {
      authToken,
      body: {
        isVerified: false,
        message: 'SubjectCredentialRequest signature can not be verified.',
        subjectDid: verificationMethod
      }
    };
  }

  return {
    authToken,
    body: {
      isVerified: true,
      subjectDid: verificationMethod
    }
  };
}

/**
 * Handle sending back the SubjectCredentialRequestVerified receipt
 */
async function handleSubjectCredentialsRequestsVerificationReceipt (authorization: string, issuerDid: string, subjectDid: string, credentialRequests: SubjectCredentialRequest[], isVerified: boolean, message?:string): Promise<string> {
  try {
    const requestInfo: CredentialRequestInfoBasic[] = credentialRequests.map((request) => omit(request, 'proof'));

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
