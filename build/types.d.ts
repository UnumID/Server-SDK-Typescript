import { CredentialStatusOptions, Issuer, CredentialSubject, Verifier, CredentialRequest, Presentation, KeyPair, PublicKeyInfo, JSONObj, PresentationPb, CredentialRequestPb } from '@unumid/types';

/**
 * Interface for key pairs. One for signing purposes and the other for encryption.
 * The signing key pair is generally an ecc key while the encryption is RSA.
 */
export interface KeyPairSet {
  signing: KeyPair;
  encryption: KeyPair;
}

/**
 * JSON string catch all type
 */
export type JSONStr = any;

/**
 * Interface to encapsulate all necessary information for a network request.
 */
export interface RESTData {
  method: string;
  baseUrl: string;
  endPoint: string;
  header?: JSONObj;
  data?: JSONObj;
}

/**
 * Interface to encapsulate network request responses.
 */
export interface RESTResponse<T = Record<string, unknown>> {
  headers: {
    [key: string]: string | string[];
  }
  body: T;
  [key: string]: any;
}

/**
 * Encapsulates necessary Credential entity attributes during creation.
 */
export interface CredentialOptions {
  credentialSubject: CredentialSubject;
  issuer: string;
  type: string[];
  expirationDate?: Date;
}

/**
 * Encapsulates API Key attributes for Issuer registration.
 */
export interface IssuerApiKey {
  uuid: string;
  customerUuid: string;
  key: string;
  type: 'Issuer';
}

/**
 * Encapsulates a successfully registered Issuer entity.
 */
export interface RegisteredIssuer extends Issuer {
  keys: KeyPairSet;
}

/**
 * Encapsulates PresentationRequest attributes.
 */
export interface PresentationRequestParams {
  credentialRequests: CredentialRequestPb[];
  holderAppUuid: string;
  verifier: string;
  id: string; // identifier for related requests between versions
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt?: Date;
  metadata?: any;
}

/**
 * Encapsulates addition request attributes to the general presentation request type for the purposes of sending a verification request.
 */
export interface SendRequestReqBody extends PresentationRequestParams {
  eccPrivateKey: string;
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
 * Encapsulates the statues of a Credential with the internal uuid.
 */
export interface CredentialStatus extends CredentialStatusInfo {
  uuid: string;
}

/**
 * Encapsulates the statues of a Credential.
 */
export interface CredentialStatusInfo {
  createdAt: Date;
  updatedAt: Date;
  credentialId: string;
  status: CredentialStatusOptions
}

/**
 * Encapsulates a generic error response types of any network request.
 */
export interface ErrorResponseBody {
  code: number;
  message: string;
}

/**
 * Encapsulates a registered Verifier entity.
 */
export interface RegisteredVerifier extends Verifier {
  keys: KeyPairSet;
}

/**
 * A type to convey why a presentation can not be verified.
 * While this would normally be served by throwing an exception we want to pass back the auth token returned
 * by calls to the SaaS via the UnumDto type.
 */
export interface VerifiedStatus {
  isVerified: boolean;
  message?: string;
}

/**
 * A type came about need to convey that a credential presentation can not be verified.
 * While this would normally be served by throwing an exception we want to pass back the auth token returned
 * by calls to the SaaS via the UnumDto type.
 */
export interface DecryptedPresentation extends VerifiedStatus {
  type: 'VerifiablePresentation' | 'DeclinedPresentation'
  presentation: PresentationPb
}

/**
 * A type which simplifies handling the information useful for analytics in a presentation.
 */
export interface CredentialInfo {
  credentialTypes: string[], // Just the credentials types that were included in the presentation
  subjectDid: string // the subjectDid that presented the credentials in the presentation
}

/**
 * Encapsulates a UnumID Data Transfer Object for a response from UnumID's SaaS.
 */
export interface UnumDto<T = Record<string, unknown>> {
  authToken: string;
  body: T;
}

// export interface PresentationRequestRepoDto {
//   presentationRequests: Record<string, PresentationRequestDto> ;
// }
