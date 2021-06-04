import { JSONObj } from '@unumid/types';
/**
 * Verify the signature on the provided byte array.
 * @param signature
 * @param data
 * @param publicKey
 * @param encoding String ('base58' | 'pem'), defaults to 'pem'
 */
export declare const doVerify: (signature: string, data: Uint8Array, publicKey: string, encoding?: 'base58' | 'pem') => boolean;
/**
 * Verify the signature on the provided data object or optional dataString.
 * Deprecated in favor of doVerifyBytes which is made to be leveraged with Protobufs for deterministic byte array (de)serialization.
 *
 * @param signature
 * @param data
 * @param publicKey
 * @param encoding String ('base58' | 'pem'), defaults to 'pem'
 * @param stringData Optional String, for cases where the text encoding maybe different, using the provided string to check the signature then compare against the object itself
 */
export declare const doVerifyDeprecated: (signature: string, data: JSONObj, publicKey: string, encoding?: 'base58' | 'pem', dataString?: string | undefined) => boolean;
//# sourceMappingURL=verify.d.ts.map