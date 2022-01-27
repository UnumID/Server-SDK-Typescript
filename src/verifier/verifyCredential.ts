
import { CryptoError } from '@unumid/library-crypto';
import { omit } from 'lodash';

import { UnumDto } from '../types';
import logger from '../logger';
import { CredentialPb, PublicKeyInfo, UnsignedCredentialPb } from '@unumid/types';
import { getDidDocPublicKeys } from '../utils/didHelper';
import { doVerify } from '../utils/verify';
import { CustError } from '..';

/**
 * Used to verify the credential signature given the corresponding Did document's public key.
 * @param credential
 * @param authorization
 */
export const verifyCredential = async (authorization: string, credential: CredentialPb): Promise<UnumDto<boolean>> => {
  const { proof } = credential;

  if (!proof) {
    throw new CustError(400, `Credential ${credential.id} does not contain a proof attribute.`);
  }

  // grab all 'secp256r1' keys from the DID document
  const publicKeyInfoResponse: UnumDto<PublicKeyInfo[]> = await getDidDocPublicKeys(authorization, proof.verificationMethod, 'secp256r1');
  const publicKeyInfoList: PublicKeyInfo[] = publicKeyInfoResponse.body;
  const authToken = publicKeyInfoResponse.authToken;

  const data: UnsignedCredentialPb = omit(credential, 'proof');

  try {
    const bytes = UnsignedCredentialPb.encode(data).finish();

    let isVerified = false;

    // check all the public keys to see if any work, stop if one does
    for (const publicKeyInfo of publicKeyInfoList) {
      // const { publicKey, encoding } = publicKeyInfo;

      // isVerified = doVerify(proof.signatureValue, bytes, publicKey, encoding);
      isVerified = doVerify(proof.signatureValue, bytes, publicKeyInfo);
      if (isVerified) break;
    }

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
