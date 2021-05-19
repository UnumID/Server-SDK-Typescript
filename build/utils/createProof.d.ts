import { Proof, JSONObj, ProofPb } from '@unumid/types';
/**
 * Create cryptographic proof.
 * @param data
 * @param privateKey
 * @param method
 * @param encoding
 */
export declare const createProof: (data: JSONObj, privateKey: string, method: string, encoding: 'base58' | 'pem') => Proof;
/**
 * Create cryptographic proof from byte array of a Protobuf object
 * @param data
 * @param privateKey
 * @param method
 * @param encoding
 */
export declare const createProofPb: (data: Uint8Array, privateKey: string, method: string, encoding: 'base58' | 'pem') => ProofPb;
//# sourceMappingURL=createProof.d.ts.map