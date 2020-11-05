import {
  getUUID,
  createToken,
  createProof,
  UnsignedCredential,
  Credential,
  RESTResponse,
  DidDocument
} from 'library-issuer-verifier-utility';

import { configData } from '../src/config';
import {
  UnsignedPresentationRequest,
  Verifier,
  PresentationRequestResponse,
  VerifierInfo,
  IssuerInfoMap,
  IssuerInfo,
  VerifierApiKey
} from '../src/types';

export const dummyIssuerDid = `did:unum:${getUUID()}`;
export const dummySubjectDid = `did:unum:${getUUID()}`;
export const dummyVerifierDid = `did:unum:${getUUID()}`;

export const dummyAuthToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';
export const dummyVerifierApiKey = 'x7DQsIj/vpsBc7vu9uIz39KbUK2KpV4VSZu0JXv/zWw=';

export interface DummyCredentialOptions {
  unsignedCredential: UnsignedCredential;
  privateKey?: string;
  privateKeyId?: string;
  encoding?: 'base58' | 'pem'
}

export interface DummyUnsignedCredentialOptions {
  issuer?: string;
  subject?: string;
  type?: string;
  claims?: Record<string, unknown>,
  expirationDate?: Date;
}

export const makeDummyUnsignedCredential = (options: DummyUnsignedCredentialOptions = {}): UnsignedCredential => {
  const id = getUUID();
  const issuer = options.issuer || dummyIssuerDid;
  const subject = options.subject || dummySubjectDid;
  const type = options.type || 'DummyCredential';
  const claims = options.claims || { value: 'Dummy' };

  return {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    id,
    type: ['VerifiableCredential', type],
    issuer,
    credentialSubject: {
      id: subject,
      ...claims
    },
    credentialStatus: {
      id: `${configData.SaaSUrl}/credentialStatus/${id}`,
      type: 'CredentialStatus'
    },
    issuanceDate: new Date(),
    expirationDate: options.expirationDate
  };
};

export const makeDummyCredential = async (options: DummyCredentialOptions): Promise<Credential> => {
  const { unsignedCredential, encoding } = options;
  let { privateKey } = options;
  if (!privateKey) {
    const keys = await createToken(encoding);
    privateKey = keys.signing.privateKey;
  }

  const privateKeyId = options.privateKeyId || getUUID();

  const issuerDidWithKeyFragment = `${unsignedCredential.issuer}#${privateKeyId}`;

  const proof = createProof(unsignedCredential, privateKey, issuerDidWithKeyFragment, encoding);

  return {
    ...unsignedCredential,
    proof
  };
};

export type DummyVerifierOptions = Partial<Verifier>

export const makeDummyVerifier = (options: DummyVerifierOptions = {}): Verifier => {
  const uuid = options.uuid || getUUID();
  const now = new Date();
  const createdAt = options.createdAt || now;
  const updatedAt = options.updatedAt || now;
  const customerUuid = options.customerUuid || getUUID();
  const name = options.name || 'Test Verifier';
  const url = options.url || 'https://customer-api.dev-unumid.org/presentation';
  const isAuthorized = options.isAuthorized || true;
  const did = options.did || dummyVerifierDid;

  return {
    uuid,
    createdAt,
    updatedAt,
    customerUuid,
    name,
    url,
    isAuthorized,
    did
  };
};

export interface DummyVerifierResponseOptions {
  verifier: Verifier;
  authToken: string;
}

export const makeDummyVerifierResponse = (options: DummyVerifierResponseOptions): RESTResponse<Verifier> => {
  const authToken = options.authToken || dummyAuthToken;
  const headers = { 'x-auth-token': authToken };
  return { body: options.verifier, headers };
};

export const makeDummyDidDocument = async (options: Partial<DidDocument> = {}): Promise<DidDocument> => {
  const id = options.id || `did:unum:${getUUID()}`;
  const now = new Date();
  const created = options.created || now;
  const updated = options.updated || now;
  const service = options.service || [{ id, serviceEndpoint: `https://api.dev-unumid.org/presentation/${id}`, type: 'CredentialRepository' }];

  let { publicKey } = options;

  if (!publicKey) {
    const keypairs = await createToken();

    publicKey = [
      {
        id: getUUID(),
        publicKey: keypairs.signing.publicKey,
        encoding: 'pem',
        type: 'secp256r1',
        status: 'valid'
      },
      {
        id: getUUID(),
        publicKey: keypairs.encryption.publicKey,
        encoding: 'pem',
        type: 'RSA',
        status: 'valid'
      }
    ];
  }

  return {
    '@context': ['https://www.w3.org/ns/did/v1'],
    id,
    updated,
    created,
    publicKey,
    service
  };
};

export const dummyCredentialRequest = {
  type: 'DummyCredential',
  issuers: [dummyIssuerDid],
  required: true
};

export const makeDummyUnsignedPresentationRequest = (options: Partial<UnsignedPresentationRequest> = {}): UnsignedPresentationRequest => {
  const credentialRequests = options.credentialRequests || [dummyCredentialRequest];
  const uuid = options.uuid || getUUID();
  const { expiresAt, metadata } = options;
  const holderAppUuid = options.holderAppUuid || getUUID();
  const verifier = options.verifier || dummyVerifierDid;

  return {
    uuid,
    credentialRequests,
    holderAppUuid,
    verifier,
    expiresAt,
    metadata
  };
};

export interface MakeDummyPresentationRequestOptions {
  unsignedPresentationRequest?: UnsignedPresentationRequest;
  privateKey?: string;
  privateKeyId?: string;
  encoding?: 'pem' | 'base58';
  createdAt?: Date;
  updatedAt?: Date;
  qrCode?: string;
  deeplink?: string;
  verifier?: VerifierInfo;
  issuers?: IssuerInfoMap;
}

export const makeDummyVerifierInfo = (options: Partial<VerifierInfo>): VerifierInfo => {
  return {
    did: options.did || dummyVerifierDid,
    name: options.name || 'Dummy Verifier',
    url: options.url || 'https://customer-api.dev-unumid.org/presentation'
  };
};

export const makeDummyIssuerInfoMap = (options: Partial<IssuerInfo>[] = [{}]): IssuerInfoMap => options
  .map(issuerInfo => {
    return {
      did: issuerInfo.did || dummyIssuerDid,
      name: issuerInfo.name || 'Dummy Issuer'
    };
  })
  .reduce((prev, current) => {
    return {
      ...prev,
      [current.did]: current
    };
  }, {});

export const makeDummyPresentationRequestResponse = async (options: MakeDummyPresentationRequestOptions = {}): Promise<PresentationRequestResponse> => {
  const unsignedPresentationRequest = options.unsignedPresentationRequest || makeDummyUnsignedPresentationRequest();
  const privateKeyId = options.privateKeyId || getUUID();
  const encoding = options.encoding || 'pem';

  const now = new Date();
  const createdAt = options.createdAt || now;
  const updatedAt = options.updatedAt || now;
  const deeplink = options.deeplink || `https://unumid.org/${unsignedPresentationRequest.uuid}`;
  const qrCode = options.qrCode || 'Dummy QR Code data url';
  const verifier = options.verifier || makeDummyVerifierInfo({ did: unsignedPresentationRequest.verifier });

  const issuers = options.issuers || makeDummyIssuerInfoMap();

  let { privateKey } = options;

  if (!privateKey) {
    const keypairs = await createToken();
    privateKey = keypairs.signing.privateKey;
  }

  const verifierDidWithKeyFragment = `${unsignedPresentationRequest.verifier}#${privateKeyId}`;
  const proof = createProof(unsignedPresentationRequest, privateKey, verifierDidWithKeyFragment, encoding);
  return {
    presentationRequest: {
      ...unsignedPresentationRequest,
      proof,
      createdAt,
      updatedAt
    },
    qrCode,
    deeplink,
    verifier,
    issuers
  };
};

export const makeDummyVerifierApiKey = (): VerifierApiKey => {
  const now = new Date();
  return {
    uuid: getUUID(),
    customerUuid: getUUID(),
    key: 'x7DQsIj/vpsBc7vu9uIz39KbUK2KpV4VSZu0JXv/zWw=',
    type: 'Verifier',
    createdAt: now,
    updatedAt: now
  };
};
