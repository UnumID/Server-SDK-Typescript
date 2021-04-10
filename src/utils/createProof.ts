import { sign } from '@unumid/library-crypto';
import stringify from 'fast-json-stable-stringify';

import { Proof } from '@unumid/types';
import { JSONObj } from '../types';
import logger from '../logger';

/**
 * Create cryptographic proof.
 * @param data
 * @param privateKey
 * @param method
 * @param encoding
 */
export const createProof = (data: JSONObj, privateKey: string, method: string, encoding: 'base58' | 'pem'): Proof => {
  const signature = sign(data, privateKey, encoding);

  const proof: Proof = {
    created: (new Date()).toISOString(),
    signatureValue: signature,
    unsignedValue: stringify(data),
    type: 'secp256r1Signature2020',
    verificationMethod: method,
    proofPurpose: 'AssertionMethod'
  };

  logger.debug('Successfully created proof', proof);
  return (proof);
};
