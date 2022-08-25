import { PublicKeyInfo } from '@unumid/types';
/**
 * Verify the signature on the provided byte array.
 * @param signature
 * @param data
 * @param publicKey
 * @param encoding String ('base58' | 'pem'), defaults to 'pem'
 */
export declare const doVerify: (signature: string, data: Uint8Array, publicKey: PublicKeyInfo) => boolean;
//# sourceMappingURL=verify.d.ts.map