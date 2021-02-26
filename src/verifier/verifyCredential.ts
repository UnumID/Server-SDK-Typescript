import { getDIDDoc, getKeyFromDIDDoc, doVerify, handleAuthToken, JSONObj } from '@unumid/library-issuer-verifier-utility';
import { CryptoError, verifyString } from '@unumid/library-crypto';
import _, { omit } from 'lodash';

import { UnumDto, VerifiableCredential } from '../types';
import { configData } from '../config';
import logger from '../logger';

/**
 * Verify the signature on the provided data object.
 * @param signature
 * @param data
 * @param publicKey
 * @param encoding String ('base58' | 'pem'), defaults to 'pem'
 */
const doVerifyString = (signature: string, dataString: string, data: JSONObj, publicKey: string, encoding: 'base58' | 'pem' = 'pem'): boolean => {
  logger.debug(`Signature verification using public key ${publicKey}`);
  const result:boolean = verifyString(signature, dataString, publicKey, encoding);

  let finalResult = false;
  if (result) {
    // need to also verify that the stringData converted to an object matches the data object
    finalResult = _.isEqual(data, JSON.parse(dataString));
  }

  logger.debug(`Signature is valid: ${result}.`);
  return result;
};

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
    const isVerifiedData = doVerify(proof.signatureValue, data, publicKeyObject[0].publicKey, publicKeyObject[0].encoding);
    const isVerifiedString = doVerifyString(proof.signatureValue, proof.unsignedValue, data, publicKeyObject[0].publicKey, publicKeyObject[0].encoding);

    const isVerified = isVerifiedData || isVerifiedString;
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
