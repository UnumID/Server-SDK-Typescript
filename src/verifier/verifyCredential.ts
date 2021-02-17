import { getDIDDoc, getKeyFromDIDDoc, doVerify, handleAuthToken } from 'library-issuer-verifier-utility';
import { omit } from 'lodash';

import { UnumDto, VerifiableCredential } from '../types';
import { configData } from '../config';

/**
 * Used to verify the credential signature given the corresponding Did document's public key.
 * @param credential
 * @param authorization
 */
export const verifyCredential = async (credential: VerifiableCredential, authorization: string): Promise<UnumDto<boolean>> => {
  const { proof } = credential;
  const didDocumentResponse = await getDIDDoc(configData.SaaSUrl, authorization, proof.verificationMethod);

  if (didDocumentResponse instanceof Error) {
    throw didDocumentResponse;
  }

  const authToken: string = handleAuthToken(didDocumentResponse);
  const publicKeyObject = getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');
  const data = omit(credential, 'proof');

  const isVerified = doVerify(proof.signatureValue, data, publicKeyObject[0].publicKey, publicKeyObject[0].encoding);
  const result: UnumDto<boolean> = {
    authToken,
    body: isVerified
  };

  return result;
};
