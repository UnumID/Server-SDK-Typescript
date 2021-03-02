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
    if (!dataString) {
        logger_1.default.debug('No Presentation Signature unsignedString value; skipping string verification.');
        return false;
    }
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
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 8, , 9]);
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
                didDocumentResponse = _b.sent();
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
                logger_1.default.debug("Presentation isPresentationDataVerified " + isPresentationDataVerified);
                isPresentationStringVerified = isPresentationDataVerified ? true : doVerifyString(proof.signatureValue, proof.unsignedValue, data, pubKeyObj[0].publicKey, pubKeyObj[0].encoding);
                isPresentationVerified = isPresentationDataVerified || isPresentationStringVerified;
                areCredentialsValid = true;
                _i = 0, _a = presentation.verifiableCredential;
                _b.label = 2;
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
                isStatusValidResponse = _b.sent();
                isStatusValid = isStatusValidResponse.body;
                authToken = isStatusValidResponse.authToken;
                if (!isStatusValid) {
                    areCredentialsValid = false;
                    return [3 /*break*/, 6];
                }
                return [4 /*yield*/, verifyCredential_1.verifyCredential(credential, authToken)];
            case 4:
                isVerifiedResponse = _b.sent();
                isVerified_1 = isVerifiedResponse.body;
                authToken = isVerifiedResponse.authToken;
                if (!isVerified_1) {
                    areCredentialsValid = false;
                    return [3 /*break*/, 6];
                }
                _b.label = 5;
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
                resp = _b.sent();
                authToken = library_issuer_verifier_utility_1.handleAuthToken(resp);
                result = {
                    authToken: authToken,
                    body: {
                        isVerified: isVerified
                    }
                };
                return [2 /*return*/, result];
            case 8:
                error_1 = _b.sent();
                logger_1.default.error('Error sending a verifyPresentation request to UnumID Saas.', error_1);
                throw error_1;
            case 9: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=verifyPresentation.js.map