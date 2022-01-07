/**
 * NOTE: This doesn't really belong under /verifier, as it may be used by anyone
 * (and in fact was written for use by subjects in the web wallet server)
 */
import { CredentialIdToStatusMap, CredentialStatusInfo } from '@unumid/types';

import { UnumDto } from '../types';
import { makeNetworkRequest, handleAuthTokenHeader } from '../utils/networkRequestHelper';
import { configData } from '../config';
import logger from '../logger';

/**
 * Function to check the status of one or more credentials by credentialId (valid, revoked, etc)
 * @param {string} authorization
 * @param {string[]} credentialIds
 * @returns {Promise<UnumDto<CredentialIdToStatusMap>>} a promise resolving to an UnumDto containing a list of zero or more CredentialStatuses
 */
export const checkManyCredentialStatuses = async (
  authorization: string,
  credentialIds: string[]
): Promise<UnumDto<CredentialIdToStatusMap>> => {
  const searchParams = new URLSearchParams();

  credentialIds.forEach(credentialId => searchParams.append('credentialId', credentialId));

  const searchParamsString = searchParams.toString();
  const options = {
    baseUrl: configData.SaaSUrl,
    endPoint: `credentialStatus?${searchParamsString}`,
    method: 'GET',
    header: { Authorization: authorization }
  };

  try {
    const credentialStatusesResponse = await makeNetworkRequest<CredentialStatusInfo[]>(options);
    const authToken = handleAuthTokenHeader(credentialStatusesResponse, authorization);

    const credentialIdToStatusMap: CredentialIdToStatusMap = credentialStatusesResponse.body.reduce<CredentialIdToStatusMap>(
      (previous, current) => {
        return {
          ...previous,
          [current.credentialId]: current
        };
      },
      {}
    );

    return {
      authToken,
      body: credentialIdToStatusMap
    };
  } catch (e) {
    logger.error('Error getting credential statuses', e);
    throw e;
  }
};
