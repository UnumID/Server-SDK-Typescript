import logger from '../logger';
import { JSONObj, PublicKeyInfo } from '@unumid/types';
import { verify, verifyBytes, verifyString } from '@unumid/library-crypto';
import { isEqual } from 'lodash';

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

/**
 * Verify the signature on the provided data object or optional dataString.
 * Deprecated in favor of doVerifyBytes which is made to be leveraged with Protobufs for deterministic byte array (de)serialization.
 *
 * @param signature
 * @param data
 * @param publicKey
 * @param encoding String ('base58' | 'pem'), defaults to 'pem'
 * @param stringData Optional String, for cases where the text encoding maybe different, using the provided string to check the signature then compare against the object itself
 */
export const doVerifyDeprecated = (signature: string, data: JSONObj, publicKey: string, encoding: 'base58' | 'pem' = 'pem', dataString?: string): boolean => {
  const isVerifiedData = doVerifyData(signature, data, publicKey, encoding);
  const isVerifiedString = !isVerifiedData ? doVerifyString(signature, data, publicKey, dataString, encoding) : false;

  const result:boolean = isVerifiedData || isVerifiedString;
  logger.debug(`Signature is valid: ${result}.`);
  return result;
};

/**
 * Verify the signature on the provided data object.
 * Should only be used if dealing with projects can ensure identical data object string encoding.
 * For this reason it is deprecated in favor of doVerifyBytes which is made to be leveraged with Protobufs for deterministic byte array (de)serialization.
 * @param signature
 * @param data
 * @param publicKey
 * @param encoding String ('base58' | 'pem'), defaults to 'pem'
 */
const doVerifyData = (signature: string, data: JSONObj, publicKey: string, encoding: 'base58' | 'pem' = 'pem'): boolean => {
  logger.debug(`Signature data verification using public key ${JSON.stringify(publicKey)}`);
  const result:boolean = verify(signature, data, publicKey, encoding);

  logger.debug(`Signature data is valid: ${result}.`);
  return result;
};

/**
 * Verify the signature on the provided data object using the unsignedString value.
 * This is to get around the way different runtime environments handle text encoding, i.e. between iOS and V8 (Node)
 * Note: this is valid work around thanks to then ensuring the stringData converted to an object has the same shallow values of the data object.
 * Deprecated in favor of doVerifyBytes which is made to be leveraged with Protobufs for deterministic byte array (de)serialization.
 * @param signature
 * @param data
 * @param publicKey
 * @param encoding String ('base58' | 'pem'), defaults to 'pem'
 */
const doVerifyString = (signature: string, data: JSONObj, publicKey: string, dataString?: string, encoding: 'base58' | 'pem' = 'pem'): boolean => {
  if (!dataString) {
    logger.debug('No Signature unsignedString value; skipping string verification.');
    return false;
  }

  logger.debug(`Signature unsignedString verification using public key ${JSON.stringify(publicKey)}`);
  const result:boolean = verifyString(signature, dataString, publicKey, encoding);

  logger.debug(`Signature unsignedString is valid: ${result}.`);
  let finalResult = false;
  if (result) {
    // need to also verify that the stringData converted to an object matches the data object
    finalResult = isEqual(data, JSON.parse(dataString));
  }

  logger.debug(`Signature unsignedString is valid and matches data object: ${finalResult}.`);
  return finalResult;
};
