import { getDIDDoc, getKeyFromDIDDoc, doVerify } from 'library-issuer-verifier-utility';
import { omit } from 'lodash';

import { VerifiableCredential } from './types';
import { configData } from './config';

export const verifyCredential = async (credential: VerifiableCredential, authorization: string): Promise<boolean> => {
  const { proof } = credential;
  const didDocumentResponse = await getDIDDoc(configData.SaaSUrl, authorization, proof.verificationMethod);

  if (didDocumentResponse instanceof Error) {
    throw didDocumentResponse;
  }

  const publicKeyObject = getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');
  const data = omit(credential, 'proof');

  const isVerified = doVerify(proof.signatureValue, data, publicKeyObject[0].publicKey, publicKeyObject[0].encoding);
  return isVerified;
};
