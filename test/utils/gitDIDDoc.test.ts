import * as restHlpr from '../../src/utils/networkRequestHelper';

import { DidDocument } from '@unumid/types';
import { RESTResponse } from '../../src/types';
import { getDIDDoc } from '../../src/utils/didHelper';

describe('Get DID doc for the given did', () => {
  const baseUrl = 'https://api.dev-unum.id/';
  const did = 'did:unum:3e48b969-5cf3-46c7-9c61-54de886d1382';
  const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiaXNzdWVyIiwidXVpZCI6ImRmYTllNmY5LWUyMGYtNGU2MS05ODZjLTEwYjRjZDFmMDQxOCIsImRpZCI6ImRpZDp1bnVtOjNlNDhiOTY5LTVjZjMtNDZjNy05YzYxLTU0ZGU4ODZkMTM4MiIsImV4cCI6MTU5Njc2NzAzNi45NjQsImlhdCI6MTU5NzA1MDY4MX0.I-t3mDBTBjKeO_GZDyiXwgKwvlUIy_B6zcB1V3hZ2c0';
  let restSpy;
  let didDoc: DidDocument;
  let didDocResponse: RESTResponse<DidDocument>;

  beforeEach(async () => {
    restSpy = jest.spyOn(restHlpr, 'makeNetworkRequest');
    didDocResponse = await getDIDDoc(baseUrl, authHeader, did) as RESTResponse<DidDocument>;
    didDoc = didDocResponse.body;
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('makeNetworkRequest should have been called', () => {
    expect(restSpy).toBeCalled();
  });

  it('returns DID Document object', () => {
    expect(didDocResponse).toBeDefined();
  });

  it('returns DID Doc with all required attributes', () => {
    expect(didDoc.id).toBeDefined();
    expect(didDoc.publicKey).toBeDefined();
    expect(didDoc.service).toBeDefined();
  });
});

describe('Failure scenario for getting the DID doc', () => {
  const baseUrl = 'https://api.dev-unum.id/';
  const did = 'did:unum:3e48b969-5cf3-46c7-9c61-54de886d1382';
  const authKey = '';
  let didDocResponse: RESTResponse<DidDocument>;

  beforeEach(async () => {
    didDocResponse = await getDIDDoc(baseUrl, authKey, did) as RESTResponse<DidDocument>;
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  // it('Status code should be 401 when authKey is not passed', () => {
  //   expect(didDocResponse.code).toBe(401);
  // });
});
