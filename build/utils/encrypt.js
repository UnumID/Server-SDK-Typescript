"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doEncryptPb = exports.doEncrypt = void 0;
var logger_1 = __importDefault(require("../logger"));
var library_crypto_1 = require("@unumid/library-crypto");
/**
 * Encrypt the provided data object.
 * @param did
 * @param publicKeyObj
 * @param data
 */
exports.doEncrypt = function (did, publicKeyObj, data) {
    logger_1.default.debug('Performing encryption using public key', publicKeyObj);
    var result = library_crypto_1.encrypt(did + '#' + publicKeyObj.id, publicKeyObj.publicKey, data, publicKeyObj.encoding);
    logger_1.default.debug("Encrypted data result: " + result.data);
    return result;
};
/**
 * Encrypt the provided data object.
 * @param did
 * @param publicKeyObj
 * @param data
 */
exports.doEncryptPb = function (did, publicKeyObj, data) {
    logger_1.default.debug('Performing byte array encryption using public key', publicKeyObj);
    var result = library_crypto_1.encryptBytes(did + '#' + publicKeyObj.id, publicKeyObj.publicKey, data, publicKeyObj.encoding);
    logger_1.default.debug("Encrypted data result: " + result.data);
    return result;
};
//# sourceMappingURL=encrypt.js.map