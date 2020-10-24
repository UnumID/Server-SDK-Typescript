import { makeRESTCall } from 'library-issuer-verifier-utility';

import { checkCredentialStatus } from '../src/checkCredentialStatus';
import { configData } from '../src/config';

describe('checkCredentialStatus', () => {
  const issuerDid = 'did:unum:dc87744a-a745-4d34-a097-2f7652a0e1f5';
  const issuerPrivateKey = '-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgNW9X8XVk5WTvWo3t\ny+kRIgAyVrzsrx/jaSSXswBeiUihRANCAARTbsvc1lAfMDSnMShlEMZhcLpqJLVH\nBK1dGVTU7oJLDMdrwK9pHYDv7owhzsOcWZjXJa32sMk2VL48Mh7VDB9a\n-----END PRIVATE KEY-----\n';
  const issuerAuthToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiaXNzdWVyIiwidXVpZCI6ImIyNzUyOTFiLWQ2ODMtNDIxMi05NmRmLTljNjMyMjE0MjliYyIsImRpZCI6ImRpZDp1bnVtOmRjODc3NDRhLWE3NDUtNGQzNC1hMDk3LTJmNzY1MmEwZTFmNSIsImV4cCI6MTYwMzM5Mjg3My4xNTEsImlhdCI6MTYwMzQ5NzIwNH0.21ICew2tXcSi4r9BwwGag-1V7gEkCVw8RJyIVfNPrXY';
  let credential1;
  let credential2;

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

    const credentialResponse1 = await makeRESTCall({
      data: credentialOptions,
      baseUrl: configData.IssuerAppUrl,
      endPoint: 'api/issueCredentials',
      header: { Authorization: `Bearer ${issuerAuthToken}` },
      method: 'POST'
    });

    credential1 = credentialResponse1.body;

    const credentialResponse2 = await makeRESTCall({
      data: credentialOptions,
      baseUrl: configData.IssuerAppUrl,
      endPoint: 'api/issueCredentials',
      header: { Authorization: `Bearer ${issuerAuthToken}` },
      method: 'POST'
    });

    credential2 = credentialResponse2.body;
  });

  it('returns true if the credential status is valid', async () => {
    const isValid = await checkCredentialStatus(credential1);
    expect(isValid).toBe(true);
  });

  it('returns false if the credential status is revoked', async () => {
    const options = {
      data: { status: 'revoked' },
      baseUrl: configData.SaaSUrl,
      endPoint: `credentialStatus/${credential2.id}`,
      method: 'PATCH',
      header: { Authorization: `Bearer ${issuerAuthToken}` }
    };

    await makeRESTCall(options);

    const isValid = await checkCredentialStatus(credential2);
    expect(isValid).toBe(false);
  });
});
