"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doEncrypt = void 0;
var logger_1 = __importDefault(require("../logger"));
var library_crypto_1 = require("@unumid/library-crypto");
var library_crypto_v1_1 = require("@unumid/library-crypto-v1");
var semver_1 = require("semver");
/**
 * Encrypt the provided data object.
 * @param did
 * @param publicKeyObj
 * @param data
 * @param version
 */
exports.doEncrypt = function (did, publicKeyObj, data, version) {
    return semver_1.lt(version, '4.0.0') ? _doEncryptV3(did, publicKeyObj, data) : _doEncrypt(did, publicKeyObj, data);
};
var _doEncrypt = function (did, publicKeyObj, data) {
    logger_1.default.debug('Performing byte array encryption using public key', publicKeyObj);
    var result = library_crypto_1.encryptBytes(did + '#' + publicKeyObj.id, publicKeyObj, data);
    logger_1.default.debug("Encrypted data result: " + result.data);
    return result;
};
var _doEncryptV3 = function (did, publicKeyObj, data) {
    logger_1.default.debug('Performing byte array encryption using public key', publicKeyObj);
    var result = library_crypto_v1_1.encryptBytes(did + '#' + publicKeyObj.id, publicKeyObj, data);
    logger_1.default.debug("Encrypted data result: " + result.data);
    return result;
};
//# sourceMappingURL=encrypt.js.map