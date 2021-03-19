import { getDIDDoc, getKeyFromDIDDoc, doVerify, handleAuthToken } from '@unumid/library-issuer-verifier-utility';
import { CryptoError } from '@unumid/library-crypto';
import { omit } from 'lodash';

import { UnumDto } from '../types';
import { configData } from '../config';
import logger from '../logger';
import { VerifiableCredential } from '@unumid/types';

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

  try {
    const isVerified: boolean = doVerify(proof.signatureValue, data, publicKeyObject[0].publicKey, publicKeyObject[0].encoding, proof.unsignedValue);

    const result: UnumDto<boolean> = {
      authToken,
      body: isVerified
    };

    return result;
  } catch (e) {
    if (e instanceof CryptoError) {
      logger.error('Crypto error verifying the credential signature', e);
    } else {
      logger.error(`Error verifying credential ${credential.id} signature`, e);
    }

    // need to return the UnumDto with the (potentially) updated authToken
    const result: UnumDto<boolean> = {
      authToken,
      body: false
    };

    return result;
  }
};
