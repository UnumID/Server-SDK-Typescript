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
var types_1 = require("@unumid/types");
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
var convertToProtobuf_1 = require("../utils/convertToProtobuf");
var sendPresentationVerifiedReceipt_1 = require("./sendPresentationVerifiedReceipt");
var getPresentationRequest_1 = require("./getPresentationRequest");
function isDeclinedPresentation(presentation) {
    return helpers_1.isArrayEmpty(presentation.verifiableCredential);
}
/**
 * Validates the presentation object has the proper attributes.
 * @param presentation Presentation
 */
var validatePresentation = function (presentation) {
    // const context = (presentation as Presentation)['@context'] ? (presentation as Presentation)['@context'] : (presentation as PresentationPb).context;
    var type = presentation.type, proof = presentation.proof, presentationRequestId = presentation.presentationRequestId, verifierDid = presentation.verifierDid, context = presentation.context;
    // validate required fields
    if (!context) {
        throw new error_1.CustError(400, 'Invalid Presentation: context is required.');
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
    if (!verifierDid) {
        throw new error_1.CustError(400, 'Invalid Presentation: verifierDid is required.');
    }
    if (helpers_1.isArrayEmpty(context)) {
        throw new error_1.CustError(400, 'Invalid Presentation: context must be a non-empty array.');
    }
    if (helpers_1.isArrayEmpty(type)) {
        throw new error_1.CustError(400, 'Invalid Presentation: type must be a non-empty array.');
    }
    // // HACK ALERT: Handling converting string dates to Date. Note: only needed for now when using Protos with Date attributes
    // // when we move to full grpc this will not be needed because not longer using json.
    // if (!uuid) {
    //   presentation.uuid = '';
    // }
    // Check proof object is formatted correctly
    var updatedProof = validateProof_1.validateProof(proof);
    presentation.proof = updatedProof;
    return presentation;
};
/**
 * Validates the presentation request object has the proper attributes.
 * @param presentation Presentation
 */
var validatePresentationRequest = function (presentationRequest) {
    var proof = presentationRequest.proof, credentialRequests = presentationRequest.credentialRequests, holderAppUuid = presentationRequest.holderAppUuid, verifier = presentationRequest.verifier;
    // validate required fields
    if (!credentialRequests) {
        throw new error_1.CustError(400, 'Invalid PresentationRequest: credentialRequests is required.');
    }
    if (!holderAppUuid) {
        throw new error_1.CustError(400, 'Invalid PresentationRequest: holderAppUuid is required.');
    }
    if (!proof) {
        throw new error_1.CustError(400, 'Invalid PresentationRequest: proof is required.');
    }
    if (!verifier) {
        throw new error_1.CustError(400, 'Invalid PresentationRequest: verifier is required.');
    }
    validateCredentialRequests(presentationRequest.credentialRequests);
    // Check proof object is formatted correctly while converting to protobuf type
    var result = __assign(__assign({}, presentationRequest), { proof: validateProof_1.validateProof(convertToProtobuf_1.convertProof(proof)), expiresAt: presentationRequest.expiresAt ? presentationRequest.expiresAt : undefined, metadata: presentationRequest.metadata ? presentationRequest.metadata : undefined });
    return result;
};
/**
 * Validates the attributes for a credential request to UnumID's SaaS.
 * @param requests CredentialRequest
 */
var validateCredentialRequests = function (requests) {
    if (helpers_1.isArrayEmpty(requests)) {
        throw new error_1.CustError(400, 'Invalid PresentationRequest: verifiableCredential must be a non-empty array.');
    }
    var totCred = requests.length;
    for (var i = 0; i < totCred; i++) {
        var credPosStr = '[' + i + ']';
        var request = requests[i];
        if (!request.type) {
            throw new error_1.CustError(400, "Invalid PresentationRequest CredentialRequest" + credPosStr + ": type must be defined.");
        }
        if (typeof request.type !== 'string') {
            throw new error_1.CustError(400, "Invalid PresentationRequest CredentialRequest" + credPosStr + ": type must be a string.");
        }
        if (!request.issuers) {
            throw new error_1.CustError(400, "Invalid PresentationRequest CredentialRequest" + credPosStr + ": issuers must be defined.");
        }
    }
};
/**
 * Verify the PresentationRequest signature as a way to side step verifier MITM attacks where an entity spoofs requests.
 */
function verifyPresentationRequest(authorization, presentationRequest) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, verificationMethod, signatureValue, publicKeyInfoResponse, publicKeyInfoList, authToken, unsignedPresentationRequest, bytes, isVerified, _i, publicKeyInfoList_1, publicKeyInfo, result_1, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger_1.default.debug("Verifying the presentation request " + presentationRequest.uuid);
                    if (!presentationRequest.proof) {
                        throw new error_1.CustError(400, 'Invalid PresentationRequest: proof is required.');
                    }
                    _a = presentationRequest.proof, verificationMethod = _a.verificationMethod, signatureValue = _a.signatureValue;
                    return [4 /*yield*/, didHelper_1.getDidDocPublicKeys(authorization, verificationMethod, 'secp256r1')];
                case 1:
                    publicKeyInfoResponse = _b.sent();
                    publicKeyInfoList = publicKeyInfoResponse.body;
                    authToken = publicKeyInfoResponse.authToken;
                    unsignedPresentationRequest = lodash_1.omit(presentationRequest, 'proof');
                    bytes = types_1.UnsignedPresentationRequestPb.encode(unsignedPresentationRequest).finish();
                    isVerified = false;
                    // check all the public keys to see if any work, stop if one does
                    for (_i = 0, publicKeyInfoList_1 = publicKeyInfoList; _i < publicKeyInfoList_1.length; _i++) {
                        publicKeyInfo = publicKeyInfoList_1[_i];
                        // verify the signature
                        isVerified = verify_1.doVerify(signatureValue, bytes, publicKeyInfo);
                        if (isVerified)
                            break;
                    }
                    if (!isVerified) {
                        logger_1.default.warn("Presentation request " + presentationRequest.uuid + " signature can not be verified.");
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
                    logger_1.default.debug("Presentation request " + presentationRequest.uuid + " signature verified.");
                    return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Handler for verifying a provided encrypted Presentation.
 * @param authorization: string
 * @param encryptedPresentation: EncryptedData
 * @param verifierDid: string
 */
exports.verifyPresentation = function (authorization, encryptedPresentation, verifierDid, encryptionPrivateKey, presentationRequest) { return __awaiter(void 0, void 0, void 0, function () {
    var presentationBytes, presentation, presentationRequestResponse, presentationRequestPb, requestVerificationResult, authToken, type, result_2, verificationResult_1, result_3, credentialRequests, verificationResult, result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 10, , 11]);
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
                presentationBytes = library_crypto_1.decryptBytes(encryptionPrivateKey, encryptedPresentation);
                presentation = types_1.PresentationPb.decode(presentationBytes);
                if (config_1.configData.debug) {
                    logger_1.default.debug("Decrypted Presentation: " + JSON.stringify(presentation));
                }
                // validate presentation
                validatePresentation(presentation);
                if (!!presentationRequest) return [3 /*break*/, 2];
                return [4 /*yield*/, getPresentationRequest_1.getPresentationRequest(authorization, presentation.presentationRequestId)];
            case 1:
                presentationRequestResponse = _a.sent();
                authorization = networkRequestHelper_1.handleAuthTokenHeader(presentationRequestResponse, authorization);
                presentationRequest = getPresentationRequest_1.extractPresentationRequest(presentationRequestResponse.body);
                return [3 /*break*/, 3];
            case 2:
                // need to convert the string date attributes to to Date objects for proto handling
                presentationRequest = getPresentationRequest_1.handleConvertingPresentationRequestDateAttributes(presentationRequest);
                _a.label = 3;
            case 3:
                // verify the presentation request uuid match
                if (presentationRequest.presentationRequest.id !== presentation.presentationRequestId) {
                    throw new error_1.CustError(400, "presentation request id provided, " + presentationRequest.presentationRequest.id + ", does not match the presentationRequestId that the presentation was in response to, " + presentation.presentationRequestId + ".");
                }
                if (!presentationRequest.presentationRequest) return [3 /*break*/, 6];
                presentationRequestPb = validatePresentationRequest(presentationRequest.presentationRequest);
                return [4 /*yield*/, verifyPresentationRequest(authorization, presentationRequestPb)];
            case 4:
                requestVerificationResult = _a.sent();
                authorization = requestVerificationResult.authToken;
                if (!!requestVerificationResult.body.isVerified) return [3 /*break*/, 6];
                return [4 /*yield*/, handlePresentationVerificationReceipt(requestVerificationResult.authToken, presentation, verifierDid, requestVerificationResult.body.message, presentationRequest.presentationRequest.uuid)];
            case 5:
                authToken = _a.sent();
                type = isDeclinedPresentation(presentation) ? 'DeclinedPresentation' : 'VerifiablePresentation';
                result_2 = {
                    authToken: authToken,
                    body: __assign(__assign({}, requestVerificationResult.body), { type: type, presentation: presentation })
                };
                return [2 /*return*/, result_2];
            case 6:
                if (!isDeclinedPresentation(presentation)) return [3 /*break*/, 8];
                return [4 /*yield*/, verifyNoPresentationHelper_1.verifyNoPresentationHelper(authorization, presentation, verifierDid, presentationRequest.presentationRequest.uuid)];
            case 7:
                verificationResult_1 = _a.sent();
                result_3 = {
                    authToken: verificationResult_1.authToken,
                    body: __assign(__assign({}, verificationResult_1.body), { type: 'DeclinedPresentation', presentation: presentation })
                };
                return [2 /*return*/, result_3];
            case 8:
                credentialRequests = presentationRequest.presentationRequest.credentialRequests;
                return [4 /*yield*/, verifyPresentationHelper_1.verifyPresentationHelper(authorization, presentation, verifierDid, credentialRequests, presentationRequest.presentationRequest.uuid)];
            case 9:
                verificationResult = _a.sent();
                result = {
                    authToken: verificationResult.authToken,
                    body: __assign(__assign({}, verificationResult.body), { type: 'VerifiablePresentation', presentation: presentation })
                };
                return [2 /*return*/, result];
            case 10:
                error_2 = _a.sent();
                if (error_2 instanceof library_crypto_1.CryptoError) {
                    logger_1.default.error("Crypto error handling encrypted presentation " + error_2);
                }
                if (error_2 instanceof TypeError) {
                    logger_1.default.error("Type error handling decoding presentation, credential or proof from bytes to protobufs " + error_2);
                }
                else {
                    logger_1.default.error("Error handling encrypted presentation. " + error_2);
                }
                throw error_2;
            case 11: return [2 /*return*/];
        }
    });
}); };
/**
 * Handle sending back the PresentationVerified receipt with the request verification failure reason
 */
function handlePresentationVerificationReceipt(authToken, presentation, verifier, message, requestUuid) {
    return __awaiter(this, void 0, void 0, function () {
        var credentialTypes, credentialIds, issuers, reply, proof;
        return __generator(this, function (_a) {
            try {
                credentialTypes = presentation.verifiableCredential && helpers_1.isArrayNotEmpty(presentation.verifiableCredential) ? presentation.verifiableCredential.flatMap(function (cred) { return cred.type.slice(1); }) : [];
                credentialIds = presentation.verifiableCredential && helpers_1.isArrayNotEmpty(presentation.verifiableCredential) ? presentation.verifiableCredential.flatMap(function (cred) { return cred.id; }) : [];
                issuers = presentation.verifiableCredential && helpers_1.isArrayNotEmpty(presentation.verifiableCredential) ? presentation.verifiableCredential.map(function (cred) { return cred.issuer; }) : [];
                reply = isDeclinedPresentation(presentation) ? 'declined' : 'approved';
                proof = presentation.proof;
                return [2 /*return*/, sendPresentationVerifiedReceipt_1.sendPresentationVerifiedReceipt(authToken, verifier, proof.verificationMethod, reply, false, presentation.presentationRequestId, requestUuid, message, issuers, credentialTypes, credentialIds)];
            }
            catch (e) {
                logger_1.default.error('Something went wrong handling the PresentationVerification receipt for the a failed request verification');
            }
            return [2 /*return*/, authToken];
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5UHJlc2VudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3ZlcmlmaWVyL3ZlcmlmeVByZXNlbnRhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLHVDQUF1TztBQUN2Tyw4Q0FBNkM7QUFDN0MseURBQW1FO0FBQ25FLHFEQUErQjtBQUMvQiwyRUFBMEU7QUFDMUUsdUVBQXNFO0FBQ3RFLHdDQUEyQztBQUMzQyw0Q0FBaUU7QUFDakUsaUNBQThCO0FBQzlCLGdEQUF5RDtBQUN6RCxvQ0FBdUM7QUFDdkMsMENBQTJDO0FBQzNDLHNFQUFzRTtBQUN0RSxpREFBZ0Q7QUFDaEQsZ0VBQTBEO0FBQzFELHFGQUFvRjtBQUNwRixtRUFBaUo7QUFFakosU0FBUyxzQkFBc0IsQ0FBRSxZQUEyQztJQUMxRSxPQUFPLHNCQUFZLENBQUMsWUFBWSxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDekQsQ0FBQztBQUVEOzs7R0FHRztBQUNILElBQU0sb0JBQW9CLEdBQUcsVUFBQyxZQUE0QjtJQUN4RCxzSkFBc0o7SUFDOUksSUFBQSxJQUFJLEdBQXlELFlBQVksS0FBckUsRUFBRSxLQUFLLEdBQWtELFlBQVksTUFBOUQsRUFBRSxxQkFBcUIsR0FBMkIsWUFBWSxzQkFBdkMsRUFBRSxXQUFXLEdBQWMsWUFBWSxZQUExQixFQUFFLE9BQU8sR0FBSyxZQUFZLFFBQWpCLENBQWtCO0lBRWxGLDJCQUEyQjtJQUMzQixJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ1osTUFBTSxJQUFJLGlCQUFTLENBQUMsR0FBRyxFQUFFLDRDQUE0QyxDQUFDLENBQUM7S0FDeEU7SUFFRCxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1QsTUFBTSxJQUFJLGlCQUFTLENBQUMsR0FBRyxFQUFFLHlDQUF5QyxDQUFDLENBQUM7S0FDckU7SUFFRCxJQUFJLENB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Z0JBQ3ZFLEtBQUssR0FBRyxZQUFZLENBQUMsS0FBZ0IsQ0FBQztnQkFFNUMsc0JBQU8saUVBQStCLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxZQUFZLENBQUMscUJBQXFCLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLGFBQWEsQ0FBQyxFQUFDO2FBQ3hNO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsMEdBQTBHLENBQUMsQ0FBQzthQUMxSDtZQUVELHNCQUFPLFNBQVMsRUFBQzs7O0NBQ2xCIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyBEZWNyeXB0ZWRQcmVzZW50YXRpb24sIFVudW1EdG8sIFZlcmlmaWVkU3RhdHVzIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgUHJlc2VudGF0aW9uLCBDcmVkZW50aWFsUmVxdWVzdCwgUHJlc2VudGF0aW9uUmVxdWVzdER0bywgRW5jcnlwdGVkRGF0YSwgUHJlc2VudGF0aW9uUmVxdWVzdCwgUHJlc2VudGF0aW9uUGIsIFByZXNlbnRhdGlvblJlcXVlc3RQYiwgUHJvb2ZQYiwgVW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0UGIsIFdpdGhWZXJzaW9uLCBQdWJsaWNLZXlJbmZvIH0gZnJvbSAnQHVudW1pZC90eXBlcyc7XG5pbXBvcnQgeyByZXF1aXJlQXV0aCB9IGZyb20gJy4uL3JlcXVpcmVBdXRoJztcbmltcG9ydCB7IENyeXB0b0Vycm9yLCBkZWNyeXB0Qnl0ZXMgfSBmcm9tICdAdW51bWlkL2xpYnJhcnktY3J5cHRvJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCB7IHZlcmlmeU5vUHJlc2VudGF0aW9uSGVscGVyIH0gZnJvbSAnLi92ZXJpZnlOb1ByZXNlbnRhdGlvbkhlbHBlcic7XG5pbXBvcnQgeyB2ZXJpZnlQcmVzZW50YXRpb25IZWxwZXIgfSBmcm9tICcuL3ZlcmlmeVByZXNlbnRhdGlvbkhlbHBlcic7XG5pbXBvcnQgeyBDdXN0RXJyb3IgfSBmcm9tICcuLi91dGlscy9lcnJvcic7XG5pbXBvcnQgeyBpc0FycmF5RW1wdHksIGlzQXJyYXlOb3RFbXB0eSB9IGZyb20gJy4uL3V0aWxzL2hlbHBlcnMnO1xuaW1wb3J0IHsgb21pdCB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBnZXREaWREb2NQdWJsaWNLZXlzIH0gZnJvbSAnLi4vdXRpbHMvZGlkSGVscGVyJztcbmltcG9ydCB7IGNvbmZpZ0RhdGEgfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgZG9WZXJpZnkgfSBmcm9tICcuLi91dGlscy92ZXJpZnknO1xuaW1wb3J0IHsgaGFuZGxlQXV0aFRva2VuSGVhZGVyIH0gZnJvbSAnLi4vdXRpbHMvbmV0d29ya1JlcXVlc3RIZWxwZXInO1xuaW1wb3J0IHsgdmFsaWRhdGVQcm9vZiB9IGZyb20gJy4vdmFsaWRhdGVQcm9vZic7XG5pbXBvcnQgeyBjb252ZXJ0UHJvb2YgfSBmcm9tICcuLi91dGlscy9jb252ZXJ0VG9Qcm90b2J1Zic7XG5pbXBvcnQgeyBzZW5kUHJlc2VudGF0aW9uVmVyaWZpZWRSZWNlaXB0IH0gZnJvbSAnLi9zZW5kUHJlc2VudGF0aW9uVmVyaWZpZWRSZWNlaXB0JztcbmltcG9ydCB7IGV4dHJhY3RQcmVzZW50YXRpb25SZXF1ZXN0LCBnZXRQcmVzZW50YXRpb25SZXF1ZXN0LCBoYW5kbGVDb252ZXJ0aW5nUHJlc2VudGF0aW9uUmVxdWVzdERhdGVBdHRyaWJ1dGVzIH0gZnJvbSAnLi9nZXRQcmVzZW50YXRpb25SZXF1ZXN0JztcblxuZnVuY3Rpb24gaXNEZWNsaW5lZFByZXNlbnRhdGlvbiAocHJlc2VudGF0aW9uOiBQcmVzZW50YXRpb24gfCBQcmVzZW50YXRpb25QYik6IHByZXNlbnRhdGlvbiBpcyBQcmVzZW50YXRpb24ge1xuICByZXR1cm4gaXNBcnJheUVtcHR5KHByZXNlbnRhdGlvbi52ZXJpZmlhYmxlQ3JlZGVudGlhbCk7XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIHRoZSBwcmVzZW50YXRpb24gb2JqZWN0IGhhcyB0aGUgcHJvcGVyIGF0dHJpYnV0ZXMuXG4gKiBAcGFyYW0gcHJlc2VudGF0aW9uIFByZXNlbnRhdGlvblxuICovXG5jb25zdCB2YWxpZGF0ZVByZXNlbnRhdGlvbiA9IChwcmVzZW50YXRpb246IFByZXNlbnRhdGlvblBiKTogUHJlc2VudGF0aW9uUGIgPT4ge1xuICAvLyBjb25zdCBjb250ZXh0ID0gKHByZXNlbnRhdGlvbiBhcyBQcmVzZW50YXRpb24pWydAY29udGV4dCddID8gKHByZXNlbnRhdGlvbiBhcyBQcmVzZW50YXRpb24pWydAY29udGV4dCddIDogKHByZXNlbnRhdGlvbiBhcyBQcmVzZW50YXRpb25QYikuY29udGV4dDtcbiAgY29uc3QgeyB0eXBlLCBwcm9vZiwgcHJlc2VudGF0aW9uUmVxdWVzdElkLCB2ZXJpZmllckRpZCwgY29udGV4dCB9ID0gcHJlc2VudGF0aW9uO1xuXG4gIC8vIHZhbGlkYXRlIHJlcXVpcmVkIGZpZWxkc1xuICBpZiAoIWNvbnRleHQpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uOiBjb250ZXh0IGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKCF0eXBlKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvbjogdHlwZSBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICghcHJvb2YpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uOiBwcm9vZiBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICghcHJlc2VudGF0aW9uUmVxdWVzdElkKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvbjogcHJlc2VudGF0aW9uUmVxdWVzdElkIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKCF2ZXJpZmllckRpZCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb246IHZlcmlmaWVyRGlkIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKGlzQXJyYXlFbXB0eShjb250ZXh0KSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb246IGNvbnRleHQgbXVzdCBiZSBhIG5vbi1lbXB0eSBhcnJheS4nKTtcbiAgfVxuXG4gIGlmIChpc0FycmF5RW1wdHkodHlwZSkpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uOiB0eXBlIG11c3QgYmUgYSBub24tZW1wdHkgYXJyYXkuJyk7XG4gIH1cblxuICAvLyAvLyBIQUNLIEFMRVJUOiBIYW5kbGluZyBjb252ZXJ0aW5nIHN0cmluZyBkYXRlcyB0byBEYXRlLiBOb3RlOiBvbmx5IG5lZWRlZCBmb3Igbm93IHdoZW4gdXNpbmcgUHJvdG9zIHdpdGggRGF0ZSBhdHRyaWJ1dGVzXG4gIC8vIC8vIHdoZW4gd2UgbW92ZSB0byBmdWxsIGdycGMgdGhpcyB3aWxsIG5vdCBiZSBuZWVkZWQgYmVjYXVzZSBub3QgbG9uZ2VyIHVzaW5nIGpzb24uXG4gIC8vIGlmICghdXVpZCkge1xuICAvLyAgIHByZXNlbnRhdGlvbi51dWlkID0gJyc7XG4gIC8vIH1cblxuICAvLyBDaGVjayBwcm9vZiBvYmplY3QgaXMgZm9ybWF0dGVkIGNvcnJlY3RseVxuICBjb25zdCB1cGRhdGVkUHJvb2YgPSB2YWxpZGF0ZVByb29mKHByb29mKTtcbiAgcHJlc2VudGF0aW9uLnByb29mID0gdXBkYXRlZFByb29mO1xuXG4gIHJldHVybiBwcmVzZW50YXRpb247XG59O1xuXG4vKipcbiAqIFZhbGlkYXRlcyB0aGUgcHJlc2VudGF0aW9uIHJlcXVlc3Qgb2JqZWN0IGhhcyB0aGUgcHJvcGVyIGF0dHJpYnV0ZXMuXG4gKiBAcGFyYW0gcHJlc2VudGF0aW9uIFByZXNlbnRhdGlvblxuICovXG5jb25zdCB2YWxpZGF0ZVByZXNlbnRhdGlvblJlcXVlc3QgPSAocHJlc2VudGF0aW9uUmVxdWVzdDogV2l0aFZlcnNpb248UHJlc2VudGF0aW9uUmVxdWVzdD4pOiBQcmVzZW50YXRpb25SZXF1ZXN0UGIgPT4ge1xuICBjb25zdCB7IHByb29mLCBjcmVkZW50aWFsUmVxdWVzdHMsIGhvbGRlckFwcFV1aWQsIHZlcmlmaWVyIH0gPSBwcmVzZW50YXRpb25SZXF1ZXN0O1xuXG4gIC8vIHZhbGlkYXRlIHJlcXVpcmVkIGZpZWxkc1xuICBpZiAoIWNyZWRlbnRpYWxSZXF1ZXN0cykge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb25SZXF1ZXN0OiBjcmVkZW50aWFsUmVxdWVzdHMgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAoIWhvbGRlckFwcFV1aWQpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uUmVxdWVzdDogaG9sZGVyQXBwVXVpZCBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICghcHJvb2YpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uUmVxdWVzdDogcHJvb2YgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAoIXZlcmlmaWVyKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvblJlcXVlc3Q6IHZlcmlmaWVyIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgdmFsaWRhdGVDcmVkZW50aWFsUmVxdWVzdHMocHJlc2VudGF0aW9uUmVxdWVzdC5jcmVkZW50aWFsUmVxdWVzdHMpO1xuXG4gIC8vIENoZWNrIHByb29mIG9iamVjdCBpcyBmb3JtYXR0ZWQgY29ycmVjdGx5IHdoaWxlIGNvbnZlcnRpbmcgdG8gcHJvdG9idWYgdHlwZVxuICBjb25zdCByZXN1bHQ6IFByZXNlbnRhdGlvblJlcXVlc3RQYiA9IHtcbiAgICAuLi5wcmVzZW50YXRpb25SZXF1ZXN0LFxuICAgIHByb29mOiB2YWxpZGF0ZVByb29mKGNvbnZlcnRQcm9vZihwcm9vZikpLFxuICAgIGV4cGlyZXNBdDogcHJlc2VudGF0aW9uUmVxdWVzdC5leHBpcmVzQXQgPyBwcmVzZW50YXRpb25SZXF1ZXN0LmV4cGlyZXNBdCA6IHVuZGVmaW5lZCxcbiAgICBtZXRhZGF0YTogcHJlc2VudGF0aW9uUmVxdWVzdC5tZXRhZGF0YSA/IHByZXNlbnRhdGlvblJlcXVlc3QubWV0YWRhdGEgOiB1bmRlZmluZWRcbiAgfTtcblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBWYWxpZGF0ZXMgdGhlIGF0dHJpYnV0ZXMgZm9yIGEgY3JlZGVudGlhbCByZXF1ZXN0IHRvIFVudW1JRCdzIFNhYVMuXG4gKiBAcGFyYW0gcmVxdWVzdHMgQ3JlZGVudGlhbFJlcXVlc3RcbiAqL1xuY29uc3QgdmFsaWRhdGVDcmVkZW50aWFsUmVxdWVzdHMgPSAocmVxdWVzdHM6IENyZWRlbnRpYWxSZXF1ZXN0W10pOiB2b2lkID0+IHtcbiAgaWYgKGlzQXJyYXlFbXB0eShyZXF1ZXN0cykpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uUmVxdWVzdDogdmVyaWZpYWJsZUNyZWRlbnRpYWwgbXVzdCBiZSBhIG5vbi1lbXB0eSBhcnJheS4nKTtcbiAgfVxuXG4gIGNvbnN0IHRvdENyZWQgPSByZXF1ZXN0cy5sZW5ndGg7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdG90Q3JlZDsgaSsrKSB7XG4gICAgY29uc3QgY3JlZFBvc1N0ciA9ICdbJyArIGkgKyAnXSc7XG4gICAgY29uc3QgcmVxdWVzdCA9IHJlcXVlc3RzW2ldO1xuXG4gICAgaWYgKCFyZXF1ZXN0LnR5cGUpIHtcbiAgICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCBgSW52YWxpZCBQcmVzZW50YXRpb25SZXF1ZXN0IENyZWRlbnRpYWxSZXF1ZXN0JHtjcmVkUG9zU3RyfTogdHlwZSBtdXN0IGJlIGRlZmluZWQuYCk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiByZXF1ZXN0LnR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgYEludmFsaWQgUHJlc2VudGF0aW9uUmVxdWVzdCBDcmVkZW50aWFsUmVxdWVzdCR7Y3JlZFBvc1N0cn06IHR5cGUgbXVzdCBiZSBhIHN0cmluZy5gKTtcbiAgICB9XG5cbiAgICBpZiAoIXJlcXVlc3QuaXNzdWVycykge1xuICAgICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsIGBJbnZhbGlkIFByZXNlbnRhdGlvblJlcXVlc3QgQ3JlZGVudGlhbFJlcXVlc3Qke2NyZWRQb3NTdHJ9OiBpc3N1ZXJzIG11c3QgYmUgZGVmaW5lZC5gKTtcbiAgICB9XG4gIH1cbn07XG4vKipcbiAqIFZlcmlmeSB0aGUgUHJlc2VudGF0aW9uUmVxdWVzdCBzaWduYXR1cmUgYXMgYSB3YXkgdG8gc2lkZSBzdGVwIHZlcmlmaWVyIE1JVE0gYXR0YWNrcyB3aGVyZSBhbiBlbnRpdHkgc3Bvb2ZzIHJlcXVlc3RzLlxuICovXG5hc3luYyBmdW5jdGlvbiB2ZXJpZnlQcmVzZW50YXRpb25SZXF1ZXN0IChhdXRob3JpemF0aW9uOiBzdHJpbmcsIHByZXNlbnRhdGlvblJlcXVlc3Q6IFByZXNlbnRhdGlvblJlcXVlc3RQYik6IFByb21pc2U8VW51bUR0bzxWZXJpZmllZFN0YXR1cz4+IHtcbiAgbG9nZ2VyLmRlYnVnKGBWZXJpZnlpbmcgdGhlIHByZXNlbnRhdGlvbiByZXF1ZXN0ICR7cHJlc2VudGF0aW9uUmVxdWVzdC51dWlkfWApO1xuXG4gIGlmICghcHJlc2VudGF0aW9uUmVxdWVzdC5wcm9vZikge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb25SZXF1ZXN0OiBwcm9vZiBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGNvbnN0IHsgcHJvb2Y6IHsgdmVyaWZpY2F0aW9uTWV0aG9kLCBzaWduYXR1cmVWYWx1ZSB9IH0gPSBwcmVzZW50YXRpb25SZXF1ZXN0O1xuXG4gIC8vIGdyYWIgYWxsICdzZWNwMjU2cjEnIGtleXMgZnJvbSB0aGUgRElEIGRvY3VtZW50XG4gIGNvbnN0IHB1YmxpY0tleUluZm9SZXNwb25zZTogVW51bUR0bzxQdWJsaWNLZXlJbmZvW10+ID0gYXdhaXQgZ2V0RGlkRG9jUHVibGljS2V5cyhhdXRob3JpemF0aW9uLCB2ZXJpZmljYXRpb25NZXRob2QsICdzZWNwMjU2cjEnKTtcbiAgY29uc3QgcHVibGljS2V5SW5mb0xpc3Q6IFB1YmxpY0tleUluZm9bXSA9IHB1YmxpY0tleUluZm9SZXNwb25zZS5ib2R5O1xuICBjb25zdCBhdXRoVG9rZW4gPSBwdWJsaWNLZXlJbmZvUmVzcG9uc2UuYXV0aFRva2VuO1xuXG4gIGNvbnN0IHVuc2lnbmVkUHJlc2VudGF0aW9uUmVxdWVzdDogVW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0UGIgPSBvbWl0KHByZXNlbnRhdGlvblJlcXVlc3QsICdwcm9vZicpO1xuXG4gIC8vIGNvbnZlcnQgdG8gYnl0ZXNcbiAgY29uc3QgYnl0ZXM6IFVpbnQ4QXJyYXkgPSBVbnNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3RQYi5lbmNvZGUodW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0KS5maW5pc2goKTtcblxuICBsZXQgaXNWZXJpZmllZCA9IGZhbHNlO1xuXG4gIC8vIGNoZWNrIGFsbCB0aGUgcHVibGljIGtleXMgdG8gc2VlIGlmIGFueSB3b3JrLCBzdG9wIGlmIG9uZSBkb2VzXG4gIGZvciAoY29uc3QgcHVibGljS2V5SW5mbyBvZiBwdWJsaWNLZXlJbmZvTGlzdCkge1xuICAgIC8vIHZlcmlmeSB0aGUgc2lnbmF0dXJlXG4gICAgaXNWZXJpZmllZCA9IGRvVmVyaWZ5KHNpZ25hdHVyZVZhbHVlLCBieXRlcywgcHVibGljS2V5SW5mbyk7XG4gICAgaWYgKGlzVmVyaWZpZWQpIGJyZWFrO1xuICB9XG5cbiAgaWYgKCFpc1ZlcmlmaWVkKSB7XG4gICAgbG9nZ2VyLndhcm4oYFByZXNlbnRhdGlvbiByZXF1ZXN0ICR7cHJlc2VudGF0aW9uUmVxdWVzdC51dWlkfSBzaWduYXR1cmUgY2FuIG5vdCBiZSB2ZXJpZmllZC5gKTtcblxuICAgIGNvbnN0IHJlc3VsdDogVW51bUR0bzxWZXJpZmllZFN0YXR1cz4gPSB7XG4gICAgICBhdXRoVG9rZW4sXG4gICAgICBib2R5OiB7XG4gICAgICAgIGlzVmVyaWZpZWQ6IGZhbHNlLFxuICAgICAgICBtZXNzYWdlOiAnUHJlc2VudGF0aW9uUmVxdWVzdCBzaWduYXR1cmUgY2FuIG5vdCBiZSB2ZXJpZmllZC4nXG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgY29uc3QgcmVzdWx0OiBVbnVtRHRvPFZlcmlmaWVkU3RhdHVzPiA9IHtcbiAgICBhdXRoVG9rZW4sXG4gICAgYm9keToge1xuICAgICAgaXNWZXJpZmllZDogdHJ1ZVxuICAgIH1cbiAgfTtcblxuICBsb2dnZXIuZGVidWcoYFByZXNlbnRhdGlvbiByZXF1ZXN0ICR7cHJlc2VudGF0aW9uUmVxdWVzdC51dWlkfSBzaWduYXR1cmUgdmVyaWZpZWQuYCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogSGFuZGxlciBmb3IgdmVyaWZ5aW5nIGEgcHJvdmlkZWQgZW5jcnlwdGVkIFByZXNlbnRhdGlvbi5cbiAqIEBwYXJhbSBhdXRob3JpemF0aW9uOiBzdHJpbmdcbiAqIEBwYXJhbSBlbmNyeXB0ZWRQcmVzZW50YXRpb246IEVuY3J5cHRlZERhdGFcbiAqIEBwYXJhbSB2ZXJpZmllckRpZDogc3RyaW5nXG4gKi9cbmV4cG9ydCBjb25zdCB2ZXJpZnlQcmVzZW50YXRpb24gPSBhc3luYyAoYXV0aG9yaXphdGlvbjogc3RyaW5nLCBlbmNyeXB0ZWRQcmVzZW50YXRpb246IEVuY3J5cHRlZERhdGEsIHZlcmlmaWVyRGlkOiBzdHJpbmcsIGVuY3J5cHRpb25Qcml2YXRlS2V5OiBzdHJpbmcsIHByZXNlbnRhdGlvblJlcXVlc3Q/OiBQcmVzZW50YXRpb25SZXF1ZXN0RHRvKTogUHJvbWlzZTxVbnVtRHRvPERlY3J5cHRlZFByZXNlbnRhdGlvbj4+ID0+IHtcbiAgdHJ5IHtcbiAgICByZXF1aXJlQXV0aChhdXRob3JpemF0aW9uKTtcblxuICAgIGlmICghZW5jcnlwdGVkUHJlc2VudGF0aW9uKSB7XG4gICAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ2VuY3J5cHRlZFByZXNlbnRhdGlvbiBpcyByZXF1aXJlZC4nKTtcbiAgICB9XG5cbiAgICBpZiAoIXZlcmlmaWVyRGlkKSB7IC8vIHZlcmlmaWVyIGRpZFxuICAgICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICd2ZXJpZmllciBpcyByZXF1aXJlZC4nKTtcbiAgICB9XG5cbiAgICBpZiAoIWVuY3J5cHRpb25Qcml2YXRlS2V5KSB7XG4gICAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ3ZlcmlmaWVyIGVuY3J5cHRpb25Qcml2YXRlS2V5IGlzIHJlcXVpcmVkLicpO1xuICAgIH1cblxuICAgIGlmIChwcmVzZW50YXRpb25SZXF1ZXN0ICYmIHByZXNlbnRhdGlvblJlcXVlc3QudmVyaWZpZXIuZGlkICE9PSB2ZXJpZmllckRpZCkge1xuICAgICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsIGB2ZXJpZmllciBwcm92aWRlZCwgJHt2ZXJpZmllckRpZH0sIGRvZXMgbm90IG1hdGNoIHRoZSBwcmVzZW50YXRpb24gcmVxdWVzdCB2ZXJpZmllciwgJHtwcmVzZW50YXRpb25SZXF1ZXN0LnZlcmlmaWVyLmRpZH0uYCk7XG4gICAgfVxuXG4gICAgLy8gZGVjcnlwdCB0aGUgcHJlc2VudGF0aW9uXG4gICAgY29uc3QgcHJlc2VudGF0aW9uQnl0ZXMgPSBkZWNyeXB0Qnl0ZXMoZW5jcnlwdGlvblByaXZhdGVLZXksIGVuY3J5cHRlZFByZXNlbnRhdGlvbik7XG4gICAgY29uc3QgcHJlc2VudGF0aW9uOiBQcmVzZW50YXRpb25QYiA9IFByZXNlbnRhdGlvblBiLmRlY29kZShwcmVzZW50YXRpb25CeXRlcyk7XG5cbiAgICBpZiAoY29uZmlnRGF0YS5kZWJ1Zykge1xuICAgICAgbG9nZ2VyLmRlYnVnKGBEZWNyeXB0ZWQgUHJlc2VudGF0aW9uOiAke0pTT04uc3RyaW5naWZ5KHByZXNlbnRhdGlvbil9YCk7XG4gICAgfVxuXG4gICAgLy8gdmFsaWRhdGUgcHJlc2VudGF0aW9uXG4gICAgdmFsaWRhdGVQcmVzZW50YXRpb24ocHJlc2VudGF0aW9uKTtcblxuICAgIGlmICghcHJlc2VudGF0aW9uUmVxdWVzdCkge1xuICAgICAgLy8gZ3JhYiB0aGUgcHJlc2VudGF0aW9uIHJlcXVlc3QgZnJvbSBVbnVtIElEIFNhYVMgZm9yIHZlcmlmaWNhdGlvbiBwdXJwb3Nlc1xuICAgICAgY29uc3QgcHJlc2VudGF0aW9uUmVxdWVzdFJlc3BvbnNlID0gYXdhaXQgZ2V0UHJlc2VudGF0aW9uUmVxdWVzdChhdXRob3JpemF0aW9uLCBwcmVzZW50YXRpb24ucHJlc2VudGF0aW9uUmVxdWVzdElkKTtcblxuICAgICAgYXV0aG9yaXphdGlvbiA9IGhhbmRsZUF1dGhUb2tlbkhlYWRlcihwcmVzZW50YXRpb25SZXF1ZXN0UmVzcG9uc2UsIGF1dGhvcml6YXRpb24pO1xuICAgICAgcHJlc2VudGF0aW9uUmVxdWVzdCA9IGV4dHJhY3RQcmVzZW50YXRpb25SZXF1ZXN0KHByZXNlbnRhdGlvblJlcXVlc3RSZXNwb25zZS5ib2R5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbmVlZCB0byBjb252ZXJ0IHRoZSBzdHJpbmcgZGF0ZSBhdHRyaWJ1dGVzIHRvIHRvIERhdGUgb2JqZWN0cyBmb3IgcHJvdG8gaGFuZGxpbmdcbiAgICAgIHByZXNlbnRhdGlvblJlcXVlc3QgPSBoYW5kbGVDb252ZXJ0aW5nUHJlc2VudGF0aW9uUmVxdWVzdERhdGVBdHRyaWJ1dGVzKHByZXNlbnRhdGlvblJlcXVlc3QpO1xuICAgIH1cblxuICAgIC8vIHZlcmlmeSB0aGUgcHJlc2VudGF0aW9uIHJlcXVlc3QgdXVpZCBtYXRjaFxuICAgIGlmIChwcmVzZW50YXRpb25SZXF1ZXN0LnByZXNlbnRhdGlvblJlcXVlc3QuaWQgIT09IHByZXNlbnRhdGlvbi5wcmVzZW50YXRpb25SZXF1ZXN0SWQpIHtcbiAgICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCBgcHJlc2VudGF0aW9uIHJlcXVlc3QgaWQgcHJvdmlkZWQsICR7cHJlc2VudGF0aW9uUmVxdWVzdC5wcmVzZW50YXRpb25SZXF1ZXN0LmlkfSwgZG9lcyBub3QgbWF0Y2ggdGhlIHByZXNlbnRhdGlvblJlcXVlc3RJZCB0aGF0IHRoZSBwcmVzZW50YXRpb24gd2FzIGluIHJlc3BvbnNlIHRvLCAke3ByZXNlbnRhdGlvbi5wcmVzZW50YXRpb25SZXF1ZXN0SWR9LmApO1xuICAgIH1cblxuICAgIC8vIHZlcmlmeSB0aGUgcHJlc2VudGF0aW9uIHJlcXVlc3Qgc2lnbmF0dXJlXG4gICAgaWYgKHByZXNlbnRhdGlvblJlcXVlc3QucHJlc2VudGF0aW9uUmVxdWVzdCkge1xuICAgICAgLy8gdmFsaWRhdGUgdGhlIHByb3ZpZGVkIHByZXNlbnRhdGlvbiByZXF1ZXN0XG4gICAgICBjb25zdCBwcmVzZW50YXRpb25SZXF1ZXN0UGI6IFByZXNlbnRhdGlvblJlcXVlc3RQYiA9IHZhbGlkYXRlUHJlc2VudGF0aW9uUmVxdWVzdChwcmVzZW50YXRpb25SZXF1ZXN0LnByZXNlbnRhdGlvblJlcXVlc3QpO1xuXG4gICAgICBjb25zdCByZXF1ZXN0VmVyaWZpY2F0aW9uUmVzdWx0OiBVbnVtRHRvPFZlcmlmaWVkU3RhdHVzPiA9IGF3YWl0IHZlcmlmeVByZXNlbnRhdGlvblJlcXVlc3QoYXV0aG9yaXphdGlvbiwgcHJlc2VudGF0aW9uUmVxdWVzdFBiKTtcbiAgICAgIGF1dGhvcml6YXRpb24gPSByZXF1ZXN0VmVyaWZpY2F0aW9uUmVzdWx0LmF1dGhUb2tlbjtcblxuICAgICAgLy8gaWYgaW52YWxpZCB0aGVuIGNhbiBzdG9wIGhlcmUgYnV0IHN0aWxsIHNlbmQgYmFjayB0aGUgZGVjcnlwdGVkIHByZXNlbnRhdGlvbiB3aXRoIHRoZSB2ZXJpZmljYXRpb24gcmVzdWx0c1xuICAgICAgaWYgKCFyZXF1ZXN0VmVyaWZpY2F0aW9uUmVzdWx0LmJvZHkuaXNWZXJpZmllZCkge1xuICAgICAgICAvLyBoYW5kbGUgc2VuZGluZyBiYWNrIHRoZSBQcmVzZW50YXRpb25WZXJpZmllZCByZWNlaXB0IHdpdGggdGhlIHJlcXVlc3QgdmVyaWZpY2F0aW9uIGZhaWx1cmUgcmVhc29uXG4gICAgICAgIGNvbnN0IGF1dGhUb2tlbiA9IGF3YWl0IGhhbmRsZVByZXNlbnRhdGlvblZlcmlmaWNhdGlvblJlY2VpcHQocmVxdWVzdFZlcmlmaWNhdGlvblJlc3VsdC5hdXRoVG9rZW4sIHByZXNlbnRhdGlvbiwgdmVyaWZpZXJEaWQsIHJlcXVlc3RWZXJpZmljYXRpb25SZXN1bHQuYm9keS5tZXNzYWdlIGFzIHN0cmluZywgcHJlc2VudGF0aW9uUmVxdWVzdC5wcmVzZW50YXRpb25SZXF1ZXN0LnV1aWQpO1xuXG4gICAgICAgIGNvbnN0IHR5cGUgPSBpc0RlY2xpbmVkUHJlc2VudGF0aW9uKHByZXNlbnRhdGlvbikgPyAnRGVjbGluZWRQcmVzZW50YXRpb24nIDogJ1ZlcmlmaWFibGVQcmVzZW50YXRpb24nO1xuICAgICAgICBjb25zdCByZXN1bHQ6IFVudW1EdG88RGVjcnlwdGVkUHJlc2VudGF0aW9uPiA9IHtcbiAgICAgICAgICBhdXRoVG9rZW4sXG4gICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgLi4ucmVxdWVzdFZlcmlmaWNhdGlvblJlc3VsdC5ib2R5LFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIHByZXNlbnRhdGlvbjogcHJlc2VudGF0aW9uXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGlzRGVjbGluZWRQcmVzZW50YXRpb24ocHJlc2VudGF0aW9uKSkge1xuICAgICAgY29uc3QgdmVyaWZpY2F0aW9uUmVzdWx0OiBVbnVtRHRvPFZlcmlmaWVkU3RhdHVzPiA9IGF3YWl0IHZlcmlmeU5vUHJlc2VudGF0aW9uSGVscGVyKGF1dGhvcml6YXRpb24sIHByZXNlbnRhdGlvbiwgdmVyaWZpZXJEaWQsIHByZXNlbnRhdGlvblJlcXVlc3QucHJlc2VudGF0aW9uUmVxdWVzdC51dWlkKTtcbiAgICAgIGNvbnN0IHJlc3VsdDogVW51bUR0bzxEZWNyeXB0ZWRQcmVzZW50YXRpb24+ID0ge1xuICAgICAgICBhdXRoVG9rZW46IHZlcmlmaWNhdGlvblJlc3VsdC5hdXRoVG9rZW4sXG4gICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAuLi52ZXJpZmljYXRpb25SZXN1bHQuYm9keSxcbiAgICAgICAgICB0eXBlOiAnRGVjbGluZWRQcmVzZW50YXRpb24nLFxuICAgICAgICAgIHByZXNlbnRhdGlvbjogcHJlc2VudGF0aW9uXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgY29uc3QgY3JlZGVudGlhbFJlcXVlc3RzOiBDcmVkZW50aWFsUmVxdWVzdFtdID0gcHJlc2VudGF0aW9uUmVxdWVzdC5wcmVzZW50YXRpb25SZXF1ZXN0LmNyZWRlbnRpYWxSZXF1ZXN0cztcbiAgICBjb25zdCB2ZXJpZmljYXRpb25SZXN1bHQ6IFVudW1EdG88VmVyaWZpZWRTdGF0dXM+ID0gYXdhaXQgdmVyaWZ5UHJlc2VudGF0aW9uSGVscGVyKGF1dGhvcml6YXRpb24sIHByZXNlbnRhdGlvbiwgdmVyaWZpZXJEaWQsIGNyZWRlbnRpYWxSZXF1ZXN0cywgcHJlc2VudGF0aW9uUmVxdWVzdC5wcmVzZW50YXRpb25SZXF1ZXN0LnV1aWQpO1xuICAgIGNvbnN0IHJlc3VsdDogVW51bUR0bzxEZWNyeXB0ZWRQcmVzZW50YXRpb24+ID0ge1xuICAgICAgYXV0aFRva2VuOiB2ZXJpZmljYXRpb25SZXN1bHQuYXV0aFRva2VuLFxuICAgICAgYm9keToge1xuICAgICAgICAuLi52ZXJpZmljYXRpb25SZXN1bHQuYm9keSxcbiAgICAgICAgdHlwZTogJ1ZlcmlmaWFibGVQcmVzZW50YXRpb24nLFxuICAgICAgICBwcmVzZW50YXRpb246IHByZXNlbnRhdGlvblxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIENyeXB0b0Vycm9yKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoYENyeXB0byBlcnJvciBoYW5kbGluZyBlbmNyeXB0ZWQgcHJlc2VudGF0aW9uICR7ZXJyb3J9YCk7XG4gICAgfSBpZiAoZXJyb3IgaW5zdGFuY2VvZiBUeXBlRXJyb3IpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihgVHlwZSBlcnJvciBoYW5kbGluZyBkZWNvZGluZyBwcmVzZW50YXRpb24sIGNyZWRlbnRpYWwgb3IgcHJvb2YgZnJvbSBieXRlcyB0byBwcm90b2J1ZnMgJHtlcnJvcn1gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nZ2VyLmVycm9yKGBFcnJvciBoYW5kbGluZyBlbmNyeXB0ZWQgcHJlc2VudGF0aW9uLiAke2Vycm9yfWApO1xuICAgIH1cblxuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuXG4vKipcbiAqIEhhbmRsZSBzZW5kaW5nIGJhY2sgdGhlIFByZXNlbnRhdGlvblZlcmlmaWVkIHJlY2VpcHQgd2l0aCB0aGUgcmVxdWVzdCB2ZXJpZmljYXRpb24gZmFpbHVyZSByZWFzb25cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlUHJlc2VudGF0aW9uVmVyaWZpY2F0aW9uUmVjZWlwdCAoYXV0aFRva2VuOiBzdHJpbmcsIHByZXNlbnRhdGlvbjogUHJlc2VudGF0aW9uUGIsIHZlcmlmaWVyOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZywgcmVxdWVzdFV1aWQ6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnN0IGNyZWRlbnRpYWxUeXBlcyA9IHByZXNlbnRhdGlvbi52ZXJpZmlhYmxlQ3JlZGVudGlhbCAmJiBpc0FycmF5Tm90RW1wdHkocHJlc2VudGF0aW9uLnZlcmlmaWFibGVDcmVkZW50aWFsKSA/IHByZXNlbnRhdGlvbi52ZXJpZmlhYmxlQ3JlZGVudGlhbC5mbGF0TWFwKGNyZWQgPT4gY3JlZC50eXBlLnNsaWNlKDEpKSA6IFtdOyAvLyBjdXQgb2ZmIHRoZSBwcmVjZWRpbmcgJ1ZlcmlmaWFibGVDcmVkZW50aWFsJyBzdHJpbmcgaW4gZWFjaCBhcnJheVxuICAgIGNvbnN0IGNyZWRlbnRpYWxJZHMgPSBwcmVzZW50YXRpb24udmVyaWZpYWJsZUNyZWRlbnRpYWwgJiYgaXNBcnJheU5vdEVtcHR5KHByZXNlbnRhdGlvbi52ZXJpZmlhYmxlQ3JlZGVudGlhbCkgPyBwcmVzZW50YXRpb24udmVyaWZpYWJsZUNyZWRlbnRpYWwuZmxhdE1hcChjcmVkID0+IGNyZWQuaWQpIDogW107XG4gICAgY29uc3QgaXNzdWVycyA9IHByZXNlbnRhdGlvbi52ZXJpZmlhYmxlQ3JlZGVudGlhbCAmJiBpc0FycmF5Tm90RW1wdHkocHJlc2VudGF0aW9uLnZlcmlmaWFibGVDcmVkZW50aWFsKSA/IHByZXNlbnRhdGlvbi52ZXJpZmlhYmxlQ3JlZGVudGlhbC5tYXAoY3JlZCA9PiBjcmVkLmlzc3VlcikgOiBbXTtcbiAgICBjb25zdCByZXBseSA9IGlzRGVjbGluZWRQcmVzZW50YXRpb24ocHJlc2VudGF0aW9uKSA/ICdkZWNsaW5lZCcgOiAnYXBwcm92ZWQnO1xuICAgIGNvbnN0IHByb29mID0gcHJlc2VudGF0aW9uLnByb29mIGFzIFByb29mUGI7IC8vIGV4aXN0ZW5jZSBoYXMgYWxyZWFkeSBiZWVuIHZhbGlkYXRlZFxuXG4gICAgcmV0dXJuIHNlbmRQcmVzZW50YXRpb25WZXJpZmllZFJlY2VpcHQoYXV0aFRva2VuLCB2ZXJpZmllciwgcHJvb2YudmVyaWZpY2F0aW9uTWV0aG9kLCByZXBseSwgZmFsc2UsIHByZXNlbnRhdGlvbi5wcmVzZW50YXRpb25SZXF1ZXN0SWQsIHJlcXVlc3RVdWlkLCBtZXNzYWdlLCBpc3N1ZXJzLCBjcmVkZW50aWFsVHlwZXMsIGNyZWRlbnRpYWxJZHMpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgbG9nZ2VyLmVycm9yKCdTb21ldGhpbmcgd2VudCB3cm9uZyBoYW5kbGluZyB0aGUgUHJlc2VudGF0aW9uVmVyaWZpY2F0aW9uIHJlY2VpcHQgZm9yIHRoZSBhIGZhaWxlZCByZXF1ZXN0IHZlcmlmaWNhdGlvbicpO1xuICB9XG5cbiAgcmV0dXJuIGF1dGhUb2tlbjtcbn1cbiJdfQ==