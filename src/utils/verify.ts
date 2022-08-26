import logger from '../logger';
import { PublicKeyInfo } from '@unumid/types';
import { verifyBytes } from '@unumid/library-crypto';

/**
 * Verify the signature on the provided byte array.
 * @param signature
 * @param data
 * @param publicKey
 * @param encoding String ('base58' | 'pem'), defaults to 'pem'
 */
export const doVerify = (signature: string, data: Uint8Array, publicKey: PublicKeyInfo): boolean => {
  logger.debug(`Signature data verification using public key ${JSON.stringify(publicKey)}`);
  const result:boolean = verifyBytes(signature, data, publicKey);

  logger.debug(`Signature data is valid: ${result}.`);
  return result;
};
