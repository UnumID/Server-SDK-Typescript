
import { RESTData, UnumDto, VerifiedStatus } from '../types';
import { CredentialRequestInfoBasic, CredentialRequestPb, JSONObj, ReceiptOptions, ReceiptSubjectCredentialRequestVerifiedData, PublicKeyInfo, SubjectCredentialRequests, CredentialRequest } from '@unumid/types';
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
import { UnsignedSubjectCredentialRequests } from '@unumid/types/build/protos/credential';

/**
 * Validates the attributes for a credential request to UnumID's SaaS.
 * @param requests CredentialRequest
 */
const validateCredentialRequests = (requests: SubjectCredentialRequests, subjectDid: string): string => {
  if (isArrayEmpty(requests) || !requests) {
    throw new CustError(400, 'subjectCredentialRequests must be a non-empty array.');
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
/**
 * Verify the CredentialRequests signatures.
 */
export async function verifySubjectCredentialRequests (authorization: string, issuerDid: string, subjectDid: string, credentialRequests: SubjectCredentialRequests): Promise<UnumDto<VerifiedStatus>> {
  requireAuth(authorization);

  // validate credentialRequests input; and grab the subjectDid for reference later
  validateCredentialRequests(credentialRequests, subjectDid);

  const result: UnumDto<VerifiedStatus> = await verifySubjectCredentialRequestsHelper(authorization, issuerDid, credentialRequests);
  let authToken = result.authToken;
  const { isVerified, message } = result.body;

  // let authToken = authorization;
  // for (const credentialRequest of credentialRequests) {
  //   const result: UnumDto<VerifiedStatus> = await verifySubjectCredentialRequestsHelper(authToken, issuerDid, credentialRequest);
  //   const { isVerified, message } = result.body;
  //   authToken = result.authToken;

  //   // can stop here is not verified
  //   if (!result.body.isVerified) {
  //     // handle sending back the ReceiptSubjectCredentialRequestVerifiedData receipt with the verification failure reason
  //     authToken = await handleSubjectCredentialsRequestsVerificationReceipt(authToken, issuerDid, subjectDid, credentialRequests, isVerified, message);

  //     return {
  //       ...result,
  //       authToken
  //     };
  //   }
  // }

  // if (!result.body.isVerified) {
  //   // handle sending back the ReceiptSubjectCredentialRequestVerifiedData receipt with the verification failure reason
  //   authToken = await handleSubjectCredentialsRequestsVerificationReceipt(authToken, issuerDid, subjectDid, credentialRequests, isVerified, message);

  //   return {
  //     ...result,
  //     authToken
  //   };
  // }

  // handle sending back the ReceiptSubjectCredentialRequestVerifiedData receipt with the verification status
  authToken = await handleSubjectCredentialsRequestsVerificationReceipt(authToken, issuerDid, subjectDid, credentialRequests, isVerified, message);

  return {
    ...result,
    authToken
  };
}

export async function verifySubjectCredentialRequestsHelper (authToken: string, issuerDid: string, subjectCredentialRequests: SubjectCredentialRequests): Promise<UnumDto<VerifiedStatus>> {
  const verificationMethod = subjectCredentialRequests.proof?.verificationMethod as string;
  const signatureValue = subjectCredentialRequests.proof?.signatureValue as string;

  // // validate that the issueDid is present in the request issuer array
  // if (!credentialRequests.issuers.includes(issuerDid)) {
  //   return {
  //     authToken,
  //     body: {
  //       isVerified: false,
  //       message: `Issuer DID, ${issuerDid}, not found in credential request issuers ${credentialRequest.issuers}`
  //     }
  //   };
  // }

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
    const { publicKey, encoding } = publicKeyInfo;

    // verify the signature
    isVerified = doVerify(signatureValue, bytes, publicKey, encoding);
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

// export async function verifySubjectCredentialRequestsHelper (authToken: string, issuerDid: string, credentialRequests: SubjectCredentialRequests): Promise<UnumDto<VerifiedStatus>> {
//   const verificationMethod = credentialRequests.proof?.verificationMethod as string;
//   const signatureValue = credentialRequests.proof?.signatureValue as string;

//   // // validate that the issueDid is present in the request issuer array
//   // if (!credentialRequests.issuers.includes(issuerDid)) {
//   //   return {
//   //     authToken,
//   //     body: {
//   //       isVerified: false,
//   //       message: `Issuer DID, ${issuerDid}, not found in credential request issuers ${credentialRequest.issuers}`
//   //     }
//   //   };
//   // }

//   const publicKeyInfoResponse: UnumDto<PublicKeyInfo[]> = await getDidDocPublicKeys(authToken, verificationMethod, 'secp256r1');
//   const publicKeyInfoList: PublicKeyInfo[] = publicKeyInfoResponse.body;
//   authToken = publicKeyInfoResponse.authToken;

//   if (publicKeyInfoList.length === 0) {
//     return {
//       authToken,
//       body: {
//         isVerified: false,
//         message: `Public key not found for the subject did ${verificationMethod}`
//       }
//     };
//   }

//   let isVerified = false;

//   const unsignedCredentialRequest: CredentialRequestPb = omit(credentialRequest, 'proof');

//   // convert to bytes
//   const bytes: Uint8Array = CredentialRequestPb.encode(unsignedCredentialRequest).finish();

//   // check all the public keys to see if any work, stop if one does
//   for (const publicKeyInfo of publicKeyInfoList) {
//     const { publicKey, encoding } = publicKeyInfo;

//     // verify the signature
//     isVerified = doVerify(signatureValue, bytes, publicKey, encoding);
//     if (isVerified) break;
//   }

//   if (!isVerified) {
//     return {
//       authToken,
//       body: {
//         isVerified: false,
//         message: 'SubjectCredentialRequest signature can not be verified.'
//       }
//     };
//   }

//   return {
//     authToken,
//     body: {
//       isVerified: true
//     }
//   };
// }

/**
 * Handle sending back the SubjectCredentialRequestVerified receipt
 */
async function handleSubjectCredentialsRequestsVerificationReceipt (authorization: string, issuerDid: string, subjectDid: string, subjectCredentialRequests: SubjectCredentialRequests, isVerified: boolean, message?:string): Promise<string> {
  try {
    // const requestInfo: CredentialRequest[] = subjectCredentialRequests.credentialRequests.map((request) => request);
    // const requstInfo: CredentialRequest[] = flatten2DArray(subjectCredentialRequests.credentialRequests);
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
