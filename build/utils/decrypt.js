"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doDecrypt = void 0;
var logger_1 = __importDefault(require("../logger"));
var library_crypto_1 = require("@unumid/library-crypto");
var library_crypto_v1_1 = require("@unumid/library-crypto-v1");
/**
 * Decrypt the data.
 * @param privateRSAKey
 * @param data
 * @returns
 */
exports.doDecrypt = function (privateRSAKey, data) {
    logger_1.default.debug('Performing byte array decryption');
    try {
        var result = library_crypto_1.decryptBytes(privateRSAKey, data);
        logger_1.default.debug('Decrypted data success.');
        return result;
    }
    catch (e) {
        logger_1.default.debug("Unable to decode using most recent crypto library with base64 encoding. Going to try with the v1, base58 crypto library. " + e);
        var result = library_crypto_v1_1.decryptBytes(privateRSAKey, data);
        logger_1.default.debug('Decrypted data success.');
        return result;
    }
};
//# sourceMappingURL=decrypt.js.map