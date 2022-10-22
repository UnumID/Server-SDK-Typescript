import { configData } from '../config';
import { requireAuth } from '../requireAuth';

import { RESTData, UnumDto } from '../types';
import logger from '../logger';
import { JSONObj, UnsignedRevokeAllCredentials, RevokeAllCredentials, ProofPb } from '@unumid/types';
import { CustError } from '../utils/error';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';
import { createProof } from '../utils/createProof';

/**
 * Helper to validate request inputs.
 * @param req Request
 */
const validateInputs = (issuerDid: string, signingPrivateKey: string, subjectDid: string): void => {
  // issuerDid is mandatory.
  if (!issuerDid) {
    throw new CustError(400, 'issuerDid is required.');
  }

  // signingPrivateKey is mandatory.
  if (!signingPrivateKey) {
    throw new CustError(400, 'signingPrivateKey is required.');
  }

  // subjectDid is mandatory.
  if (!subjectDid) {
    throw new CustError(400, 'subjectDid is required.');
  }
};

/**
 * Helper to revoke all credentials that the calling issuer (DID + signing private key) has issued a particular DID.
 * @param authorization
 * @param issuerDid
 * @param signingPrivateKey
 * @param subjectDid
 * @returns
 */
export const revokeAllCredentials = async (authorization: string, issuerDid: string, signingPrivateKey: string, subjectDid: string): Promise<UnumDto<undefined>> => {
  try {
    requireAuth(authorization);

    validateInputs(issuerDid, signingPrivateKey, subjectDid);

    // must sign the request with the issuer's signing private key.
    const unsignedDto: UnsignedRevokeAllCredentials = {
      did: subjectDid
    };

    const bytes = UnsignedRevokeAllCredentials.encode(unsignedDto).finish();
    const proof: ProofPb = createProof(bytes, signingPrivateKey, issuerDid, '4.0.0');

    const signedDto: RevokeAllCredentials = {
      ...unsignedDto,
      proof
    };

    const restData: RESTData = {
      method: 'POST',
      baseUrl: configData.SaaSUrl,
      endPoint: 'revokeAllCredentials/',
      header: { Authorization: authorization },
      data: signedDto
    };

    // make request to SaaS to update the CredentialStatus
    const response: JSONObj = await makeNetworkRequest<{ success: boolean }>(restData);

    const authToken: string = handleAuthTokenHeader(response, authorization);

    const revokedResponse: UnumDto<undefined> = {
      authToken,
      body: undefined
    };

    return revokedResponse;
  } catch (error) {
    logger.error(`Error revoking all ${subjectDid}'s credentials with UnumID SaaS. ${error}`);
    throw error;
  }
};
