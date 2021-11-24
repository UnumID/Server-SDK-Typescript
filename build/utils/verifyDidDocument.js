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
exports.verifyDidDocument = exports.verifySubjectDidDocument = void 0;
var requireAuth_1 = require("../requireAuth");
var error_1 = require("../utils/error");
var lodash_1 = require("lodash");
var didHelper_1 = require("../utils/didHelper");
var config_1 = require("../config");
var verify_1 = require("../utils/verify");
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
var validateProof_1 = require("../verifier/validateProof");
var logger_1 = __importDefault(require("../logger"));
/**
 * Validate a DidDocument's ServiceInfo
 * @param service
 */
var validateServiceInfo = function (service) {
    var id = service.id, serviceEndpoint = service.serviceEndpoint, type = service.type;
    if (!id) {
        throw new error_1.CustError(400, 'Invalid service: id is required.');
    }
    if (!serviceEndpoint) {
        throw new error_1.CustError(400, 'Invalid service: serviceEndpoint is required.');
    }
    if (!type) {
        throw new error_1.CustError(400, 'Invalid service: type is required.');
    }
    if (typeof id !== 'string') {
        throw new error_1.CustError(400, 'Invalid service: expected id to be a string.');
    }
    if (typeof serviceEndpoint !== 'string') {
        throw new error_1.CustError(400, 'Invalid service: expected serviceEndpoint to be a string.');
    }
    if (typeof type !== 'string') {
        throw new error_1.CustError(400, 'Invalid service: expected type to be a string.');
    }
};
/**
 * Validate a DidDocument's PublicInfo
 * @param pki
 */
var validatePublicKeyInfo = function (pki) {
    // check that pki is an object
    if (typeof pki !== 'object') {
        throw new error_1.CustError(400, 'Invalid publicKeyInfo: expected array of objects.');
    }
    if (Array.isArray(pki)) {
        throw new error_1.CustError(400, 'Invalid publicKeyInfo: expected array of objects.');
    }
    var id = pki.id, publicKey = pki.publicKey, encoding = pki.encoding, type = pki.type;
    // check for each required property
    if (!id) {
        throw new error_1.CustError(400, 'Invalid publicKeyInfo: id is required.');
    }
    if (!publicKey) {
        throw new error_1.CustError(400, 'Invalid publicKeyInfo: publicKey is required.');
    }
    if (!encoding) {
        throw new error_1.CustError(400, 'Invalid publicKeyInfo: encoding is required.');
    }
    if (!type) {
        throw new error_1.CustError(400, 'Invalid publicKeyInfo: type is required.');
    }
    // check that all values are the correct type
    if (typeof id !== 'string') {
        throw new error_1.CustError(400, 'Invalid publicKeyInfo: expected id to be a string.');
    }
    if (typeof publicKey !== 'string') {
        throw new error_1.CustError(400, 'Invalid publicKeyInfo: expected publicKey to be a string.');
    }
    if (!['base58', 'pem'].includes(encoding)) {
        throw new error_1.CustError(400, 'Invalid publicKeyInfo: expected encoding to be one of \'base58\', \'pem\'.');
    }
    if (!['RSA', 'secp256r1'].includes(type)) {
        throw new error_1.CustError(400, 'Invalid publicKeyInfo: expected type to be one of \'RSA\', \'secp256r1\'.');
    }
};
/**
 * Validates the attributes for a DidDocument
 * @param requests CredentialRequest
 */
var validateDidDocument = function (doc) {
    if (!doc) {
        throw new error_1.CustError(400, 'SignedDidDocument is required.');
    }
    var id = doc.id, created = doc.created, updated = doc.updated, publicKey = doc.publicKey, service = doc.service, proof = doc.proof;
    if (!proof) {
        throw new error_1.CustError(400, 'proof is required.');
    }
    validateProof_1.validateProofDeprecated(proof);
    if (!id) {
        throw new error_1.CustError(400, 'id is required.');
    }
    if (!doc['@context']) {
        throw new error_1.CustError(400, '@context is required.');
    }
    if (!created) {
        throw new error_1.CustError(400, 'created is required');
    }
    if (!updated) {
        throw new error_1.CustError(400, 'updated is required');
    }
    if (!publicKey) {
        throw new error_1.CustError(400, 'publicKey is required');
    }
    if (!service) {
        throw new error_1.CustError(400, 'service is required');
    }
    if (typeof id !== 'string') {
        throw new error_1.CustError(400, 'Invalid id: expected string.');
    }
    // if (typeof created !== 'string') {
    //   throw new CustError(400, 'Invalid created: expected string.');
    // }
    //   if (typeof updated !== 'string') {
    //     throw new CustError(400, 'Invalid updated: expected string.');
    //   }
    if (!Array.isArray(publicKey)) {
        throw new error_1.CustError(400, 'Invalid publicKey: expected array.');
    }
    if (!Array.isArray(service)) {
        throw new error_1.CustError(400, 'Invalid service: expected array.');
    }
    if (!Array.isArray(doc['@context'])) {
        throw new error_1.CustError(400, 'Invalid @context: expected array.');
    }
    if (doc['@context'][0] !== 'https://www.w3.org/ns/did/v1') {
        throw new error_1.CustError(400, 'Invalid @context');
    }
    publicKey.forEach(validatePublicKeyInfo);
    service.forEach(validateServiceInfo);
};
/**
 * Verify the CredentialRequests signatures.
 */
function verifySubjectDidDocument(authorization, issuerDid, didDocument) {
    return __awaiter(this, void 0, void 0, function () {
        var authToken, result, _a, isVerified, message;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    requireAuth_1.requireAuth(authorization);
                    // validate the DidDocument
                    validateDidDocument(didDocument);
                    authToken = authorization;
                    return [4 /*yield*/, verifyDidDocument(authToken, didDocument)];
                case 1:
                    result = _b.sent();
                    _a = result.body, isVerified = _a.isVerified, message = _a.message;
                    authToken = result.authToken;
                    if (!!result.body.isVerified) return [3 /*break*/, 3];
                    return [4 /*yield*/, handleSubjectDidDocumentVerifiedReceipt(authToken, issuerDid, didDocument, isVerified, message)];
                case 2:
                    // handle sending back the PresentationVerified receipt with the verification failure reason
                    authToken = _b.sent();
                    return [2 /*return*/, __assign(__assign({}, result), { authToken: authToken })];
                case 3: return [4 /*yield*/, handleSubjectDidDocumentVerifiedReceipt(authToken, issuerDid, didDocument, true)];
                case 4:
                    authToken = _b.sent();
                    // if made it this far then all SubjectCredentialRequests are verified
                    return [2 /*return*/, {
                            authToken: authToken,
                            body: {
                                isVerified: true
                            }
                        }];
            }
        });
    });
}
exports.verifySubjectDidDocument = verifySubjectDidDocument;
function verifyDidDocument(authorization, didDocument) {
    return __awaiter(this, void 0, void 0, function () {
        var verificationMethod, signatureValue, didDocumentResponse, authToken, publicKeyInfos, _a, publicKey, encoding, unsignedDidDocument, isVerified, result_1, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    verificationMethod = didDocument.proof.verificationMethod;
                    signatureValue = didDocument.proof.signatureValue;
                    return [4 /*yield*/, didHelper_1.getDIDDoc(config_1.configData.SaaSUrl, authorization, verificationMethod)];
                case 1:
                    didDocumentResponse = _b.sent();
                    if (didDocumentResponse instanceof Error) {
                        throw didDocumentResponse;
                    }
                    authToken = networkRequestHelper_1.handleAuthTokenHeader(didDocumentResponse, authorization);
                    publicKeyInfos = didHelper_1.getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');
                    if (publicKeyInfos.length === 0) {
                        // throw new CustError(404, `Public key not found for the subject did ${verificationMethod}`);
                        return [2 /*return*/, {
                                authToken: authToken,
                                body: {
                                    isVerified: false,
                                    message: "Public key not found for the subject did " + verificationMethod
                                }
                            }];
                    }
                    _a = publicKeyInfos[0], publicKey = _a.publicKey, encoding = _a.encoding;
                    unsignedDidDocument = lodash_1.omit(didDocument, 'proof');
                    isVerified = verify_1.doVerifyDeprecated(signatureValue, unsignedDidDocument, publicKey, encoding);
                    if (!isVerified) {
                        result_1 = {
                            authToken: authToken,
                            body: {
                                isVerified: false,
                                message: 'SubjectCredentialRequest signature can not be verified.'
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
exports.verifyDidDocument = verifyDidDocument;
/**
 * Handle sending back the SubjectDidDocumentVerified receipt
 */
function handleSubjectDidDocumentVerifiedReceipt(authorization, issuerDid, didDocument, isVerified, message) {
    return __awaiter(this, void 0, void 0, function () {
        var subjectDid, receiptOptions, receiptCallOptions, resp, authToken, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    subjectDid = didDocument.id;
                    receiptOptions = {
                        type: 'SubjectDidDocumentVerified',
                        issuer: issuerDid,
                        subject: subjectDid,
                        data: {
                            did: subjectDid,
                            isVerified: isVerified,
                            reason: message
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
                case 1:
                    resp = _a.sent();
                    authToken = networkRequestHelper_1.handleAuthTokenHeader(resp, authorization);
                    return [2 /*return*/, authToken];
                case 2:
                    e_1 = _a.sent();
                    logger_1.default.error("Error sending SubjectCredentialRequestVerification Receipt to Unum ID SaaS. Error " + e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, authorization];
            }
        });
    });
}
//# sourceMappingURL=verifyDidDocument.js.map