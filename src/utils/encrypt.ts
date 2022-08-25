import { EncryptedData, PublicKeyInfo } from '@unumid/types';
import logger from '../logger';
import { encryptBytes } from '@unumid/library-crypto';

/**
 * Encrypt the provided data object.
 * @param did
 * @param publicKeyObj
 * @param data
 */
export const doEncrypt = (did: string, publicKeyObj: PublicKeyInfo, data: Uint8Array): EncryptedData => {
  logger.debug('Performing byte array encryption using public key', publicKeyObj);

  const result = encryptBytes(
    did + '#' + publicKeyObj.id,
    publicKeyObj,
    data
  );

  logger.debug(`Encrypted data result: ${result.data}`);
  return result;
};
