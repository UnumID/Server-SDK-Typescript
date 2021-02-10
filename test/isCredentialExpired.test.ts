import { isCredentialExpired } from '../src/verifier/isCredentialExpired';
import { makeDummyCredential, makeDummyUnsignedCredential } from './mocks';

describe('isCredentialExpired', () => {
  let credentialWithNoExpirationDate;
  let unexpiredCredential;
  let expiredCredential;

  beforeAll(async () => {
    const unsignedUnexpiredCredential = makeDummyUnsignedCredential({ expirationDate: new Date(new Date().getTime() + 6000) });
    unexpiredCredential = await makeDummyCredential({ unsignedCredential: unsignedUnexpiredCredential });

    const unsignedExpiredCredential = makeDummyUnsignedCredential({ expirationDate: new Date() });
    expiredCredential = await makeDummyCredential({ unsignedCredential: unsignedExpiredCredential });

    const unsignedCredentialWithNoExpirationDate = makeDummyUnsignedCredential();
    credentialWithNoExpirationDate = await makeDummyCredential({ unsignedCredential: unsignedCredentialWithNoExpirationDate });
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
