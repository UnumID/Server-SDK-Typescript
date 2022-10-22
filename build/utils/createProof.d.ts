import { Proof } from '@unumid/types';
/**
 * Creates cryptographic proof from byte array of a Protobuf object.
 * Supports v3 and v4 proofs.
 * @param data
 * @param privateKey
 * @param method
 * @param encoding
 */
export declare const createProof: (data: Uint8Array, privateKey: string, method: string, version: string) => Proof;
//# sourceMappingURL=createProof.d.ts.map