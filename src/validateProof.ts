import { JSONObj } from 'library-issuer-verifier-utility';

export const validateProof = (proof: JSONObj): boolean => {
  const {
    created,
    signatureValue,
    type,
    verificationMethod,
    proofPurpose
  } = proof;

  return created && signatureValue && type && verificationMethod && proofPurpose;
};
