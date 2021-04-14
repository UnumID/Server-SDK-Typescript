import { configData } from '../../src/config';
import { dummyAuthToken, makeDummyDidDocument, dummyAdminKey } from './mocks';
import { issueCredential } from '../../src/issuer/issueCredentials';
import { UnumDto } from '../../src/types';
import { CredentialSubject } from '@unumid/types';
import { CustError } from '../../src/utils/error';
import * as createKeyPairs from '../../src/utils/createKeyPairs';
import { getDIDDoc } from '../../src/utils/didHelper';
import { doEncrypt } from '../../src/utils/encrypt';
import { makeNetworkRequest } from '../../src/utils/networkRequestHelper';

jest.mock('../../src/utils/didHelper', () => {
  const actual = jest.requireActual('../../src/utils/didHelper');
  return {
    ...actual,
    getDIDDoc: jest.fn()
  };
});

jest.mock('../../src/utils/verify', () => {
  const actual = jest.requireActual('../../src/utils/verify');
  return {
    ...actual,
    doVerify: jest.fn(() => actual.doVerify)
  };
});

jest.mock('../../src/utils/networkRequestHelper', () => ({
  ...jest.requireActual('../../src/utils/networkRequestHelper'),
  makeNetworkRequest: jest.fn()
}));

jest.mock('../../src/utils/createProof', () => {
  const actual = jest.requireActual('../../src/utils/createProof');
  return {
    ...actual,
    doEncrypt: jest.fn(() => actual.doEncrypt)
  };
});

jest.mock('../../src/utils/encrypt');
const createKeyPairSetSpy = jest.spyOn(createKeyPairs, 'createKeyPairSet');

const mockMakeNetworkRequest = makeNetworkRequest as jest.Mock;
const mockGetDIDDoc = getDIDDoc as jest.Mock;
const mockDoEncrypt = doEncrypt as jest.Mock;

function callIssueCreds (credentialSubject: CredentialSubject, type: string[], issuer: string, expirationDate: Date, eccPrivateKey: string, auth: string): Promise<UnumDto<Credential>> {
  return issueCredential(auth, type, issuer, credentialSubject, eccPrivateKey, expirationDate);
}

describe('issueCredential', () => {
  let responseDto: UnumDto<Credential>, response:UnumDto<Credential>, responseAuthToken: string;
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
    mockMakeNetworkRequest.mockResolvedValueOnce({ body: { success: true }, headers });

    responseDto = await callIssueCreds(credentialSubject, type, issuer, expirationDate, eccPrivateKey, authHeader);
    response = responseDto.body;
    responseAuthToken = responseDto.authToken;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('gets the subject did document', () => {
    expect(mockGetDIDDoc).toBeCalled();
  });

  it('signs the credential', () => {
    expect(createKeyPairSetSpy).toHaveBeenCalled();
  });

  it('encrypts the credential for each public key', () => {
    expect(mockDoEncrypt).toBeCalledTimes(2);
  });

  it('sends the encrypted credentials to the saas', () => {
    expect(mockMakeNetworkRequest).toBeCalled();
    expect(mockMakeNetworkRequest.mock.calls[0][0].data.encryptedCredentials.length).toEqual(2);
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
    mockMakeNetworkRequest.mockResolvedValueOnce({ body: { success: true } });
    response = await callIssueCreds(credentialSubject, type, issuer, expirationDate, eccPrivateKey, dummyAdminKey);
    responseAuthToken = response.authToken;
    expect(responseAuthToken).toBeUndefined();
  });

  it('type array starts with and contains only one `VerifiableCredential` string despite type of the credential options including the preceeding string', async () => {
    mockMakeNetworkRequest.mockResolvedValueOnce({ body: { success: true } });
    response = await callIssueCreds(credentialSubject, type, issuer, expirationDate, eccPrivateKey, dummyAdminKey);
    const types = response.body.type;
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
