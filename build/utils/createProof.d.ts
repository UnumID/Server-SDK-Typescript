import { Proof, JSONObj } from '@unumid/types';
/**
 * Create cryptographic proof.
 * @param data
 * @param privateKey
 * @param method
 * @param encoding
 */
export declare const createProof: (data: JSONObj, privateKey: string, method: string, encoding: 'base58' | 'pem') => Proof;
//# sourceMappingURL=createProof.d.ts.map