import logger from '../logger';
import { PublicKeyInfo } from '@unumid/types';
import { verifyBytes } from '@unumid/library-crypto';
import { verifyBytes as verifyBytesBase58 } from '@unumid/library-crypto-v1';

/**
 * Verify the signature on the provided byte array.
 *
 * Note: it is backwards compatible with v1 of the crypto library which uses base58 encoding.
 * @param signature
 * @param data
 * @param publicKey
 * @param encoding String ('base58' | 'pem'), defaults to 'pem'
 */
export const doVerify = (signature: string, data: Uint8Array, publicKey: PublicKeyInfo): boolean => {
  logger.debug(`Signature data verification using public key ${JSON.stringify(publicKey)}`);

  try {
    const result:boolean = verifyBytes(signature, data, publicKey);
    logger.debug(`Signature data is valid: ${result}.`);
    return result;
  } catch (e) {
    logger.debug(`Unable verifying signature using most recent crypto library with base64 encoding with publicKeyInfo ${JSON.stringify(publicKey)}. Going to try with the v1, base58 crypto library. ${e}`);

    const result:boolean = verifyBytesBase58(signature, data, publicKey);
    logger.debug(`Signature data is valid with base58 encoding: ${result}.`);
    return result;
  }
};
