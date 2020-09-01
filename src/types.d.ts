export interface VerifierOptions {
  name: string;
  customerUuid: string;
  publicKeyInfo: Array<PublicKeyInfo>;
}

export interface VerifierInfo {
  name: string;
  did: string;
  url: string;
}

export interface IssuerInfo {
  did: string;
  name: string;
  url?: string;
  required?: boolean;
}

export interface CredentialRequest {
  type: string;
  issuers: IssuerInfo[];
  required?: boolean;
}

export interface UnsignedPresentationRequest {
  verifier: VerifierInfo;
  credentialRequests: CredentialRequest[];
  metadata?: any;
  expiresAt?: Date;
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
