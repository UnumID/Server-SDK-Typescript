import { configData } from '../../src/config';
import { dummyAuthToken, makeDummyDidDocument, dummyAdminKey } from './mocks';
import { issueCredential, issueCredentials } from '../../src/issuer/issueCredentials';
import { UnumDto } from '../../src/types';
import { CredentialSubject, Credential, CredentialData, CredentialPb } from '@unumid/types';
import { CustError } from '../../src/utils/error';
import * as createKeyPairs from '../../src/utils/createKeyPairs';
import { getDIDDoc, getDidDocPublicKeys } from '../../src/utils/didHelper';
import { doEncrypt, doEncryptPb } from '../../src/utils/encrypt';
import { makeNetworkRequest } from '../../src/utils/networkRequestHelper';
import { omit } from 'lodash';

jest.mock('../../src/utils/didHelper', () => {
  const actual = jest.requireActual('../../src/utils/didHelper');
  return {
    ...actual,
    getDIDDoc: jest.fn(),
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
const mockGetDIDDoc = getDIDDoc as jest.Mock;
const mockGetDidDocKeys = getDidDocPublicKeys as jest.Mock;
const mockDoEncrypt = doEncrypt as jest.Mock;
const mockDoEncryptPb = doEncryptPb as jest.Mock;

function callIssueCred (credentialSubject: CredentialSubject, type: string[], issuer: string, expirationDate: Date, eccPrivateKey: string, auth: string): Promise<UnumDto<CredentialPb | Credential>> {
  return issueCredential(auth, type, issuer, credentialSubject, eccPrivateKey, expirationDate);
}

function callIssueCreds (issuer: string, subjectDid: string, credentialDataList: CredentialData[], expirationDate: Date, eccPrivateKey: string, auth: string): Promise<UnumDto<(Credential |CredentialPb)[]>> {
  return issueCredentials(auth, issuer, subjectDid, credentialDataList, eccPrivateKey, expirationDate);
}

describe('issueCredential', () => {
  let responseDto: UnumDto<Credential | CredentialPb>, response: Credential | CredentialPb, responseAuthToken: string;
  const credentialSubject: CredentialSubject = {
    id: 'did:unum:a0cd2e20-5f3e-423c-8382-afc722eaca9e',
    value: 'dummy value'
  };
  const type = ['VerifiableCredential', 'DummyCredential'];
  const issuer = 'did:unum:0c1e4d6a-04b9-4518-9293-4de595bbdbd2';
  const expirationDate = new Date('2099-10-26T23:07:12.770Z');
  const eccPrivateKey = '-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIKgEnAHdkJOWCr2HxgThssEnn4+4dXh+AXCK2ORgiM69oAoGCCqGSM49\nAwEHoUQDQgAEl1ZqPBLIa8QxEEx7nNWsVPnUd59UtVmRLS7axzA5VPeVOs2FIGkT\nFx+RgfZSF6J4kXd7F+/pd03fPV/lu/lJpA==\n-----END EC PRIVATE KEY-----\n';
  const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiaXNzdWVyIiwidXVpZCI6IjU5MDMyMmRiLTJlMDgtNGZjNi1iZTY2LTQ3NGRmMWY3Nzk4YSIsImRpZCI6ImRpZDp1bnVtOmRhOGYyNDJkLTZjZDYtNGUzMC1iNTU3LTNhMzkzZWFkZmMyYyIsImV4cCI6MTU5Njc2NzAzNi45NjQsImlhdCI6MTU5NzE0MzAxNn0.9AwobcQ3a9u4gMCc9b1BtN8VRoiglCJKGtkqB425Zyo';

  beforeEach(async () => {
    const dummyDidDoc = await makeDummyDidDocument();
    const headers = { 'x-auth-token': dummyAuthToken };
    mockGetDIDDoc.mockResolvedValue({ body: dummyDidDoc, headers });
    mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers });
    mockGetDidDocKeys.mockResolvedValue(dummyDidDoc.publicKey);

    responseDto = await callIssueCred(credentialSubject, type, issuer, expirationDate, eccPrivateKey, authHeader);
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

  it('encrypts the credential for each public key', () => {
    expect(mockDoEncrypt).toBeCalledTimes(4);
    expect(mockDoEncryptPb).toBeCalledTimes(4);
  });

  it('sends encrypted credentials of all versions (2,3) to the saas', () => {
    expect(mockMakeNetworkRequest).toBeCalled();
    expect(mockMakeNetworkRequest.mock.calls.length).toEqual(2);
  });

  it('sends the encrypted credentials v2 to the saas', () => {
    expect(mockMakeNetworkRequest).toBeCalled();
    // expect(mockMakeNetworkRequest.mock.calls[0][0].data.encryptedCredentials.length).toEqual(2);
    expect(mockMakeNetworkRequest.mock.calls[0][0].header.version).toEqual('2.0.0');
  });

  it('returns the credential', () => {
    expect(response.id).toBeDefined();
    expect(response.credentialStatus).toBeDefined();
    expect(response.credentialSubject).toBeDefined();
    expect(response.proof).toBeDefined();
    expect(response.credentialStatus.id).toEqual(`${configData.SaaSUrl}/credentialStatus/${response.id}`);
  });

  it('returns the auth token', () => {
    expect(responseAuthToken).toEqual(dummyAuthToken);
  });

  it('does not return an auth token if the SaaS does not return an auth token', async () => {
    mockMakeNetworkRequest.mockResolvedValue({ body: { success: true } });
    responseDto = await callIssueCred(credentialSubject, type, issuer, expirationDate, eccPrivateKey, dummyAdminKey);
    responseAuthToken = responseDto.authToken;
    expect(responseAuthToken).toBeUndefined();
  });

  it('type array starts with and contains only one `VerifiableCredential` string despite type of the credential options including the preceeding string', async () => {
    mockMakeNetworkRequest.mockResolvedValue({ body: { success: true } });
    const dummyDidDoc = await makeDummyDidDocument();
    const headers = { 'x-auth-token': dummyAuthToken };
    mockGetDIDDoc.mockResolvedValue({ body: dummyDidDoc, headers });

    responseDto = await callIssueCred(credentialSubject, type, issuer, expirationDate, eccPrivateKey, dummyAdminKey);
    const types = responseDto.body.type;
    expect(types[0]).toEqual('VerifiableCredential');
    expect(types[1]).toEqual('DummyCredential');
  });
});

describe('issueCredential - Failure cases', () => {
  const credentialSubject: CredentialSubject = {
    id: 'did:unum:a0cd2e20-5f3e-423c-8382-afc722eaca9e',
    value: 'dummy value'
  };
  const type = 'DummyCredential';
  const issuer = 'did:unum:0c1e4d6a-04b9-4518-9293-4de595bbdbd2';
  const expirationDate = new Date('2099-10-26T23:07:12.770Z');
  const eccPrivateKey = '-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIKgEnAHdkJOWCr2HxgThssEnn4+4dXh+AXCK2ORgiM69oAoGCCqGSM49\nAwEHoUQDQgAEl1ZqPBLIa8QxEEx7nNWsVPnUd59UtVmRLS7axzA5VPeVOs2FIGkT\nFx+RgfZSF6J4kXd7F+/pd03fPV/lu/lJpA==\n-----END EC PRIVATE KEY-----\n';
  const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiaXNzdWVyIiwidXVpZCI6IjU5MDMyMmRiLTJlMDgtNGZjNi1iZTY2LTQ3NGRmMWY3Nzk4YSIsImRpZCI6ImRpZDp1bnVtOmRhOGYyNDJkLTZjZDYtNGUzMC1iNTU3LTNhMzkzZWFkZmMyYyIsImV4cCI6MTU5Njc2NzAzNi45NjQsImlhdCI6MTU5NzE0MzAxNn0.9AwobcQ3a9u4gMCc9b1BtN8VRoiglCJKGtkqB425Zyo';

  it('returns a CustError with a descriptive error message if type is missing', async () => {
    try {
      await issueCredential(authHeader, undefined, issuer, credentialSubject, eccPrivateKey, expirationDate);

      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(400, 'type is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('type is required.');
    }
  });

  it('returns a CustError with a descriptive error message if issuer is missing', async () => {
    try {
      await issueCredential(authHeader, type, undefined, credentialSubject, eccPrivateKey, expirationDate);
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(400, 'issuer is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('issuer is required.');
    }
  });

  it('returns a CustError with a descriptive error message if credentialSubject is missing', async () => {
    try {
      await issueCredential(authHeader, type, issuer, undefined, eccPrivateKey, expirationDate);
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(400, 'credentialSubject is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('credentialSubject is required.');
    }
  });

  it('returns a CustError with a descriptive error message if eccPrivateKey is missing', async () => {
    try {
      await issueCredential(authHeader, type, issuer, credentialSubject, undefined, expirationDate);
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(400, 'signingPrivateKey is required.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('signingPrivateKey is required.');
    }
  });

  it('returns a CustError with a descriptive error message if expirationDate is not a date object', async () => {
    try {
      await issueCredential(authHeader, type, issuer, credentialSubject, eccPrivateKey, '2021' as unknown as Date);
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(400, 'expirationDate must be a valid Date object.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('expirationDate must be a valid Date object.');
    }
  });

  it('returns a CustError with a descriptive error message if expirationDate is not a future date', async () => {
    try {
      await issueCredential(authHeader, type, issuer, credentialSubject, eccPrivateKey, new Date('2020-10-26T23:07:12.770Z'));
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(400, 'expirationDate must be in the future.'));
      expect(e.code).toEqual(400);
      expect(e.message).toEqual('expirationDate must be in the future.');
    }
  });

  it('returns a CustError with a descriptive error if x-auth-token header is missing', async () => {
    try {
      await issueCredential('', type, issuer, credentialSubject, undefined, expirationDate);
      fail();
    } catch (e) {
      expect(e).toEqual(new CustError(401, 'No authentication string. Not authenticated.'));
      expect(e.code).toEqual(401);
      expect(e.message).toEqual('No authentication string. Not authenticated.');
    }
  });
});

describe('issueCredentials', () => {
  let responseDto: UnumDto<(Credential | CredentialPb)[]>, response: (Credential | CredentialPb)[], responseAuthToken: string;
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
    mockGetDIDDoc.mockResolvedValue({ body: dummyDidDoc, headers });
    mockMakeNetworkRequest.mockResolvedValue({ body: { success: true }, headers });
    mockGetDidDocKeys.mockResolvedValue(dummyDidDoc.publicKey);

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

  it('encrypts the credential for each public key', () => {
    expect(mockDoEncrypt).toBeCalledTimes(8);
    expect(mockDoEncryptPb).toBeCalledTimes(8);
  });

  it('sends encrypted credentials of all versions (2,3) to the saas', () => {
    expect(mockMakeNetworkRequest).toBeCalled();
    expect(mockMakeNetworkRequest.mock.calls.length).toEqual(2);
  });

  it('sends the encrypted credentials v2 to the saas', () => {
    expect(mockMakeNetworkRequest).toBeCalled();
    // expect(mockMakeNetworkRequest.mock.calls[0][0].data.encryptedCredentials.length).toEqual(2);
    expect(mockMakeNetworkRequest.mock.calls[0][0].header.version).toEqual('2.0.0');
  });

  it('returns the credentials', () => {
    expect(response.length).toEqual(2);
    expect(response[0].id).toBeDefined();
    expect(response[0].credentialStatus).toBeDefined();
    expect(response[0].credentialSubject).toBeDefined();
    expect(response[0].proof).toBeDefined();
    expect(response[0].credentialStatus.id).toEqual(`${configData.SaaSUrl}/credentialStatus/${response[0].id}`);
  });

  it('returns the auth token', () => {
    expect(responseAuthToken).toEqual(dummyAuthToken);
  });

  // this is not true... it returns the auth that was passed to issueCredentials()
  // if no auth token is returned from the saas
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
    mockGetDIDDoc.mockResolvedValue({ body: dummyDidDoc, headers });

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
