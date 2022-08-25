import { EncryptedData } from '@unumid/types';
import logger from '../logger';
import { decryptBytes, encryptBytes } from '@unumid/library-crypto';

/**
 * Decrypt the data.
 * @param privateRSAKey
 * @param data
 * @returns
 */
export const doDecrypt = (privateRSAKey: string, data: EncryptedData): Buffer => {
  logger.debug('Performing byte array decryption');

  const result = decryptBytes(
    privateRSAKey,
    data
  );

  logger.debug('Decrypted data success.');
  return result;
};
