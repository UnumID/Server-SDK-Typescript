import { generateEccKeyPair, generateRsaKeyPair } from '@unumid/library-crypto';
import { KeyPairSet } from '../types';

/**
 * Utility to create a key pair set for signing and encryption.
 * @param encoding
 */
export const createKeyPairSet = async (encoding: 'base58' | 'pem' = 'pem'): Promise<KeyPairSet> => {
  const kpSet: KeyPairSet = {} as KeyPairSet;
  // generate ECC key pair with async / await
  kpSet.signing = await generateEccKeyPair(encoding);

  // generate rsa key pair with async / await
  kpSet.encryption = await generateRsaKeyPair(encoding);

  return (kpSet);
};
