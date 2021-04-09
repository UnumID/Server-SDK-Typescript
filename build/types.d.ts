import { KeyPairSet, PublicKeyInfo } from '@unumid/library-issuer-verifier-utility';
import { CredentialStatusOptions, Issuer, CredentialSubject, Verifier, PresentationRequest, VerifierInfo, IssuerInfoMap, CredentialRequest, Presentation, NoPresentation } from '@unumid/types';

/**
 * Encapsulates necessary Issuer entity attributes during creation.
 */
export interface IssuerOptions {
  name: string;
  customerUuid: string;
  publicKeyInfo: Array<PublicKeyInfo>;
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

export type PresentationOrNoPresentation = Presentation | NoPresentation;

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
  type: 'VerifiablePresentation' | 'NoPresentation'
  presentation: Presentation | NoPresentation
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
