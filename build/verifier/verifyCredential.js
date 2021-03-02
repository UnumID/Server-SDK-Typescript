"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCredential = void 0;
var library_issuer_verifier_utility_1 = require("@unumid/library-issuer-verifier-utility");
var library_crypto_1 = require("@unumid/library-crypto");
var lodash_1 = __importStar(require("lodash"));
var config_1 = require("../config");
var logger_1 = __importDefault(require("../logger"));
/**
 * Verify the signature on the provided data object.
 * @param signature
 * @param data
 * @param publicKey
 * @param encoding String ('base58' | 'pem'), defaults to 'pem'
 */
var doVerifyString = function (signature, dataString, data, publicKey, encoding) {
    if (encoding === void 0) { encoding = 'pem'; }
    logger_1.default.debug("Credential Signature verification using public key " + publicKey);
    var result = library_crypto_1.verifyString(signature, dataString, publicKey, encoding);
    logger_1.default.debug("Credential Signature STRING is valid: " + result + ".");
    var finalResult = false;
    if (result) {
        // need to also verify that the stringData converted to an object matches the data object
        finalResult = lodash_1.default.isEqual(data, JSON.parse(dataString));
    }
    logger_1.default.debug("Credential Signature STRING is valid FINAL: " + finalResult + ".");
    return finalResult;
};
/**
 * Used to verify the credential signature given the corresponding Did document's public key.
 * @param credential
 * @param authorization
 */
exports.verifyCredential = function (credential, authorization) { return __awaiter(void 0, void 0, void 0, function () {
    var proof, didDocumentResponse, authToken, publicKeyObject, data, isVerifiedData, isVerifiedString, isVerified, result, result;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                proof = credential.proof;
                return [4 /*yield*/, library_issuer_verifier_utility_1.getDIDDoc(config_1.configData.SaaSUrl, authorization, proof.verificationMethod)];
            case 1:
                didDocumentResponse = _b.sent();
                if (didDocumentResponse instanceof Error) {
                    throw didDocumentResponse;
                }
                authToken = library_issuer_verifier_utility_1.handleAuthToken(didDocumentResponse);
                publicKeyObject = library_issuer_verifier_utility_1.getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');
                data = lodash_1.omit(credential, 'proof');
                try {
                    isVerifiedData = library_issuer_verifier_utility_1.doVerify(proof.signatureValue, data, publicKeyObject[0].publicKey, publicKeyObject[0].encoding);
                    isVerifiedString = (_a = !isVerifiedData) !== null && _a !== void 0 ? _a : doVerifyString(proof.signatureValue, proof.unsignedValue, data, publicKeyObject[0].publicKey, publicKeyObject[0].encoding);
                    isVerified = isVerifiedData || isVerifiedString;
                    result = {
                        authToken: authToken,
                        body: isVerified
                    };
                    return [2 /*return*/, result];
                }
                catch (e) {
                    if (e instanceof library_crypto_1.CryptoError) {
                        logger_1.default.error('Crypto error verifying the credential signature', e);
                    }
                    else {
                        logger_1.default.error("Error verifying credential " + credential.id + " signature", e);
                    }
                    result = {
                        authToken: authToken,
                        body: false
                    };
                    return [2 /*return*/, result];
                }
                return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=verifyCredential.js.map