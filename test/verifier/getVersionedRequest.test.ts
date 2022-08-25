
import { makeNetworkRequest } from '../../src/utils/networkRequestHelper'; import { configData } from '../../src/config';
import { dummyAuthToken, makeDummyPresentationRequestEnriched } from './mocks';
import { CustError } from '../../src';
import logger from '../../src/logger';
import { PresentationRequestEnriched } from '@unumid/types';
import { sdkMajorVersion } from '../../src/utils/constants';
import { getPresentationRequest } from '../../src/verifier/getRequestById';

jest.mock('../../src/utils/networkRequestHelper', () => ({
  ...jest.requireActual('../../src/utils/networkRequestHelper'),
  makeNetworkRequest: jest.fn()
}));

jest.spyOn(logger, 'error');

const mockMakeNetworkRequest = makeNetworkRequest as jest.Mock;

describe('getVersionedRequest', () => {
  let PresentationRequestEnrichedDto: PresentationRequestEnriched[];

  beforeEach(async () => {
    PresentationRequestEnrichedDto = [await makeDummyPresentationRequestEnriched()];
  });

  afterEach(() => {
    mockMakeNetworkRequest.mockClear();
  });

  it('calls the saas to get the versioned requests', async () => {
    mockMakeNetworkRequest.mockResolvedValueOnce({
      body: PresentationRequestEnrichedDto,
      headers: { 'x-auth-token': dummyAuthToken }
    });
    const id = PresentationRequestEnrichedDto[0].presentationRequest.id;
    await getPresentationRequest(dummyAuthToken, id);
    const expected = {
      method: 'GET',
      baseUrl: configData.SaaSUrl,
      endPoint: `presentationRequest?id=${id}&version=${sdkMajorVersion}`,
      header: { Authorization: dummyAuthToken }
    };
    expect(mockMakeNetworkRequest).toBeCalledWith(expected);
  });

  it('returns the versioned requests', async () => {
    mockMakeNetworkRequest.mockResolvedValueOnce({
      body: PresentationRequestEnrichedDto,
      headers: { 'x-auth-token': dummyAuthToken }
    });
    const id = PresentationRequestEnrichedDto[0].presentationRequest.id;
    const response = await getPresentationRequest(dummyAuthToken, id);
    expect(response.body).toEqual(PresentationRequestEnrichedDto);
  });

  it('returns the auth token returned in response headers by the SaaS', async () => {
    mockMakeNetworkRequest.mockResolvedValueOnce({
      body: PresentationRequestEnrichedDto,
      headers: { 'x-auth-token': dummyAuthToken }
    });
    const id = PresentationRequestEnrichedDto[0].presentationRequest.id;
    const response = await getPresentationRequest(dummyAuthToken, id);
    expect(response.authToken).toEqual(dummyAuthToken);
  });

  it('logs and re-throws errors', async () => {
    const err = new CustError(404, 'not found.');
    mockMakeNetworkRequest.mockRejectedValueOnce(err);
    const id = PresentationRequestEnrichedDto[0].presentationRequest.id;
    try {
      await getPresentationRequest(dummyAuthToken, id);
      fail();
    } catch (e) {
      expect(logger.error).toBeCalledWith(`Error getting PresentationRequest ${id} from Unum ID SaaS, https://api.sandbox-unumid.co/. Error CustError: not found.`);
      expect(e).toEqual(err);
    }
  });
});
