"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProof = void 0;
var library_crypto_1 = require("@unumid/library-crypto");
var library_crypto_v1_1 = require("@unumid/library-crypto-v1");
var lodash_1 = require("lodash");
var winston_1 = require("winston");
var logger_1 = __importDefault(require("../logger"));
/**
 * Creates cryptographic proof from byte array of a Protobuf object.
 * Supports v3 and v4 proofs.
 * @param data
 * @param privateKey
 * @param method
 * @param encoding
 */
exports.createProof = function (data, privateKey, method, version) {
    if (version === void 0) { version = '4.0.0'; }
    return lodash_1.lt(version, '4.0.0') ? _createProofV3(data, privateKey, method) : _createProof(data, privateKey, method);
};
/**
 * Creates a v4 cryptographic proof from byte array of a Protobuf object.
 * @param data
 * @param privateKey
 * @param method
 * @returns
 */
var _createProof = function (data, privateKey, method) {
    var signature = library_crypto_1.signBytes(data, privateKey);
    var proof = {
        created: new Date(),
        signatureValue: signature,
        type: 'secp256r1Signature2020',
        verificationMethod: method,
        proofPurpose: 'assertionMethod'
    };
    logger_1.default.debug("Successfully created " + winston_1.version + " proof " + JSON.stringify(proof));
    return (proof);
};
/**
 * Creates a v3 cryptographic proof from byte array of a Protobuf object.
 * @param data
 * @param privateKey
 * @param method
 * @returns
 */
var _createProofV3 = function (data, privateKey, method) {
    var signature = library_crypto_v1_1.signBytes(data, privateKey);
    var proof = {
        created: new Date(),
        signatureValue: signature,
        type: 'secp256r1Signature2020',
        verificationMethod: method,
        proofPurpose: 'assertionMethod'
    };
    logger_1.default.debug("Successfully created " + winston_1.version + " proof " + JSON.stringify(proof));
    return (proof);
};
//# sourceMappingURL=createProof.js.map