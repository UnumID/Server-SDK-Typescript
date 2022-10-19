
import { Issuer, DidDocument, UnsignedCredential, Credential, CredentialSubject, SubjectCredentialRequest, CredentialRequestPb, SignedDidDocument, SubjectCredentialRequests, UnsignedCredentialPb, Credential, UnsignedDID, DID } from '@unumid/types';
import { CredentialRequest, UnsignedCredential, UnsignedSubjectCredentialRequests } from '@unumid/types/build/protos/credential';
import { configData } from '../../src/config';
import { RESTResponse } from '../../src/types';
import { createKeyPairSet } from '../../src/utils/createKeyPairs';
import { createProof } from '../../src/utils/createProof';
import { getUUID } from '../../src/utils/helpers';

export const dummyAuthToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiaXNzdWVyIiwidXVpZCI6IjU5MDMyMmRiLTJlMDgtNGZjNi1iZTY2LTQ3NGRmMWY3Nzk4YSIsImRpZCI6ImRpZDp1bnVtOmRhOGYyNDJkLTZjZDYtNGUzMC1iNTU3LTNhMzkzZWFkZmMyYyIsImV4cCI6MTU5Njc2NzAzNi45NjQsImlhdCI6MTU5NzE0MzAxNn0.9AwobcQ3a9u4gMCc9b1BtN8VRoiglCJKGtkqB425Zyo';
export const dummyIssuerDid = `did:unum:${getUUID()}`;
export const dummySubjectDid = `did:unum:${getUUID()}`;
export const dummyIssuerApiKey = 'x7DQsIj/vpsBc7vu9uIz39KbUK2KpV4VSZu0JXv/zWw=';
export const dummyAdminKey = 'x7DQsIj/vpsBc7vu9uIz39KbUK2KpV4VSZu0JXv/zWw=';

export const makeDummyIssuer = (options: Partial<Issuer> = {}): Issuer => {
  const uuid = options.uuid || getUUID();
  const now = new Date();
  const createdAt = options.createdAt || now;
  const updatedAt = options.updatedAt || now;
  const customerUuid = options.customerUuid || getUUID();
  const name = options.name || 'Test Issuer';
  const isAuthorized = options.isAuthorized || true;
  const did = options.did || dummyIssuerDid;

  return {
    uuid,
    createdAt,
    updatedAt,
    customerUuid,
    name,
    isAuthorized,
    did
  };
};

export interface DummyVerifierResponseOptions {
  issuer?: Issuer;
  authToken?: string;
}

export const dummyCredentialRequest = {
  type: 'DummyCredential',
  issuers: [dummyIssuerDid],
  required: true
};

export const dummySubjectCredentialRequest = {
  type: 'DummyCredential',
  issuers: [dummyIssuerDid],
  required: true
};

export const makeDummySubjectCredentialRequests = async (requests: CredentialRequest[], subjectPrivateKey: string, subjectDid: string): Promise<SubjectCredentialRequests> => {
  // create UnsignedSubjectCredentialRequests
  const unsignedSubjectCredentialRequests: UnsignedSubjectCredentialRequests = {
    credentialRequests: requests
  };

  // convert the protobuf to a byte array
  const bytes: Uint8Array = UnsignedSubjectCredentialRequests.encode(unsignedSubjectCredentialRequests).finish();
  const proof = await createProof(bytes, subjectPrivateKey, subjectDid);

  return {
    ...unsignedSubjectCredentialRequests,
    proof: proof
  };
};

export const makeDummySignedDidDocument = async (did: string, subjectPrivateKey: string): Promise<DID> => {
  const unsignedDid: UnsignedDID = {
    id: did
  };
  const bytes = UnsignedDID.encode(unsignedDid).finish();

  const proof = await createProof(bytes, subjectPrivateKey, did);
  return {
    ...unsignedDid,
    proof
  };
};

export const makeDummyIssuerResponse = (options: DummyVerifierResponseOptions = {}): RESTResponse<Issuer> => {
  const authToken = options.authToken || dummyAuthToken;
  const issuer = options.issuer || makeDummyIssuer();

  const headers = { 'x-auth-token': authToken };
  return { body: issuer, headers };
};

export const makeDummyDidDocument = async (options: Partial<DidDocument> = {}, signingPrivateKey?: string, signginPublicKey?: string): Promise<DidDocument> => {
// export const makeDummyDidDocument = async (options: Partial<DidDocument> = {}, signingPrivateKey?: string, signginPublicKey?: string): Promise<DidDocument> => {
  const id = options.id || `did:unum:${getUUID()}`;
  const now = new Date();
  const created = options.created || now;
  const updated = options.updated || now;
  const service = options.service || [{ id, serviceEndpoint: `https://api.dev-unumid.co/presentation/${id}`, type: 'CredentialRepository' }];

  let { publicKey } = options;

  if (!publicKey) {
    const keypairs = await createKeyPairSet();
    const keypairs2 = await createKeyPairSet();

    publicKey = [
      {
        id: getUUID(),
        publicKey: signginPublicKey || keypairs.signing.publicKey,
        // publicKey: keypairs.signing.publicKey,
        encoding: 'pem',
        type: 'secp256r1',
        status: 'valid',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: getUUID(),
        publicKey: signingPrivateKey || keypairs.encryption.publicKey,
        // publicKey: keypairs.encryption.publicKey,
        encoding: 'pem',
        type: 'RSA',
        status: 'valid',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: getUUID(),
        publicKey: keypairs2.signing.publicKey,
        encoding: 'pem',
        type: 'secp256r1',
        status: 'valid',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: getUUID(),
        publicKey: keypairs2.encryption.publicKey,
        encoding: 'pem',
        type: 'RSA',
        status: 'valid',
        createdAt: new Date(),
        updatedAt: new Date()
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

export const makeDummyCredentialSubject = (options: DummyUnsignedCredentialOptions = {}): CredentialSubject => {
  const subject = options.subject || dummySubjectDid;
  const claims = options.claims || { value: 'Dummy' };

  return {
    id: subject,
    ...claims
  };
};

export const makeDummyUnsignedCredential = (options: DummyUnsignedCredentialOptions = {}): UnsignedCredential => {
  const id = getUUID();
  const issuer = options.issuer || dummyIssuerDid;
  const subject = options.subject || dummySubjectDid;
  const type = options.type || 'DummyCredential';
  const claims = options.claims || { value: 'Dummy' };
  const credentialSubject = makeDummyCredentialSubject(options);

  return {
    context: ['https://www.w3.org/2018/credentials/v1'],
    id,
    type: ['VerifiableCredential', type],
    issuer,
    credentialSubject: JSON.stringify(credentialSubject),
    credentialStatus: {
      id: `${configData.SaaSUrl}/credentialStatus/${id}`,
      type: 'CredentialStatus'
    },
    issuanceDate: new Date(),
    expirationDate: options.expirationDate
  };
};

export const makeDummyCredential = async (options: DummyCredentialOptions): Promise<Credential> => {
  let { privateKey, unsignedCredential, encoding } = options;
  if (!privateKey) {
    const keys = await createKeyPairSet(encoding);
    privateKey = keys.signing.privateKey;
  }

  const privateKeyId = options.privateKeyId || getUUID();

  const issuerDidWithKeyFragment = `${unsignedCredential.issuer}#${privateKeyId}`;

  const bytes = UnsignedCredentialPb.encode(unsignedCredential).finish();

  const proof = createProof(bytes, privateKey, issuerDidWithKeyFragment);

  return {
    ...unsignedCredential,
    proof
  };
};
