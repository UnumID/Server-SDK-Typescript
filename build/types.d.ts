import { KeyPairSet, Proof, PublicKeyInfo } from 'library-issuer-verifier-utility';

/**
 * Encapsulates necessary Verifier entity attributes during creation.
 */
export interface VerifierOptions {
  name: string;
  customerUuid: string;
  url: string;
  publicKeyInfo: Array<PublicKeyInfo>;
}

/**
 * Encapsulates necessary CredentialRequest entity attributes.
 */
export interface CredentialRequest {
  type: string;
  issuers: string[];
  required?: boolean;
}

/**
 * Encapsulates PresentationRequest attributes.
 */
export interface PresentationRequestParams {
  credentialRequests: CredentialRequest[];
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt?: Date;
  holderAppUuid: string;
  metadata?: any;
  verifier: string;
}

/**
 * Encapsulates addition request attributes to the general presentation request type for the purposes of sending a verification request.
 */
export interface SendRequestReqBody extends PresentationRequestParams {
  eccPrivateKey: string;
}

/**
 * Encapsulates addition request attributes to the general presentation request type for the purposes of sending an unsigned presentation request.
 */
export interface UnsignedPresentationRequest extends PresentationRequestParams {
  uuid: string;
}

/**
 * Encapsulates addition request attributes to the unsigned presentation request type for the purposes of sending a signed presentation request.
 */
export interface SignedPresentationRequest extends UnsignedPresentationRequest {
  proof: Proof;
}

/**
 * Encapsulates addition request attributes to the signed presentation request type for the purposes of valid presentation request with metadata.
 */
export interface PresentationRequest extends SignedPresentationRequest {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Encapsulates a verifiable credential attributes.
 */

export interface VerifiableCredential {
  ['@context']: ['https://www.w3.org/2018/credentials/v1', ...string[]];
  id: string;
  credentialSubject: any;
  credentialStatus: { id: string, type: string };
  issuer: string;
  type: ['VerifiableCredential', ...string[]];
  issuanceDate: Date;
  expirationDate?: Date;
  proof: Proof;
}

/**
 * Encapsulates an unsigned presentation attributes.
 */
export interface UnsignedPresentation {
  '@context': ['https://www.w3.org/2018/credentials/v1', ...string[]];
  type: ['VerifiablePresentation', ...string[]];
  verifiableCredential: VerifiableCredential[];
  presentationRequestUuid: string;
  uuid: string;
}

/**
 * Encapsulates addition attributes to the unsigned presentation entity to create a Presentation entity.
 */
export interface Presentation extends UnsignedPresentation {
  proof: Proof;
}

/**
 * Encapsulates attributes for a presentation request declined.
 */
export interface NoPresentation {
  type: ['NoPresentation', ...string[]];
  proof: Proof;
  holder: string;
  presentationRequestUuid: string;
}

/**
 * Encapsulates API Key attributes for Verifier registration.
 */
export interface VerifierApiKey {
  uuid: string;
  type: 'Verifier';
  key: string;
  customerUuid: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Encapsulates Verifier metadata attributes.
 */
export interface VerifierInfo {
  did: string;
  name: string;
  url: string;
}

/**
 * Encapsulates Issuer metadata attributes.
 */
export interface IssuerInfo {
  did: string;
  name: string;
}

/**
 * Encapsulates a map of Issuer metadata attributes keyed on the corresponding did.
 */
export interface IssuerInfoMap {
  [did: string]: IssuerInfo;
}

/**
 * Encapsulates the response attributes of a PresentationRequest.
 */
export interface PresentationRequestResponse {
  presentationRequest: PresentationRequest;
  verifier: VerifierInfo;
  issuers: IssuerInfoMap;
  deeplink: string;
  qrCode: string;
}

/**
 * Encapsulates the statues of a Credential.
 */
export interface CredentialStatus {
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
  credentialId: string;
  status: 'valid' | 'revoked';
}

/**
 * Encapsulates a generic error response types of any network request.
 */
export interface ErrorResponseBody {
  code: number;
  message: string;
}

/**
 * Encapsulates Verifier entity attributes.
 */
export interface Verifier {
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
  isAuthorized: boolean;
  customerUuid: string;
  name: string;
  did: string;
  url: string;
}

/**
 * Encapsulates a Data Transfer Object for a successfully registered Verifier entity.
 */
export interface RegisteredVerifierDto extends Verifier {
  keys: KeyPairSet;
  authToken: string;
}

/**
 * Encapsulates a Data Transfer Object for a response from UnumID's SaaS.
 */
export interface VerifierDto<T = Record<string, unknown>> {
  authToken: string;
  body: T;
}

/**
 * Encapsulates a Reciept entity.
 */
export interface Receipt {
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
  type: string[];
  subject: string;
  issuer: string;
  isVerified: boolean;
}
