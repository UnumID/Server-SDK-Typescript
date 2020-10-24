export interface VerifierOptions {
  name: string;
  customerUuid: string;
  url: string;
  publicKeyInfo: Array<PublicKeyInfo>;
}

export interface CredentialRequest {
  type: string;
  issuers: string[];
  required?: boolean;
}

export interface UnsignedPresentationRequest {
  verifier: string;
  credentialRequests: CredentialRequest[];
  metadata?: any;
  expiresAt?: Date;
  holderAppUuid: string;
}

export interface SignedPresentationRequest extends UnsignedPresentationRequest {
  proof: Proof;
}

export interface PresentationRequest extends SignedPresentationRequest {
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface UnsignedPresentation {
  '@context': ['https://www.w3.org/2018/credentials/v1', ...string[]];
  type: ['VerifiablePresentation', ...string[]];
  verifiableCredential: VerifiableCredential[];
  presentationRequestUuid: string;
  uuid: string;
}

export interface Presentation extends UnsignedPresentation {
  proof: Proof;
}

export interface NoPresentation {
  type: ['NoPresentation', ...string[]];
  proof: Proof;
  holder: string;
  presentationRequestUuid: string;
}

export interface VerifierApiKey {
  uuid: string;
  type: 'Verifier';
  key: string;
  customerUuid: string;
}

export interface VerifierInfo {
  did: string;
  name: string;
  url: string;
}

export interface IssuerInfo {
  did: string;
  name: string;
}

export interface IssuerInfoMap {
  [did: string]: IssuerInfo;
}

export interface PresentationRequestResponse {
  presentationRequest: PresentationRequest;
  verifier: VerifierInfo;
  issuers: IssuerInfoMap;
  deeplink: string;
  qrCode: string;
}

export interface CredentialStatus {
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
  credentialId: string;
  status: 'valid' | 'revoked';
}
