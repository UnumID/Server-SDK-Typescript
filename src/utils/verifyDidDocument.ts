
import { RESTData, UnumDto, VerifiedStatus } from '../types';
import { DidDocument, DidDocumentService, JSONObj, PublicKeyInfo, ReceiptOptions, SignedDidDocument, ReceiptSubjectDidDocumentVerifiedData } from '@unumid/types';
import { requireAuth } from '../requireAuth';
import { CustError } from '../utils/error';
import { omit } from 'lodash';
import { getDIDDoc, getKeyFromDIDDoc } from '../utils/didHelper';
import { configData } from '../config';
import { doVerifyDeprecated } from '../utils/verify';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';
import { validateProofDeprecated } from '../verifier/validateProof';
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
const validateDidDocument = (doc: SignedDidDocument): void => {
  if (!doc) {
    throw new CustError(400, 'SignedDidDocument is required.');
  }

  const { id, created, updated, publicKey, service, proof } = doc;

  if (!proof) {
    throw new CustError(400, 'proof is required.');
  }

  validateProofDeprecated(proof);

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

  // if (typeof created !== 'string') {
  //   throw new CustError(400, 'Invalid created: expected string.');
  // }

  //   if (typeof updated !== 'string') {
  //     throw new CustError(400, 'Invalid updated: expected string.');
  //   }

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
export async function verifySubjectDidDocument (authorization: string, issuerDid: string, didDocument: SignedDidDocument): Promise<UnumDto<VerifiedStatus>> {
  requireAuth(authorization);

  // validate the DidDocument
  validateDidDocument(didDocument);

  let authToken = authorization;

  const result: UnumDto<VerifiedStatus> = await verifyDidDocument(authToken, didDocument);
  const { isVerified, message } = result.body;
  authToken = result.authToken;

  // handle sending back the SubjectDidDocumentVerified receipt
  authToken = await handleSubjectDidDocumentVerifiedReceipt(authToken, issuerDid, didDocument, isVerified, message);

  return {
    authToken,
    body: {
      isVerified,
      message
    }
  };
}

export async function verifyDidDocument (authorization: string, didDocument: SignedDidDocument): Promise<UnumDto<VerifiedStatus>> {
  const verificationMethod = didDocument.proof.verificationMethod as string;
  const signatureValue = didDocument.proof.signatureValue as string;

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

  const unsignedDidDocument: DidDocument = omit(didDocument, 'proof');

  // verify the signature
  // TODO upon v4 work this needs to use the proto didDocument def so can use the byte array
  const isVerified = doVerifyDeprecated(signatureValue, unsignedDidDocument, publicKey, encoding);

  if (!isVerified) {
    const result: UnumDto<VerifiedStatus> = {
      authToken,
      body: {
        isVerified: false,
        message: 'DidDocument signature can not be verified.'
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
async function handleSubjectDidDocumentVerifiedReceipt (authorization: string, issuerDid: string, didDocument: DidDocument, isVerified: boolean, message?:string): Promise<string> {
  try {
    const subjectDid = didDocument.id;

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
