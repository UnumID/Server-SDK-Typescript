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
exports.verifySubjectCredentialRequestsHelper = exports.verifySubjectCredentialRequests = void 0;
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
var validateSubjectCredentialRequests = function (requests, subjectDid) {
    if (!requests) {
        throw new error_1.CustError(400, 'SubjectCredentialRequests must be defined.');
    }
    if (helpers_1.isArrayEmpty(requests.credentialRequests)) {
        throw new error_1.CustError(400, 'Subject credentialRequests must be a non-empty array.');
    }
    if (!requests.proof) {
        throw new error_1.CustError(400, 'Invalid SubjectCredentialRequest: proof must be defined.');
    }
    validateProof_1.validateProof(requests.proof);
    // handle validating the subject did is the identical to that of the proof
    if (subjectDid !== requests.proof.verificationMethod.split('#')[0]) {
        throw new error_1.CustError(400, "Invalid SubjectCredentialRequest: provided subjectDid, " + subjectDid + ", must match that of the credential requests' signer, " + requests.proof.verificationMethod + ".");
    }
    for (var i = 0; i < requests.credentialRequests.length; i++) {
        var request = requests.credentialRequests[i];
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
    }
    // return the subjectDid for reference now that have validated all the same across all requests
    return subjectDid;
};
/**
 * Verify the CredentialRequests signatures.
 */
function verifySubjectCredentialRequests(authorization, issuerDid, subjectDid, subjectCredentialRequests) {
    return __awaiter(this, void 0, void 0, function () {
        var result, authToken, _a, isVerified, message;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    requireAuth_1.requireAuth(authorization);
                    // validate credentialRequests input; and grab the subjectDid for reference later
                    validateSubjectCredentialRequests(subjectCredentialRequests, subjectDid);
                    return [4 /*yield*/, verifySubjectCredentialRequestsHelper(authorization, issuerDid, subjectCredentialRequests)];
                case 1:
                    result = _b.sent();
                    authToken = result.authToken;
                    _a = result.body, isVerified = _a.isVerified, message = _a.message;
                    return [4 /*yield*/, handleSubjectCredentialsRequestsVerificationReceipt(authToken, issuerDid, subjectDid, subjectCredentialRequests, isVerified, message)];
                case 2:
                    // handle sending back the ReceiptSubjectCredentialRequestVerifiedData receipt with the verification status
                    authToken = _b.sent();
                    return [2 /*return*/, __assign(__assign({}, result), { authToken: authToken })];
            }
        });
    });
}
exports.verifySubjectCredentialRequests = verifySubjectCredentialRequests;
function verifySubjectCredentialRequestsHelper(authToken, issuerDid, subjectCredentialRequests) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var verificationMethod, signatureValue, publicKeyInfoResponse, publicKeyInfoList, isVerified, unsignedSubjectCredentialRequests, bytes, _i, publicKeyInfoList_1, publicKeyInfo;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    verificationMethod = (_a = subjectCredentialRequests.proof) === null || _a === void 0 ? void 0 : _a.verificationMethod;
                    signatureValue = (_b = subjectCredentialRequests.proof) === null || _b === void 0 ? void 0 : _b.signatureValue;
                    return [4 /*yield*/, didHelper_1.getDidDocPublicKeys(authToken, verificationMethod, 'secp256r1')];
                case 1:
                    publicKeyInfoResponse = _c.sent();
                    publicKeyInfoList = publicKeyInfoResponse.body;
                    authToken = publicKeyInfoResponse.authToken;
                    if (publicKeyInfoList.length === 0) {
                        return [2 /*return*/, {
                                authToken: authToken,
                                body: {
                                    isVerified: false,
                                    message: "Public key not found for the subject did " + verificationMethod
                                }
                            }];
                    }
                    isVerified = false;
                    unsignedSubjectCredentialRequests = lodash_1.omit(subjectCredentialRequests, 'proof');
                    bytes = types_1.UnsignedSubjectCredentialRequests.encode(unsignedSubjectCredentialRequests).finish();
                    // check all the public keys to see if any work, stop if one does
                    for (_i = 0, publicKeyInfoList_1 = publicKeyInfoList; _i < publicKeyInfoList_1.length; _i++) {
                        publicKeyInfo = publicKeyInfoList_1[_i];
                        // verify the signature
                        isVerified = verify_1.doVerify(signatureValue, bytes, publicKeyInfo);
                        if (isVerified)
                            break;
                    }
                    if (!isVerified) {
                        return [2 /*return*/, {
                                authToken: authToken,
                                body: {
                                    isVerified: false,
                                    message: 'SubjectCredentialRequests signature can not be verified.'
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
exports.verifySubjectCredentialRequestsHelper = verifySubjectCredentialRequestsHelper;
/**
 * Handle sending back the SubjectCredentialRequestVerified receipt
 */
function handleSubjectCredentialsRequestsVerificationReceipt(authorization, issuerDid, subjectDid, subjectCredentialRequests, isVerified, message) {
    return __awaiter(this, void 0, void 0, function () {
        var requestInfo, data, receiptOptions, receiptCallOptions, resp, authToken, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    requestInfo = subjectCredentialRequests.credentialRequests;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5U3ViamVjdENyZWRlbnRpYWxSZXF1ZXN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pc3N1ZXIvdmVyaWZ5U3ViamVjdENyZWRlbnRpYWxSZXF1ZXN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLHVDQUFxTTtBQUNyTSw4Q0FBNkM7QUFDN0Msd0NBQTJDO0FBQzNDLDRDQUFnRDtBQUNoRCxpQ0FBOEI7QUFDOUIsZ0RBQXlEO0FBQ3pELG9DQUF1QztBQUN2QywwQ0FBMkM7QUFDM0Msc0VBQTBGO0FBQzFGLDJEQUEwRDtBQUMxRCxxREFBK0I7QUFFL0I7OztHQUdHO0FBQ0gsSUFBTSxpQ0FBaUMsR0FBRyxVQUFDLFFBQW1DLEVBQUUsVUFBa0I7SUFDaEcsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNiLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSw0Q0FBNEMsQ0FBQyxDQUFDO0tBQ3hFO0lBRUQsSUFBSSxzQkFBWSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1FBQzdDLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSx1REFBdUQsQ0FBQyxDQUFDO0tBQ25GO0lBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUU7UUFDbkIsTUFBTSxJQUFJLGlCQUFTLENBQUMsR0FBRyxFQUFFLDBEQUEwRCxDQUFDLENBQUM7S0FDdEY7SUFFRCw2QkFBYSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUU5QiwwRUFBMEU7SUFDMUUsSUFBSSxVQUFVLEtBQUssUUFBUSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDbEUsTUFBTSxJQUFJLGlCQUFTLENBQUMsR0FBRyxFQUFFLDREQUEwRCxVQUFVLDhE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d0JBQ2pCLE9BQU8sRUFBRSxVQUFVO3dCQUNuQixJQUFJLE1BQUE7cUJBQ0wsQ0FBQztvQkFFSSxrQkFBa0IsR0FBYTt3QkFDbkMsTUFBTSxFQUFFLE1BQU07d0JBQ2QsT0FBTyxFQUFFLG1CQUFVLENBQUMsT0FBTzt3QkFDM0IsUUFBUSxFQUFFLFNBQVM7d0JBQ25CLE1BQU0sRUFBRSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUU7d0JBQ3hDLElBQUksRUFBRSxjQUFjO3FCQUNyQixDQUFDO29CQUVvQixxQkFBTSx5Q0FBa0IsQ0FBVSxrQkFBa0IsQ0FBQyxFQUFBOztvQkFBckUsSUFBSSxHQUFZLFNBQXFEO29CQUVyRSxTQUFTLEdBQUcsNENBQXFCLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO29CQUU3RCxzQkFBTyxTQUFTLEVBQUM7OztvQkFFakIsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsdUZBQXFGLEdBQUcsQ0FBQyxDQUFDOzt3QkFHekcsc0JBQU8sYUFBYSxFQUFDOzs7O0NBQ3RCIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyBSRVNURGF0YSwgVW51bUR0bywgVmVyaWZpZWRTdGF0dXMgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBKU09OT2JqLCBSZWNlaXB0T3B0aW9ucywgUmVjZWlwdFN1YmplY3RDcmVkZW50aWFsUmVxdWVzdFZlcmlmaWVkRGF0YSwgUHVibGljS2V5SW5mbywgVW5zaWduZWRTdWJqZWN0Q3JlZGVudGlhbFJlcXVlc3RzLCBTdWJqZWN0Q3JlZGVudGlhbFJlcXVlc3RzLCBDcmVkZW50aWFsUmVxdWVzdCB9IGZyb20gJ0B1bnVtaWQvdHlwZXMnO1xuaW1wb3J0IHsgcmVxdWlyZUF1dGggfSBmcm9tICcuLi9yZXF1aXJlQXV0aCc7XG5pbXBvcnQgeyBDdXN0RXJyb3IgfSBmcm9tICcuLi91dGlscy9lcnJvcic7XG5pbXBvcnQgeyBpc0FycmF5RW1wdHkgfSBmcm9tICcuLi91dGlscy9oZWxwZXJzJztcbmltcG9ydCB7IG9taXQgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgZ2V0RGlkRG9jUHVibGljS2V5cyB9IGZyb20gJy4uL3V0aWxzL2RpZEhlbHBlcic7XG5pbXBvcnQgeyBjb25maWdEYXRhIH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7IGRvVmVyaWZ5IH0gZnJvbSAnLi4vdXRpbHMvdmVyaWZ5JztcbmltcG9ydCB7IGhhbmRsZUF1dGhUb2tlbkhlYWRlciwgbWFrZU5ldHdvcmtSZXF1ZXN0IH0gZnJvbSAnLi4vdXRpbHMvbmV0d29ya1JlcXVlc3RIZWxwZXInO1xuaW1wb3J0IHsgdmFsaWRhdGVQcm9vZiB9IGZyb20gJy4uL3ZlcmlmaWVyL3ZhbGlkYXRlUHJvb2YnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuLi9sb2dnZXInO1xuXG4vKipcbiAqIFZhbGlkYXRlcyB0aGUgYXR0cmlidXRlcyBmb3IgYSBjcmVkZW50aWFsIHJlcXVlc3QgdG8gVW51bUlEJ3MgU2FhUy5cbiAqIEBwYXJhbSByZXF1ZXN0cyBDcmVkZW50aWFsUmVxdWVzdFxuICovXG5jb25zdCB2YWxpZGF0ZVN1YmplY3RDcmVkZW50aWFsUmVxdWVzdHMgPSAocmVxdWVzdHM6IFN1YmplY3RDcmVkZW50aWFsUmVxdWVzdHMsIHN1YmplY3REaWQ6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIGlmICghcmVxdWVzdHMpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ1N1YmplY3RDcmVkZW50aWFsUmVxdWVzdHMgbXVzdCBiZSBkZWZpbmVkLicpO1xuICB9XG5cbiAgaWYgKGlzQXJyYXlFbXB0eShyZXF1ZXN0cy5jcmVkZW50aWFsUmVxdWVzdHMpKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdTdWJqZWN0IGNyZWRlbnRpYWxSZXF1ZXN0cyBtdXN0IGJlIGEgbm9uLWVtcHR5IGFycmF5LicpO1xuICB9XG5cbiAgaWYgKCFyZXF1ZXN0cy5wcm9vZikge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBTdWJqZWN0Q3JlZGVudGlhbFJlcXVlc3Q6IHByb29mIG11c3QgYmUgZGVmaW5lZC4nKTtcbiAgfVxuXG4gIHZhbGlkYXRlUHJvb2YocmVxdWVzdHMucHJvb2YpO1xuXG4gIC8vIGhhbmRsZSB2YWxpZGF0aW5nIHRoZSBzdWJqZWN0IGRpZCBpcyB0aGUgaWRlbnRpY2FsIHRvIHRoYXQgb2YgdGhlIHByb29mXG4gIGlmIChzdWJqZWN0RGlkICE9PSByZXF1ZXN0cy5wcm9vZi52ZXJpZmljYXRpb25NZXRob2Quc3BsaXQoJyMnKVswXSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCBgSW52YWxpZCBTdWJqZWN0Q3JlZGVudGlhbFJlcXVlc3Q6IHByb3ZpZGVkIHN1YmplY3REaWQsICR7c3ViamVjdERpZH0sIG11c3QgbWF0Y2ggdGhhdCBvZiB0aGUgY3JlZGVudGlhbCByZXF1ZXN0cycgc2lnbmVyLCAke3JlcXVlc3RzLnByb29mLnZlcmlmaWNhdGlvbk1ldGhvZH0uYCk7XG4gIH1cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHJlcXVlc3RzLmNyZWRlbnRpYWxSZXF1ZXN0cy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHJlcXVlc3QgPSByZXF1ZXN0cy5jcmVkZW50aWFsUmVxdWVzdHNbaV07XG5cbiAgICBpZiAoIXJlcXVlc3QudHlwZSkge1xuICAgICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsIGBJbnZhbGlkIFN1YmplY3RDcmVkZW50aWFsUmVxdWVzdFske2l9XTogdHlwZSBtdXN0IGJlIGRlZmluZWQuYCk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiByZXF1ZXN0LnR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgYEludmFsaWQgU3ViamVjdENyZWRlbnRpYWxSZXF1ZXN0WyR7aX1dOiB0eXBlIG11c3QgYmUgYSBzdHJpbmcuYCk7XG4gICAgfVxuXG4gICAgaWYgKCEoKHJlcXVlc3QucmVxdWlyZWQgPT09IGZhbHNlIHx8IHJlcXVlc3QucmVxdWlyZWQgPT09IHRydWUpKSkge1xuICAgICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsIGBJbnZhbGlkIFN1YmplY3RDcmVkZW50aWFsUmVxdWVzdFske2l9XTogcmVxdWlyZWQgbXVzdCBiZSBkZWZpbmVkLmApO1xuICAgIH1cblxuICAgIGlmICghcmVxdWVzdC5pc3N1ZXJzKSB7XG4gICAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgYEludmFsaWQgU3ViamVjdENyZWRlbnRpYWxSZXF1ZXN0WyR7aX1dOiBpc3N1ZXJzIG11c3QgYmUgZGVmaW5lZC5gKTtcbiAgICB9XG4gIH1cblxuICAvLyByZXR1cm4gdGhlIHN1YmplY3REaWQgZm9yIHJlZmVyZW5jZSBub3cgdGhhdCBoYXZlIHZhbGlkYXRlZCBhbGwgdGhlIHNhbWUgYWNyb3NzIGFsbCByZXF1ZXN0c1xuICByZXR1cm4gc3ViamVjdERpZDtcbn07XG4vKipcbiAqIFZlcmlmeSB0aGUgQ3JlZGVudGlhbFJlcXVlc3RzIHNpZ25hdHVyZXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2ZXJpZnlTdWJqZWN0Q3JlZGVudGlhbFJlcXVlc3RzIChhdXRob3JpemF0aW9uOiBzdHJpbmcsIGlzc3VlckRpZDogc3RyaW5nLCBzdWJqZWN0RGlkOiBzdHJpbmcsIHN1YmplY3RDcmVkZW50aWFsUmVxdWVzdHM6IFN1YmplY3RDcmVkZW50aWFsUmVxdWVzdHMpOiBQcm9taXNlPFVudW1EdG88VmVyaWZpZWRTdGF0dXM+PiB7XG4gIHJlcXVpcmVBdXRoKGF1dGhvcml6YXRpb24pO1xuXG4gIC8vIHZhbGlkYXRlIGNyZWRlbnRpYWxSZXF1ZXN0cyBpbnB1dDsgYW5kIGdyYWIgdGhlIHN1YmplY3REaWQgZm9yIHJlZmVyZW5jZSBsYXRlclxuICB2YWxpZGF0ZVN1YmplY3RDcmVkZW50aWFsUmVxdWVzdHMoc3ViamVjdENyZWRlbnRpYWxSZXF1ZXN0cywgc3ViamVjdERpZCk7XG5cbiAgY29uc3QgcmVzdWx0OiBVbnVtRHRvPFZlcmlmaWVkU3RhdHVzPiA9IGF3YWl0IHZlcmlmeVN1YmplY3RDcmVkZW50aWFsUmVxdWVzdHNIZWxwZXIoYXV0aG9yaXphdGlvbiwgaXNzdWVyRGlkLCBzdWJqZWN0Q3JlZGVudGlhbFJlcXVlc3RzKTtcbiAgbGV0IGF1dGhUb2tlbiA9IHJlc3VsdC5hdXRoVG9rZW47XG4gIGNvbnN0IHsgaXNWZXJpZmllZCwgbWVzc2FnZSB9ID0gcmVzdWx0LmJvZHk7XG5cbiAgLy8gaGFuZGxlIHNlbmRpbmcgYmFjayB0aGUgUmVjZWlwdFN1YmplY3RDcmVkZW50aWFsUmVxdWVzdFZlcmlmaWVkRGF0YSByZWNlaXB0IHdpdGggdGhlIHZlcmlmaWNhdGlvbiBzdGF0dXNcbiAgYXV0aFRva2VuID0gYXdhaXQgaGFuZGxlU3ViamVjdENyZWRlbnRpYWxzUmVxdWVzdHNWZXJpZmljYXRpb25SZWNlaXB0KGF1dGhUb2tlbiwgaXNzdWVyRGlkLCBzdWJqZWN0RGlkLCBzdWJqZWN0Q3JlZGVudGlhbFJlcXVlc3RzLCBpc1ZlcmlmaWVkLCBtZXNzYWdlKTtcblxuICByZXR1cm4ge1xuICAgIC4uLnJlc3VsdCxcbiAgICBhdXRoVG9rZW5cbiAgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeVN1YmplY3RDcmVkZW50aWFsUmVxdWVzdHNIZWxwZXIgKGF1dGhUb2tlbjogc3RyaW5nLCBpc3N1ZXJEaWQ6IHN0cmluZywgc3ViamVjdENyZWRlbnRpYWxSZXF1ZXN0czogU3ViamVjdENyZWRlbnRpYWxSZXF1ZXN0cyk6IFByb21pc2U8VW51bUR0bzxWZXJpZmllZFN0YXR1cz4+IHtcbiAgY29uc3QgdmVyaWZpY2F0aW9uTWV0aG9kID0gc3ViamVjdENyZWRlbnRpYWxSZXF1ZXN0cy5wcm9vZj8udmVyaWZpY2F0aW9uTWV0aG9kIGFzIHN0cmluZztcbiAgY29uc3Qgc2lnbmF0dXJlVmFsdWUgPSBzdWJqZWN0Q3JlZGVudGlhbFJlcXVlc3RzLnByb29mPy5zaWduYXR1cmVWYWx1ZSBhcyBzdHJpbmc7XG5cbiAgY29uc3QgcHVibGljS2V5SW5mb1Jlc3BvbnNlOiBVbnVtRHRvPFB1YmxpY0tleUluZm9bXT4gPSBhd2FpdCBnZXREaWREb2NQdWJsaWNLZXlzKGF1dGhUb2tlbiwgdmVyaWZpY2F0aW9uTWV0aG9kLCAnc2VjcDI1NnIxJyk7XG4gIGNvbnN0IHB1YmxpY0tleUluZm9MaXN0OiBQdWJsaWNLZXlJbmZvW10gPSBwdWJsaWNLZXlJbmZvUmVzcG9uc2UuYm9keTtcbiAgYXV0aFRva2VuID0gcHVibGljS2V5SW5mb1Jlc3BvbnNlLmF1dGhUb2tlbjtcblxuICBpZiAocHVibGljS2V5SW5mb0xpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGF1dGhUb2tlbixcbiAgICAgIGJvZHk6IHtcbiAgICAgICAgaXNWZXJpZmllZDogZmFsc2UsXG4gICAgICAgIG1lc3NhZ2U6IGBQdWJsaWMga2V5IG5vdCBmb3VuZCBmb3IgdGhlIHN1YmplY3QgZGlkICR7dmVyaWZpY2F0aW9uTWV0aG9kfWBcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgbGV0IGlzVmVyaWZpZWQgPSBmYWxzZTtcblxuICBjb25zdCB1bnNpZ25lZFN1YmplY3RDcmVkZW50aWFsUmVxdWVzdHM6IFVuc2lnbmVkU3ViamVjdENyZWRlbnRpYWxSZXF1ZXN0cyA9IG9taXQoc3ViamVjdENyZWRlbnRpYWxSZXF1ZXN0cywgJ3Byb29mJyk7XG5cbiAgLy8gY29udmVydCB0byBieXRlc1xuICBjb25zdCBieXRlczogVWludDhBcnJheSA9IFVuc2lnbmVkU3ViamVjdENyZWRlbnRpYWxSZXF1ZXN0cy5lbmNvZGUodW5zaWduZWRTdWJqZWN0Q3JlZGVudGlhbFJlcXVlc3RzKS5maW5pc2goKTtcblxuICAvLyBjaGVjayBhbGwgdGhlIHB1YmxpYyBrZXlzIHRvIHNlZSBpZiBhbnkgd29yaywgc3RvcCBpZiBvbmUgZG9lc1xuICBmb3IgKGNvbnN0IHB1YmxpY0tleUluZm8gb2YgcHVibGljS2V5SW5mb0xpc3QpIHtcbiAgICAvLyB2ZXJpZnkgdGhlIHNpZ25hdHVyZVxuICAgIGlzVmVyaWZpZWQgPSBkb1ZlcmlmeShzaWduYXR1cmVWYWx1ZSwgYnl0ZXMsIHB1YmxpY0tleUluZm8pO1xuICAgIGlmIChpc1ZlcmlmaWVkKSBicmVhaztcbiAgfVxuXG4gIGlmICghaXNWZXJpZmllZCkge1xuICAgIHJldHVybiB7XG4gICAgICBhdXRoVG9rZW4sXG4gICAgICBib2R5OiB7XG4gICAgICAgIGlzVmVyaWZpZWQ6IGZhbHNlLFxuICAgICAgICBtZXNzYWdlOiAnU3ViamVjdENyZWRlbnRpYWxSZXF1ZXN0cyBzaWduYXR1cmUgY2FuIG5vdCBiZSB2ZXJpZmllZC4nXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYXV0aFRva2VuLFxuICAgIGJvZHk6IHtcbiAgICAgIGlzVmVyaWZpZWQ6IHRydWVcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogSGFuZGxlIHNlbmRpbmcgYmFjayB0aGUgU3ViamVjdENyZWRlbnRpYWxSZXF1ZXN0VmVyaWZpZWQgcmVjZWlwdFxuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTdWJqZWN0Q3JlZGVudGlhbHNSZXF1ZXN0c1ZlcmlmaWNhdGlvblJlY2VpcHQgKGF1dGhvcml6YXRpb246IHN0cmluZywgaXNzdWVyRGlkOiBzdHJpbmcsIHN1YmplY3REaWQ6IHN0cmluZywgc3ViamVjdENyZWRlbnRpYWxSZXF1ZXN0czogU3ViamVjdENyZWRlbnRpYWxSZXF1ZXN0cywgaXNWZXJpZmllZDogYm9vbGVhbiwgbWVzc2FnZT86c3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXF1ZXN0SW5mbzogQ3JlZGVudGlhbFJlcXVlc3RbXSA9IHN1YmplY3RDcmVkZW50aWFsUmVxdWVzdHMuY3JlZGVudGlhbFJlcXVlc3RzO1xuXG4gICAgY29uc3QgZGF0YTogUmVjZWlwdFN1YmplY3RDcmVkZW50aWFsUmVxdWVzdFZlcmlmaWVkRGF0YSA9IHtcbiAgICAgIGlzVmVyaWZpZWQsXG4gICAgICByZXF1ZXN0SW5mbyxcbiAgICAgIHJlYXNvbjogbWVzc2FnZVxuICAgIH07XG5cbiAgICBjb25zdCByZWNlaXB0T3B0aW9uczogUmVjZWlwdE9wdGlvbnM8UmVjZWlwdFN1YmplY3RDcmVkZW50aWFsUmVxdWVzdFZlcmlmaWVkRGF0YT4gPSB7XG4gICAgICB0eXBlOiAnU3ViamVjdENyZWRlbnRpYWxSZXF1ZXN0VmVyaWZpZWQnLFxuICAgICAgaXNzdWVyOiBpc3N1ZXJEaWQsXG4gICAgICBzdWJqZWN0OiBzdWJqZWN0RGlkLFxuICAgICAgZGF0YVxuICAgIH07XG5cbiAgICBjb25zdCByZWNlaXB0Q2FsbE9wdGlvbnM6IFJFU1REYXRhID0ge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBiYXNlVXJsOiBjb25maWdEYXRhLlNhYVNVcmwsXG4gICAgICBlbmRQb2ludDogJ3JlY2VpcHQnLFxuICAgICAgaGVhZGVyOiB7IEF1dGhvcml6YXRpb246IGF1dGhvcml6YXRpb24gfSxcbiAgICAgIGRhdGE6IHJlY2VpcHRPcHRpb25zXG4gICAgfTtcblxuICAgIGNvbnN0IHJlc3A6IEpTT05PYmogPSBhd2FpdCBtYWtlTmV0d29ya1JlcXVlc3Q8SlNPTk9iaj4ocmVjZWlwdENhbGxPcHRpb25zKTtcblxuICAgIGNvbnN0IGF1dGhUb2tlbiA9IGhhbmRsZUF1dGhUb2tlbkhlYWRlcihyZXNwLCBhdXRob3JpemF0aW9uKTtcblxuICAgIHJldHVybiBhdXRoVG9rZW47XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2dnZXIuZXJyb3IoYEVycm9yIHNlbmRpbmcgU3ViamVjdENyZWRlbnRpYWxSZXF1ZXN0VmVyaWZpY2F0aW9uIFJlY2VpcHQgdG8gVW51bSBJRCBTYWFTLiBFcnJvciAke2V9YCk7XG4gIH1cblxuICByZXR1cm4gYXV0aG9yaXphdGlvbjtcbn1cbiJdfQ==