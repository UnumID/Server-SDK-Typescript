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
exports.verifyNoPresentation = exports.verifyNoPresentationRequest = exports.validateNoPresentationParams = void 0;
var library_issuer_verifier_utility_1 = require("library-issuer-verifier-utility");
var lodash_1 = require("lodash");
var validateProof_1 = require("./validateProof");
var config_1 = require("./config");
var requireAuth_1 = require("./requireAuth");
var logger_1 = __importDefault(require("./logger"));
/**
 * Validates the NoPresentation type to ensure the necessary attributes.
 * @param noPresentation NoPresentation
 */
exports.validateNoPresentationParams = function (noPresentation) {
    var type = noPresentation.type, holder = noPresentation.holder, proof = noPresentation.proof, presentationRequestUuid = noPresentation.presentationRequestUuid;
    if (!type) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'type is required.');
    }
    if (!proof) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'proof is required.');
    }
    if (!holder) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'holder is required.');
    }
    if (!presentationRequestUuid) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'presentationRequestUuid is required.');
    }
    if (type[0] !== 'NoPresentation') {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid type: first element must be \'NoPresentation\'.');
    }
    if (typeof holder !== 'string') {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid holder: must be a string.');
    }
    if (typeof presentationRequestUuid !== 'string') {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid presentationRequestUuid: must be a string.');
    }
    validateProof_1.validateProof(proof);
};
/**
 * Request middleware to handle a user not agreeing to share the information in the credential request.
 *
 * Note: The request body is exaclty the information sent by the mobile SDK serving the prompt via the deeplink for credential sharing to your application.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
exports.verifyNoPresentationRequest = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, noPresentation, verifier, authorization, _b, verificationMethod, signatureValue, didDocumentResponse, publicKeyInfos, _c, publicKey, encoding, unsignedNoPresentation, isVerified, receiptOptions, receiptCallOptions, authToken, e_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                _a = req.body, noPresentation = _a.noPresentation, verifier = _a.verifier;
                authorization = req.headers.authorization;
                requireAuth_1.requireAuth(authorization);
                exports.validateNoPresentationParams(noPresentation);
                _b = noPresentation.proof, verificationMethod = _b.verificationMethod, signatureValue = _b.signatureValue;
                return [4 /*yield*/, library_issuer_verifier_utility_1.getDIDDoc(config_1.configData.SaaSUrl, authorization, verificationMethod)];
            case 1:
                didDocumentResponse = _d.sent();
                if (didDocumentResponse instanceof Error) {
                    throw didDocumentResponse;
                }
                publicKeyInfos = library_issuer_verifier_utility_1.getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');
                _c = publicKeyInfos[0], publicKey = _c.publicKey, encoding = _c.encoding;
                unsignedNoPresentation = lodash_1.omit(noPresentation, 'proof');
                isVerified = library_issuer_verifier_utility_1.doVerify(signatureValue, unsignedNoPresentation, publicKey, encoding);
                receiptOptions = {
                    type: noPresentation.type,
                    verifier: verifier,
                    subject: noPresentation.holder,
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
                return [4 /*yield*/, library_issuer_verifier_utility_1.makeNetworkRequest(receiptCallOptions)];
            case 2:
                _d.sent();
                authToken = didDocumentResponse.headers['x-auth-token'];
                if (authToken) {
                    res.setHeader('x-auth-token', didDocumentResponse.headers['x-auth-token']);
                }
                res.send({ isVerified: isVerified });
                return [3 /*break*/, 4];
            case 3:
                e_1 = _d.sent();
                next(e_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Handler for when a user does not agree to share the information in the credential request.
 * @param authorization
 * @param noPresentation
 * @param verifier
 */
exports.verifyNoPresentation = function (authorization, noPresentation, verifier) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, verificationMethod, signatureValue, didDocumentResponse, publicKeyInfos, _b, publicKey, encoding, unsignedNoPresentation, isVerified, receiptOptions, receiptCallOptions, resp, authTokenResp, authToken, result, e_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                requireAuth_1.requireAuth(authorization);
                exports.validateNoPresentationParams(noPresentation);
                _a = noPresentation.proof, verificationMethod = _a.verificationMethod, signatureValue = _a.signatureValue;
                return [4 /*yield*/, library_issuer_verifier_utility_1.getDIDDoc(config_1.configData.SaaSUrl, authorization, verificationMethod)];
            case 1:
                didDocumentResponse = _c.sent();
                if (didDocumentResponse instanceof Error) {
                    throw didDocumentResponse;
                }
                publicKeyInfos = library_issuer_verifier_utility_1.getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');
                _b = publicKeyInfos[0], publicKey = _b.publicKey, encoding = _b.encoding;
                unsignedNoPresentation = lodash_1.omit(noPresentation, 'proof');
                isVerified = library_issuer_verifier_utility_1.doVerify(signatureValue, unsignedNoPresentation, publicKey, encoding);
                receiptOptions = {
                    type: noPresentation.type,
                    verifier: verifier,
                    subject: noPresentation.holder,
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
                return [4 /*yield*/, library_issuer_verifier_utility_1.makeNetworkRequest(receiptCallOptions)];
            case 2:
                resp = _c.sent();
                authTokenResp = resp && resp.headers && resp.headers['x-auth-token'] ? resp.headers['x-auth-token'] : '';
                authToken = (library_issuer_verifier_utility_1.isArrayEmpty(authTokenResp) && authTokenResp ? authTokenResp : (library_issuer_verifier_utility_1.isArrayNotEmpty(authTokenResp) ? authTokenResp[0] : undefined));
                result = {
                    authToken: authToken,
                    body: {
                        uuid: resp.uuid,
                        createdAt: resp.createdAt,
                        updatedAt: resp.updatedAt,
                        type: resp.type,
                        subject: resp.subject,
                        issuer: resp.issuer,
                        isVerified: isVerified
                    }
                };
                return [2 /*return*/, result];
            case 3:
                e_2 = _c.sent();
                logger_1.default.error("Error sending a veryNoPresentation request to UnumID Saas. Error " + e_2);
                throw e_2;
            case 4: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=verifyNoPresentation.js.map