import { sign, signBytes } from '@unumid/library-crypto';
import stringify from 'fast-json-stable-stringify';

import { JSONObj, ProofPb } from '@unumid/types';

import logger from '../logger';
import { Proof } from '@unumid/types-v2';

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
    created: new Date().toISOString(),
    signatureValue: signature,
    unsignedValue: stringify(data),
    type: 'secp256r1Signature2020',
    verificationMethod: method,
    proofPurpose: 'AssertionMethod'
  };

  logger.debug(`Successfully created proof ${JSON.stringify(proof)}`);
  return (proof);
};

/**
 * Create cryptographic proof from byte array of a Protobuf object
 * @param data
 * @param privateKey
 * @param method
 * @param encoding
 */
// export const createProofPb = (data: Uint8Array, privateKey: string, method: string, encoding: 'base58' | 'pem'): ProofPb => {
export const createProofPb = (data: Uint8Array, privateKey: string, method: string): ProofPb => {
  const signature = signBytes(data, privateKey);

  const proof: ProofPb = {
    created: new Date(),
    signatureValue: signature,
    type: 'secp256r1Signature2020',
    verificationMethod: method,
    proofPurpose: 'AssertionMethod'
  };

  logger.debug(`Successfully created proof ${JSON.stringify(proof)}`);
  return (proof);
};
