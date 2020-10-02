import { JSONObj, CustError } from 'library-issuer-verifier-utility';

export const validateProof = (proof: JSONObj): void => {
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
};
