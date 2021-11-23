
import { RESTData, UnumDto, VerifiedStatus } from '../types';
import { CredentialRequestPb, DidDocument, DidDocumentService, JSONObj, PublicKeyInfo, SubjectCredentialRequest } from '@unumid/types';
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
 * Validate a DidDocument's ServiceInfo
 * @param service
 */
const validateServiceInfo = (service: DidDocumentService): void => {
  const { id, serviceEndpoint, type } = service;

  if (!id) {
    throw new CustError(400, 'Invalid service: id is required.');
  }

  if (!serviceEndpoint) {
    throw new CustError(400, 'Invalid service: serviceEndpoint is required.');
  }

  if (!type) {
    throw new CustError(400, 'Invalid service: type is required.');
  }

  if (typeof id !== 'string') {
    throw new CustError(400, 'Invalid service: expected id to be a string.');
  }

  if (typeof serviceEndpoint !== 'string') {
    throw new CustError(400, 'Invalid service: expected serviceEndpoint to be a string.');
  }

  if (typeof type !== 'string') {
    throw new CustError(400, 'Invalid service: expected type to be a string.');
  }
};

/**
 * Validate a DidDocument's PublicInfo
 * @param pki
 */
const validatePublicKeyInfo = (pki: PublicKeyInfo): void => {
  // check that pki is an object
  if (typeof pki !== 'object') {
    throw new CustError(400, 'Invalid publicKeyInfo: expected array of objects.');
  }

  if (Array.isArray(pki)) {
    throw new CustError(400, 'Invalid publicKeyInfo: expected array of objects.');
  }

  const {
    id,
    publicKey,
    encoding,
    type
  } = pki;

  // check for each required property
  if (!id) {
    throw new CustError(400, 'Invalid publicKeyInfo: id is required.');
  }

  if (!publicKey) {
    throw new CustError(400, 'Invalid publicKeyInfo: publicKey is required.');
  }

  if (!encoding) {
    throw new CustError(400, 'Invalid publicKeyInfo: encoding is required.');
  }

  if (!type) {
    throw new CustError(400, 'Invalid publicKeyInfo: type is required.');
  }

  // check that all values are the correct type
  if (typeof id !== 'string') {
    throw new CustError(400, 'Invalid publicKeyInfo: expected id to be a string.');
  }

  if (typeof publicKey !== 'string') {
    throw new CustError(400, 'Invalid publicKeyInfo: expected publicKey to be a string.');
  }

  if (!['base58', 'pem'].includes(encoding)) {
    throw new CustError(400, 'Invalid publicKeyInfo: expected encoding to be one of \'base58\', \'pem\'.');
  }

  if (!['RSA', 'secp256r1'].includes(type)) {
    throw new CustError(400, 'Invalid publicKeyInfo: expected type to be one of \'RSA\', \'secp256r1\'.');
  }
};

/**
 * Validates the attributes for a DidDocument
 * @param requests CredentialRequest
 */
const validateDidDocument = (doc: DidDocument): void => {
  const { id, created, updated, publicKey, service } = doc;

  if (!id) {
    throw new CustError(400, 'id is required.');
  }

  if (!doc['@context']) {
    throw new CustError(400, '@context is required.');
  }

  if (!created) {
    throw new CustError(400, 'created is required');
  }

  if (!updated) {
    throw new CustError(400, 'updated is required');
  }

  if (!publicKey) {
    throw new CustError(400, 'publicKey is required');
  }

  if (!service) {
    throw new CustError(400, 'service is required');
  }

  if (typeof id !== 'string') {
    throw new CustError(400, 'Invalid id: expected string.');
  }

  if (typeof created !== 'string') {
    throw new CustError(400, 'Invalid created: expected string.');
  }

  if (typeof updated !== 'string') {
    throw new CustError(400, 'Invalid updated: expected string.');
  }

  if (!Array.isArray(publicKey)) {
    throw new CustError(400, 'Invalid publicKey: expected array.');
  }

  if (!Array.isArray(service)) {
    throw new CustError(400, 'Invalid service: expected array.');
  }

  if (!Array.isArray(doc['@context'])) {
    throw new CustError(400, 'Invalid @context: expected array.');
  }

  if (doc['@context'][0] !== 'https://www.w3.org/ns/did/v1') {
    throw new CustError(400, 'Invalid @context');
  }

  publicKey.forEach(validatePublicKeyInfo);
  service.forEach(validateServiceInfo);
};
/**
 * Verify the CredentialRequests signatures.
 */
export async function verifyDidDocument (authorization: string, didDocument: DidDocument): Promise<UnumDto<VerifiedStatus>> {
  requireAuth(authorization);

  // validate the DidDocument
  const subjectDid = validateDidDocument(didDocument);

  let authToken = authorization;

  const result: UnumDto<VerifiedStatus> = await verifyDidDocumentHelper(authToken, didDocument);
  const { isVerified, message } = result.body;
  authToken = result.authToken;

  // can stop here is not verified
  if (!result.body.isVerified) {
    // handle sending back the PresentationVerified receipt with the verification failure reason
    authToken = await handleDidDocumentVerifiedReceipt(authToken, issuerDid, subjectDid, credentialRequests, isVerified, message);

    return {
      ...result,
      authToken
    };
  }

  authToken = await handleDidDocumentVerifiedReceipt(authToken, issuerDid, subjectDid, credentialRequests, true);

  // if made it this far then all SubjectCredentialRequests are verified
  return {
    authToken,
    body: {
      isVerified: true
    }
  };
}

export async function verifyDidDocumentHelper (authorization: string, didDocument: DidDocument): Promise<UnumDto<VerifiedStatus>> {
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

  const verificationMethod = didDocument.proof.verificationMethod as string;
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
 * Handle sending back the DidDocumentVerified receipt
 */
async function handleDidDocumentVerifiedReceipt (authorization: string, issuerDid: string, subjectDid: string, didDocument: DidDocument, isVerified: boolean, message?:string): Promise<string> {
  try {
    const receiptOptions = {
      type: 'DidDocumentVerified',
      issuer: issuerDid,
      subject: subjectDid,
      data: {
        did: didDocument.id,
        isVerified,
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
