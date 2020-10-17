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

export interface PresentationRequestWithDeeplink extends SignedPresentationRequest {
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
  deeplink: string;
}

export interface UnsignedPresentation {
  '@context': ['https://www.w3.org/2018/credentials/v1', ...string[]];
  type: ['VerifiablePresentation', ...string[]];
  verifiableCredential: Credential;
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
