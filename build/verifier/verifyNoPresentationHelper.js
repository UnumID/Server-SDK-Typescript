"use strict";
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
exports.verifyNoPresentationHelper = exports.validateNoPresentationParams = void 0;
var lodash_1 = require("lodash");
var validateProof_1 = require("./validateProof");
var config_1 = require("../config");
var requireAuth_1 = require("../requireAuth");
var logger_1 = __importDefault(require("../logger"));
var error_1 = require("../utils/error");
var helpers_1 = require("../utils/helpers");
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
var verify_1 = require("../utils/verify");
var types_1 = require("@unumid/types");
var didHelper_1 = require("../utils/didHelper");
/**
 * Validates the NoPresentation type to ensure the necessary attributes.
 * @param noPresentation NoPresentation
 */
exports.validateNoPresentationParams = function (noPresentation) {
    var type = noPresentation.type, proof = noPresentation.proof, presentationRequestId = noPresentation.presentationRequestId, verifiableCredential = noPresentation.verifiableCredential, verifierDid = noPresentation.verifierDid;
    if (!type) {
        throw new error_1.CustError(400, 'Invalid Presentation: type is required.');
    }
    if (helpers_1.isArrayEmpty(type)) {
        throw new error_1.CustError(400, 'Invalid Presentation: type must be a non-empty array.');
    }
    if (!proof) {
        throw new error_1.CustError(400, 'Invalid Presentation: proof is required.');
    }
    if (!verifierDid) {
        throw new error_1.CustError(400, 'Invalid Presentation: verifierDid is required.');
    }
    if (!presentationRequestId) {
        throw new error_1.CustError(400, 'Invalid Presentation: presentationRequestId is required.');
    }
    if (typeof presentationRequestId !== 'string') {
        throw new error_1.CustError(400, 'Invalid presentationRequestId: must be a string.');
    }
    if (verifiableCredential && helpers_1.isArrayNotEmpty(verifiableCredential)) {
        throw new error_1.CustError(400, 'Invalid Declined Presentation: verifiableCredential must be undefined or empty.'); // this should never happen base on upstream logic
    }
    noPresentation.proof = validateProof_1.validateProof(proof);
    return noPresentation;
};
/**
 * Handler for when a user does not agree to share the information in the credential request.
 * @param authorization
 * @param noPresentation
 * @param verifier
 */
exports.verifyNoPresentationHelper = function (authorization, noPresentation, verifier) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, verificationMethod, signatureValue, verifierDid, result_1, didDocumentResponse, authToken, publicKeyInfos, _b, publicKey, encoding, unsignedNoPresentation, bytes, isVerified, result_2, receiptOptions, receiptCallOptions, resp, result, e_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                requireAuth_1.requireAuth(authorization);
                noPresentation = exports.validateNoPresentationParams(noPresentation);
                if (!noPresentation.proof) {
                    throw new error_1.CustError(400, 'Invalid Presentation: proof is required.');
                }
                _a = noPresentation.proof, verificationMethod = _a.verificationMethod, signatureValue = _a.signatureValue, verifierDid = noPresentation.verifierDid;
                // validate that the verifier did provided matches the verifier did in the presentation
                if (verifierDid !== verifier) {
                    result_1 = {
                        authToken: authorization,
                        body: {
                            isVerified: false,
                            message: "The presentation was meant for verifier, " + verifierDid + ", not the provided verifier, " + verifier + "."
                        }
                    };
                    return [2 /*return*/, result_1];
                }
                return [4 /*yield*/, didHelper_1.getDIDDoc(config_1.configData.SaaSUrl, authorization, verificationMethod)];
            case 1:
                didDocumentResponse = _c.sent();
                if (didDocumentResponse instanceof Error) {
                    throw didDocumentResponse;
                }
                authToken = networkRequestHelper_1.handleAuthTokenHeader(didDocumentResponse, authorization);
                publicKeyInfos = didHelper_1.getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');
                _b = publicKeyInfos[0], publicKey = _b.publicKey, encoding = _b.encoding;
                unsignedNoPresentation = lodash_1.omit(noPresentation, 'proof');
                bytes = types_1.UnsignedPresentationPb.encode(unsignedNoPresentation).finish();
                isVerified = verify_1.doVerify(signatureValue, bytes, publicKey, encoding);
                if (!isVerified) {
                    result_2 = {
                        authToken: authToken,
                        body: {
                            isVerified: false,
                            message: 'Presentation signature can not be verified.'
                        }
                    };
                    return [2 /*return*/, result_2];
                }
                receiptOptions = {
                    type: ['NoPresentation'],
                    verifier: verifier,
                    subject: noPresentation.proof.verificationMethod,
                    data: {
                        isVerified: isVerified
                    }
                };
                receiptCallOptions = {
                    method: 'POST',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'receipt',
                    header: { Authorization: authorization },
                    data: receiptOptions
                };
                return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(receiptCallOptions)];
            case 2:
                resp = _c.sent();
                authToken = networkRequestHelper_1.handleAuthTokenHeader(resp, authToken);
                result = {
                    authToken: authToken,
                    body: {
                        isVerified: isVerified
                    }
                };
                return [2 /*return*/, result];
            case 3:
                e_1 = _c.sent();
                logger_1.default.error("Error sending a verifyNoPresentation request to UnumID Saas. Error " + e_1);
                throw e_1;
            case 4: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=verifyNoPresentationHelper.js.map