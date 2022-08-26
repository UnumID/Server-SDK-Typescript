import { Proof } from '@unumid/types';
/**
 * Create cryptographic proof from byte array of a Protobuf object
 * @param data
 * @param privateKey
 * @param method
 * @param encoding
 */
export declare const createProof: (data: Uint8Array, privateKey: string, method: string) => Proof;
//# sourceMappingURL=createProof.d.ts.map