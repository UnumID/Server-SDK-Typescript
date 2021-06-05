import { VersionedPresentationRequestDto } from '@unumid/types';
import { makeNetworkRequest } from '../../src/utils/networkRequestHelper';
import { configData } from '../../src/config';
import { dummyAuthToken, makeDummyVersionedPresentationRequestDto } from './mocks';
import { CustError, getVersionedRequest } from '../../src';
import logger from '../../src/logger';

jest.mock('../../src/utils/networkRequestHelper', () => ({
  ...jest.requireActual('../../src/utils/networkRequestHelper'),
  makeNetworkRequest: jest.fn()
}));

jest.spyOn(logger, 'error');

const mockMakeNetworkRequest = makeNetworkRequest as jest.Mock;

describe('getVersionedRequest', () => {
  let dummyVersionedPresentationRequestDto: VersionedPresentationRequestDto;

  beforeEach(async () => {
    dummyVersionedPresentationRequestDto = await makeDummyVersionedPresentationRequestDto();
  });

  afterEach(() => {
    mockMakeNetworkRequest.mockClear();
  });

  it('calls the saas to get the versioned requests', async () => {
    mockMakeNetworkRequest.mockResolvedValueOnce({
      body: dummyVersionedPresentationRequestDto,
      headers: { 'x-auth-token': dummyAuthToken }
    });
    const id = dummyVersionedPresentationRequestDto.presentationRequests['3.0.0'].presentationRequest.id;
    await getVersionedRequest(dummyAuthToken, id);
    const expected = {
      method: 'GET',
      baseUrl: configData.SaaSUrl,
      endPoint: `presentationRequestRepository/${id}`,
      header: { Authorization: dummyAuthToken }
    };
    expect(mockMakeNetworkRequest).toBeCalledWith(expected);
  });

  it('returns the versioned requests', async () => {
    mockMakeNetworkRequest.mockResolvedValueOnce({
      body: dummyVersionedPresentationRequestDto,
      headers: { 'x-auth-token': dummyAuthToken }
    });
    const id = dummyVersionedPresentationRequestDto.presentationRequests['3.0.0'].presentationRequest.id;
    const response = await getVersionedRequest(dummyAuthToken, id);
    expect(response.body).toEqual(dummyVersionedPresentationRequestDto);
  });

  it('returns the auth token returned in response headers by the SaaS', async () => {
    mockMakeNetworkRequest.mockResolvedValueOnce({
      body: dummyVersionedPresentationRequestDto,
      headers: { 'x-auth-token': dummyAuthToken }
    });
    const id = dummyVersionedPresentationRequestDto.presentationRequests['3.0.0'].presentationRequest.id;
    const response = await getVersionedRequest(dummyAuthToken, id);
    expect(response.authToken).toEqual(dummyAuthToken);
  });

  it('logs and re-throws errors', async () => {
    const err = new CustError(404, 'not found.');
    mockMakeNetworkRequest.mockRejectedValueOnce(err);
    const id = dummyVersionedPresentationRequestDto.presentationRequests['3.0.0'].presentationRequest.id;
    try {
      await getVersionedRequest(dummyAuthToken, id);
      fail();
    } catch (e) {
      expect(logger.error).toBeCalledWith('Error getting request(s) from UnumID SaaS. CustError: not found.');
      expect(e).toEqual(err);
    }
  });
});
