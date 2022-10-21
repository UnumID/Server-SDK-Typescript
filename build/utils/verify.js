"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doVerify = void 0;
var logger_1 = __importDefault(require("../logger"));
var library_crypto_1 = require("@unumid/library-crypto");
var library_crypto_v1_1 = require("@unumid/library-crypto-v1");
/**
 * Verify the signature on the provided byte array.
 *
 * Note: it is backwards compatible with v1 of the crypto library which uses base58 encoding.
 * @param signature
 * @param data
 * @param publicKey
 * @param encoding String ('base58' | 'pem'), defaults to 'pem'
 */
exports.doVerify = function (signature, data, publicKey) {
    logger_1.default.debug("Signature data verification using public key " + JSON.stringify(publicKey));
    try {
        var result = library_crypto_1.verifyBytes(signature, data, publicKey);
        logger_1.default.debug("Signature data is valid: " + result + ".");
        return result;
    }
    catch (e) {
        logger_1.default.debug("Unable verifying signature using most recent crypto library with base64 encoding with publicKeyInfo " + JSON.stringify(publicKey) + ". Going to try with the v1, base58 crypto library. " + e);
        var result = library_crypto_v1_1.verifyBytes(signature, data, publicKey);
        logger_1.default.debug("Signature data is valid with base58 encoding: " + result + ".");
        return result;
    }
};
//# sourceMappingURL=verify.js.map