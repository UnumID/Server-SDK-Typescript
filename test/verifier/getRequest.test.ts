import { PresentationRequestDto } from '@unumid/types';
import { makeNetworkRequest } from '../../src/utils/networkRequestHelper';
import { configData } from '../../src/config';
import { dummyAuthToken, makeDummyPresentationRequestDto } from './mocks';
import { CustError, getRequest } from '../../src';
import logger from '../../src/logger';

jest.mock('../../src/utils/networkRequestHelper', () => ({
  ...jest.requireActual('../../src/utils/networkRequestHelper'),
  makeNetworkRequest: jest.fn()
}));

jest.spyOn(logger, 'error');

const mockMakeNetworkRequest = makeNetworkRequest as jest.Mock;
describe('getRequest', () => {
  let dummyPresentationRequestDto: PresentationRequestDto;

  beforeEach(async () => {
    dummyPresentationRequestDto = await makeDummyPresentationRequestDto();
  });

  afterEach(() => {
    mockMakeNetworkRequest.mockClear();
  });

  it('calls the saas to get the request', async () => {
    mockMakeNetworkRequest.mockResolvedValueOnce({ body: dummyPresentationRequestDto, headers: { 'x-auth-token': dummyAuthToken } });
    await getRequest('test-authorization', dummyPresentationRequestDto.presentationRequest.uuid);
    const expected = {
      method: 'GET',
      baseUrl: configData.SaaSUrl,
      endPoint: `presentationRequest/${dummyPresentationRequestDto.presentationRequest.uuid}`,
      header: { Authorization: 'test-authorization' }
    };
    expect(mockMakeNetworkRequest).toBeCalledWith(expected);
  });

  it('returns the request', async () => {
    mockMakeNetworkRequest.mockResolvedValueOnce({ body: dummyPresentationRequestDto, headers: { 'x-auth-token': dummyAuthToken } });
    const response = await getRequest('test-authorization', dummyPresentationRequestDto.presentationRequest.uuid);
    expect(response.body).toEqual(dummyPresentationRequestDto);
  });

  it('returns the auth token returned in response headers by the SaaS', async () => {
    mockMakeNetworkRequest.mockResolvedValueOnce({ body: dummyPresentationRequestDto, headers: { 'x-auth-token': dummyAuthToken } });
    const response = await getRequest('test-authorization', dummyPresentationRequestDto.presentationRequest.uuid);
    expect(response.authToken).toEqual(dummyAuthToken);
  });

  it('logs and re-throws errors', async () => {
    const err = new CustError(404, 'presentationRequest not found.');
    mockMakeNetworkRequest.mockRejectedValueOnce(err);
    try {
      await getRequest(dummyAuthToken, dummyPresentationRequestDto.presentationRequest.uuid);
      fail();
    } catch (e) {
      expect(logger.error).toBeCalledWith('Error getting request from UnumID SaaS. CustError: presentationRequest not found.');
      expect(e).toEqual(err);
    }
  });
});
