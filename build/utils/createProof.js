"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProofPb = exports.createProof = void 0;
var library_crypto_1 = require("@unumid/library-crypto");
var fast_json_stable_stringify_1 = __importDefault(require("fast-json-stable-stringify"));
var logger_1 = __importDefault(require("../logger"));
/**
 * Create cryptographic proof.
 * @param data
 * @param privateKey
 * @param method
 * @param encoding
 */
exports.createProof = function (data, privateKey, method, encoding) {
    var signature = library_crypto_1.sign(data, privateKey, encoding);
    var proof = {
        created: new Date().toISOString(),
        signatureValue: signature,
        unsignedValue: fast_json_stable_stringify_1.default(data),
        type: 'secp256r1Signature2020',
        verificationMethod: method,
        proofPurpose: 'AssertionMethod'
    };
    logger_1.default.debug("Successfully created proof " + JSON.stringify(proof));
    return (proof);
};
/**
 * Create cryptographic proof from byte array of a Protobuf object
 * @param data
 * @param privateKey
 * @param method
 * @param encoding
 */
// export const createProofPb = (data: Uint8Array, privateKey: string, method: string, encoding: 'base58' | 'pem'): ProofPb => {
exports.createProofPb = function (data, privateKey, method) {
    var signature = library_crypto_1.signBytesV2(data, privateKey);
    var proof = {
        created: new Date(),
        signatureValue: signature,
        type: 'secp256r1Signature2020',
        verificationMethod: method,
        proofPurpose: 'AssertionMethod'
    };
    logger_1.default.debug("Successfully created proof " + JSON.stringify(proof));
    return (proof);
};
//# sourceMappingURL=createProof.js.map