"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doVerify = void 0;
var logger_1 = __importDefault(require("../logger"));
var library_crypto_1 = require("@unumid/library-crypto");
var lodash_1 = require("lodash");
/**
 * Verify the signature on the provided data object.
 * @param signature
 * @param data
 * @param publicKey
 * @param encoding String ('base58' | 'pem'), defaults to 'pem'
 * @param stringData Optional String, for cases where the text encoding maybe different, using the provided string to check the signature then compare against the object itself
 */
exports.doVerify = function (signature, data, publicKey, encoding, dataString) {
    if (encoding === void 0) { encoding = 'pem'; }
    var isVerifiedData = doVerifyData(signature, data, publicKey, encoding);
    var isVerifiedString = !isVerifiedData ? doVerifyString(signature, data, publicKey, dataString, encoding) : false;
    var result = isVerifiedData || isVerifiedString;
    logger_1.default.debug("Signature is valid: " + result + ".");
    return result;
};
/**
   * Verify the signature on the provided data object.
   * @param signature
   * @param data
   * @param publicKey
   * @param encoding String ('base58' | 'pem'), defaults to 'pem'
   */
var doVerifyData = function (signature, data, publicKey, encoding) {
    if (encoding === void 0) { encoding = 'pem'; }
    logger_1.default.debug("Signature data verification using public key " + publicKey);
    var result = library_crypto_1.verify(signature, data, publicKey, encoding);
    logger_1.default.debug("Signature data is valid: " + result + ".");
    return result;
};
/**
   * Verify the signature on the provided data object using the unsignedString value.
   * This is to get around the way different runtime environments handle text encoding, i.e. between iOS and V8 (Node)
   * Note: this is valid work around thanks to then ensuring the stringData converted to an object has the same shallow values of the data object.
   * @param signature
   * @param data
   * @param publicKey
   * @param encoding String ('base58' | 'pem'), defaults to 'pem'
   */
var doVerifyString = function (signature, data, publicKey, dataString, encoding) {
    if (encoding === void 0) { encoding = 'pem'; }
    if (!dataString) {
        logger_1.default.debug('No Signature unsignedString value; skipping string verification.');
        return false;
    }
    logger_1.default.debug("Signature unsignedString verification using public key " + publicKey);
    var result = library_crypto_1.verifyString(signature, dataString, publicKey, encoding);
    logger_1.default.debug("Signature unsignedString is valid: " + result + ".");
    var finalResult = false;
    if (result) {
        // need to also verify that the stringData converted to an object matches the data object
        finalResult = lodash_1.isEqual(data, JSON.parse(dataString));
    }
    logger_1.default.debug("Signature unsignedString is valid and matches data object: " + finalResult + ".");
    return finalResult;
};
//# sourceMappingURL=verify.js.map