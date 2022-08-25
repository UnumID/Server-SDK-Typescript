import { configData } from '../../src/config';
import { dummyAuthToken, makeDummyDidDocument, dummyAdminKey } from './mocks';
import { issueCredentials } from '../../src/issuer/issueCredentials';
import { UnumDto } from '../../src/types';
import { CredentialSubject, Credential, CredentialData, CredentialPb } from '@unumid/types';
import { CustError } from '../../src/utils/error';
import * as createKeyPairs from '../../src/utils/createKeyPairs';
import { getDidDocPublicKeys } from '../../src/utils/didHelper';
import { doEncrypt, doEncrypt } from '../../src/utils/encrypt';
import { makeNetworkRequest } from '../../src/utils/networkRequestHelper';
import { omit } from 'lodash';

jest.mock('../../src/utils/didHelper', () => {
  const actual = jest.requireActual('../../src/utils/didHelper');
  return {
    ...actual,
    getDidDocPublicKeys: jest.fn()
  };
});

jest.mock('../../src/utils/verify', () => {
  const actual = jest.requireActual('../../src/utils/verify');
  return {
    ...actual,
    doVerify: jest.fn(() => actual.doVerify)
  };
});

jest.mock('../../src/utils/networkRequestHelper', () => {
  const actual = jest.requireActual('../../src/utils/networkRequestHelper');
  return {
    ...actual,
    makeNetworkRequest: jest.fn()
  };
});

jest.mock('../../src/utils/createProof', () => {
  const actual = jest.requireActual('../../src/utils/createProof');
  return {
    ...actual,
    doEncrypt: jest.fn(() => actual.doEncrypt)
  };
});

jest.setTimeout(30000);

jest.mock('../../src/utils/encrypt');
const createKeyPairSetSpy = jest.spyOn(createKeyPairs, 'createKeyPairSet');

const mockMakeNetworkRequest = makeNetworkRequest as jest.Mock;
const mockGetDidDocKeys = getDidDocPublicKeys as jest.Mock;
const mockDoEncrypt = doEncrypt as jest.Mock;
const mockdoEncrypt = doEncrypt as jest.Mock;

function callIssueCreds (issuer: string, subjectDid: string, credentialDataList: CredentialData[], expirationDate: Date, eccPrivateKey: string, auth: string): Promise<UnumDto<(Credential | CredentialPb)[]>> {
  return issueCredentials(auth, issuer, subjectDid, credentialDataList, eccPrivateKey, expirationDate);
}

describe('issueCredentials', () => {
  let responseDto: UnumDto<(Credential | CredentialPb)[]>, response: (Credential | CredentialPb)[],
    responseAuthToken: string;
  const credentialSubject: CredentialSubject = {
    id: 'did:unum:a0cd2e20-5f3e-423c-8382-afc722eaca9e',
    value: 'dummy value'
  };
  const credentialData: CredentialData[] = [
    {
      type: 'DummyCredential',
      value: 'dummy value'
    },
    {
      type: 'DummyCredential2',
      value: 'dummy value 2'
    }
  ];
  // const type = ['DummyCredential', 'DummyCredential2'];
  const issuer = 'did:unum:0c1e4d6a-04b9-4518-9293-4de595bbdbd2';
  const expirationDate = new Date('2099-10-26T23:07:12.770Z');
  const eccPrivateKey = '-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIKgEnAHdkJOWCr2HxgThssEnn4+4dXh+AXCK2ORgiM69oAoGCCqGSM49\nAwEHoUQDQgAEl1ZqPBLIa8QxEEx7nNWsVPnUd59UtVmRLS7axzA5VPeVOs2FIGkT\nFx+RgfZSF6J4kXd7F+/pd03fPV/lu/lJpA==\n-----END EC PRIVATE KEY-----\n';
  const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiaXNzdWVyIiwidXVpZCI6IjU5MDMyMmRiLTJlMDgtNGZjNi1iZTY2LTQ3NGRmMWY3Nzk4YSIsImRpZCI6ImRpZDp1bnVtOmRhOGYyNDJkLTZjZDYtNGUzMC1iNTU3LTNhMzkzZWFkZmMyYyIsImV4cCI6MTU5Njc2NzAzNi45NjQsImlhdCI6MTU5NzE0MzAxNn0.9AwobcQ3a9u4gMCc9b1BtN8VRoiglCJKGtkqB425Zyo';

  beforeEach(async () => {
    const dummyDidDoc = await makeDummyDidDocument();
    const headers = { 'x-auth-token': dummyAuthToken };
    // mockGetDIDDoc.mockResolvedValue({ body: dummyDidDoc, headers });
    mockMakeNetworkRequest.mockResolvedValue({
      body: { success: true },
      headers
    });
    mockGetDidDocKeys.mockResolvedValue({
      authToken: dummyAuthToken,
      body: [dummyDidDoc.publicKey]
    });

    responseDto = await callIssueCreds(issuer, credentialSubject.id, credentialData, expirationDate, eccPrivateKey, authHeader);
    response = responseDto.body;
    responseAuthToken = responseDto.authToken;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('gets the subject did document', () => {
    expect(mockGetDidDocKeys).toBeCalled();
  });

  it('signs the credential', () => {
    expect(createKeyPairSetSpy).toHaveBeenCalled();
  });

  it('encrypts the credential for each public key and it\'s "proof-of" credential', () => {
    expect(mockDoEncrypt).toBeCalledTimes(8);
    expect(mockdoEncrypt).toBeCalledTimes(8);
  });

  it('sends encrypted credentials of all versions (2,3) to the saas', () => {
    expect(mockMakeNetworkRequest).toBeCalled();
    expect(mockMakeNetworkRequest.mock.calls.length).toEqual(4);
  });

  it('sends the encrypted credentials v2 to the saas', () => {
    expect(mockMakeNetworkRequest).toBeCalled();
    // expect(mockMakeNetworkRequest.mock.calls[0][0].data.encryptedCredentials.length).toEqual(2);
    expect(mockMakeNetworkRequest.mock.calls[0][0].header.version).toEqual('2.0.0');
  });

  // TODO: fix this test.
  // it('sends both the encrypted credentials and their respective "proof-of"', () => {
  //   expect(mockMakeNetworkRequest).toBeCalled();
  //   expect(mockMakeNetworkRequest.mock.calls).toHaveLength(4);

  //   for (const callArray of mockMakeNetworkRequest.mock.calls) {
  //     for (const call of callArray) {
  //       expect(call.data).toHaveProperty('credentialRequests');
  //       expect(call.data.credentialRequests.length % 2).toEqual(0);
  //       const credentialRequests = call.data.credentialRequests;

  //       for (const request of credentialRequests) {
  //         const encryptedCredential = request.encryptedCredentials[0];
  //         const proofOfCredential = request.encryptedCredentials[1];

  //         // Validate Types
  //         expect(proofOfCredential.type).toEqual(`ProofOf${encryptedCredential.type}`);

  //         if ('types' in proofOfCredential) {
  //           expect(encryptedCredential.types.length).toEqual(proofOfCredential.types.length);
  //           for (const credType of encryptedCredential.types) {
  //             const property = credType === 'VerifiableCredential' ? credType : `ProofOf${credType}`;
  //             expect(proofOfCredential.types).toContain(property);
  //           }
  //         }

  //         // Validate CredentialID
  //         expect(encryptedCredential.credentialId).toEqual(proofOfCredential.credentialId);

  //         // Validate matching issuanceDate
  //         expect(proofOfCredential.issuanceDate).toEqual(encryptedCredential.issuanceDate);

  //         // Validate Issuer
  //         expect(proofOfCredential.issuer).toEqual(encryptedCredential.issuer);

  //         // Validate Subject
  //         expect(proofOfCredential.subject).toEqual('undefined#undefined');
  //       }
  //     }
  //   }
  // });

  it('returns the credentials', () => {
    expect(response.length).toEqual(2);
    expect(response[0].id).toBeDefined();
    expect(response[0].credentialStatus).toBeDefined();
    expect(response[0].credentialSubject).toBeDefined();
    expect(response[0].proof).toBeDefined();
    expect(response[0].credentialStatus?.id).toEqual(`${configData.SaaSUrl}/credentialStatus/${response[0].id}`);
  });

  it('returns the auth token', () => {
    expect(responseAuthToken).toEqual(dummyAuthToken);
  });

  // this is not true... it returns the auth that was passed to issueCredentials()
  // if no auth token is returned from the saas
  // TODO: figure out what the behavior we actually want in this scenario is,
  // and either update the implementation or remove/update this test
  xit('does not return an auth token if the SaaS does not return an auth token', async () => {
    mockMakeNetworkRequest.mockResolvedValue({ body: { success: true } });
    responseDto = await callIssueCreds(issuer, credentialSubject.id, credentialData, expirationDate, eccPrivateKey, authHeader);
    responseAuthToken = responseDto.authToken;
    expect(responseAuthToken).toBeUndefined();
  });

  it('type array starts with and contains only one `VerifiableCredential` string despite type of the credential options including the preceeding string', async () => {
    mockMakeNetworkRequest.mockResolvedValue({ body: { success: true } });
    const dummyDidDoc = await makeDummyDidDocument();
    const headers = { 'x-auth-token': dummyAuthToken };
    // mockGetDIDDoc.mockResolvedValue({ body: dummyDidDoc, headers });

    responseDto = await callIssueCreds(issuer, credentialSubject.id, credentialData, expirationDate, eccPrivateKey, authHeader);
    const types = response[0].type;
    expect(types[0]).toEqual('VerifiableCredential');
    expect(types[1]).toEqual('DummyCredential');
  });

  it('returns a CustError with a descriptive error message if type is missing from credential data', async () => {
    const malCredentialData = [omit(credentialData[0], 'type'), ...credentialData.slice(1)] as CredentialData[];

    try {
      responseDto = await callIssueCreds(issuer, credentialSubject.id, malCredentialData, expirationDate, eccPrivateKey, authHeader);
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(400, 'Credential Data needs to contain the credential type'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('Credential Data needs to contain the credential type');
    }
  });
});
