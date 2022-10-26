import { EncryptedData, PublicKeyInfo } from '@unumid/types';
/**
 * Encrypt the provided data object.
 * @param did
 * @param publicKeyObj
 * @param data
 * @param version
 */
export declare const doEncrypt: (did: string, publicKeyObj: PublicKeyInfo, data: Uint8Array, version: string) => EncryptedData;
//# sourceMappingURL=encrypt.d.ts.map