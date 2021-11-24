import { Proof, ProofPb } from '@unumid/types';
import { CustError } from '../utils/error';

/**
 * Helper to validate a proof has the required attributes.
 * @param proof ProofPb
 */
export const validateProof = (proof: ProofPb): ProofPb => {
  const {
    created,
    signatureValue,
    type,
    verificationMethod,
    proofPurpose
  } = proof;

  if (!created) {
    throw new CustError(400, 'Invalid Presentation: proof.created is required.');
  } else if (typeof created === 'string') {
    proof.created = new Date(created);
  }

  if (!signatureValue) {
    throw new CustError(400, 'Invalid Presentation: proof.signatureValue is required.');
  }

  if (!type) {
    throw new CustError(400, 'Invalid Presentation: proof.type is required.');
  }

  if (!verificationMethod) {
    throw new CustError(400, 'Invalid Presentation: proof.verificationMethod is required.');
  }

  if (!proofPurpose) {
    throw new CustError(400, 'Invalid Presentation: proof.proofPurpose is required.');
  }

  return proof;
};

/**
 * Helper to validate a proof has the required attributes.
 * @param proof ProofPb
 */
export const validateProofDeprecated = (proof: Proof): Proof => {
  const {
    created,
    signatureValue,
    type,
    verificationMethod,
    proofPurpose
  } = proof;

  if (!created) {
    throw new CustError(400, 'Invalid Presentation: proof.created is required.');
  }

  if (!signatureValue) {
    throw new CustError(400, 'Invalid Presentation: proof.signatureValue is required.');
  }

  if (!type) {
    throw new CustError(400, 'Invalid Presentation: proof.type is required.');
  }

  if (!verificationMethod) {
    throw new CustError(400, 'Invalid Presentation: proof.verificationMethod is required.');
  }

  if (!proofPurpose) {
    throw new CustError(400, 'Invalid Presentation: proof.proofPurpose is required.');
  }

  return proof;
};
