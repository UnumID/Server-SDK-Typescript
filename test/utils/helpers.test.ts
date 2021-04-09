import * as cryptoLib from '@unumid/library-crypto';
import { PublicKeyInfo, EncryptedData, KeyPair } from '@unumid/types';
import { getDIDDoc, getKeyFromDIDDoc } from '../../src/utils/didHandler';

import { getUUID } from '../../src/utils/helpers';
// import { getKeyFromDIDDoc } from '../src/getKeyFromDIDDoc';
// import { PublicKeyInfo, EncryptedData, KeyPair } from '../src/types';
// import { getDIDDoc } from '../src/getDIDDoc';

describe('UUID generation', () => {
  it('Generate UUID', () => {
    expect(getUUID()).toBeDefined();
  });
});

describe('Encrypt the given data', () => {
  const data = { test: 'Data to encrypt' };
  const did = 'did:unum:3e48b969-5cf3-46c7-9c61-54de886d1382';
  let publicKeyObj: PublicKeyInfo[];
  let encryptedData: EncryptedData;
  let encryptSpy;

  beforeAll(async () => {
    const baseUrl = 'https://api.dev-unumid.org/';
    const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiaXNzdWVyIiwidXVpZCI6ImRmYTllNmY5LWUyMGYtNGU2MS05ODZjLTEwYjRjZDFmMDQxOCIsImRpZCI6ImRpZDp1bnVtOjNlNDhiOTY5LTVjZjMtNDZjNy05YzYxLTU0ZGU4ODZkMTM4MiIsImV4cCI6MTU5Njc2NzAzNi45NjQsImlhdCI6MTU5NzA1MDY4MX0.I-t3mDBTBjKeO_GZDyiXwgKwvlUIy_B6zcB1V3hZ2c0';
    encryptSpy = jest.spyOn(cryptoLib, 'encrypt', 'get');
    const didDocResponse = await getDIDDoc(baseUrl, authHeader, did);
    publicKeyObj = getKeyFromDIDDoc(didDocResponse.body, 'RSA');
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('returns the public key of the given type', () => {
    expect(publicKeyObj).toBeDefined();
    expect(publicKeyObj.length).toBeGreaterThan(0);
  });

  it('encrypt crypto library should have been called', () => {
    encryptedData = doEncrypt(did, publicKeyObj[0], data);
    expect(encryptSpy).toBeCalled();
  });

  it('Encrypted data should be available', () => {
    expect(encryptedData).toBeDefined();
  });

  it('Encrypted data should have the key attribute', () => {
    expect(encryptedData.key).toBeDefined();
    expect(encryptedData.key.iv).toBeDefined();
  });
});

describe('Verifies the given data - Success Scenario', () => {
  const data = { test: 'Data to Verify' };
  const dataString = "{ test: 'Data to Verify' }";
  let keyPair: KeyPair, verifySpy, signature, retVal;

  beforeAll(async () => {
    verifySpy = jest.spyOn(cryptoLib, 'verify', 'get');
    keyPair = await cryptoLib.generateEccKeyPair();
    signature = cryptoLib.sign(data, keyPair.privateKey);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('verify crypto library should have been called', () => {
    retVal = doVerify(signature, data, keyPair.publicKey, 'pem');
    expect(verifySpy).toBeCalled();
  });

  it('doVerify should return true', () => {
    expect(retVal).toBeDefined();
    expect(retVal).toBe(true);
  });

  it('doVerify should return true while passing valid stringData optional param', () => {
    retVal = doVerify(signature, data, keyPair.publicKey, 'pem', dataString);
    expect(verifySpy).toBeCalled();
    expect(retVal).toBeDefined();
    expect(retVal).toBe(true);
  });
});

describe('Verifies the given data - Failure Scenario', () => {
  const data = { test: 'Data to Verify' };
  const dataString = "{ test: 'Data to Verify' }";
  let keyPair: KeyPair, verifySpy, signature, unsignedValue, retVal;

  beforeAll(async () => {
    verifySpy = jest.spyOn(cryptoLib, 'verify', 'get');
    keyPair = await cryptoLib.generateEccKeyPair();
    signature = cryptoLib.sign(data, keyPair.privateKey);
    unsignedValue = dataString;
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('verify crypto library should have been called', () => {
    retVal = doVerify(signature, {}, keyPair.publicKey, 'pem');
    expect(verifySpy).toBeCalled();
  });

  it('doVerify should return false', () => {
    expect(retVal).toBeDefined();
    expect(retVal).toBe(false);
  });

  it('doVerify should return false - stringData signature passes but does not not match the data object', () => {
    retVal = doVerify(signature, { nope: 'test' }, keyPair.publicKey, 'pem', dataString);
    expect(verifySpy).toBeCalled();
    expect(retVal).toBeDefined();
    expect(retVal).toBe(false);
  });
});
