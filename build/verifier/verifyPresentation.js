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
exports.verifyPresentation = void 0;
var lodash_1 = __importStar(require("lodash"));
var config_1 = require("../config");
var validateProof_1 = require("./validateProof");
var requireAuth_1 = require("../requireAuth");
var verifyCredential_1 = require("./verifyCredential");
var isCredentialExpired_1 = require("./isCredentialExpired");
var checkCredentialStatus_1 = require("./checkCredentialStatus");
var library_issuer_verifier_utility_1 = require("@unumid/library-issuer-verifier-utility");
var logger_1 = __importDefault(require("../logger"));
var library_crypto_1 = require("@unumid/library-crypto");
/**
 * Validates the attributes for a credential request to UnumID's SaaS.
 * @param credentials JSONObj
 */
var validateCredentialInput = function (credentials) {
    var retObj = { valStat: true };
    if (library_issuer_verifier_utility_1.isArrayEmpty(credentials)) {
        retObj.valStat = false;
        retObj.msg = 'Invalid Presentation: verifiableCredential must be a non-empty array.';
        return (retObj);
    }
    var totCred = credentials.length;
    for (var i = 0; i < totCred; i++) {
        var credPosStr = '[' + i + ']';
        var credential = credentials[i];
        // Validate the existance of elements in verifiableCredential object
        var invalidMsg = "Invalid verifiableCredential" + credPosStr + ":";
        if (!credential['@context']) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " @context is required.";
            break;
        }
        if (!credential.credentialStatus) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " credentialStatus is required.";
            break;
        }
        if (!credential.credentialSubject) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " credentialSubject is required.";
            break;
        }
        if (!credential.issuer) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " issuer is required.";
            break;
        }
        if (!credential.type) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " type is required.";
            break;
        }
        if (!credential.id) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " id is required.";
            break;
        }
        if (!credential.issuanceDate) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " issuanceDate is required.";
            break;
        }
        if (!credential.proof) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " proof is required.";
            break;
        }
        // Check @context is an array and not empty
        if (library_issuer_verifier_utility_1.isArrayEmpty(credential['@context'])) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " @context must be a non-empty array.";
            break;
        }
        // Check CredentialStatus object has id and type elements.
        if (!credential.credentialStatus.id || !credential.credentialStatus.type) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " credentialStatus must contain id and type properties.";
            break;
        }
        // Check credentialSubject object has id element.
        if (!credential.credentialSubject.id) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " credentialSubject must contain id property.";
            break;
        }
        // Check type is an array and not empty
        if (library_issuer_verifier_utility_1.isArrayEmpty(credential.type)) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " type must be a non-empty array.";
            break;
        }
        // Check that proof object is valid
        validateProof_1.validateProof(credential.proof);
    }
    return (retObj);
};
/**
 * Validates the presentation object has the proper attributes.
 * @param presentation Presentation
 */
var validatePresentation = function (presentation) {
    var context = presentation['@context'];
    var type = presentation.type, verifiableCredential = presentation.verifiableCredential, proof = presentation.proof, presentationRequestUuid = presentation.presentationRequestUuid;
    var retObj = {};
    // validate required fields
    if (!context) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: @context is required.');
    }
    if (!type) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: type is required.');
    }
    if (!verifiableCredential) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: verifiableCredential is required.');
    }
    if (!proof) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: proof is required.');
    }
    if (!presentationRequestUuid) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: presentationRequestUuid is required.');
    }
    if (library_issuer_verifier_utility_1.isArrayEmpty(context)) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: @context must be a non-empty array.');
    }
    if (library_issuer_verifier_utility_1.isArrayEmpty(type)) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: type must be a non-empty array.');
    }
    retObj = validateCredentialInput(verifiableCredential);
    if (!retObj.valStat) {
        throw new library_issuer_verifier_utility_1.CustError(400, retObj.msg);
    }
    // Check proof object is formatted correctly
    validateProof_1.validateProof(proof);
};
/**
 * Verify the signature on the provided data object.
 * @param signature
 * @param data
 * @param publicKey
 * @param encoding String ('base58' | 'pem'), defaults to 'pem'
 */
var doVerifyString = function (signature, dataString, data, publicKey, encoding) {
    if (encoding === void 0) { encoding = 'pem'; }
    logger_1.default.debug("Presentation Signature STRING verification using public key " + publicKey);
    var result = library_crypto_1.verifyString(signature, dataString, publicKey, encoding);
    logger_1.default.debug("Presentation Signature STRING is valid: " + result + ".");
    var finalResult = false;
    if (result) {
        // need to also verify that the stringData converted to an object matches the data object
        finalResult = lodash_1.default.isEqual(data, JSON.parse(dataString));
    }
    logger_1.default.debug("Presentation Signature STRING is valid FINAL: " + finalResult + ".");
    return finalResult;
};
/**
 * Handler to send information regarding the user agreeing to share a credential Presentation.
 * @param authorization
 * @param presentation
 * @param verifier
 */
exports.verifyPresentation = function (authorization, presentation, verifier) { return __awaiter(void 0, void 0, void 0, function () {
    var data, proof, didDocumentResponse, authToken, pubKeyObj, result_1, isPresentationDataVerified, isPresentationStringVerified, isPresentationVerified, areCredentialsValid, _i, _a, credential, isExpired, isStatusValidResponse, isStatusValid, isVerifiedResponse, isVerified_1, result_2, result_3, isVerified, credentialTypes, issuers, subject, receiptOptions, receiptCallOptions, resp, result, error_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 8, , 9]);
                requireAuth_1.requireAuth(authorization);
                if (!presentation) {
                    throw new library_issuer_verifier_utility_1.CustError(400, 'presentation is required.');
                }
                if (!verifier) {
                    throw new library_issuer_verifier_utility_1.CustError(400, 'verifier is required.');
                }
                validatePresentation(presentation);
                data = lodash_1.omit(presentation, 'proof');
                proof = presentation.proof;
                return [4 /*yield*/, library_issuer_verifier_utility_1.getDIDDoc(config_1.configData.SaaSUrl, authorization, proof.verificationMethod)];
            case 1:
                didDocumentResponse = _c.sent();
                if (didDocumentResponse instanceof Error) {
                    throw didDocumentResponse;
                }
                authToken = library_issuer_verifier_utility_1.handleAuthToken(didDocumentResponse);
                pubKeyObj = library_issuer_verifier_utility_1.getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');
                if (pubKeyObj.length === 0) {
                    result_1 = {
                        authToken: authToken,
                        body: {
                            isVerified: false,
                            message: 'Public key not found for the DID associated with the proof.verificationMethod'
                        }
                    };
                    return [2 /*return*/, result_1];
                }
                isPresentationDataVerified = library_issuer_verifier_utility_1.doVerify(proof.signatureValue, data, pubKeyObj[0].publicKey, pubKeyObj[0].encoding);
                isPresentationStringVerified = (_b = !isPresentationDataVerified) !== null && _b !== void 0 ? _b : doVerifyString(proof.signatureValue, proof.unsignedValue, data, pubKeyObj[0].publicKey, pubKeyObj[0].encoding);
                isPresentationVerified = isPresentationDataVerified || isPresentationStringVerified;
                areCredentialsValid = true;
                _i = 0, _a = presentation.verifiableCredential;
                _c.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 6];
                credential = _a[_i];
                isExpired = isCredentialExpired_1.isCredentialExpired(credential);
                if (isExpired) {
                    areCredentialsValid = false;
                    return [3 /*break*/, 6];
                }
                return [4 /*yield*/, checkCredentialStatus_1.checkCredentialStatus(credential, authToken)];
            case 3:
                isStatusValidResponse = _c.sent();
                isStatusValid = isStatusValidResponse.body;
                authToken = isStatusValidResponse.authToken;
                if (!isStatusValid) {
                    areCredentialsValid = false;
                    return [3 /*break*/, 6];
                }
                return [4 /*yield*/, verifyCredential_1.verifyCredential(credential, authToken)];
            case 4:
                isVerifiedResponse = _c.sent();
                isVerified_1 = isVerifiedResponse.body;
                authToken = isVerifiedResponse.authToken;
                if (!isVerified_1) {
                    areCredentialsValid = false;
                    return [3 /*break*/, 6];
                }
                _c.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 2];
            case 6:
                if (!isPresentationVerified) {
                    result_2 = {
                        authToken: authToken,
                        body: {
                            isVerified: false,
                            message: 'Presentation signature can no be verified'
                        }
                    };
                    return [2 /*return*/, result_2];
                }
                if (!areCredentialsValid) {
                    result_3 = {
                        authToken: authToken,
                        body: {
                            isVerified: false,
                            message: 'Credential signature can not be verified.'
                        }
                    };
                    return [2 /*return*/, result_3];
                }
                isVerified = isPresentationVerified && areCredentialsValid;
                credentialTypes = presentation.verifiableCredential.flatMap(function (cred) { return cred.type.slice(1); });
                issuers = presentation.verifiableCredential.map(function (cred) { return cred.issuer; });
                subject = proof.verificationMethod;
                receiptOptions = {
                    type: ['PresentationVerified'],
                    verifier: verifier,
                    subject: subject,
                    data: {
                        credentialTypes: credentialTypes,
                        issuers: issuers,
                        isVerified: isVerified
                    }
                };
                receiptCallOptions = {
                    method: 'POST',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'receipt',
                    header: { Authorization: authToken },
                    data: receiptOptions
                };
                return [4 /*yield*/, library_issuer_verifier_utility_1.makeNetworkRequest(receiptCallOptions)];
            case 7:
                resp = _c.sent();
                authToken = library_issuer_verifier_utility_1.handleAuthToken(resp);
                result = {
                    authToken: authToken,
                    body: {
                        isVerified: isVerified
                    }
                };
                return [2 /*return*/, result];
            case 8:
                error_1 = _c.sent();
                logger_1.default.error('Error sending a verifyPresentation request to UnumID Saas.', error_1);
                throw error_1;
            case 9: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5UHJlc2VudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3ZlcmlmaWVyL3ZlcmlmeVByZXNlbnRhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsK0NBQWlDO0FBRWpDLG9DQUF1QztBQUV2QyxpREFBZ0Q7QUFDaEQsOENBQTZDO0FBQzdDLHVEQUFzRDtBQUN0RCw2REFBNEQ7QUFDNUQsaUVBQWdFO0FBQ2hFLDJGQUF1TTtBQUN2TSxxREFBK0I7QUFDL0IseURBQXNEO0FBRXREOzs7R0FHRztBQUNILElBQU0sdUJBQXVCLEdBQUcsVUFBQyxXQUFvQjtJQUNuRCxJQUFNLE1BQU0sR0FBWSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUUxQyxJQUFJLDhDQUFZLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDN0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDdkIsTUFBTSxDQUFDLEdBQUcsR0FBRyx1RUFBdUUsQ0FBQztRQUVyRixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDakI7SUFFRCxJQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO0lBQ25DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDaEMsSUFBTSxVQUFVLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDakMsSUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWxDLG9FQUFvRTtRQUNwRSxJQUFNLFVBQVUsR0FBRyxpQ0FBK0IsVUFBVSxNQUFHLENBQUM7UUFDaEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUMzQixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUN2QixNQUFNLENBQUMsR0FBRyxHQUFNLFVBQVUsMkJBQXdCLENBQUM7WUFDbkQsTUFBTTtTQUNQO1FBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRTtZQUNoQyxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUN2QixNQUFNLENBQUMsR0FBRyxHQUFNLFVBQVUsbUNBQWdDLENBQUM7WUFDM0QsTUFBTTtTQUNQO1FBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRTtZQUNqQyxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUN2QixNQUFNLENBQUMsR0FBRyxHQUFNLFVBQVUsb0NBQWlDLENBQUM7WUFDNUQsTUFBTTtTQUNQO1FBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7WUFDdEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDdkIsTUFBTSxDQUFDLEdBQUcsR0FBTSxVQUFVLHlCQUFzQixDQUFDO1lBQ2pELE1BQU07U0FDUDtRQUVELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFO1lBQ3BCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxHQUFHLEdBQU0sVUFBVSx1QkFBb0IsQ0FBQztZQUMvQyxNQUFNO1NBQ1A7UUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRTtZQUNsQixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUN2QixNQUFNLENBQUMsR0FBRyxHQUFNLFVBQVUscUJBQWtCLENBQUM7WUFDN0MsTUFBTTtTQUNQO1FBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUU7WUFDNUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDdkIsTUFBTSxDQUFDLEdBQUcsR0FBTSxVQUFVLCtCQUE0QixDQUFDO1lBQ3ZELE1BQU07U0FDUDtRQUVELElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFO1lBQ3JCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxHQUFHLEdBQU0sVUFBVSx3QkFBcUIsQ0FBQztZQUNoRCxNQUFNO1NBQ1A7UUFFRCwyQ0FBMkM7UUFDM0MsSUFBSSw4Q0FBWSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFO1lBQ3hDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxHQUFHLEdBQU0sVUFBVSx5Q0FBc0MsQ0FBQztZQUNqRSxNQUFNO1NBQ1A7UUFFRCwwREFBMEQ7UUFDMUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFO1lBQ3hFLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxHQUFHLEdBQU0sVUFBVSwyREFBd0QsQ0FBQztZQUNuRixNQUFNO1NBQ1A7UUFFRCxpREFBaUQ7UUFDakQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUU7WUFDcEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDdkIsTUFBTSxDQUFDLEdBQUcsR0FBTSxVQUFVLGlEQUE4QyxDQUFDO1lBQ3pFLE1BQU07U0FDUDtRQUVELHVDQUF1QztRQUN2QyxJQUFJLDhDQUFZLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2pDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxHQUFHLEdBQU0sVUFBVSxxQ0FBa0MsQ0FBQztZQUM3RCxNQUFNO1NBQ1A7UUFFRCxtQ0FBbUM7UUFDbkMsNkJBQWEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDakM7SUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbEIsQ0FBQyxDQUFDO0FBRUY7OztHQUdHO0FBQ0gsSUFBTSxvQkFBb0IsR0FBRyxVQUFDLFlBQTBCO0lBQ3RELElBQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNqQyxJQUFBLElBQUksR0FBMkQsWUFBWSxLQUF2RSxFQUFFLG9CQUFvQixHQUFxQyxZQUFZLHFCQUFqRCxFQUFFLEtBQUssR0FBOEIsWUFBWSxNQUExQyxFQUFFLHVCQUF1QixHQUFLLFlBQVksd0JBQWpCLENBQWtCO0lBQ3BGLElBQUksTUFBTSxHQUFZLEVBQUUsQ0FBQztJQUV6QiwyQkFBMkI7SUFDM0IsSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUNaLE1BQU0sSUFBSSwyQ0FBUyxDQUFDLEdBQUcsRUFBRSw2Q0FBNkMsQ0FBQyxDQUFDO0tBQ3pFO0lBRUQsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNULE1BQU0sSUFBSSwyQ0FBUyxDQUFDLEdBQUcsRUFBRSx5Q0FBeUMsQ0FBQyxDQUFDO0tBQ3JFO0lBRUQsSUFBSSxDQUFDLG9CQUFvQixFQUFFO1FBQ3pCLE1BQU0sSUFBSSwyQ0FBUyxDQUFDLEdBQUcsRUFBRSx5REFBeUQsQ0FBQyxDQUFDO0tBQ3JGO0lBRUQsSUFBSSxDQUFDLEtBQUssRUFBRTtRQUNWLE1BQU0sSUFBSSwyQ0FBUyxDQUFDLEdBQUcsRUFBRSwwQ0FBMEMsQ0FBQyxDQUFDO0tBQ3RFO0lBRUQsSUFBSSxDQUFDLHVCQUF1QixFQUFFO1FBQzVCLE1BQU0sSUFBSSwyQ0FBUyxDQUFDLEdBQUcsRUFBRSw0REFBNEQsQ0FBQyxDQUFDO0tBQ3hGO0lBRUQsSUFBSSw4Q0FBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ3pCLE1BQU0sSUFBSSwyQ0FBUyxDQUFDLEdBQUcsRUFBRSwyREFBMkQsQ0FBQyxDQUFDO0tBQ3ZGO0lBRUQsSUFBSSw4Q0FBWSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3RCLE1BQU0sSUFBSSwyQ0FBUyxDQUFDLEdBQUcsRUFBRSx1REFBdUQsQ0FBQyxDQUFDO0tBQ25GO0lBRUQsTUFBTSxHQUFHLHVCQUF1QixDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDdkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7UUFDbkIsTUFBTSxJQUFJLDJDQUFTLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUN0QztJQUVELDRDQUE0QztJQUM1Qyw2QkFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3ZCLENBQUMsQ0FBQztBQUVGOzs7Ozs7R0FNRztBQUNILElBQU0sY0FBYyxHQUFHLFVBQUMsU0FBaUIsRUFBRSxVQUFrQixFQUFFLElBQWEsRUFBRSxTQUFpQixFQUFFLFFBQWtDO0lBQWxDLHlCQUFBLEVBQUEsZ0JBQWtDO0lBQ2pJLGdCQUFNLENBQUMsS0FBSyxDQUFDLGlFQUErRCxTQUFXLENBQUMsQ0FBQztJQUN6RixJQUFNLE1BQU0sR0FBVyw2QkFBWSxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBRWhGLGdCQUFNLENBQUMsS0FBSyxDQUFDLDZDQUEyQyxNQUFNLE1BQUcsQ0FBQyxDQUFDO0lBQ25FLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztJQUN4QixJQUFJLE1BQU0sRUFBRTtRQUNWLHlGQUF5RjtRQUN6RixXQUFXLEdBQUcsZ0JBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztLQUN2RDtJQUVELGdCQUFNLENBQUMsS0FBSyxDQUFDLG1EQUFpRCxXQUFXLE1BQUcsQ0FBQyxDQUFDO0lBQzlFLE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUMsQ0FBQztBQUVGOzs7OztHQUtHO0FBQ1UsUUFBQSxrQkFBa0IsR0FBRyxVQUFPLGFBQXFCLEVBQUUsWUFBMEIsRUFBRSxRQUFnQjs7Ozs7OztnQkFFeEcseUJBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFFM0IsSUFBSSxDQUFDLFlBQVksRUFBRTtvQkFDakIsTUFBTSxJQUFJLDJDQUFTLENBQUMsR0FBRyxFQUFFLDJCQUEyQixDQUFDLENBQUM7aUJBQ3ZEO2dCQUVELElBQUksQ0FBQyxRQUFRLEVBQUU7b0JBQ2IsTUFBTSxJQUFJLDJDQUFTLENBQUMsR0FBRyxFQUFFLHVCQUF1QixDQUFDLENBQUM7aUJBQ25EO2dCQUVELG9CQUFvQixDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUM3QixJQUFJLEdBQUcsYUFBSSxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFFbkMsS0FBSyxHQUFVLFlBQVksQ0FBQyxLQUFLLENBQUM7Z0JBR1oscUJBQU0sMkNBQVMsQ0FBQyxtQkFBVSxDQUFDLE9BQU8sRUFBRSxhQUF1QixFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxFQUFBOztnQkFBNUcsbUJBQW1CLEdBQUcsU0FBc0Y7Z0JBRWxILElBQUksbUJBQW1CLFlBQVksS0FBSyxFQUFFO29CQUN4QyxNQUFNLG1CQUFtQixDQUFDO2lCQUMzQjtnQkFFRyxTQUFTLEdBQVcsaURBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUN2RCxTQUFTLEdBQW9CLGtEQUFnQixDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFFM0YsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDcEIsV0FBa0M7d0JBQ3RDLFNBQVMsV0FBQTt3QkFDVCxJQUFJLEVBQUU7NEJBQ0osVUFBVSxFQUFFLEtBQUs7NEJBQ2pCLE9BQU8sRUFBRSwrRUFBK0U7eUJBQ3pGO3FCQUNGLENBQUM7b0JBQ0Ysc0JBQU8sUUFBTSxFQUFDO2lCQUNmO2dCQU9LLDBCQUEwQixHQUFZLDBDQUFRLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzFILDRCQUE0QixTQUFZLENBQUMsMEJBQTBCLG1DQUFJLGNBQWMsQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUV0TCxzQkFBc0IsR0FBWSwwQkFBMEIsSUFBSSw0QkFBNEIsQ0FBQztnQkFFL0YsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO3NCQUUyQixFQUFqQyxLQUFBLFlBQVksQ0FBQyxvQkFBb0I7OztxQkFBakMsQ0FBQSxjQUFpQyxDQUFBO2dCQUEvQyxVQUFVO2dCQUNiLFNBQVMsR0FBRyx5Q0FBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFFbEQsSUFBSSxTQUFTLEVBQUU7b0JBQ2IsbUJBQW1CLEdBQUcsS0FBSyxDQUFDO29CQUM1Qix3QkFBTTtpQkFDUDtnQkFFK0MscUJBQU0sNkNBQXFCLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxFQUFBOztnQkFBNUYscUJBQXFCLEdBQXFCLFNBQWtEO2dCQUM1RixhQUFhLEdBQUcscUJBQXFCLENBQUMsSUFBSSxDQUFDO2dCQUNqRCxTQUFTLEdBQUcscUJBQXFCLENBQUMsU0FBUyxDQUFDO2dCQUU1QyxJQUFJLENBQUMsYUFBYSxFQUFFO29CQUNsQixtQkFBbUIsR0FBRyxLQUFLLENBQUM7b0JBQzVCLHdCQUFNO2lCQUNQO2dCQUU0QyxxQkFBTSxtQ0FBZ0IsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLEVBQUE7O2dCQUFwRixrQkFBa0IsR0FBcUIsU0FBNkM7Z0JBQ3BGLGVBQWEsa0JBQWtCLENBQUMsSUFBSSxDQUFDO2dCQUMzQyxTQUFTLEdBQUcsa0JBQWtCLENBQUMsU0FBUyxDQUFDO2dCQUV6QyxJQUFJLENBQUMsWUFBVSxFQUFFO29CQUNmLG1CQUFtQixHQUFHLEtBQUssQ0FBQztvQkFDNUIsd0JBQU07aUJBQ1A7OztnQkF4QnNCLElBQWlDLENBQUE7OztnQkEyQjFELElBQUksQ0FBQyxzQkFBc0IsRUFBRTtvQkFDckIsV0FBa0M7d0JBQ3RDLFNBQVMsV0FBQTt3QkFDVCxJQUFJLEVBQUU7NEJBQ0osVUFBVSxFQUFFLEtBQUs7NEJBQ2pCLE9BQU8sRUFBRSwyQ0FBMkM7eUJBQ3JEO3FCQUNGLENBQUM7b0JBQ0Ysc0JBQU8sUUFBTSxFQUFDO2lCQUNmO2dCQUVELElBQUksQ0FBQyxtQkFBbUIsRUFBRTtvQkFDbEIsV0FBa0M7d0JBQ3RDLFNBQVMsV0FBQTt3QkFDVCxJQUFJLEVBQUU7NEJBQ0osVUFBVSxFQUFFLEtBQUs7NEJBQ2pCLE9BQU8sRUFBRSwyQ0FBMkM7eUJBQ3JEO3FCQUNGLENBQUM7b0JBQ0Ysc0JBQU8sUUFBTSxFQUFDO2lCQUNmO2dCQUVLLFVBQVUsR0FBRyxzQkFBc0IsSUFBSSxtQkFBbUIsQ0FBQztnQkFDM0QsZUFBZSxHQUFHLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO2dCQUN4RixPQUFPLEdBQUcsWUFBWSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxNQUFNLEVBQVgsQ0FBVyxDQUFDLENBQUM7Z0JBQ3JFLE9BQU8sR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUM7Z0JBQ25DLGNBQWMsR0FBRztvQkFDckIsSUFBSSxFQUFFLENBQUMsc0JBQXNCLENBQUM7b0JBQzlCLFFBQVEsVUFBQTtvQkFDUixPQUFPLFNBQUE7b0JBQ1AsSUFBSSxFQUFFO3dCQUNKLGVBQWUsaUJBQUE7d0JBQ2YsT0FBTyxTQUFBO3dCQUNQLFVBQVUsWUFBQTtxQkFDWDtpQkFDRixDQUFDO2dCQUVJLGtCQUFrQixHQUFhO29CQUNuQyxNQUFNLEVBQUUsTUFBTTtvQkFDZCxPQUFPLEVBQUUsbUJBQVUsQ0FBQyxPQUFPO29CQUMzQixRQUFRLEVBQUUsU0FBUztvQkFDbkIsTUFBTSxFQUFFLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRTtvQkFDcEMsSUFBSSxFQUFFLGNBQWM7aUJBQ3JCLENBQUM7Z0JBRW9CLHFCQUFNLG9EQUFrQixDQUFVLGtCQUFrQixDQUFDLEVBQUE7O2dCQUFyRSxJQUFJLEdBQVksU0FBcUQ7Z0JBQzNFLFNBQVMsR0FBRyxpREFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUU1QixNQUFNLEdBQTRCO29CQUN0QyxTQUFTLFdBQUE7b0JBQ1QsSUFBSSxFQUFFO3dCQUNKLFVBQVUsWUFBQTtxQkFDWDtpQkFDRixDQUFDO2dCQUVGLHNCQUFPLE1BQU0sRUFBQzs7O2dCQUVkLGdCQUFNLENBQUMsS0FBSyxDQUFDLDREQUE0RCxFQUFFLE9BQUssQ0FBQyxDQUFDO2dCQUNsRixNQUFNLE9BQUssQ0FBQzs7OztLQUVmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXywgeyBvbWl0IH0gZnJvbSAnbG9kYXNoJztcblxuaW1wb3J0IHsgY29uZmlnRGF0YSB9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQgeyBQcmVzZW50YXRpb24sIFVudW1EdG8sIFZlcmlmaWVkU3RhdHVzIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgdmFsaWRhdGVQcm9vZiB9IGZyb20gJy4vdmFsaWRhdGVQcm9vZic7XG5pbXBvcnQgeyByZXF1aXJlQXV0aCB9IGZyb20gJy4uL3JlcXVpcmVBdXRoJztcbmltcG9ydCB7IHZlcmlmeUNyZWRlbnRpYWwgfSBmcm9tICcuL3ZlcmlmeUNyZWRlbnRpYWwnO1xuaW1wb3J0IHsgaXNDcmVkZW50aWFsRXhwaXJlZCB9IGZyb20gJy4vaXNDcmVkZW50aWFsRXhwaXJlZCc7XG5pbXBvcnQgeyBjaGVja0NyZWRlbnRpYWxTdGF0dXMgfSBmcm9tICcuL2NoZWNrQ3JlZGVudGlhbFN0YXR1cyc7XG5pbXBvcnQgeyBKU09OT2JqLCBDdXN0RXJyb3IsIFByb29mLCBnZXRESUREb2MsIFB1YmxpY0tleUluZm8sIGdldEtleUZyb21ESUREb2MsIGRvVmVyaWZ5LCBSRVNURGF0YSwgbWFrZU5ldHdvcmtSZXF1ZXN0LCBpc0FycmF5RW1wdHksIGhhbmRsZUF1dGhUb2tlbiB9IGZyb20gJ0B1bnVtaWQvbGlicmFyeS1pc3N1ZXItdmVyaWZpZXItdXRpbGl0eSc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyB2ZXJpZnlTdHJpbmcgfSBmcm9tICdAdW51bWlkL2xpYnJhcnktY3J5cHRvJztcblxuLyoqXG4gKiBWYWxpZGF0ZXMgdGhlIGF0dHJpYnV0ZXMgZm9yIGEgY3JlZGVudGlhbCByZXF1ZXN0IHRvIFVudW1JRCdzIFNhYVMuXG4gKiBAcGFyYW0gY3JlZGVudGlhbHMgSlNPTk9ialxuICovXG5jb25zdCB2YWxpZGF0ZUNyZWRlbnRpYWxJbnB1dCA9IChjcmVkZW50aWFsczogSlNPTk9iaik6IEpTT05PYmogPT4ge1xuICBjb25zdCByZXRPYmo6IEpTT05PYmogPSB7IHZhbFN0YXQ6IHRydWUgfTtcblxuICBpZiAoaXNBcnJheUVtcHR5KGNyZWRlbnRpYWxzKSkge1xuICAgIHJldE9iai52YWxTdGF0ID0gZmFsc2U7XG4gICAgcmV0T2JqLm1zZyA9ICdJbnZhbGlkIFByZXNlbnRhdGlvbjogdmVyaWZpYWJsZUNyZWRlbnRpYWwgbXVzdCBiZSBhIG5vbi1lbXB0eSBhcnJheS4nO1xuXG4gICAgcmV0dXJuIChyZXRPYmopO1xuICB9XG5cbiAgY29uc3QgdG90Q3JlZCA9IGNyZWRlbnRpYWxzLmxlbmd0aDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b3RDcmVkOyBpKyspIHtcbiAgICBjb25zdCBjcmVkUG9zU3RyID0gJ1snICsgaSArICddJztcbiAgICBjb25zdCBjcmVkZW50aWFsID0gY3JlZGVudGlhbHNbaV07XG5cbiAgICAvLyBWYWxpZGF0ZSB0aGUgZXhpc3RhbmNlIG9mIGVsZW1lbnRzIGluIHZlcmlmaWFibGVDcmVkZW50aWFsIG9iamVjdFxuICAgIGNvbnN0IGludmFsaWRNc2cgPSBgSW52YWxpZCB2ZXJpZmlhYmxlQ3JlZGVudGlhbCR7Y3JlZFBvc1N0cn06YDtcbiAgICBpZiAoIWNyZWRlbnRpYWxbJ0Bjb250ZXh0J10pIHtcbiAgICAgIHJldE9iai52YWxTdGF0ID0gZmFsc2U7XG4gICAgICByZXRPYmoubXNnID0gYCR7aW52YWxpZE1zZ30gQGNvbnRleHQgaXMgcmVxdWlyZWQuYDtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmICghY3JlZGVudGlhbC5jcmVkZW50aWFsU3RhdHVzKSB7XG4gICAgICByZXRPYmoudmFsU3RhdCA9IGZhbHNlO1xuICAgICAgcmV0T2JqLm1zZyA9IGAke2ludmFsaWRNc2d9IGNyZWRlbnRpYWxTdGF0dXMgaXMgcmVxdWlyZWQuYDtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmICghY3JlZGVudGlhbC5jcmVkZW50aWFsU3ViamVjdCkge1xuICAgICAgcmV0T2JqLnZhbFN0YXQgPSBmYWxzZTtcbiAgICAgIHJldE9iai5tc2cgPSBgJHtpbnZhbGlkTXNnfSBjcmVkZW50aWFsU3ViamVjdCBpcyByZXF1aXJlZC5gO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKCFjcmVkZW50aWFsLmlzc3Vlcikge1xuICAgICAgcmV0T2JqLnZhbFN0YXQgPSBmYWxzZTtcbiAgICAgIHJldE9iai5tc2cgPSBgJHtpbnZhbGlkTXNnfSBpc3N1ZXIgaXMgcmVxdWlyZWQuYDtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmICghY3JlZGVudGlhbC50eXBlKSB7XG4gICAgICByZXRPYmoudmFsU3RhdCA9IGZhbHNlO1xuICAgICAgcmV0T2JqLm1zZyA9IGAke2ludmFsaWRNc2d9IHR5cGUgaXMgcmVxdWlyZWQuYDtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmICghY3JlZGVudGlhbC5pZCkge1xuICAgICAgcmV0T2JqLnZhbFN0YXQgPSBmYWxzZTtcbiAgICAgIHJldE9iai5tc2cgPSBgJHtpbnZhbGlkTXNnfSBpZCBpcyByZXF1aXJlZC5gO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKCFjcmVkZW50aWFsLmlzc3VhbmNlRGF0ZSkge1xuICAgICAgcmV0T2JqLnZhbFN0YXQgPSBmYWxzZTtcbiAgICAgIHJldE9iai5tc2cgPSBgJHtpbnZhbGlkTXNnfSBpc3N1YW5jZURhdGUgaXMgcmVxdWlyZWQuYDtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmICghY3JlZGVudGlhbC5wcm9vZikge1xuICAgICAgcmV0T2JqLnZhbFN0YXQgPSBmYWxzZTtcbiAgICAgIHJldE9iai5tc2cgPSBgJHtpbnZhbGlkTXNnfSBwcm9vZiBpcyByZXF1aXJlZC5gO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgQGNvbnRleHQgaXMgYW4gYXJyYXkgYW5kIG5vdCBlbXB0eVxuICAgIGlmIChpc0FycmF5RW1wdHkoY3JlZGVudGlhbFsnQGNvbnRleHQnXSkpIHtcbiAgICAgIHJldE9iai52YWxTdGF0ID0gZmFsc2U7XG4gICAgICByZXRPYmoubXNnID0gYCR7aW52YWxpZE1zZ30gQGNvbnRleHQgbXVzdCBiZSBhIG5vbi1lbXB0eSBhcnJheS5gO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgQ3JlZGVudGlhbFN0YXR1cyBvYmplY3QgaGFzIGlkIGFuZCB0eXBlIGVsZW1lbnRzLlxuICAgIGlmICghY3JlZGVudGlhbC5jcmVkZW50aWFsU3RhdHVzLmlkIHx8ICFjcmVkZW50aWFsLmNyZWRlbnRpYWxTdGF0dXMudHlwZSkge1xuICAgICAgcmV0T2JqLnZhbFN0YXQgPSBmYWxzZTtcbiAgICAgIHJldE9iai5tc2cgPSBgJHtpbnZhbGlkTXNnfSBjcmVkZW50aWFsU3RhdHVzIG11c3QgY29udGFpbiBpZCBhbmQgdHlwZSBwcm9wZXJ0aWVzLmA7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBDaGVjayBjcmVkZW50aWFsU3ViamVjdCBvYmplY3QgaGFzIGlkIGVsZW1lbnQuXG4gICAgaWYgKCFjcmVkZW50aWFsLmNyZWRlbnRpYWxTdWJqZWN0LmlkKSB7XG4gICAgICByZXRPYmoudmFsU3RhdCA9IGZhbHNlO1xuICAgICAgcmV0T2JqLm1zZyA9IGAke2ludmFsaWRNc2d9IGNyZWRlbnRpYWxTdWJqZWN0IG11c3QgY29udGFpbiBpZCBwcm9wZXJ0eS5gO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdHlwZSBpcyBhbiBhcnJheSBhbmQgbm90IGVtcHR5XG4gICAgaWYgKGlzQXJyYXlFbXB0eShjcmVkZW50aWFsLnR5cGUpKSB7XG4gICAgICByZXRPYmoudmFsU3RhdCA9IGZhbHNlO1xuICAgICAgcmV0T2JqLm1zZyA9IGAke2ludmFsaWRNc2d9IHR5cGUgbXVzdCBiZSBhIG5vbi1lbXB0eSBhcnJheS5gO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhhdCBwcm9vZiBvYmplY3QgaXMgdmFsaWRcbiAgICB2YWxpZGF0ZVByb29mKGNyZWRlbnRpYWwucHJvb2YpO1xuICB9XG5cbiAgcmV0dXJuIChyZXRPYmopO1xufTtcblxuLyoqXG4gKiBWYWxpZGF0ZXMgdGhlIHByZXNlbnRhdGlvbiBvYmplY3QgaGFzIHRoZSBwcm9wZXIgYXR0cmlidXRlcy5cbiAqIEBwYXJhbSBwcmVzZW50YXRpb24gUHJlc2VudGF0aW9uXG4gKi9cbmNvbnN0IHZhbGlkYXRlUHJlc2VudGF0aW9uID0gKHByZXNlbnRhdGlvbjogUHJlc2VudGF0aW9uKTogdm9pZCA9PiB7XG4gIGNvbnN0IGNvbnRleHQgPSBwcmVzZW50YXRpb25bJ0Bjb250ZXh0J107XG4gIGNvbnN0IHsgdHlwZSwgdmVyaWZpYWJsZUNyZWRlbnRpYWwsIHByb29mLCBwcmVzZW50YXRpb25SZXF1ZXN0VXVpZCB9ID0gcHJlc2VudGF0aW9uO1xuICBsZXQgcmV0T2JqOiBKU09OT2JqID0ge307XG5cbiAgLy8gdmFsaWRhdGUgcmVxdWlyZWQgZmllbGRzXG4gIGlmICghY29udGV4dCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb246IEBjb250ZXh0IGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKCF0eXBlKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvbjogdHlwZSBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICghdmVyaWZpYWJsZUNyZWRlbnRpYWwpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uOiB2ZXJpZmlhYmxlQ3JlZGVudGlhbCBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICghcHJvb2YpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uOiBwcm9vZiBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICghcHJlc2VudGF0aW9uUmVxdWVzdFV1aWQpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uOiBwcmVzZW50YXRpb25SZXF1ZXN0VXVpZCBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmIChpc0FycmF5RW1wdHkoY29udGV4dCkpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uOiBAY29udGV4dCBtdXN0IGJlIGEgbm9uLWVtcHR5IGFycmF5LicpO1xuICB9XG5cbiAgaWYgKGlzQXJyYXlFbXB0eSh0eXBlKSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb246IHR5cGUgbXVzdCBiZSBhIG5vbi1lbXB0eSBhcnJheS4nKTtcbiAgfVxuXG4gIHJldE9iaiA9IHZhbGlkYXRlQ3JlZGVudGlhbElucHV0KHZlcmlmaWFibGVDcmVkZW50aWFsKTtcbiAgaWYgKCFyZXRPYmoudmFsU3RhdCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCByZXRPYmoubXNnKTtcbiAgfVxuXG4gIC8vIENoZWNrIHByb29mIG9iamVjdCBpcyBmb3JtYXR0ZWQgY29ycmVjdGx5XG4gIHZhbGlkYXRlUHJvb2YocHJvb2YpO1xufTtcblxuLyoqXG4gKiBWZXJpZnkgdGhlIHNpZ25hdHVyZSBvbiB0aGUgcHJvdmlkZWQgZGF0YSBvYmplY3QuXG4gKiBAcGFyYW0gc2lnbmF0dXJlXG4gKiBAcGFyYW0gZGF0YVxuICogQHBhcmFtIHB1YmxpY0tleVxuICogQHBhcmFtIGVuY29kaW5nIFN0cmluZyAoJ2Jhc2U1OCcgfCAncGVtJyksIGRlZmF1bHRzIHRvICdwZW0nXG4gKi9cbmNvbnN0IGRvVmVyaWZ5U3RyaW5nID0gKHNpZ25hdHVyZTogc3RyaW5nLCBkYXRhU3RyaW5nOiBzdHJpbmcsIGRhdGE6IEpTT05PYmosIHB1YmxpY0tleTogc3RyaW5nLCBlbmNvZGluZzogJ2Jhc2U1OCcgfCAncGVtJyA9ICdwZW0nKTogYm9vbGVhbiA9PiB7XG4gIGxvZ2dlci5kZWJ1ZyhgUHJlc2VudGF0aW9uIFNpZ25hdHVyZSBTVFJJTkcgdmVyaWZpY2F0aW9uIHVzaW5nIHB1YmxpYyBrZXkgJHtwdWJsaWNLZXl9YCk7XG4gIGNvbnN0IHJlc3VsdDpib29sZWFuID0gdmVyaWZ5U3RyaW5nKHNpZ25hdHVyZSwgZGF0YVN0cmluZywgcHVibGljS2V5LCBlbmNvZGluZyk7XG5cbiAgbG9nZ2VyLmRlYnVnKGBQcmVzZW50YXRpb24gU2lnbmF0dXJlIFNUUklORyBpcyB2YWxpZDogJHtyZXN1bHR9LmApO1xuICBsZXQgZmluYWxSZXN1bHQgPSBmYWxzZTtcbiAgaWYgKHJlc3VsdCkge1xuICAgIC8vIG5lZWQgdG8gYWxzbyB2ZXJpZnkgdGhhdCB0aGUgc3RyaW5nRGF0YSBjb252ZXJ0ZWQgdG8gYW4gb2JqZWN0IG1hdGNoZXMgdGhlIGRhdGEgb2JqZWN0XG4gICAgZmluYWxSZXN1bHQgPSBfLmlzRXF1YWwoZGF0YSwgSlNPTi5wYXJzZShkYXRhU3RyaW5nKSk7XG4gIH1cblxuICBsb2dnZXIuZGVidWcoYFByZXNlbnRhdGlvbiBTaWduYXR1cmUgU1RSSU5HIGlzIHZhbGlkIEZJTkFMOiAke2ZpbmFsUmVzdWx0fS5gKTtcbiAgcmV0dXJuIGZpbmFsUmVzdWx0O1xufTtcblxuLyoqXG4gKiBIYW5kbGVyIHRvIHNlbmQgaW5mb3JtYXRpb24gcmVnYXJkaW5nIHRoZSB1c2VyIGFncmVlaW5nIHRvIHNoYXJlIGEgY3JlZGVudGlhbCBQcmVzZW50YXRpb24uXG4gKiBAcGFyYW0gYXV0aG9yaXphdGlvblxuICogQHBhcmFtIHByZXNlbnRhdGlvblxuICogQHBhcmFtIHZlcmlmaWVyXG4gKi9cbmV4cG9ydCBjb25zdCB2ZXJpZnlQcmVzZW50YXRpb24gPSBhc3luYyAoYXV0aG9yaXphdGlvbjogc3RyaW5nLCBwcmVzZW50YXRpb246IFByZXNlbnRhdGlvbiwgdmVyaWZpZXI6IHN0cmluZyk6IFByb21pc2U8VW51bUR0bzxWZXJpZmllZFN0YXR1cz4+ID0+IHtcbiAgdHJ5IHtcbiAgICByZXF1aXJlQXV0aChhdXRob3JpemF0aW9uKTtcblxuICAgIGlmICghcHJlc2VudGF0aW9uKSB7XG4gICAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ3ByZXNlbnRhdGlvbiBpcyByZXF1aXJlZC4nKTtcbiAgICB9XG5cbiAgICBpZiAoIXZlcmlmaWVyKSB7XG4gICAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ3ZlcmlmaWVyIGlzIHJlcXVpcmVkLicpO1xuICAgIH1cblxuICAgIHZhbGlkYXRlUHJlc2VudGF0aW9uKHByZXNlbnRhdGlvbik7XG4gICAgY29uc3QgZGF0YSA9IG9taXQocHJlc2VudGF0aW9uLCAncHJvb2YnKTtcblxuICAgIGNvbnN0IHByb29mOiBQcm9vZiA9IHByZXNlbnRhdGlvbi5wcm9vZjtcblxuICAgIC8vIHByb29mLnZlcmlmaWNhdGlvbk1ldGhvZCBpcyB0aGUgc3ViamVjdCdzIGRpZFxuICAgIGNvbnN0IGRpZERvY3VtZW50UmVzcG9uc2UgPSBhd2FpdCBnZXRESUREb2MoY29uZmlnRGF0YS5TYWFTVXJsLCBhdXRob3JpemF0aW9uIGFzIHN0cmluZywgcHJvb2YudmVyaWZpY2F0aW9uTWV0aG9kKTtcblxuICAgIGlmIChkaWREb2N1bWVudFJlc3BvbnNlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHRocm93IGRpZERvY3VtZW50UmVzcG9uc2U7XG4gICAgfVxuXG4gICAgbGV0IGF1dGhUb2tlbjogc3RyaW5nID0gaGFuZGxlQXV0aFRva2VuKGRpZERvY3VtZW50UmVzcG9uc2UpOyAvLyBOb3RlOiBnb2luZyB0byB1c2UgYXV0aFRva2VuIGluc3RlYWQgb2YgYXV0aG9yaXphdGlvbiBmb3Igc3Vic2VxdWVudCByZXF1ZXN0cyBpbiBjYXNlIHNhYXMgcm9sbHMgdG8gdG9rZW4uXG4gICAgY29uc3QgcHViS2V5T2JqOiBQdWJsaWNLZXlJbmZvW10gPSBnZXRLZXlGcm9tRElERG9jKGRpZERvY3VtZW50UmVzcG9uc2UuYm9keSwgJ3NlY3AyNTZyMScpO1xuXG4gICAgaWYgKHB1YktleU9iai5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnN0IHJlc3VsdDogVW51bUR0bzxWZXJpZmllZFN0YXR1cz4gPSB7XG4gICAgICAgIGF1dGhUb2tlbixcbiAgICAgICAgYm9keToge1xuICAgICAgICAgIGlzVmVyaWZpZWQ6IGZhbHNlLFxuICAgICAgICAgIG1lc3NhZ2U6ICdQdWJsaWMga2V5IG5vdCBmb3VuZCBmb3IgdGhlIERJRCBhc3NvY2lhdGVkIHdpdGggdGhlIHByb29mLnZlcmlmaWNhdGlvbk1ldGhvZCdcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gVmVyaWZ5IHRoZSBkYXRhIGdpdmVuLiAgQXMgb2Ygbm93IG9ubHkgb25lIHNlY3AyNTZyMSBwdWJsaWMga2V5IGlzIGV4cGVjdGVkLlxuICAgIC8vIEluIGZ1dHVyZSwgdGhlcmUgaXMgYSBwb3NzaWJpbGl0eSB0aGF0LCBtb3JlIHRoYW4gb25lIHNlY3AyNTZyMSBwdWJsaWMga2V5IGNhbiBiZSB0aGVyZSBmb3IgYSBnaXZlbiBESUQuXG4gICAgLy8gVGhlIHNhbWUgc2NlbmFyaW8gd291bGQgYmUgaGFuZGxlZCBsYXRlci5cbiAgICAvLyB2ZXJpZmlhYmxlQ3JlZGVudGlhbCBpcyBhbiBhcnJheS4gIEFzIG9mIG5vdyB3ZSBhcmUgdmVyaWZ5aW5nIHRoZSBlbnRpcmUgY3JlZGVudGlhbCBvYmplY3QgdG9nZXRoZXIuICBXZSB3aWxsIGhhdmUgdG8gbW9kaWZ5XG4gICAgLy8gdGhpcyBsb2dpYyB0byB2ZXJpZnkgZWFjaCBjcmVkZW50aWFsIHByZXNlbnQgc2VwYXJhdGVseS4gIFdlIGNhbiB0YWtlIHRoaXMgdXAgbGF0ZXIuXG4gICAgY29uc3QgaXNQcmVzZW50YXRpb25EYXRhVmVyaWZpZWQ6IGJvb2xlYW4gPSBkb1ZlcmlmeShwcm9vZi5zaWduYXR1cmVWYWx1ZSwgZGF0YSwgcHViS2V5T2JqWzBdLnB1YmxpY0tleSwgcHViS2V5T2JqWzBdLmVuY29kaW5nKTtcbiAgICBjb25zdCBpc1ByZXNlbnRhdGlvblN0cmluZ1ZlcmlmaWVkOiBib29sZWFuID0gIWlzUHJlc2VudGF0aW9uRGF0YVZlcmlmaWVkID8/IGRvVmVyaWZ5U3RyaW5nKHByb29mLnNpZ25hdHVyZVZhbHVlLCBwcm9vZi51bnNpZ25lZFZhbHVlLCBkYXRhLCBwdWJLZXlPYmpbMF0ucHVibGljS2V5LCBwdWJLZXlPYmpbMF0uZW5jb2RpbmcpO1xuXG4gICAgY29uc3QgaXNQcmVzZW50YXRpb25WZXJpZmllZDogYm9vbGVhbiA9IGlzUHJlc2VudGF0aW9uRGF0YVZlcmlmaWVkIHx8IGlzUHJlc2VudGF0aW9uU3RyaW5nVmVyaWZpZWQ7XG5cbiAgICBsZXQgYXJlQ3JlZGVudGlhbHNWYWxpZCA9IHRydWU7XG5cbiAgICBmb3IgKGNvbnN0IGNyZWRlbnRpYWwgb2YgcHJlc2VudGF0aW9uLnZlcmlmaWFibGVDcmVkZW50aWFsKSB7XG4gICAgICBjb25zdCBpc0V4cGlyZWQgPSBpc0NyZWRlbnRpYWxFeHBpcmVkKGNyZWRlbnRpYWwpO1xuXG4gICAgICBpZiAoaXNFeHBpcmVkKSB7XG4gICAgICAgIGFyZUNyZWRlbnRpYWxzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGlzU3RhdHVzVmFsaWRSZXNwb25zZTogVW51bUR0bzxib29sZWFuPiA9IGF3YWl0IGNoZWNrQ3JlZGVudGlhbFN0YXR1cyhjcmVkZW50aWFsLCBhdXRoVG9rZW4pO1xuICAgICAgY29uc3QgaXNTdGF0dXNWYWxpZCA9IGlzU3RhdHVzVmFsaWRSZXNwb25zZS5ib2R5O1xuICAgICAgYXV0aFRva2VuID0gaXNTdGF0dXNWYWxpZFJlc3BvbnNlLmF1dGhUb2tlbjtcblxuICAgICAgaWYgKCFpc1N0YXR1c1ZhbGlkKSB7XG4gICAgICAgIGFyZUNyZWRlbnRpYWxzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGlzVmVyaWZpZWRSZXNwb25zZTogVW51bUR0bzxib29sZWFuPiA9IGF3YWl0IHZlcmlmeUNyZWRlbnRpYWwoY3JlZGVudGlhbCwgYXV0aFRva2VuKTtcbiAgICAgIGNvbnN0IGlzVmVyaWZpZWQgPSBpc1ZlcmlmaWVkUmVzcG9uc2UuYm9keTtcbiAgICAgIGF1dGhUb2tlbiA9IGlzVmVyaWZpZWRSZXNwb25zZS5hdXRoVG9rZW47XG5cbiAgICAgIGlmICghaXNWZXJpZmllZCkge1xuICAgICAgICBhcmVDcmVkZW50aWFsc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghaXNQcmVzZW50YXRpb25WZXJpZmllZCkge1xuICAgICAgY29uc3QgcmVzdWx0OiBVbnVtRHRvPFZlcmlmaWVkU3RhdHVzPiA9IHtcbiAgICAgICAgYXV0aFRva2VuLFxuICAgICAgICBib2R5OiB7XG4gICAgICAgICAgaXNWZXJpZmllZDogZmFsc2UsXG4gICAgICAgICAgbWVzc2FnZTogJ1ByZXNlbnRhdGlvbiBzaWduYXR1cmUgY2FuIG5vIGJlIHZlcmlmaWVkJ1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBpZiAoIWFyZUNyZWRlbnRpYWxzVmFsaWQpIHtcbiAgICAgIGNvbnN0IHJlc3VsdDogVW51bUR0bzxWZXJpZmllZFN0YXR1cz4gPSB7XG4gICAgICAgIGF1dGhUb2tlbixcbiAgICAgICAgYm9keToge1xuICAgICAgICAgIGlzVmVyaWZpZWQ6IGZhbHNlLFxuICAgICAgICAgIG1lc3NhZ2U6ICdDcmVkZW50aWFsIHNpZ25hdHVyZSBjYW4gbm90IGJlIHZlcmlmaWVkLidcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgY29uc3QgaXNWZXJpZmllZCA9IGlzUHJlc2VudGF0aW9uVmVyaWZpZWQgJiYgYXJlQ3JlZGVudGlhbHNWYWxpZDsgLy8gYWx3YXlzIHRydWUgaWYgaGVyZVxuICAgIGNvbnN0IGNyZWRlbnRpYWxUeXBlcyA9IHByZXNlbnRhdGlvbi52ZXJpZmlhYmxlQ3JlZGVudGlhbC5mbGF0TWFwKGNyZWQgPT4gY3JlZC50eXBlLnNsaWNlKDEpKTtcbiAgICBjb25zdCBpc3N1ZXJzID0gcHJlc2VudGF0aW9uLnZlcmlmaWFibGVDcmVkZW50aWFsLm1hcChjcmVkID0+IGNyZWQuaXNzdWVyKTtcbiAgICBjb25zdCBzdWJqZWN0ID0gcHJvb2YudmVyaWZpY2F0aW9uTWV0aG9kO1xuICAgIGNvbnN0IHJlY2VpcHRPcHRpb25zID0ge1xuICAgICAgdHlwZTogWydQcmVzZW50YXRpb25WZXJpZmllZCddLFxuICAgICAgdmVyaWZpZXIsXG4gICAgICBzdWJqZWN0LFxuICAgICAgZGF0YToge1xuICAgICAgICBjcmVkZW50aWFsVHlwZXMsXG4gICAgICAgIGlzc3VlcnMsXG4gICAgICAgIGlzVmVyaWZpZWRcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3QgcmVjZWlwdENhbGxPcHRpb25zOiBSRVNURGF0YSA9IHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgYmFzZVVybDogY29uZmlnRGF0YS5TYWFTVXJsLFxuICAgICAgZW5kUG9pbnQ6ICdyZWNlaXB0JyxcbiAgICAgIGhlYWRlcjogeyBBdXRob3JpemF0aW9uOiBhdXRoVG9rZW4gfSxcbiAgICAgIGRhdGE6IHJlY2VpcHRPcHRpb25zXG4gICAgfTtcblxuICAgIGNvbnN0IHJlc3A6IEpTT05PYmogPSBhd2FpdCBtYWtlTmV0d29ya1JlcXVlc3Q8SlNPTk9iaj4ocmVjZWlwdENhbGxPcHRpb25zKTtcbiAgICBhdXRoVG9rZW4gPSBoYW5kbGVBdXRoVG9rZW4ocmVzcCk7XG5cbiAgICBjb25zdCByZXN1bHQ6IFVudW1EdG88VmVyaWZpZWRTdGF0dXM+ID0ge1xuICAgICAgYXV0aFRva2VuLFxuICAgICAgYm9keToge1xuICAgICAgICBpc1ZlcmlmaWVkXG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKCdFcnJvciBzZW5kaW5nIGEgdmVyaWZ5UHJlc2VudGF0aW9uIHJlcXVlc3QgdG8gVW51bUlEIFNhYXMuJywgZXJyb3IpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuIl19