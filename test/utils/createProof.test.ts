import * as cryptoLib from '@unumid/library-crypto';
import { Proof } from '@unumid/types';
import { createProof } from '../../src/utils/createProof';

describe('Signs the given data and returns Proof object', () => {
  const data = { test: 'test Data Object' };
  const method = 'did:unum:9072a539-6a2e-495a-966b-eb03f5273116';
  const proof: Proof;
  let signSpy;

  beforeAll(async () => {
    signSpy = jest.spyOn(cryptoLib, 'sign', 'get');
    const { privateKey } = await cryptoLib.generateEccKeyPair();
    proof = createProof(data, privateKey, method);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('sign crypto library should have been called', () => {
    expect(signSpy).toBeCalled();
  });

  it('returns Proof object', () => {
    expect(proof).toBeDefined();
  });

  it('returns Proof Object with all required attributes', () => {
    expect(proof.created).toBeDefined();
    expect(proof.signatureValue).toBeDefined();
    expect(proof.type).toBe('secp256r1Signature2020');
    expect(proof.verificationMethod).toBe(method);
    expect(proof.proofPurpose).toBe('AssertionMethod');
  });
});
