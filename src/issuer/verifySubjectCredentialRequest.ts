
import { RESTData, UnumDto, VerifiedStatus } from '../types';
import { CredentialRequestPb, JSONObj, SubjectCredentialRequest } from '@unumid/types';
import { requireAuth } from '../requireAuth';
// import { verifyCredentialHelper } from './verifyCredentialHelper';
import { CustError } from '../utils/error';
import { isArrayEmpty } from '../utils/helpers';
import { omit } from 'lodash';
import { getDIDDoc, getKeyFromDIDDoc } from '../utils/didHelper';
import { configData } from '../config';
import { doVerify } from '../utils/verify';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';
import { validateProof } from '../verifier/validateProof';
import logger from '../logger';
import { request } from 'express';

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
export async function verifySubjectCredentialRequests (authorization: string, issuerDid: string, credentialRequests: SubjectCredentialRequest[]): Promise<UnumDto<VerifiedStatus>> {
  requireAuth(authorization);

  // validate credentialRequests input; and grab the subjectDid for reference later
  const subjectDid = validateCredentialRequests(credentialRequests);

  let authToken = authorization;
  for (const credentialRequest of credentialRequests) {
    const result: UnumDto<VerifiedStatus> = await verifySubjectCredentialRequest(authToken, issuerDid, credentialRequest);
    const { isVerified, message } = result.body;
    authToken = result.authToken;

    // can stop here is not verified
    if (!result.body.isVerified) {
      // handle sending back the PresentationVerified receipt with the verification failure reason
      authToken = await handleSubjectCredentialsRequestsVerificationReceipt(authToken, issuerDid, subjectDid, credentialRequests, isVerified, message);

      return {
        ...result,
        authToken
      };
    }
  }

  authToken = await handleSubjectCredentialsRequestsVerificationReceipt(authToken, issuerDid, subjectDid, credentialRequests, true);

  // if made it this far then all SubjectCredentialRequests are verified
  return {
    authToken,
    body: {
      isVerified: true
    }
  };
}

export async function verifySubjectCredentialRequest (authorization: string, issuerDid: string, credentialRequest: SubjectCredentialRequest): Promise<UnumDto<VerifiedStatus>> {
  // validate that the issueDid is present in the request issuer array
  if (!credentialRequest.issuers.includes(issuerDid)) {
    return {
      authToken: authorization,
      body: {
        isVerified: false,
        message: `Issuer DID, ${issuerDid}, not found in credential request issuers ${credentialRequest.issuers}`
      }
    };
  }

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
        message: 'SubjectCredentialRequest signature can not be verified.'
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
async function handleSubjectCredentialsRequestsVerificationReceipt (authorization: string, issuerDid: string, subjectDid: string, credentialRequests: SubjectCredentialRequest[], isVerified: boolean, message?:string): Promise<string> {
  try {
    const credentialTypes = credentialRequests.map((request: { type: string; }) => request.type);

    const receiptOptions = {
      type: 'SubjectCredentialRequestVerified',
      issuer: issuerDid,
      subject: subjectDid,
      data: {
        isVerified,
        credentialTypes,
        reason: message
      }
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
