import { makeRESTCall } from 'library-issuer-verifier-utility';

import { isCredentialExpired } from '../src/isCredentialExpired';
import { configData } from '../src/config';

describe('isCredentialExpired', () => {
  const issuerDid = 'did:unum:dc87744a-a745-4d34-a097-2f7652a0e1f5';
  const issuerPrivateKey = '-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgNW9X8XVk5WTvWo3t\ny+kRIgAyVrzsrx/jaSSXswBeiUihRANCAARTbsvc1lAfMDSnMShlEMZhcLpqJLVH\nBK1dGVTU7oJLDMdrwK9pHYDv7owhzsOcWZjXJa32sMk2VL48Mh7VDB9a\n-----END PRIVATE KEY-----\n';
  const issuerAuthToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiaXNzdWVyIiwidXVpZCI6ImIyNzUyOTFiLWQ2ODMtNDIxMi05NmRmLTljNjMyMjE0MjliYyIsImRpZCI6ImRpZDp1bnVtOmRjODc3NDRhLWE3NDUtNGQzNC1hMDk3LTJmNzY1MmEwZTFmNSIsImV4cCI6MTYwMzM5Mjg3My4xNTEsImlhdCI6MTYwMzQ5NzIwNH0.21ICew2tXcSi4r9BwwGag-1V7gEkCVw8RJyIVfNPrXY';
  let credentialWithNoExpirationDate;
  let unexpiredCredential;
  let expiredCredential;

  beforeAll(async () => {
    const credentialOptions = {
      type: 'TestCredential',
      credentialSubject: {
        id: 'did:unum:a0cd2e20-5f3e-423c-8382-afc722eaca9e',
        value: 'test'
      },
      eccPrivateKey: issuerPrivateKey,
      issuer: issuerDid
    };

    const credentialResponse = await makeRESTCall({
      data: credentialOptions,
      baseUrl: configData.IssuerAppUrl,
      endPoint: 'api/issueCredentials',
      header: { Authorization: `Bearer ${issuerAuthToken}` },
      method: 'POST'
    });

    credentialWithNoExpirationDate = credentialResponse.body;

    const unexpiredCredentialResponse = await makeRESTCall({
      data: { ...credentialOptions, expirationDate: new Date(new Date().getTime() + 10 * 60 * 1000) },
      baseUrl: configData.IssuerAppUrl,
      endPoint: 'api/issueCredentials',
      header: { Authorization: `Bearer ${issuerAuthToken}` },
      method: 'POST'
    });

    unexpiredCredential = unexpiredCredentialResponse.body;

    const expiredCredentialResponse = await makeRESTCall({
      data: { ...credentialOptions, expirationDate: new Date() },
      baseUrl: configData.IssuerAppUrl,
      endPoint: 'api/issueCredentials',
      header: { Authorization: `Bearer ${issuerAuthToken}` },
      method: 'POST'
    });

    expiredCredential = expiredCredentialResponse.body;
  });

  it('returns false if the credential has no expiration date', () => {
    const isExpired = isCredentialExpired(credentialWithNoExpirationDate);
    expect(isExpired).toBe(false);
  });

  it('returns false if the credential expiration date is in the future', () => {
    const isExpired = isCredentialExpired(unexpiredCredential);
    expect(isExpired).toBe(false);
  });

  it('returns true if the credential expiration date is in the past', () => {
    const isExpired = isCredentialExpired(expiredCredential);
    expect(isExpired).toBe(true);
  });
});
