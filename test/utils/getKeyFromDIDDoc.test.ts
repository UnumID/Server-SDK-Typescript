import { DidDocument } from '@unumid/types';
import { getKeysFromDIDDoc } from '../../src/utils/didHelper';

describe('getKeyFromDidDoc', () => {
  it('gets keys by the given type', () => {
    const didDoc: DidDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1'
      ],
      id: 'did:unum:3e48b969-5cf3-46c7-9c61-54de886d1382',
      created: new Date('2020-08-10T09:11:21.730Z'),
      updated: new Date('2020-08-10T09:11:21.730Z'),
      publicKey: [
        {
          id: '5a586f0f-6936-426c-bc68-adeb4f0e7d5d',
          type: 'secp256r1',
          status: 'valid',
          encoding: 'pem',
          publicKey: '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEJPhxGUH5UGMMgI+QypletJYpZRKs\n0R8BoFkbQOvA1kBLvKUGYuNguR+yOzCiY7LFjZD3PgYPuuDHAUuedyvF3A==\n-----END PUBLIC KEY-----\n'
        },
        {
          id: 'f335d201-8f84-49ee-b895-a5040a7877fd',
          type: 'RSA',
          status: 'valid',
          encoding: 'pem',
          publicKey: '-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAtnb48QEMrlXK60liNIpvPKBNhJj8k6ODfvYbypGlALQC2QYRrXwp\nqmyNy+kYBKmSoz92a0Rd6J8ifCWDmmOfiyuiQDyxIKNFzftM2QZnL/8nD6kPLNq4\n6lSHm6zilq+5lSXkz1Sf2vl0lFJl4Y04aR+//d+A63nQGrJjC0sVfnd+2JkgAzeA\nxNoYV8XC9sXX7VGYBo0Q39ljpp425nH/YTQ67XoKhCM09ElB7cISfc/+xwSpEqBs\nN+qGVbm1dDndGcOuIIREeTs9zzUjBU33bp4LyjNJx+OB243802/abi2huk1+faox\n2MxBlnf0wB46WThEuR/fDeHt7gsDjKN3cwIDAQAB\n-----END RSA PUBLIC KEY-----\n'
        }
      ],
      service: [
        {
          id: 'did:unum:3e48b969-5cf3-46c7-9c61-54de886d1382#vcr',
          type: 'CredentialRepositoryService',
          serviceEndpoint: 'https://api.dev-unumid.co/credentialRepository/did:unum:3e48b969-5cf3-46c7-9c61-54de886d1382'
        }
      ]
    };

    const result = getKeysFromDIDDoc(didDoc, 'secp256r1');
    expect(result.length).toEqual(1);
    expect(result[0].id).toEqual('5a586f0f-6936-426c-bc68-adeb4f0e7d5d');
  });
});
