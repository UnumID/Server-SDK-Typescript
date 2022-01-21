
import { CryptoError } from '@unumid/library-crypto';
import { omit } from 'lodash';

import { UnumDto } from '../types';
import { configData } from '../config';
import logger from '../logger';
import { CredentialPb, Proof, UnsignedCredentialPb } from '@unumid/types';
import { getDIDDoc, getKeysFromDIDDoc } from '../utils/didHelper';
import { handleAuthTokenHeader } from '../utils/networkRequestHelper';
import { doVerify } from '../utils/verify';
import { CustError } from '..';

/**
 * Used to verify the credential signature given the corresponding Did document's public key.
 * @param credential
 * @param authorization
 */
export const verifyCredential = async (credential: CredentialPb, authorization: string): Promise<UnumDto<boolean>> => {
  const { proof } = credential;

  if (!proof) {
    throw new CustError(400, `Credential ${credential.id} does not contain a proof attribute.`);
  }

  const didDocumentResponse = await getDIDDoc(configData.SaaSUrl, authorization, proof.verificationMethod);

  if (didDocumentResponse instanceof Error) {
    throw didDocumentResponse;
  }

  const authToken: string = handleAuthTokenHeader(didDocumentResponse, authorization);
  const publicKeyObject = getKeysFromDIDDoc(didDocumentResponse.body, 'secp256r1');

  const data: UnsignedCredentialPb = omit(credential, 'proof');

  try {
    const bytes = UnsignedCredentialPb.encode(data).finish();
    // TODO update DID
    const isVerified: boolean = doVerify(proof.signatureValue, bytes, publicKeyObject[0].publicKey, publicKeyObject[0].encoding);

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
