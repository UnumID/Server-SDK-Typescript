"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.verifyPresentation = void 0;
var requireAuth_1 = require("../requireAuth");
var library_crypto_1 = require("@unumid/library-crypto");
var logger_1 = __importDefault(require("../logger"));
var verifyNoPresentationHelper_1 = require("./verifyNoPresentationHelper");
var verifyPresentationHelper_1 = require("./verifyPresentationHelper");
var error_1 = require("../utils/error");
var helpers_1 = require("../utils/helpers");
var lodash_1 = require("lodash");
var didHelper_1 = require("../utils/didHelper");
var config_1 = require("../config");
var verify_1 = require("../utils/verify");
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
var validateProof_1 = require("./validateProof");
function isDeclinedPresentation(presentation) {
    return helpers_1.isArrayEmpty(presentation.verifiableCredential);
}
/**
 * Validates the presentation object has the proper attributes.
 * @param presentation Presentation
 */
var validatePresentation = function (presentation) {
    var context = presentation['@context'];
    var type = presentation.type, proof = presentation.proof, presentationRequestId = presentation.presentationRequestId, verifierDid = presentation.verifierDid;
    // const retObj: JSONObj = {};
    // validate required fields
    if (!context) {
        throw new error_1.CustError(400, 'Invalid Presentation: @context is required.');
    }
    if (!type) {
        throw new error_1.CustError(400, 'Invalid Presentation: type is required.');
    }
    if (!proof) {
        throw new error_1.CustError(400, 'Invalid Presentation: proof is required.');
    }
    if (!presentationRequestId) {
        throw new error_1.CustError(400, 'Invalid Presentation: presentationRequestId is required.');
    }
    // if (!verifiableCredential || isArrayEmpty(verifiableCredential)) {
    //   throw new CustError(400, 'Invalid Presentation: verifiableCredentials must be a non-empty array.');
    // }
    if (!verifierDid) {
        throw new error_1.CustError(400, 'Invalid Presentation: verifierDid is required.');
    }
    if (helpers_1.isArrayEmpty(context)) {
        throw new error_1.CustError(400, 'Invalid Presentation: @context must be a non-empty array.');
    }
    if (helpers_1.isArrayEmpty(type)) {
        throw new error_1.CustError(400, 'Invalid Presentation: type must be a non-empty array.');
    }
    // Check proof object is formatted correctly
    validateProof_1.validateProof(proof);
};
/**
 * Verify the PresentationRequest signature as a way to side step verifier MITM attacks where an entity spoofs requests.
 */
function verifyPresentationRequest(authorization, presentationRequest) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, verificationMethod, signatureValue, unsignedValue, didDocumentResponse, authToken, publicKeyInfos, _b, publicKey, encoding, unsignedPresentationRequest, isVerified, result_1, result;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = presentationRequest.proof, verificationMethod = _a.verificationMethod, signatureValue = _a.signatureValue, unsignedValue = _a.unsignedValue;
                    return [4 /*yield*/, didHelper_1.getDIDDoc(config_1.configData.SaaSUrl, authorization, verificationMethod)];
                case 1:
                    didDocumentResponse = _c.sent();
                    if (didDocumentResponse instanceof Error) {
                        throw didDocumentResponse;
                    }
                    authToken = networkRequestHelper_1.handleAuthToken(didDocumentResponse, authorization);
                    publicKeyInfos = didHelper_1.getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');
                    _b = publicKeyInfos[0], publicKey = _b.publicKey, encoding = _b.encoding;
                    unsignedPresentationRequest = lodash_1.omit(presentationRequest, 'proof');
                    isVerified = verify_1.doVerify(signatureValue, unsignedPresentationRequest, publicKey, encoding, unsignedValue);
                    if (!isVerified) {
                        result_1 = {
                            authToken: authToken,
                            body: {
                                isVerified: false,
                                message: 'PresentationRequest signature can not be verified.'
                            }
                        };
                        return [2 /*return*/, result_1];
                    }
                    result = {
                        authToken: authToken,
                        body: {
                            isVerified: true
                        }
                    };
                    return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Handler to send information regarding the user agreeing to share a credential Presentation.
 * @param authorization: string
 * @param encryptedPresentation: EncryptedData
 * @param verifierDid: string
 */
exports.verifyPresentation = function (authorization, encryptedPresentation, verifierDid, encryptionPrivateKey, presentationRequest) { return __awaiter(void 0, void 0, void 0, function () {
    var presentation, presentationRequestWithoutVersion, requestVerificationResult, type, result_2, verificationResult_1, result_3, credentialRequests, verificationResult, result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                requireAuth_1.requireAuth(authorization);
                if (!encryptedPresentation) {
                    throw new error_1.CustError(400, 'encryptedPresentation is required.');
                }
                if (!verifierDid) { // verifier did
                    throw new error_1.CustError(400, 'verifier is required.');
                }
                if (!encryptionPrivateKey) {
                    throw new error_1.CustError(400, 'verifier encryptionPrivateKey is required.');
                }
                if (presentationRequest && presentationRequest.verifier.did !== verifierDid) {
                    throw new error_1.CustError(400, "verifier provided, " + verifierDid + ", does not match the presentation request verifier, " + presentationRequest.verifier.did + ".");
                }
                presentation = library_crypto_1.decrypt(encryptionPrivateKey, encryptedPresentation);
                // validate presentation
                validatePresentation(presentation);
                // verify the presentation request uuid match
                if (presentationRequest && presentationRequest.presentationRequest.id !== presentation.presentationRequestId) {
                    throw new error_1.CustError(400, "presentation request id provided, " + presentationRequest.presentationRequest.id + ", does not match the presentationRequestId that the presentation was in response to, " + presentation.presentationRequestId + ".");
                }
                if (!(presentationRequest && presentationRequest.presentationRequest)) return [3 /*break*/, 2];
                presentationRequestWithoutVersion = lodash_1.omit(presentationRequest.presentationRequest, 'version');
                return [4 /*yield*/, verifyPresentationRequest(authorization, presentationRequestWithoutVersion)];
            case 1:
                requestVerificationResult = _a.sent();
                authorization = requestVerificationResult.authToken;
                // if invalid then can stop here but still send back the decrypted presentation with the verification results
                if (!requestVerificationResult.body.isVerified) {
                    type = isDeclinedPresentation(presentation) ? 'DeclinedPresentation' : 'VerifiablePresentation';
                    result_2 = {
                        authToken: requestVerificationResult.authToken,
                        body: __assign(__assign({}, requestVerificationResult.body), { type: type, presentation: presentation })
                    };
                    return [2 /*return*/, result_2];
                }
                _a.label = 2;
            case 2:
                if (!isDeclinedPresentation(presentation)) return [3 /*break*/, 4];
                return [4 /*yield*/, verifyNoPresentationHelper_1.verifyNoPresentationHelper(authorization, presentation, verifierDid)];
            case 3:
                verificationResult_1 = _a.sent();
                result_3 = {
                    authToken: verificationResult_1.authToken,
                    body: __assign(__assign({}, verificationResult_1.body), { type: 'DeclinedPresentation', presentation: presentation })
                };
                return [2 /*return*/, result_3];
            case 4:
                credentialRequests = presentationRequest === null || presentationRequest === void 0 ? void 0 : presentationRequest.presentationRequest.credentialRequests;
                return [4 /*yield*/, verifyPresentationHelper_1.verifyPresentationHelper(authorization, presentation, verifierDid, credentialRequests)];
            case 5:
                verificationResult = _a.sent();
                result = {
                    authToken: verificationResult.authToken,
                    body: __assign(__assign({}, verificationResult.body), { type: 'VerifiablePresentation', presentation: presentation })
                };
                return [2 /*return*/, result];
            case 6:
                error_2 = _a.sent();
                if (error_2 instanceof library_crypto_1.CryptoError) {
                    logger_1.default.error('Crypto error handling encrypted presentation', error_2);
                }
                else {
                    logger_1.default.error('Error handling encrypted presentation request to UnumID Saas.', error_2);
                }
                throw error_2;
            case 7: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=verifyPresentation.js.map