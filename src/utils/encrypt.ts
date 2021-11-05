import { EncryptedData, JSONObj, PublicKeyInfo } from '@unumid/types';
import logger from '../logger';
import { encrypt, encryptBytes } from '@unumid/library-crypto';

/**
 * Encrypt the provided data object.
 * @param did
 * @param publicKeyObj
 * @param data
 */
export const doEncrypt = (did: string, publicKeyObj: PublicKeyInfo, data: JSONObj): EncryptedData => {
  logger.debug('Performing encryption using public key', publicKeyObj);
  const result:EncryptedData = encrypt(did + '#' + publicKeyObj.id, publicKeyObj.publicKey, data, publicKeyObj.encoding);

  logger.debug(`Encrypted data result: ${result.data}`);
  return result;
};

/**
 * Encrypt the provided data object.
 * @param did
 * @param publicKeyObj
 * @param data
 */
export const doEncryptPb = (did: string, publicKeyObj: PublicKeyInfo, data: Uint8Array): EncryptedData => {
  logger.debug('Performing byte array encryption using public key', publicKeyObj);
  const result:EncryptedData = encryptBytes(did + '#' + publicKeyObj.id, publicKeyObj.publicKey, data, publicKeyObj.encoding);

  logger.debug(`Encrypted data result: ${result.data}`);
  return result;
};
