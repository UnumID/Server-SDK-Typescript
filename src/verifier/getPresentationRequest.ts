import { JSONObj, PresentationRequestDto, PresentationRequestDtoPb } from '@unumid/types';
import { configData } from '../config';
import logger from '../logger';
import { RESTData, RESTResponse, UnumDto } from '../types';
import { CustError } from '../utils/error';
import { handleAuthTokenHeader, makeNetworkRequest } from '../utils/networkRequestHelper';

export async function getPresentationRequest (authorization: string, id: string): Promise<RESTResponse<PresentationRequestDto[]>> {
  const receiptCallOptions: RESTData = {
    method: 'GET',
    baseUrl: configData.SaaSUrl,
    endPoint: `presentationRequest?id=${id}&version=3.0.0`,
    header: { Authorization: authorization }
  };

  try {
    const resp = await makeNetworkRequest<PresentationRequestDto[]>(receiptCallOptions);

    return resp;
  } catch (e) {
    logger.error(`Error getting PresentationRequest ${id} from Unum ID SaaS, ${configData.SaaSUrl}. Error ${e}`);
    throw e;
  }
}
