import { EncryptedData, PublicKeyInfo } from '@unumid/types';
import { JSONObj } from '../types';
/**
 * Encrypt the provided data object.
 * @param did
 * @param publicKeyObj
 * @param data
 */
export declare const doEncrypt: (did: string, publicKeyObj: PublicKeyInfo, data: JSONObj) => EncryptedData;
//# sourceMappingURL=encrypt.d.ts.map