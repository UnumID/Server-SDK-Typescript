import * as cryptoLib from '@unumid/library-crypto';
import { KeyPairSet } from '../../src/types';
import { createKeyPairSet } from '../../src/utils/createKeyPairs';

describe('Generate Key Pairs', () => {
  let kpSet: KeyPairSet;
  let eccKeySpy, rsaKeySpy;

  beforeAll(async () => {
    eccKeySpy = jest.spyOn(cryptoLib, 'generateEccKeyPair', 'get');
    rsaKeySpy = jest.spyOn(cryptoLib, 'generateRsaKeyPair', 'get');
    kpSet = await createKeyPairSet();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('Generates ECC and Rsa Key pairs', () => {
    expect(eccKeySpy).toBeCalled();
    expect(rsaKeySpy).toBeCalled();
  });

  it('returns the keysets', () => {
    expect(kpSet.signing).toBeDefined();
    expect(kpSet.encryption).toBeDefined();
  });

  it('returns ECC and RSA keys', () => {
    expect(kpSet.signing.privateKey).toBeDefined();
    expect(kpSet.signing.publicKey).toBeDefined();
    expect(kpSet.encryption.privateKey).toBeDefined();
    expect(kpSet.encryption.publicKey).toBeDefined();
  });
});
