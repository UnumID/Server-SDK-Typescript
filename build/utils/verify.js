"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doVerify = void 0;
var logger_1 = __importDefault(require("../logger"));
var library_crypto_1 = require("@unumid/library-crypto");
/**
 * Verify the signature on the provided byte array.
 * @param signature
 * @param data
 * @param publicKey
 * @param encoding String ('base58' | 'pem'), defaults to 'pem'
 */
exports.doVerify = function (signature, data, publicKey) {
    logger_1.default.debug("Signature data verification using public key " + JSON.stringify(publicKey));
    var result = library_crypto_1.verifyBytes(signature, data, publicKey);
    logger_1.default.debug("Signature data is valid: " + result + ".");
    return result;
};
//# sourceMappingURL=verify.js.map