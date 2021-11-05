import { EncryptedData, JSONObj, PublicKeyInfo } from '@unumid/types';
/**
 * Encrypt the provided data object.
 * @param did
 * @param publicKeyObj
 * @param data
 */
export declare const doEncrypt: (did: string, publicKeyObj: PublicKeyInfo, data: JSONObj) => EncryptedData;
/**
 * Encrypt the provided data object.
 * @param did
 * @param publicKeyObj
 * @param data
 */
export declare const doEncryptPb: (did: string, publicKeyObj: PublicKeyInfo, data: Uint8Array) => EncryptedData;
//# sourceMappingURL=encrypt.d.ts.map