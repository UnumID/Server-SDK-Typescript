import { sign } from '@unumid/library-crypto';
import { DidDocument, HolderApp, IssuerInfo, IssuerInfoMap, JSONObj, PresentationRequestPostDto, UnsignedCredential, UnsignedPresentationRequest, Verifier, VerifierInfo, Credential, CredentialSubject, Proof, CredentialRequest } from '@unumid/types';
import stringify from 'fast-json-stable-stringify';

import { configData } from '../../src/config';
import { RESTResponse, VerifierApiKey } from '../../src/types';
import { createKeyPairSet } from '../../src/utils/createKeyPairs';
import { createProof } from '../../src/utils/createProof';
import { getUUID } from '../../src/utils/helpers';

export const dummyIssuerDid = `did:unum:${getUUID()}`;
export const dummySubjectDid = `did:unum:${getUUID()}`;
export const dummyVerifierDid = `did:unum:${getUUID()}`;

export const dummyAuthToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';
export const dummyVerifierApiKey = 'x7DQsIj/vpsBc7vu9uIz39KbUK2KpV4VSZu0JXv/zWw=';

export const dummyRsaPublicKey = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA62ykSiBsmldkj7yQ0ky4\n66hc0WooxmfgxODAZByyEsWykn1PNTMizN3hsEmyWK4khN3sJpmgzH88UW4b2oR5\ndsWo739RiLRdmtdhUZp+JBRz3YrK2Qt4LcmNHFVJxgGttqr+toaiNg8V7ZnsVE2/\nlC9zJqY1diuUGRVoCpkIpZElHMqI4uO4zAK4jrpY53YC4bTPxICdlhKSiN9bEYMW\nO5/LvHGwBgEJ4/pCaUYSBJcHFMzS9u3COecAlgco69tOlEBIqShYoJV2BM72anvT\na2copxu9QCoIaZPzphEenT0M4n/cu/jSdciMYLtC/ZhrCWGfGUYYu9yRACFOqnoD\naQIDAQAB\n-----END PUBLIC KEY-----\n';
export const dummyRsaPrivateKey = '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDrbKRKIGyaV2SP\nvJDSTLjrqFzRaijGZ+DE4MBkHLISxbKSfU81MyLM3eGwSbJYriSE3ewmmaDMfzxR\nbhvahHl2xajvf1GItF2a12FRmn4kFHPdisrZC3gtyY0cVUnGAa22qv62hqI2DxXt\nmexUTb+UL3MmpjV2K5QZFWgKmQilkSUcyoji47jMAriOuljndgLhtM/EgJ2WEpKI\n31sRgxY7n8u8cbAGAQnj+kJpRhIElwcUzNL27cI55wCWByjr206UQEipKFiglXYE\nzvZqe9NrZyinG71AKghpk/OmER6dPQzif9y7+NJ1yIxgu0L9mGsJYZ8ZRhi73JEA\nIU6qegNpAgMBAAECggEBAORfcUePCIr3988PJpU6Y7AGlHN4vbEpl3qkYz06MOvQ\n55b/A9Uhk8KUApiWBPHNjBNvi+Mt6DQ3wPVlEJP7KjCzMVuScC9id+L6x6b3bSHm\nzTa9qmS9oYkZGU/A1F3FxxOJ8KhzFevG2oiwZfaprQw8s0FsvjOxtmpWv6R4K1Ef\nDUtP5BqPeckkTAiAc1H8sXA04wCrlbQMiK6SlyGXA+eHG9roxVIL0hFFSodhl69U\nTeUTfim0Q9jXRxhQhcZwneYAVBa4WnBO0Y29p+9Q+lJaXE0mnt3AHC94Ni4+J+Uf\n9lcnhO8gWkN/Qij3v7tF6mfiSIq6BGKDRffJ1mCG+AECgYEA9lDZRU4GUa5RTyRY\nL5T1E08fga3ssaGPxUkqALtaJMQUcBqSGISk2QEQoSNnP07J32xJ8sPLFBl2Nvjt\nHUMzJJX2jasT0IGAzKTDotumLOp6rSQ35CrwtRYyBNXWIl4WI4b9HzlsaRDwDNs3\nRNvxqVGH+YY3feioSv/gWHBUkIECgYEA9K4r6acyUZHyTZIusxf0MXzcgImrZ44o\nHX2UQwVI92Z5hY0f8n/uFvMJ3H8XPgt/9tb7ppZk+rIqgxTy8eZGAVxBrzzx43Rn\nUwva4qBY9TbV/HGF0nH7P6DXLb4Rc8wdZwNt0Q+/R94L3YvnCHv5WQWnPt7rdmFc\nGsoDdKzjfukCgYBPlanN2bry80a0MoMHxLI2re75IHAEqLXiQZR/rgkfLfeIjR09\nLMZykwSDfAPlEZjqRnvSI27fLKbkdiNuvAKvRIDoHymEygMKnAXV/fBAPPasMLKa\nV0F00RoSM+E/M3Ulv3zTdONRQza8gKvn5MS9N2metr4BQYX2zZv4FztLgQKBgHo1\nJ++qt6IwMAJ4eeSvmSLCh2uX10mAoh6go1WaJSiUQSvoIcXACc3ik9FSlOxDWCWU\nmNpKkaL5K+yOoQ0bA2oYhyIcYYBGmnjLGgdJKUVInzZYCQvkLCZKkk7heNwKXcEe\n4FGj+NjPWcPM5ZbCPPcusKrhMl/NHvCuZ212EKZJAoGBALjGFVLtxLjf4Y5OwJ2b\nZX6CP3viNs5dQJPOyWHdGmQhNVEh0jEZV9WJcz+D4djJTFeUz0+xuBVxXJLW8qW/\nvnOIVpfZBrDCcKve4kOVbInXR6yI+OhmgyAQJMKGE7romWf1Iq8mh41GJFnBWGnc\nqR92ms3JlTIu94gnfPXLoS/r\n-----END PRIVATE KEY-----\n';

export const dummyEccPublicKey = 'aSq9DsNNvGhYxYyqA9wd2eduEAZ5AXWgJTbTKcK5rUyWBBvenyGeVgJFo2UQRRwcNhVQTAMYkzoWRNSaqxsvp6MTXLNiopgnmAMNCNV9AmnwGPHUpTpmzT5YTAVq';
export const dummyEccPrivateKey = '2EPbyvKQKUaUPMF7Mm94FjEzvs5tsLWfesyc97W1dqYeeZFEG3RbKtndUZSYBdcp4xQtukTc6yUB4vyfWrxWqm1wPsY1g7uPaRftRJ57WaJ5zMWHpVagZdK7FVz2qUXHc7Fs5JwoxixcYwxDu4iL29y9KWyexi3CQKT2Ze3SSRqz9ZzTzhusitc7TjLBm';

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
    const keys = await createKeyPairSet(encoding);
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
    const keypairs = await createKeyPairSet();

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
        publicKey: dummyRsaPublicKey, // Need the key to be static encryption / decryption purposes
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
  holderApp?: HolderAppInfo;
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

type HolderAppInfo = Pick<HolderApp, 'name' | 'uriScheme' | 'deeplinkButtonImg'>
export const makeDummyHolderAppInfo = (options: Partial<HolderAppInfo> = {}): HolderAppInfo => {
  return {
    name: options.name || 'Dummy HolderApp',
    uriScheme: options.uriScheme || 'acme://',
    deeplinkButtonImg: options.deeplinkButtonImg || 'data:image/png;base64,dummydeeplinkButtonImg'
  };
};

export const makeDummyPresentationRequestResponse = async (options: MakeDummyPresentationRequestOptions = {}): Promise<PresentationRequestPostDto> => {
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
  const holderApp = makeDummyHolderAppInfo(options.holderApp);

  let { privateKey } = options;

  if (!privateKey) {
    const keypairs = await createKeyPairSet();
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
    issuers,
    holderApp
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

export const dummyCredentialSubject: CredentialSubject = {
  id: 'did:unum:3ff2f020-50b0-4f4c-a267-a9f104aedcd8',
  test: 'test'
};

export const populateMockData = (): JSONObj => {
  const context: string[] = ['https://www.w3.org/2018/credentials/v1'];
  const type: string[] = ['VerifiablePresentation'];

  const credentialIssuerDid = 'did:unum:7fc1753e-cdb7-428a-b6ce-eefc0e3634e5'; // could be dummyIssuerDid?
  const verifiableCredentialObj: Credential =
      {
        '@context': [
          'https://www.w3.org/2018/credentials/v1'
        ],
        credentialStatus: {
          id: 'https://api.dev-unumid.org//credentialStatus/f8287c1e-0c56-460a-92af-5519f5c10cbf',
          type: 'CredentialStatus'
        },
        credentialSubject: JSON.stringify(dummyCredentialSubject),
        issuer: credentialIssuerDid,
        type: [
          'VerifiableCredential',
          'UsernameCredential'
        ],
        id: 'f8287c1e-0c56-460a-92af-5519f5c10cbf',
        issuanceDate: new Date('2021-01-09T02:23:54.844Z'),
        expirationDate: new Date('2022-01-09T00:00:00.000Z'),
        proof: {
          created: '2021-01-09T02:23:54.844Z',
          type: 'secp256r1Signature2020',
          verificationMethod: 'did:unum:7fc1753e-cdb7-428a-b6ce-eefc0e3634e5',
          proofPurpose: 'AssertionMethod',
          signatureValue: '381yXZCEPSC9NB2smArjiBtvnGL6LZ2yAUW1qLQfhuZSyeQiCyrFRqkxfPoa1gaLaScR7cFVJmguo1v1JKYH6uEU4Zd32D9C',
          unsignedValue: '{"@context":["https://www.w3.org/2018/credentials/v1"],"credentialStatus":{"id":"https://api.dev-unumid.org//credentialStatus/f8287c1e-0c56-460a-92af-5519f5c10cbf","type":"CredentialStatus"},"credentialSubject":{"id":"did:unum:5f5eb3dd-d0e0-4356-bfdd-96bc1393c705","username":"Analyst-Shoes-278"},"expirationDate":"2022-01-09T00:00:00.000Z","id":"f8287c1e-0c56-460a-92af-5519f5c10cbf","issuanceDate":"2021-01-09T02:23:54.844Z","issuer":"did:unum:7fc1753e-cdb7-428a-b6ce-eefc0e3634e5","proof":{"created":"2021-01-09T02:23:54.844Z","proofPurpose":"AssertionMethod","type":"secp256r1Signature2020","verificationMethod":"did:unum:7fc1753e-cdb7-428a-b6ce-eefc0e3634e5"},"type":["VerifiableCredential","UsernameCredential"]}'
        }
      };
  const verifiableCredential: Credential[] = [verifiableCredentialObj];
  const verifiableCredentialString = [stringify(verifiableCredentialObj)];

  const presentationRequestUuid = '0cebee3b-3295-4ef6-a4d6-7dfea413b3aa';
  const invalidProof: JSONObj = {
    created: '2020-09-03T18:50:52.105Z',
    signatureValue: 'iTx1CJLYue7vopUo2fqGps3TWmxqRxoBDTupumLkaNp2W3UeAjwLUf5WxLRCRkDzEFeKCgT7JdF5fqbpvqnBZoHyYzWYbmW4YQ',
    unsignedValue: JSON.stringify({}),
    type: 'secp256r1Signature2020',
    verificationMethod: 'did:unum:3ff2f020-50b0-4f4c-a267-a9f104aedcd8',
    proofPurpose: 'AssertionMethod'
  };
  const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmVyaWZpZXIiLCJ1dWlkIjoiM2VjYzVlZDMtZjdhMC00OTU4LWJjOTgtYjc5NTQxMThmODUyIiwiZGlkIjoiZGlkOnVudW06ZWVhYmU0NGItNjcxMi00NTRkLWIzMWItNTM0NTg4NTlmMTFmIiwiZXhwIjoxNTk1NDcxNTc0LjQyMiwiaWF0IjoxNTk1NTI5NTExfQ.4iJn_a8fHnVsmegdR5uIsdCjXmyZ505x1nA8NVvTEBg';
  const verifier = 'did:unum:dd407b1a-ee7f-46a2-af2a-ccbb48cbb0dc';

  const subjectDid = 'did:unum:3ff2f020-50b0-4f4c-a267-a9f104aedcd8';
  const unsignedPresentation = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    presentationRequestUuid,
    verifiableCredential: [verifiableCredential],
    type: ['VerifiablePresentation']
  };

  const signatureValue = sign(unsignedPresentation, dummyEccPrivateKey, 'base58');

  const proof: Proof = {
    created: new Date().toISOString(),
    signatureValue,
    unsignedValue: stringify(unsignedPresentation),
    type: 'secp256r1Signature2020',
    verificationMethod: subjectDid,
    proofPurpose: 'assertionMethod'
  };

  const presentation = {
    ...unsignedPresentation,
    proof
  };

  const credRequest: CredentialRequest = {
    type: 'UsernameCredential',
    issuers: [credentialIssuerDid],
    required: true
  };
  const credentialRequests = [credRequest];

  return ({
    context,
    type,
    verifiableCredential,
    verifiableCredentialString,
    presentationRequestUuid,
    proof,
    invalidProof,
    authHeader,
    verifier,
    presentation,
    credentialRequests
  });
};
