
import { RESTData, UnumDto, VerifiedStatus } from '../types';
import { JSONObj, ReceiptOptions, ReceiptSubjectDidDocumentVerifiedData, DID, UnsignedDID, PublicKeyInfo } from '@unumid/types';
import { requireAuth } from '../requireAuth';
import { CustError } from '../utils/error';
import { omit } from 'lodash';
import { getDidDocPublicKeys } from '../utils/didHelper';
import { configData } from '../config';
import { doVerify } from '../utils/verify';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';
import logger from '../logger';

/**
 * Validates the attributes for a DidDocument
 * @param requests CredentialRequest
 */
const validateSignedDid = (did: DID): void => {
  if (!did) {
    throw new CustError(400, 'SignedDid is required.');
  }

  const { id, proof } = did;

  if (!proof) {
    throw new CustError(400, 'proof is required.');
  }

  if (!id) {
    throw new CustError(400, 'id is required.');
  }
};

/**
 * Verify the CredentialRequests signatures.
 */
export async function verifySignedDid (authorization: string, issuerDid: string, signedDid: DID): Promise<UnumDto<VerifiedStatus>> {
  requireAuth(authorization);

  // validate the DID
  validateSignedDid(signedDid);

  let authToken = authorization;

  const result: UnumDto<VerifiedStatus> = await verifyDidSignature(authToken, signedDid);
  const { isVerified, message } = result.body;
  authToken = result.authToken;

  // handle sending back the SubjectDidDocumentVerified receipt
  authToken = await handleSubjectDidDocumentVerifiedReceipt(authToken, issuerDid, signedDid, isVerified, message);

  return {
    authToken,
    body: {
      isVerified,
      message
    }
  };
}

/**
 * Helper function to verify a Did signature.
 * @param authToken
 * @param did
 * @returns
 */
async function verifyDidSignature (authToken: string, did: DID): Promise<UnumDto<VerifiedStatus>> {
  const verificationMethod = did.proof.verificationMethod as string;
  const signatureValue = did.proof.signatureValue as string;

  // grab all 'secp256r1' keys from the DID document
  const publicKeyInfoResponse: UnumDto<PublicKeyInfo[]> = await getDidDocPublicKeys(authToken, verificationMethod, 'secp256r1');
  const publicKeyInfoList: PublicKeyInfo[] = publicKeyInfoResponse.body;
  authToken = publicKeyInfoResponse.authToken;

  const unsignedDid: UnsignedDID = omit(did, 'proof');

  // convert to byte array
  const bytes: Uint8Array = UnsignedDID.encode(unsignedDid).finish();

  let isVerified = false;

  // check all the public keys to see if any work, stop if one does
  for (const publicKeyInfo of publicKeyInfoList) {
    // verify the signature over the byte array
    isVerified = doVerify(signatureValue, bytes, publicKeyInfo);

    if (isVerified) {
      break;
    }
  }

  if (!isVerified) {
    const result: UnumDto<VerifiedStatus> = {
      authToken,
      body: {
        isVerified: false,
        message: 'Did signature can not be verified.'
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
 * Handle sending back the SubjectDidDocumentVerified receipt
 */
async function handleSubjectDidDocumentVerifiedReceipt (authorization: string, issuerDid: string, did: DID, isVerified: boolean, message?:string): Promise<string> {
  try {
    const subjectDid = did.id;

    const data: ReceiptSubjectDidDocumentVerifiedData = {
      did: subjectDid,
      isVerified,
      reason: message
    };

    const receiptOptions: ReceiptOptions<ReceiptSubjectDidDocumentVerifiedData> = {
      type: 'SubjectDidDocumentVerified',
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
