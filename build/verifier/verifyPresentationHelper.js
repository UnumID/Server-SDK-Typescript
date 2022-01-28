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
exports.verifyPresentationHelper = void 0;
var lodash_1 = require("lodash");
var types_1 = require("@unumid/types");
var validateProof_1 = require("./validateProof");
var requireAuth_1 = require("../requireAuth");
var verifyCredential_1 = require("./verifyCredential");
var isCredentialExpired_1 = require("./isCredentialExpired");
var logger_1 = __importDefault(require("../logger"));
var library_crypto_1 = require("@unumid/library-crypto");
var helpers_1 = require("../utils/helpers");
var error_1 = require("../utils/error");
var didHelper_1 = require("../utils/didHelper");
var verify_1 = require("../utils/verify");
var convertCredentialSubject_1 = require("../utils/convertCredentialSubject");
var sendPresentationVerifiedReceipt_1 = require("./sendPresentationVerifiedReceipt");
var checkCredentialStatuses_1 = require("./checkCredentialStatuses");
var getCredentialStatusFromMap_1 = require("../utils/getCredentialStatusFromMap");
/**
 * Validates the attributes for a credential from UnumId's Saas
 * @param credentials JSONObj
 */
// TODO return a VerifiedStatus type with additional any array for passing back the type conforming objects
var validateCredentialInput = function (credentials) {
    var retObj = { valid: true, stringifiedDates: false, resultantCredentials: [] };
    if (helpers_1.isArrayEmpty(credentials)) {
        retObj.valid = false;
        retObj.msg = 'Invalid Presentation: verifiableCredential must be a non-empty array.';
        return (retObj);
    }
    for (var i = 0; i < credentials.length; i++) {
        var credential = credentials[i];
        // Validate the existence of elements in Credential object
        var invalidMsg = "Invalid verifiableCredential[" + i + "]:";
        if (!credential.context) {
            retObj.valid = false;
            retObj.msg = invalidMsg + " context is required.";
            break;
        }
        if (!credential.credentialStatus) {
            retObj.valid = false;
            retObj.msg = invalidMsg + " credentialStatus is required.";
            break;
        }
        if (!credential.credentialSubject) {
            retObj.valid = false;
            retObj.msg = invalidMsg + " credentialSubject is required.";
            break;
        }
        if (!credential.issuer) {
            retObj.valid = false;
            retObj.msg = invalidMsg + " issuer is required.";
            break;
        }
        if (!credential.type) {
            retObj.valid = false;
            retObj.msg = invalidMsg + " type is required.";
            break;
        }
        if (!credential.id) {
            retObj.valid = false;
            retObj.msg = invalidMsg + " id is required.";
            break;
        }
        if (!credential.issuanceDate) {
            retObj.valid = false;
            retObj.msg = invalidMsg + " issuanceDate is required.";
            break;
        }
        // HACK ALERT: Handling converting string dates to Date. Note: only needed for now when using Protos with Date attributes
        // when we move to full grpc this will not be needed because not longer using json.
        if (typeof credential.expirationDate === 'string') {
            retObj.stringifiedDates = true;
            credential.issuanceDate = new Date(credential.issuanceDate);
        }
        if (typeof credential.expirationDate === 'string') {
            retObj.stringifiedDates = true;
            credential.expirationDate = new Date(credential.expirationDate);
        }
        if (!credential.proof) {
            retObj.valid = false;
            retObj.msg = invalidMsg + " proof is required.";
            break;
        }
        // Check @context is an array and not empty
        if (helpers_1.isArrayEmpty(credential.context)) {
            retObj.valid = false;
            retObj.msg = invalidMsg + " context must be a non-empty array.";
            break;
        }
        // Check CredentialStatus object has id and type elements.
        if (!credential.credentialStatus.id || !credential.credentialStatus.type) {
            retObj.valid = false;
            retObj.msg = invalidMsg + " credentialStatus must contain id and type properties.";
            break;
        }
        // Check credentialSubject object has id element.
        var credentialSubject = convertCredentialSubject_1.convertCredentialSubject(credential.credentialSubject);
        if (!credentialSubject.id) {
            retObj.valid = false;
            retObj.msg = invalidMsg + " credentialSubject must contain id property.";
            break;
        }
        // Check type is an array and not empty
        if (helpers_1.isArrayEmpty(credential.type)) {
            retObj.valid = false;
            retObj.msg = invalidMsg + " type must be a non-empty array.";
            break;
        }
        // Check that proof object is valid
        credential.proof = validateProof_1.validateProof(credential.proof);
        // HACK ALERT continued: this is assuming that if one credential date attribute is a string then all of them are.
        // this resultantCredentials array is then take the place of the creds in the presentation
        if (retObj.stringifiedDates) {
            // Adding the credential to the result list so can use the fully created objects downstream
            retObj.resultantCredentials.push(credential);
        }
    }
    return (retObj);
};
/**
 * Validates the presentation object has the proper attributes.
 * Returns the fully formed verifiableCredential object list if applicable (if was sent as a stringified object)
 * @param presentation Presentation
 */
var validatePresentation = function (presentation) {
    logger_1.default.debug('Validating a Presentation input');
    var type = presentation.type, verifiableCredential = presentation.verifiableCredential, proof = presentation.proof, presentationRequestId = presentation.presentationRequestId, verifierDid = presentation.verifierDid, context = presentation.context;
    var retObj = {};
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
    if (!verifiableCredential || helpers_1.isArrayEmpty(verifiableCredential)) {
        throw new error_1.CustError(400, 'Invalid Presentation: verifiableCredential must be a non-empty array.'); // it should never make it here, ought to be in the NoPresentationHelper
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
    if (type[0] !== 'VerifiablePresentation') {
        throw new error_1.CustError(400, 'Invalid Presentation: type\'s first array element must be VerifiablePresentation.');
    }
    retObj = validateCredentialInput(verifiableCredential);
    if (!retObj.valid) {
        throw new error_1.CustError(400, retObj.msg);
    }
    else if (retObj.stringifiedDates) {
        // adding the credentials, which which now have the proper date attributes, Date for proto encoding for signature verification.
        presentation.verifiableCredential = retObj.resultantCredentials;
    }
    // Check proof object is formatted correctly
    presentation.proof = validateProof_1.validateProof(proof);
    logger_1.default.debug('Presentation input is validated');
    return presentation;
};
/**
 * Validates that:
 * a. all requested credentials types are present
 * b. credentials are only from list of required issuers, if the list is present
 * @param presentation Presentation
 * @param credentialRequests CredentialRequest[]
 */
function validatePresentationMeetsRequestedCredentials(presentation, credentialRequests) {
    if (!presentation.verifiableCredential) {
        return; // just skip because this is a declined presentation
    }
    for (var _i = 0, credentialRequests_1 = credentialRequests; _i < credentialRequests_1.length; _i++) {
        var requestedCred = credentialRequests_1[_i];
        if (requestedCred.required) {
            // check that the request credential is present in the presentation
            var presentationCreds = presentation.verifiableCredential;
            var found = false;
            for (var _a = 0, presentationCreds_1 = presentationCreds; _a < presentationCreds_1.length; _a++) {
                var presentationCred = presentationCreds_1[_a];
                // checking required credential types are present
                if (presentationCred.type.includes(requestedCred.type)) {
                    found = true;
                }
                if (found) {
                    // checking required issuers are present
                    if (helpers_1.isArrayNotEmpty(requestedCred.issuers) && !requestedCred.issuers.includes(presentationCred.issuer)) {
                        var errMessage = "Invalid Presentation: credentials provided did not meet issuer requirements. Issuers requested: [" + requestedCred.issuers + "]. Issuer of the credential received: [" + presentationCred.issuer + "].";
                        logger_1.default.warn(errMessage);
                        throw new error_1.CustError(400, errMessage);
                    }
                    // can break from inner loop because validation has been met.
                    break;
                }
            }
            if (!found) {
                var errMessage = "Invalid Presentation: credentials provided did not meet type requirements. Presented credentials: [" + presentationCreds.map(function (pc) { return pc.type.filter(function (t) { return t !== 'VerifiableCredential'; }); }) + "]. Requested credentials: [" + credentialRequests.map(function (cr) { return cr.type; }) + "].";
                logger_1.default.warn(errMessage);
                throw new error_1.CustError(400, errMessage);
            }
        }
    }
}
/**
 * Handler to send information regarding the user agreeing to share a credential Presentation.
 * @param authorization
 * @param presentation
 * @param verifier
 */
exports.verifyPresentationHelper = function (authorization, presentation, verifier, credentialRequests, requestUuid) { return __awaiter(void 0, void 0, void 0, function () {
    var data, proof, subject, credentialTypes, credentialIds, issuers, message, authToken_1, result_1, publicKeyInfoResponse, publicKeyInfoList, authToken, isPresentationVerified, bytes, _i, publicKeyInfoList_1, publicKeyInfo, e_1, message, result_2, message, result_3, areCredentialsValid, credentialInvalidMessage, presentationCredentialIds, isStatusValidResponse, _a, _b, credential, isExpired, isStatusValid, isVerifiedResponse, isVerified_1, result_4, isVerified, result, error_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 18, , 19]);
                requireAuth_1.requireAuth(authorization);
                if (!presentation) {
                    throw new error_1.CustError(400, 'presentation is required.');
                }
                if (!verifier) {
                    throw new error_1.CustError(400, 'verifier is required.');
                }
                data = lodash_1.omit(presentation, 'proof');
                presentation = validatePresentation(presentation);
                proof = presentation.proof;
                subject = proof.verificationMethod;
                credentialTypes = presentation.verifiableCredential.flatMap(function (cred) { return cred.type.slice(1); });
                credentialIds = presentation.verifiableCredential && helpers_1.isArrayNotEmpty(presentation.verifiableCredential) ? presentation.verifiableCredential.flatMap(function (cred) { return cred.id; }) : [];
                issuers = presentation.verifiableCredential.map(function (cred) { return cred.issuer; });
                if (!(presentation.verifierDid !== verifier)) return [3 /*break*/, 2];
                message = "The presentation was meant for verifier, " + presentation.verifierDid + ", not the provided verifier, " + verifier + ".";
                return [4 /*yield*/, sendPresentationVerifiedReceipt_1.sendPresentationVerifiedReceipt(authorization, verifier, proof.verificationMethod, 'approved', false, presentation.presentationRequestId, requestUuid, message, issuers, credentialTypes, credentialIds)];
            case 1:
                authToken_1 = _c.sent();
                logger_1.default.warn("Presentation verifier not matching input verifier. " + message);
                result_1 = {
                    authToken: authToken_1,
                    body: {
                        isVerified: false,
                        message: message
                    }
                };
                return [2 /*return*/, result_1];
            case 2:
                // if specific credential requests, then need to confirm the presentation provided meets the requirements
                if (helpers_1.isArrayNotEmpty(credentialRequests)) {
                    validatePresentationMeetsRequestedCredentials(presentation, credentialRequests);
                }
                return [4 /*yield*/, didHelper_1.getDidDocPublicKeys(authorization, proof.verificationMethod, 'secp256r1')];
            case 3:
                publicKeyInfoResponse = _c.sent();
                publicKeyInfoList = publicKeyInfoResponse.body;
                authToken = publicKeyInfoResponse.authToken;
                isPresentationVerified = false;
                _c.label = 4;
            case 4:
                _c.trys.push([4, 5, , 7]);
                bytes = types_1.UnsignedPresentationPb.encode(data).finish();
                // check all the public keys to see if any work, stop if one does
                for (_i = 0, publicKeyInfoList_1 = publicKeyInfoList; _i < publicKeyInfoList_1.length; _i++) {
                    publicKeyInfo = publicKeyInfoList_1[_i];
                    // verify the signature
                    isPresentationVerified = verify_1.doVerify(proof.signatureValue, bytes, publicKeyInfo);
                    if (isPresentationVerified)
                        break;
                }
                return [3 /*break*/, 7];
            case 5:
                e_1 = _c.sent();
                if (e_1 instanceof library_crypto_1.CryptoError) {
                    logger_1.default.error("CryptoError verifying presentation " + JSON.stringify(presentation) + " signature", e_1);
                }
                else {
                    logger_1.default.error("Error verifying presentation " + JSON.stringify(presentation) + " signature", e_1);
                }
                message = "Exception verifying presentation signature. " + e_1.message;
                return [4 /*yield*/, sendPresentationVerifiedReceipt_1.sendPresentationVerifiedReceipt(authToken, verifier, proof.verificationMethod, 'approved', false, presentation.presentationRequestId, requestUuid, message, issuers, credentialTypes, credentialIds)];
            case 6:
                // send PresentationVerified receipt
                authToken = _c.sent();
                result_2 = {
                    authToken: authToken,
                    body: {
                        isVerified: false,
                        message: message
                    }
                };
                return [2 /*return*/, result_2];
            case 7:
                if (!!isPresentationVerified) return [3 /*break*/, 9];
                message = 'Presentation signature can not be verified';
                return [4 /*yield*/, sendPresentationVerifiedReceipt_1.sendPresentationVerifiedReceipt(authToken, verifier, proof.verificationMethod, 'approved', false, presentation.presentationRequestId, requestUuid, message, issuers, credentialTypes, credentialIds)];
            case 8:
                // send PresentationVerified receipt
                authToken = _c.sent();
                result_3 = {
                    authToken: authToken,
                    body: {
                        isVerified: false,
                        message: message
                    }
                };
                logger_1.default.warn("Presentation signature can not be verified. " + message);
                return [2 /*return*/, result_3];
            case 9:
                areCredentialsValid = true;
                credentialInvalidMessage = void 0;
                presentationCredentialIds = presentation.verifiableCredential.map(function (credential) { return credential.id; });
                return [4 /*yield*/, checkCredentialStatuses_1.checkCredentialStatuses(authToken, presentationCredentialIds)];
            case 10:
                isStatusValidResponse = _c.sent();
                authToken = isStatusValidResponse.authToken;
                _a = 0, _b = presentation.verifiableCredential;
                _c.label = 11;
            case 11:
                if (!(_a < _b.length)) return [3 /*break*/, 14];
                credential = _b[_a];
                isExpired = isCredentialExpired_1.isCredentialExpired(credential);
                if (isExpired) {
                    areCredentialsValid = false;
                    credentialInvalidMessage = "Credential " + credential.type + " " + credential.id + " is expired.";
                    return [3 /*break*/, 14];
                }
                isStatusValid = getCredentialStatusFromMap_1.getCredentialStatusFromMap(credential.id, isStatusValidResponse.body);
                authToken = isStatusValidResponse.authToken;
                if (!isStatusValid) {
                    areCredentialsValid = false;
                    credentialInvalidMessage = "Credential " + credential.type + " " + credential.id + " status is invalid.";
                    return [3 /*break*/, 14];
                }
                return [4 /*yield*/, verifyCredential_1.verifyCredential(authToken, credential)];
            case 12:
                isVerifiedResponse = _c.sent();
                isVerified_1 = isVerifiedResponse.body;
                authToken = isVerifiedResponse.authToken;
                if (!isVerified_1) {
                    areCredentialsValid = false;
                    credentialInvalidMessage = "Credential " + credential.type + " " + credential.id + " signature can not be verified.";
                    return [3 /*break*/, 14];
                }
                _c.label = 13;
            case 13:
                _a++;
                return [3 /*break*/, 11];
            case 14:
                if (!!areCredentialsValid) return [3 /*break*/, 16];
                return [4 /*yield*/, sendPresentationVerifiedReceipt_1.sendPresentationVerifiedReceipt(authToken, verifier, proof.verificationMethod, 'approved', false, presentation.presentationRequestId, requestUuid, credentialInvalidMessage, issuers, credentialTypes, credentialIds)];
            case 15:
                // send PresentationVerified receipt
                authToken = _c.sent();
                result_4 = {
                    authToken: authToken,
                    body: {
                        isVerified: false,
                        message: credentialInvalidMessage
                    }
                };
                logger_1.default.warn("Presentation credentials are not valid. " + credentialInvalidMessage);
                return [2 /*return*/, result_4];
            case 16:
                isVerified = isPresentationVerified && areCredentialsValid;
                return [4 /*yield*/, sendPresentationVerifiedReceipt_1.sendPresentationVerifiedReceipt(authToken, verifier, subject, 'approved', isVerified, presentation.presentationRequestId, requestUuid, undefined, issuers, credentialTypes, credentialIds)];
            case 17:
                authToken = _c.sent();
                result = {
                    authToken: authToken,
                    body: {
                        isVerified: isVerified
                    }
                };
                logger_1.default.debug("Presentation is verify: " + isVerified);
                return [2 /*return*/, result];
            case 18:
                error_2 = _c.sent();
                logger_1.default.error('Error verifying Presentation.', error_2);
                throw error_2;
            case 19: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=verifyPresentationHelper.js.map