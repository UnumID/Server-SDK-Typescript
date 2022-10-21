import { EncryptedData } from '@unumid/types';
import logger from '../logger';
import { decryptBytes } from '@unumid/library-crypto';
import { decryptBytes as decryptBytesBase58 } from '@unumid/library-crypto-v1';

/**
 * Decrypt the data.
 * @param privateRSAKey
 * @param data
 * @returns
 */
export const doDecrypt = (privateRSAKey: string, data: EncryptedData): Buffer => {
  logger.debug('Performing byte array decryption');

  try {
    const result = decryptBytes(
      privateRSAKey,
      data
    );

    logger.debug('Decrypted data success.');
    return result;
  } catch (e) {
    logger.debug(`Unable to decode using most recent crypto library with base64 encoding. Going to try with the v1, base58 crypto library. ${e}`);

    const result = decryptBytesBase58(
      privateRSAKey,
      data
    );

    logger.debug('Decrypted data success.');
    return result;
  }
};
