
import { RESTData, UnumDto, VerifiedStatus } from '../types';
import { JSONObj, ReceiptOptions, ReceiptSubjectDidDocumentVerifiedData, DID, UnsignedDID } from '@unumid/types';
import { requireAuth } from '../requireAuth';
import { CustError } from '../utils/error';
import { omit } from 'lodash';
import { getDIDDoc, getKeyFromDIDDoc } from '../utils/didHelper';
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
export async function verifySubjectDidDocument (authorization: string, issuerDid: string, signedDid: DID): Promise<UnumDto<VerifiedStatus>> {
  requireAuth(authorization);

  // validate the DID
  validateSignedDid(signedDid);

  let authToken = authorization;

  const result: UnumDto<VerifiedStatus> = await verifyDid(authToken, signedDid);
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

async function verifyDid (authorization: string, did: DID): Promise<UnumDto<VerifiedStatus>> {
  const verificationMethod = did.proof.verificationMethod as string;
  const signatureValue = did.proof.signatureValue as string;

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

  const unsignedDid: UnsignedDID = omit(did, 'proof');

  // convert to byte array
  const bytes: Uint8Array = UnsignedDID.encode(unsignedDid).finish();

  // verify the signature over the byte array
  const isVerified = doVerify(signatureValue, bytes, publicKey, encoding);

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
