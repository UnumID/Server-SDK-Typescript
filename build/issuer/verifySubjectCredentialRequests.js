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
exports.verifySubjectCredentialRequest = exports.verifySubjectCredentialRequests = void 0;
var types_1 = require("@unumid/types");
var requireAuth_1 = require("../requireAuth");
var error_1 = require("../utils/error");
var helpers_1 = require("../utils/helpers");
var lodash_1 = require("lodash");
var didHelper_1 = require("../utils/didHelper");
var config_1 = require("../config");
var verify_1 = require("../utils/verify");
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
var validateProof_1 = require("../verifier/validateProof");
var logger_1 = __importDefault(require("../logger"));
/**
 * Validates the attributes for a credential request to UnumID's SaaS.
 * @param requests CredentialRequest
 */
var validateCredentialRequests = function (requests, subjectDid) {
    if (helpers_1.isArrayEmpty(requests) || !requests) {
        throw new error_1.CustError(400, 'subjectCredentialRequests must be a non-empty array.');
    }
    for (var i = 0; i < requests.length; i++) {
        var request = requests[i];
        if (!request.proof) {
            throw new error_1.CustError(400, "Invalid SubjectCredentialRequest[" + i + "]: proof must be defined.");
        }
        validateProof_1.validateProof(request.proof);
        if (!request.type) {
            throw new error_1.CustError(400, "Invalid SubjectCredentialRequest[" + i + "]: type must be defined.");
        }
        if (typeof request.type !== 'string') {
            throw new error_1.CustError(400, "Invalid SubjectCredentialRequest[" + i + "]: type must be a string.");
        }
        if (!((request.required === false || request.required === true))) {
            throw new error_1.CustError(400, "Invalid SubjectCredentialRequest[" + i + "]: required must be defined.");
        }
        if (!request.issuers) {
            throw new error_1.CustError(400, "Invalid SubjectCredentialRequest[" + i + "]: issuers must be defined.");
        }
        // handle validating the subject did is the identical fr all requests
        if (subjectDid !== request.proof.verificationMethod) {
            throw new error_1.CustError(400, "Invalid SubjectCredentialRequest[" + i + "]: provided subjectDid, " + subjectDid + ", must match that of the credential requests' signer, " + request.proof.verificationMethod + ".");
        }
    }
    // return the subjectDid for reference now that have validated all the same across all requests
    return subjectDid;
};
/**
 * Verify the CredentialRequests signatures.
 */
function verifySubjectCredentialRequests(authorization, issuerDid, subjectDid, credentialRequests) {
    return __awaiter(this, void 0, void 0, function () {
        var authToken, _i, credentialRequests_1, credentialRequest, result, _a, isVerified, message;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    requireAuth_1.requireAuth(authorization);
                    // validate credentialRequests input; and grab the subjectDid for reference later
                    validateCredentialRequests(credentialRequests, subjectDid);
                    authToken = authorization;
                    _i = 0, credentialRequests_1 = credentialRequests;
                    _b.label = 1;
                case 1:
                    if (!(_i < credentialRequests_1.length)) return [3 /*break*/, 5];
                    credentialRequest = credentialRequests_1[_i];
                    return [4 /*yield*/, verifySubjectCredentialRequest(authToken, issuerDid, credentialRequest)];
                case 2:
                    result = _b.sent();
                    _a = result.body, isVerified = _a.isVerified, message = _a.message;
                    authToken = result.authToken;
                    if (!!result.body.isVerified) return [3 /*break*/, 4];
                    return [4 /*yield*/, handleSubjectCredentialsRequestsVerificationReceipt(authToken, issuerDid, subjectDid, credentialRequests, isVerified, message)];
                case 3:
                    // handle sending back the ReceiptSubjectCredentialRequestVerifiedData receipt with the verification failure reason
                    authToken = _b.sent();
                    return [2 /*return*/, __assign(__assign({}, result), { authToken: authToken })];
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [4 /*yield*/, handleSubjectCredentialsRequestsVerificationReceipt(authToken, issuerDid, subjectDid, credentialRequests, true)];
                case 6:
                    // if made it this far then all SubjectCredentialRequests are verified
                    authToken = _b.sent();
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
exports.verifySubjectCredentialRequests = verifySubjectCredentialRequests;
function verifySubjectCredentialRequest(authorization, issuerDid, credentialRequest) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var verificationMethod, signatureValue, didDocumentResponse, authToken, publicKeyInfos, _c, publicKey, encoding, unsignedCredentialRequest, bytes, isVerified;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    verificationMethod = (_a = credentialRequest.proof) === null || _a === void 0 ? void 0 : _a.verificationMethod;
                    signatureValue = (_b = credentialRequest.proof) === null || _b === void 0 ? void 0 : _b.signatureValue;
                    // validate that the issueDid is present in the request issuer array
                    if (!credentialRequest.issuers.includes(issuerDid)) {
                        return [2 /*return*/, {
                                authToken: authorization,
                                body: {
                                    isVerified: false,
                                    message: "Issuer DID, " + issuerDid + ", not found in credential request issuers " + credentialRequest.issuers
                                }
                            }];
                    }
                    return [4 /*yield*/, didHelper_1.getDIDDoc(config_1.configData.SaaSUrl, authorization, verificationMethod)];
                case 1:
                    didDocumentResponse = _d.sent();
                    if (didDocumentResponse instanceof Error) {
                        throw didDocumentResponse;
                    }
                    authToken = networkRequestHelper_1.handleAuthTokenHeader(didDocumentResponse, authorization);
                    publicKeyInfos = didHelper_1.getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');
                    if (publicKeyInfos.length === 0) {
                        return [2 /*return*/, {
                                authToken: authToken,
                                body: {
                                    isVerified: false,
                                    message: "Public key not found for the subject did " + verificationMethod
                                }
                            }];
                    }
                    _c = publicKeyInfos[0], publicKey = _c.publicKey, encoding = _c.encoding;
                    unsignedCredentialRequest = lodash_1.omit(credentialRequest, 'proof');
                    bytes = types_1.CredentialRequestPb.encode(unsignedCredentialRequest).finish();
                    isVerified = verify_1.doVerify(signatureValue, bytes, publicKey, encoding);
                    if (!isVerified) {
                        return [2 /*return*/, {
                                authToken: authToken,
                                body: {
                                    isVerified: false,
                                    message: 'SubjectCredentialRequest signature can not be verified.'
                                }
                            }];
                    }
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
exports.verifySubjectCredentialRequest = verifySubjectCredentialRequest;
/**
 * Handle sending back the SubjectCredentialRequestVerified receipt
 */
function handleSubjectCredentialsRequestsVerificationReceipt(authorization, issuerDid, subjectDid, credentialRequests, isVerified, message) {
    return __awaiter(this, void 0, void 0, function () {
        var requestInfo, data, receiptOptions, receiptCallOptions, resp, authToken, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    requestInfo = credentialRequests.map(function (request) { return lodash_1.omit(request, 'proof'); });
                    data = {
                        isVerified: isVerified,
                        requestInfo: requestInfo,
                        reason: message
                    };
                    receiptOptions = {
                        type: 'SubjectCredentialRequestVerified',
                        issuer: issuerDid,
                        subject: subjectDid,
                        data: data
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
//# sourceMappingURL=verifySubjectCredentialRequests.js.map