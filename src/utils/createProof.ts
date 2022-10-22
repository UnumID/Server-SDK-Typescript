import { signBytes } from '@unumid/library-crypto';
import { signBytes as signBytesDeprecated } from '@unumid/library-crypto-v1';
import { Proof } from '@unumid/types';
import { lt } from 'lodash';
import { version } from 'winston';
import logger from '../logger';

/**
 * Creates cryptographic proof from byte array of a Protobuf object.
 * Supports v3 and v4 proofs.
 * @param data
 * @param privateKey
 * @param method
 * @param encoding
 */
export const createProof = (data: Uint8Array, privateKey: string, method: string, version: string): Proof => {
  return lt(version, '4.0.0') ? _createProofV3(data, privateKey, method) : _createProof(data, privateKey, method);
};

/**
 * Creates a v4 cryptographic proof from byte array of a Protobuf object.
 * @param data
 * @param privateKey
 * @param method
 * @returns
 */
const _createProof = (data: Uint8Array, privateKey: string, method: string): Proof => {
  const signature = signBytes(data, privateKey);

  const proof: Proof = {
    created: new Date(),
    signatureValue: signature,
    type: 'secp256r1Signature2020',
    verificationMethod: method,
    proofPurpose: 'assertionMethod'
  };

  logger.debug(`Successfully created ${version} proof ${JSON.stringify(proof)}`);
  return (proof);
};

/**
 * Creates a v3 cryptographic proof from byte array of a Protobuf object.
 * @param data
 * @param privateKey
 * @param method
 * @returns
 */
const _createProofV3 = (data: Uint8Array, privateKey: string, method: string): Proof => {
  const signature = signBytesDeprecated(data, privateKey);

  const proof: Proof = {
    created: new Date(),
    signatureValue: signature,
    type: 'secp256r1Signature2020',
    verificationMethod: method,
    proofPurpose: 'assertionMethod'
  };

  logger.debug(`Successfully created ${version} proof ${JSON.stringify(proof)}`);
  return (proof);
};
