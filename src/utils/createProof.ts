import { signBytes } from '@unumid/library-crypto';
import { ProofPb } from '@unumid/types';
import logger from '../logger';

/**
 * Create cryptographic proof from byte array of a Protobuf object
 * @param data
 * @param privateKey
 * @param method
 * @param encoding
 */
export const createProofPb = (data: Uint8Array, privateKey: string, method: string): ProofPb => {
  const signature = signBytes(data, privateKey);

  const proof: ProofPb = {
    created: new Date(),
    signatureValue: signature,
    type: 'secp256r1Signature2020',
    verificationMethod: method,
    proofPurpose: 'assertionMethod'
  };

  logger.debug(`Successfully created proof ${JSON.stringify(proof)}`);
  return (proof);
};
