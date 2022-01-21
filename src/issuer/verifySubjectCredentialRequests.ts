
import { RESTData, UnumDto, VerifiedStatus } from '../types';
import { CredentialRequestInfoBasic, CredentialRequestPb, JSONObj, ReceiptOptions, SubjectCredentialRequest, ReceiptSubjectCredentialRequestVerifiedData, PublicKeyInfo, DidDocument } from '@unumid/types';
import { requireAuth } from '../requireAuth';
import { CustError } from '../utils/error';
import { isArrayEmpty } from '../utils/helpers';
import { omit } from 'lodash';
import { getDIDDoc, getDidDocPublicKeys, getKeysFromDIDDoc } from '../utils/didHelper';
import { configData } from '../config';
import { doVerify } from '../utils/verify';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';
import { validateProof } from '../verifier/validateProof';
import logger from '../logger';

/**
 * Validates the attributes for a credential request to UnumID's SaaS.
 * @param requests CredentialRequest
 */
const validateCredentialRequests = (requests: SubjectCredentialRequest[], subjectDid: string): string => {
  if (isArrayEmpty(requests) || !requests) {
    throw new CustError(400, 'subjectCredentialRequests must be a non-empty array.');
  }

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

    if (!((request.required === false || request.required === true))) {
      throw new CustError(400, `Invalid SubjectCredentialRequest[${i}]: required must be defined.`);
    }

    if (!request.issuers) {
      throw new CustError(400, `Invalid SubjectCredentialRequest[${i}]: issuers must be defined.`);
    }

    // handle validating the subject did is the identical fr all requests
    if (subjectDid !== request.proof.verificationMethod.split('#')[0]) {
      throw new CustError(400, `Invalid SubjectCredentialRequest[${i}]: provided subjectDid, ${subjectDid}, must match that of the credential requests' signer, ${request.proof.verificationMethod}.`);
    }
  }

  // return the subjectDid for reference now that have validated all the same across all requests
  return subjectDid;
};
/**
 * Verify the CredentialRequests signatures.
 */
export async function verifySubjectCredentialRequests (authorization: string, issuerDid: string, subjectDid: string, credentialRequests: SubjectCredentialRequest[]): Promise<UnumDto<VerifiedStatus>> {
  requireAuth(authorization);

  // validate credentialRequests input; and grab the subjectDid for reference later
  validateCredentialRequests(credentialRequests, subjectDid);

  let authToken = authorization;
  for (const credentialRequest of credentialRequests) {
    const result: UnumDto<VerifiedStatus> = await verifySubjectCredentialRequest(authToken, issuerDid, credentialRequest);
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
      isVerified: true
    }
  };
}

export async function verifySubjectCredentialRequest (authToken: string, issuerDid: string, credentialRequest: SubjectCredentialRequest): Promise<UnumDto<VerifiedStatus>> {
  const verificationMethod = credentialRequest.proof?.verificationMethod as string;
  const signatureValue = credentialRequest.proof?.signatureValue as string;

  // validate that the issueDid is present in the request issuer array
  if (!credentialRequest.issuers.includes(issuerDid)) {
    return {
      authToken,
      body: {
        isVerified: false,
        message: `Issuer DID, ${issuerDid}, not found in credential request issuers ${credentialRequest.issuers}`
      }
    };
  }

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

  // TODO update DID
  const { publicKey, encoding } = publicKeyInfoList[0];

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
        message: 'SubjectCredentialRequest signature can not be verified.'
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
