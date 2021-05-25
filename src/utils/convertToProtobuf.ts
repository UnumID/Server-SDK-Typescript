
import { Proof, ProofPb } from '@unumid/types';

/**
 * Convert a json / http Proof type to protobuf
 */
export const convertProof = (proof: Proof): ProofPb => {
  return {
    ...proof,
    created: new Date(proof.created)
  };
};
