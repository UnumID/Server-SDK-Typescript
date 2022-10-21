
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

export const base64Image = 'data:image/gif;base64,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';
export const imageUrl = 'https://user-images.githubusercontent.com/2586247/31589241-2ca0211e-b1b3-11e7-9ae7-901fb77990e9.gif';
