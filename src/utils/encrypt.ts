import { EncryptedData, PublicKeyInfo } from '@unumid/types';
import logger from '../logger';
import { encryptBytes } from '@unumid/library-crypto';
import { encryptBytes as encryptBytesDeprecated } from '@unumid/library-crypto-v1';
import { lt } from 'semver';

/**
 * Encrypt the provided data object.
 * @param did
 * @param publicKeyObj
 * @param data
 */
export const doEncrypt = (did: string, publicKeyObj: PublicKeyInfo, data: Uint8Array, version: string): EncryptedData => {
  return lt(version, '4.0.0') ? _doEncryptV3(did, publicKeyObj, data) : _doEncrypt(did, publicKeyObj, data);
};

const _doEncrypt = (did: string, publicKeyObj: PublicKeyInfo, data: Uint8Array): EncryptedData => {
  logger.debug('Performing byte array encryption using public key', publicKeyObj);

  const result = encryptBytes(
    did + '#' + publicKeyObj.id,
    publicKeyObj,
    data
  );

  logger.debug(`Encrypted data result: ${result.data}`);
  return result;
};

const _doEncryptV3 = (did: string, publicKeyObj: PublicKeyInfo, data: Uint8Array): EncryptedData => {
  logger.debug('Performing byte array encryption using public key', publicKeyObj);

  const result = encryptBytesDeprecated(
    did + '#' + publicKeyObj.id,
    publicKeyObj,
    data
  );

  logger.debug(`Encrypted data result: ${result.data}`);
  return result;
};
