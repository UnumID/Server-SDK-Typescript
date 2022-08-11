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
                logger_1.default.debug("Presentation signature verified: " + isPresentationVerified + ".");
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
                logger_1.default.debug("Credential signatures are verified: " + areCredentialsValid);
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
                logger_1.default.info("Presentation is verified: " + isVerified);
                return [2 /*return*/, result];
            case 18:
                error_2 = _c.sent();
                logger_1.default.error('Error verifying Presentation.', error_2);
                throw error_2;
            case 19: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5UHJlc2VudGF0aW9uSGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3ZlcmlmaWVyL3ZlcmlmeVByZXNlbnRhdGlvbkhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQ0FBOEI7QUFHOUIsdUNBQXFMO0FBQ3JMLGlEQUFnRDtBQUNoRCw4Q0FBNkM7QUFDN0MsdURBQXNEO0FBQ3RELDZEQUE0RDtBQUM1RCxxREFBK0I7QUFDL0IseURBQXFEO0FBQ3JELDRDQUFpRTtBQUNqRSx3Q0FBMkM7QUFDM0MsZ0RBQXlEO0FBQ3pELDBDQUEyQztBQUMzQyw4RUFBNkU7QUFDN0UscUZBQW9GO0FBQ3BGLHFFQUFvRTtBQUNwRSxrRkFBaUY7QUFFakY7OztHQUdHO0FBQ0gsMkdBQTJHO0FBQzNHLElBQU0sdUJBQXVCLEdBQUcsVUFBQyxXQUEyQjtJQUMxRCxJQUFNLE1BQU0sR0FBWSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLG9CQUFvQixFQUFFLEVBQUUsRUFBRSxDQUFDO0lBRTNGLElBQUksc0JBQVksQ0FBQyxXQUFXLENBQUMsRUFBRTtRQUM3QixNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNyQixNQUFNLENBQUMsR0FBRyxHQUFHLHVFQUF1RSxDQUFDO1FBRXJGLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNqQjtJQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzNDLElBQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVsQywwREFBMEQ7UUFDMUQsSUFBTSxVQUFVLEdBQUcsa0NBQWdDLENBQUMsT0FBSSxDQUFDO1FBQ3pELElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFO1lBQ3ZCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxHQUFHLEdBQU0sVUFBVSwwQkFBdUIsQ0FBQztZQUNsRCxNQUFNO1NBQ1A7UUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFO1lBQ2hDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxHQUFHLEdBQU0sVUFBVSxtQ0FBZ0MsQ0FBQztZQUMzRCxNQUFNO1NBQ1A7UUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixFQUFFO1lBQ2pDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxHQUFHLEdBQU0sVUFBVSxvQ0FBaUMsQ0FBQztZQUM1RCxNQUFNO1NBQ1A7UUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtZQUN0QixNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNyQixNQUFNLENBQUMsR0FBRyxHQUFNLFVBQVUseUJBQXNCLENBQUM7WUFDakQsTUFBTTtTQUNQO1FBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUU7WUFDcEIsTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDckIsTUFBTSxDQUFDLEdBQUcsR0FBTSxVQUFVLHVCQUFvQixDQUFDO1lBQy9DLE1BQU07U0FDUDtRQUVELElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFO1lBQ2xCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxHQUFHLEdBQU0sVUFBVSxxQkFBa0IsQ0FBQztZQUM3QyxNQUFNO1NBQ1A7UUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRTtZQUM1QixNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNyQixNQUFNLENBQUMsR0FBRyxHQUFNLFVBQVUsK0JBQTRCLENBQUM7WUFDdkQsTUFBTTtTQUNQO1FBRUQseUhBQXlIO1FBQ3pILG1GQUFtRjtRQUNuRixJQUFJLE9BQU8sVUFBVSxDQUFDLGNBQWMsS0FBSyxRQUFRLEVBQUU7WUFDakQsTUFBTSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztZQUMvQixVQUFVLENBQUMsWUFBWSxHQUFHLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUM3RDtRQUVELElBQUksT0FBTyxVQUFVLENBQUMsY0FBYyxLQUFLLFFBQVEsRUFBRTtZQUNqRCxNQUFNLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO1lBQy9CLFVBQVUsQ0FBQyxjQUFjLEdBQUcsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQ2pFO1FBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUU7WUFDckIsTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDckIsTUFBTSxDQUFDLEdBQUcsR0FBTSxVQUFVLHdCQUFxQixDQUFDO1lBQ2hELE1BQU07U0FDUDtRQUVELDJDQUEyQztRQUMzQyxJQUFJLHNCQUFZLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3BDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxHQUFHLEdBQU0sVUFBVSx3Q0FBcUMsQ0FBQztZQUNoRSxNQUFNO1NBQ1A7UUFFRCwwREFBMEQ7UUFDMUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFO1lBQ3hFLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxHQUFHLEdBQU0sVUFBVSwyREFBd0QsQ0FBQztZQUNuRixNQUFNO1NBQ1A7UUFFRCxpREFBaUQ7UUFDakQsSUFBTSxpQkFBaUIsR0FBc0IsbURBQXdCLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDcEcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRTtZQUN6QixNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNyQixNQUFNLENBQUMsR0FBRyxHQUFNLFVBQVUsaURBQThDLENBQUM7WUFDekUsTUFBTTtTQUNQO1FBRUQsdUNBQXVDO1FBQ3ZDLElBQUksc0JBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDakMsTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDckIsTUFBTSxDQUFDLEdBQUcsR0FBTSxVQUFVLHFDQUFrQyxDQUFDO1lBQzdELE1BQU07U0FDUDtRQUVELG1DQUFtQztRQUNuQyxVQUFVLENBQUMsS0FBSyxHQUFHLDZCQUFhLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRW5ELGlIQUFpSDtRQUNqSCwwRkFBMEY7UUFDMUYsSUFBSSxNQUFNLENBQUMsZ0JBQWdCLEVBQUU7WUFDM0IsMkZBQTJGO1lBQzNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDOUM7S0FDRjtJQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsQixDQUFDLENBQUM7QUFFRjs7OztHQUlHO0FBQ0gsSUFBTSxvQkFBb0IsR0FBRyxVQUFDLFlBQTRCO0lBQ3hELGdCQUFNLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7SUFDeEMsSUFBQSxJQUFJLEdBQStFLFlBQVksS0FBM0YsRUFBRSxvQkFBb0IsR0FBeUQsWUFBWSxxQkFBckUsRUFBRSxLQUFLLEdBQWtELFlBQVksTUFBOUQsRUFBRSxxQkFBcUIsR0FBMkIsWUFBWSxzQkFBdkMsRUFBRSxXQUFXLEdBQWMsWUFBWSxZQUExQixFQUFFLE9BQU8sR0FBSyxZQUFZLFFBQWpCLENBQWtCO0lBQ3hHLElBQUksTUFBTSxHQUFZLEVBQUUsQ0FBQztJQUV6QiwyQkFBMkI7SUFDM0IsSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUNaLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSw0Q0FBNEMsQ0FBQyxDQUFDO0tBQ3hFO0lBRUQsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNULE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSx5Q0FBeUMsQ0FBQyxDQUFDO0tBQ3JFO0lBRUQsSUFBSSxDQUFDLEtBQUssRUFBRTtRQUNWLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSwwQ0FBMEMsQ0FBQyxDQUFDO0tBQ3RFO0lBRUQsSUFBSSxDQUFDLHFCQUFxQixFQUFFO1FBQzFCLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSwwREFBMEQsQ0FBQyxDQUFDO0tBQ3RGO0lBRUQsSUFBSSxDQUFDLG9CQUFvQixJQUFJLHNCQUFZLENBQUMsb0JBQW9CLENBQUMsRUFBRTtRQUMvRCxNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsdUVBQXVFLENBQUMsQ0FBQyxDQUFDLHdFQUF3RTtLQUM1SztJQUVELElBQUksQ0FBQyxXQUFXLEVBQUU7UUFDaEIsTUFBTSxJQUFJLGlCQUFTLENBQUMsR0FBRyxFQUFFLGdEQUFnRCxDQUFDLENBQUM7S0FDNUU7SUFFRCxJQUFJLHNCQUFZLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDekIsTUFBTSxJQUFJLGlCQUFTLENBQUMsR0FBRyxFQUFFLDBEQUEwRCxDQUFDLENBQUM7S0FDdEY7SUFFRCxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDdEIsTUFBTSxJQUFJLGlCQUFTLENBQUMsR0FBRyxFQUFFLHVEQUF1RCxDQUFDLENBQUM7S0FDbkY7SUFFRCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyx3QkFBd0IsRUFBRTtRQUN4QyxNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsbUZBQW1GLENBQUMsQ0FBQztLQUMvRztJQUVELE1BQU0sR0FBRyx1QkFBdUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQ3ZELElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFO1FBQ2pCLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDdEM7U0FBTSxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRTtRQUNsQywrSEFBK0g7UUFDL0gsWUFBWSxDQUFDLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUNqRTtJQUVELDRDQUE0QztJQUM1QyxZQUFZLENBQUMsS0FBSyxHQUFHLDZCQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFMUMsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztJQUNoRCxPQUFPLFlBQVksQ0FBQztBQUN0QixDQUFDLENBQUM7QUFFRjs7Ozs7O0dBTUc7QUFDSCxTQUFTLDZDQUE2QyxDQUFFLFlBQTRCLEVBQUUsa0JBQXVDO0lBQzNILElBQUksQ0FBQyxZQUFZLENBQUMsb0JBQW9CLEVBQUU7UUFDdEMsT0FBTyxDQUFDLG9EQUFvRDtLQUM3RDtJQUVELEtBQTRCLFVBQWtCLEVBQWxCLHlDQUFrQixFQUFsQixnQ0FBa0IsRUFBbEIsSUFBa0IsRUFBRTtRQUEzQyxJQUFNLGFBQWEsMkJBQUE7UUFDdEIsSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFO1lBQzFCLG1FQUFtRTtZQUNuRSxJQUFNLGlCQUFpQixHQUFrQixZQUFZLENBQUMsb0JBQW9CLENBQUM7WUFDM0UsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ2xCLEtBQStCLFVBQWlCLEVBQWpCLHVDQUFpQixFQUFqQiwrQkFBaUIsRUFBakIsSUFBaUIsRUFBRTtnQkFBN0MsSUFBTSxnQkFBZ0IsMEJBQUE7Z0JBQ3pCLGlEQUFpRDtnQkFDakQsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDdEQsS0FBSyxHQUFHLElBQUksQ0FBQztpQkFDZDtnQkFFRCxJQUFJLEtBQUssRUFBRTtvQkFDVCx3Q0FBd0M7b0JBQ3hDLElBQUkseUJBQWUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDdEcsSUFBTSxVQUFVLEdBQUcsc0dBQW9HLGFBQWEsQ0FBQyxPQUFPLCtDQUEwQyxnQkFBZ0IsQ0FBQyxNQUFNLE9BQUksQ0FBQzt3QkFDbE4sZ0JBQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQ3hCLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztxQkFDdEM7b0JBRUQsNkRBQTZEO29CQUM3RCxNQUFNO2lCQUNQO2FBQ0Y7WUFFRCxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNWLElBQU0sVUFBVSxHQUFHLHdHQUFzRyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsVUFBQSxFQUFFLElBQUksT0FBQSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsS0FBSyxzQkFBc0IsRUFBNUIsQ0FBNEIsQ0FBQyxFQUFqRCxDQUFpRCxDQUFDLG1DQUE4QixrQkFBa0IsQ0FBQyxHQUFHLENBQUMsVUFBQSxFQUFFLElBQUksT0FBQSxFQUFFLENBQUMsSUFBSSxFQUFQLENBQU8sQ0FBQyxPQUFJLENBQUM7Z0JBQy9RLGdCQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN4QixNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7YUFDdEM7U0FDRjtLQUNGO0FBQ0gsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ1UsUUFBQSx3QkFBd0IsR0FBRyxVQUFPLGFBQXFCLEVBQUUsWUFBNEIsRUFBRSxRQUFnQixFQUFFLGtCQUF1QyxFQUFFLFdBQW1COzs7Ozs7Z0JBRTlLLHlCQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBRTNCLElBQUksQ0FBQyxZQUFZLEVBQUU7b0JBQ2pCLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO2lCQUN2RDtnQkFFRCxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUNiLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO2lCQUNuRDtnQkFFSyxJQUFJLEdBQTJCLGFBQUksQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ2pFLFlBQVksR0FBRyxvQkFBb0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFNUMsS0FBSyxHQUFZLFlBQVksQ0FBQyxLQUFnQixDQUFDO2dCQUMvQyxPQUFPLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDO2dCQUNuQyxlQUFlLEdBQUcsWUFBWSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFsQixDQUFrQixDQUFDLENBQUM7Z0JBQ3hGLGFBQWEsR0FBRyxZQUFZLENBQUMsb0JBQW9CLElBQUkseUJBQWUsQ0FBQyxZQUFZLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxFQUFFLEVBQVAsQ0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDMUssT0FBTyxHQUFHLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsTUFBTSxFQUFYLENBQVcsQ0FBQyxDQUFDO3FCQUl2RSxDQUFBLFlBQVksQ0FBQyxXQUFXLEtBQUssUUFBUSxDQUFBLEVBQXJDLHdCQUFxQztnQkFDakMsT0FBTyxHQUFHLDhDQUE0QyxZQUFZLENBQUMsV0FBVyxxQ0FBZ0MsUUFBUSxNQUFHLENBQUM7Z0JBRzlHLHFCQUFNLGlFQUErQixDQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsWUFBWSxDQUFDLHFCQUFxQixFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxhQUFhLENBQUMsRUFBQTs7Z0JBQTFOLGNBQVksU0FBOE07Z0JBRWhPLGdCQUFNLENBQUMsSUFBSSxDQUFDLHdEQUFzRCxPQUFTLENBQUMsQ0FBQztnQkFDdkUsV0FBa0M7b0JBQ3RDLFNBQVMsYUFBQTtvQkFDVCxJQUFJLEVBQUU7d0JBQ0osVUFBVSxFQUFFLEtBQUs7d0JBQ2pCLE9BQU8sU0FBQTtxQkFDUjtpQkFDRixDQUFDO2dCQUNGLHNCQUFPLFFBQU0sRUFBQzs7Z0JBR2hCLHlHQUF5RztnQkFDekcsSUFBSSx5QkFBZSxDQUFDLGtCQUFrQixDQUFDLEVBQUU7b0JBQ3ZDLDZDQUE2QyxDQUFDLFlBQVksRUFBRSxrQkFBeUMsQ0FBQyxDQUFDO2lCQUN4RztnQkFJdUQscUJBQU0sK0JBQW1CLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxXQUFXLENBQUMsRUFBQTs7Z0JBQWpJLHFCQUFxQixHQUE2QixTQUErRTtnQkFDakksaUJBQWlCLEdBQW9CLHFCQUFxQixDQUFDLElBQUksQ0FBQztnQkFDbEUsU0FBUyxHQUFHLHFCQUFxQixDQUFDLFNBQVMsQ0FBQztnQkFFNUMsc0JBQXNCLEdBQUcsS0FBSyxDQUFDOzs7O2dCQUczQixLQUFLLEdBQUcsOEJBQXNCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUUzRCxpRUFBaUU7Z0JBQ2pFLFdBQTZDLEVBQWpCLHVDQUFpQixFQUFqQiwrQkFBaUIsRUFBakIsSUFBaUIsRUFBRTtvQkFBcEMsYUFBYTtvQkFDdEIsdUJBQXVCO29CQUN2QixzQkFBc0IsR0FBRyxpQkFBUSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO29CQUM5RSxJQUFJLHNCQUFzQjt3QkFBRSxNQUFNO2lCQUNuQzs7OztnQkFFRCxJQUFJLEdBQUMsWUFBWSw0QkFBVyxFQUFFO29CQUM1QixnQkFBTSxDQUFDLEtBQUssQ0FBQyx3Q0FBc0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsZUFBWSxFQUFFLEdBQUMsQ0FBQyxDQUFDO2lCQUNqRztxQkFBTTtvQkFDTCxnQkFBTSxDQUFDLEtBQUssQ0FBQyxrQ0FBZ0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsZUFBWSxFQUFFLEdBQUMsQ0FBQyxDQUFDO2lCQUMzRjtnQkFFSyxPQUFPLEdBQUcsaURBQStDLEdBQUMsQ0FBQyxPQUFTLENBQUM7Z0JBRy9ELHFCQUFNLGlFQUErQixDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsWUFBWSxDQUFDLHFCQUFxQixFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxhQUFhLENBQUMsRUFBQTs7Z0JBRHROLG9DQUFvQztnQkFDcEMsU0FBUyxHQUFHLFNBQTBNLENBQUM7Z0JBR2pOLFdBQWtDO29CQUN0QyxTQUFTLFdBQUE7b0JBQ1QsSUFBSSxFQUFFO3dCQUNKLFVBQVUsRUFBRSxLQUFLO3dCQUNqQixPQUFPLFNBQUE7cUJBQ1I7aUJBQ0YsQ0FBQztnQkFDRixzQkFBTyxRQUFNLEVBQUM7O3FCQUdaLENBQUMsc0JBQXNCLEVBQXZCLHdCQUF1QjtnQkFDbkIsT0FBTyxHQUFHLDRDQUE0QyxDQUFDO2dCQUdqRCxxQkFBTSxpRUFBK0IsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFlBQVksQ0FBQyxxQkFBcUIsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsYUFBYSxDQUFDLEVBQUE7O2dCQUR0TixvQ0FBb0M7Z0JBQ3BDLFNBQVMsR0FBRyxTQUEwTSxDQUFDO2dCQUVqTixXQUFrQztvQkFDdEMsU0FBUyxXQUFBO29CQUNULElBQUksRUFBRTt3QkFDSixVQUFVLEVBQUUsS0FBSzt3QkFDakIsT0FBTyxTQUFBO3FCQUNSO2lCQUNGLENBQUM7Z0JBRUYsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsaURBQStDLE9BQVMsQ0FBQyxDQUFDO2dCQUN0RSxzQkFBTyxRQUFNLEVBQUM7O2dCQUdoQixnQkFBTSxDQUFDLEtBQUssQ0FBQyxzQ0FBb0Msc0JBQXNCLE1BQUcsQ0FBQyxDQUFDO2dCQUV4RSxtQkFBbUIsR0FBRyxJQUFJLENBQUM7Z0JBQzNCLHdCQUF3QixTQUFBLENBQUM7Z0JBR3ZCLHlCQUF5QixHQUFHLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsVUFBQSxVQUFVLElBQUksT0FBQSxVQUFVLENBQUMsRUFBRSxFQUFiLENBQWEsQ0FBQyxDQUFDO2dCQUNyQyxxQkFBTSxpREFBdUIsQ0FBQyxTQUFTLEVBQUUseUJBQXlCLENBQUMsRUFBQTs7Z0JBQTdILHFCQUFxQixHQUFxQyxTQUFtRTtnQkFDbkksU0FBUyxHQUFHLHFCQUFxQixDQUFDLFNBQVMsQ0FBQztzQkFFYyxFQUFqQyxLQUFBLFlBQVksQ0FBQyxvQkFBb0I7OztxQkFBakMsQ0FBQSxjQUFpQyxDQUFBO2dCQUEvQyxVQUFVO2dCQUNiLFNBQVMsR0FBRyx5Q0FBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFFbEQsSUFBSSxTQUFTLEVBQUU7b0JBQ2IsbUJBQW1CLEdBQUcsS0FBSyxDQUFDO29CQUM1Qix3QkFBd0IsR0FBRyxnQkFBYyxVQUFVLENBQUMsSUFBSSxTQUFJLFVBQVUsQ0FBQyxFQUFFLGlCQUFjLENBQUM7b0JBQ3hGLHlCQUFNO2lCQUNQO2dCQUVLLGFBQWEsR0FBRyx1REFBMEIsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM1RixTQUFTLEdBQUcscUJBQXFCLENBQUMsU0FBUyxDQUFDO2dCQUU1QyxJQUFJLENBQUMsYUFBYSxFQUFFO29CQUNsQixtQkFBbUIsR0FBRyxLQUFLLENBQUM7b0JBQzVCLHdCQUF3QixHQUFHLGdCQUFjLFVBQVUsQ0FBQyxJQUFJLFNBQUksVUFBVSxDQUFDLEVBQUUsd0JBQXFCLENBQUM7b0JBQy9GLHlCQUFNO2lCQUNQO2dCQUU0QyxxQkFBTSxtQ0FBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLEVBQUE7O2dCQUFwRixrQkFBa0IsR0FBcUIsU0FBNkM7Z0JBQ3BGLGVBQWEsa0JBQWtCLENBQUMsSUFBSSxDQUFDO2dCQUMzQyxTQUFTLEdBQUcsa0JBQWtCLENBQUMsU0FBUyxDQUFDO2dCQUV6QyxJQUFJLENBQUMsWUFBVSxFQUFFO29CQUNmLG1CQUFtQixHQUFHLEtBQUssQ0FBQztvQkFDNUIsd0JBQXdCLEdBQUcsZ0JBQWMsVUFBVSxDQUFDLElBQUksU0FBSSxVQUFVLENBQUMsRUFBRSxvQ0FBaUMsQ0FBQztvQkFDM0cseUJBQU07aUJBQ1A7OztnQkExQnNCLElBQWlDLENBQUE7OztxQkE2QnRELENBQUMsbUJBQW1CLEVBQXBCLHlCQUFvQjtnQkFFVixxQkFBTSxpRUFBK0IsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFlBQVksQ0FBQyxxQkFBcUIsRUFBRSxXQUFXLEVBQUUsd0JBQXdCLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxhQUFhLENBQUMsRUFBQTs7Z0JBRHZPLG9DQUFvQztnQkFDcEMsU0FBUyxHQUFHLFNBQTJOLENBQUM7Z0JBRWxPLFdBQWtDO29CQUN0QyxTQUFTLFdBQUE7b0JBQ1QsSUFBSSxFQUFFO3dCQUNKLFVBQVUsRUFBRSxLQUFLO3dCQUNqQixPQUFPLEVBQUUsd0JBQXdCO3FCQUNsQztpQkFDRixDQUFDO2dCQUVGLGdCQUFNLENBQUMsSUFBSSxDQUFDLDZDQUEyQyx3QkFBMEIsQ0FBQyxDQUFDO2dCQUNuRixzQkFBTyxRQUFNLEVBQUM7O2dCQUVoQixnQkFBTSxDQUFDLEtBQUssQ0FBQyx5Q0FBdUMsbUJBQXFCLENBQUMsQ0FBQztnQkFFckUsVUFBVSxHQUFHLHNCQUFzQixJQUFJLG1CQUFtQixDQUFDO2dCQUVyRCxxQkFBTSxpRUFBK0IsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQyxxQkFBcUIsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsYUFBYSxDQUFDLEVBQUE7O2dCQUE1TSxTQUFTLEdBQUcsU0FBZ00sQ0FBQztnQkFFdk0sTUFBTSxHQUE0QjtvQkFDdEMsU0FBUyxXQUFBO29CQUNULElBQUksRUFBRTt3QkFDSixVQUFVLFlBQUE7cUJBQ1g7aUJBQ0YsQ0FBQztnQkFFRixnQkFBTSxDQUFDLElBQUksQ0FBQywrQkFBNkIsVUFBWSxDQUFDLENBQUM7Z0JBQ3ZELHNCQUFPLE1BQU0sRUFBQzs7O2dCQUVkLGdCQUFNLENBQUMsS0FBSyxDQUFDLCtCQUErQixFQUFFLE9BQUssQ0FBQyxDQUFDO2dCQUNyRCxNQUFNLE9BQUssQ0FBQzs7OztLQUVmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBvbWl0IH0gZnJvbSAnbG9kYXNoJztcblxuaW1wb3J0IHsgVW51bUR0bywgVmVyaWZpZWRTdGF0dXMgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBDcmVkZW50aWFsUmVxdWVzdCwgUHVibGljS2V5SW5mbywgSlNPTk9iaiwgUHJlc2VudGF0aW9uUGIsIENyZWRlbnRpYWxQYiwgUHJvb2ZQYiwgVW5zaWduZWRQcmVzZW50YXRpb25QYiwgQ3JlZGVudGlhbFN1YmplY3QsIENyZWRlbnRpYWxJZFRvU3RhdHVzTWFwIH0gZnJvbSAnQHVudW1pZC90eXBlcyc7XG5pbXBvcnQgeyB2YWxpZGF0ZVByb29mIH0gZnJvbSAnLi92YWxpZGF0ZVByb29mJztcbmltcG9ydCB7IHJlcXVpcmVBdXRoIH0gZnJvbSAnLi4vcmVxdWlyZUF1dGgnO1xuaW1wb3J0IHsgdmVyaWZ5Q3JlZGVudGlhbCB9IGZyb20gJy4vdmVyaWZ5Q3JlZGVudGlhbCc7XG5pbXBvcnQgeyBpc0NyZWRlbnRpYWxFeHBpcmVkIH0gZnJvbSAnLi9pc0NyZWRlbnRpYWxFeHBpcmVkJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCB7IENyeXB0b0Vycm9yIH0gZnJvbSAnQHVudW1pZC9saWJyYXJ5LWNyeXB0byc7XG5pbXBvcnQgeyBpc0FycmF5RW1wdHksIGlzQXJyYXlOb3RFbXB0eSB9IGZyb20gJy4uL3V0aWxzL2hlbHBlcnMnO1xuaW1wb3J0IHsgQ3VzdEVycm9yIH0gZnJvbSAnLi4vdXRpbHMvZXJyb3InO1xuaW1wb3J0IHsgZ2V0RGlkRG9jUHVibGljS2V5cyB9IGZyb20gJy4uL3V0aWxzL2RpZEhlbHBlcic7XG5pbXBvcnQgeyBkb1ZlcmlmeSB9IGZyb20gJy4uL3V0aWxzL3ZlcmlmeSc7XG5pbXBvcnQgeyBjb252ZXJ0Q3JlZGVudGlhbFN1YmplY3QgfSBmcm9tICcuLi91dGlscy9jb252ZXJ0Q3JlZGVudGlhbFN1YmplY3QnO1xuaW1wb3J0IHsgc2VuZFByZXNlbnRhdGlvblZlcmlmaWVkUmVjZWlwdCB9IGZyb20gJy4vc2VuZFByZXNlbnRhdGlvblZlcmlmaWVkUmVjZWlwdCc7XG5pbXBvcnQgeyBjaGVja0NyZWRlbnRpYWxTdGF0dXNlcyB9IGZyb20gJy4vY2hlY2tDcmVkZW50aWFsU3RhdHVzZXMnO1xuaW1wb3J0IHsgZ2V0Q3JlZGVudGlhbFN0YXR1c0Zyb21NYXAgfSBmcm9tICcuLi91dGlscy9nZXRDcmVkZW50aWFsU3RhdHVzRnJvbU1hcCc7XG5cbi8qKlxuICogVmFsaWRhdGVzIHRoZSBhdHRyaWJ1dGVzIGZvciBhIGNyZWRlbnRpYWwgZnJvbSBVbnVtSWQncyBTYWFzXG4gKiBAcGFyYW0gY3JlZGVudGlhbHMgSlNPTk9ialxuICovXG4vLyBUT0RPIHJldHVybiBhIFZlcmlmaWVkU3RhdHVzIHR5cGUgd2l0aCBhZGRpdGlvbmFsIGFueSBhcnJheSBmb3IgcGFzc2luZyBiYWNrIHRoZSB0eXBlIGNvbmZvcm1pbmcgb2JqZWN0c1xuY29uc3QgdmFsaWRhdGVDcmVkZW50aWFsSW5wdXQgPSAoY3JlZGVudGlhbHM6IENyZWRlbnRpYWxQYltdKTogSlNPTk9iaiA9PiB7XG4gIGNvbnN0IHJldE9iajogSlNPTk9iaiA9IHsgdmFsaWQ6IHRydWUsIHN0cmluZ2lmaWVkRGF0ZXM6IGZhbHNlLCByZXN1bHRhbnRDcmVkZW50aWFsczogW10gfTtcblxuICBpZiAoaXNBcnJheUVtcHR5KGNyZWRlbnRpYWxzKSkge1xuICAgIHJldE9iai52YWxpZCA9IGZhbHNlO1xuICAgIHJldE9iai5tc2cgPSAnSW52YWxpZCBQcmVzZW50YXRpb246IHZlcmlmaWFibGVDcmVkZW50aWFsIG11c3QgYmUgYSBub24tZW1wdHkgYXJyYXkuJztcblxuICAgIHJldHVybiAocmV0T2JqKTtcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY3JlZGVudGlhbHMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjcmVkZW50aWFsID0gY3JlZGVudGlhbHNbaV07XG5cbiAgICAvLyBWYWxpZGF0ZSB0aGUgZXhpc3RlbmNlIG9mIGVsZW1lbnRzIGluIENyZWRlbnRpYWwgb2JqZWN0XG4gICAgY29uc3QgaW52YWxpZE1zZyA9IGBJbnZhbGlkIHZlcmlmaWFibGVDcmVkZW50aWFsWyR7aX1dOmA7XG4gICAgaWYgKCFjcmVkZW50aWFsLmNvbnRleHQpIHtcbiAgICAgIHJldE9iai52YWxpZCA9IGZhbHNlO1xuICAgICAgcmV0T2JqLm1zZyA9IGAke2ludmFsaWRNc2d9IGNvbnRleHQgaXMgcmVxdWlyZWQuYDtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmICghY3JlZGVudGlhbC5jcmVkZW50aWFsU3RhdHVzKSB7XG4gICAgICByZXRPYmoudmFsaWQgPSBmYWxzZTtcbiAgICAgIHJldE9iai5tc2cgPSBgJHtpbnZhbGlkTXNnfSBjcmVkZW50aWFsU3RhdHVzIGlzIHJlcXVpcmVkLmA7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoIWNyZWRlbnRpYWwuY3JlZGVudGlhbFN1YmplY3QpIHtcbiAgICAgIHJldE9iai52YWxpZCA9IGZhbHNlO1xuICAgICAgcmV0T2JqLm1zZyA9IGAke2ludmFsaWRNc2d9IGNyZWRlbnRpYWxTdWJqZWN0IGlzIHJlcXVpcmVkLmA7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoIWNyZWRlbnRpYWwuaXNzdWVyKSB7XG4gICAgICByZXRPYmoudmFsaWQgPSBmYWxzZTtcbiAgICAgIHJldE9iai5tc2cgPSBgJHtpbnZhbGlkTXNnfSBpc3N1ZXIgaXMgcmVxdWlyZWQuYDtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmICghY3JlZGVudGlhbC50eXBlKSB7XG4gICAgICByZXRPYmoudmFsaWQgPSBmYWxzZTtcbiAgICAgIHJldE9iai5tc2cgPSBgJHtpbnZhbGlkTXNnfSB0eXBlIGlzIHJlcXVpcmVkLmA7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoIWNyZWRlbnRpYWwuaWQpIHtcbiAgICAgIHJldE9iai52YWxpZCA9IGZhbHNlO1xuICAgICAgcmV0T2JqLm1zZyA9IGAke2ludmFsaWRNc2d9IGlkIGlzIHJlcXVpcmVkLmA7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoIWNyZWRlbnRpYWwuaXNzdWFuY2VEYXRlKSB7XG4gICAgICByZXRPYmoudmFsaWQgPSBmYWxzZTtcbiAgICAgIHJldE9iai5tc2cgPSBgJHtpbnZhbGlkTXNnfSBpc3N1YW5jZURhdGUgaXMgcmVxdWlyZWQuYDtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIEhBQ0sgQUxFUlQ6IEhhbmRsaW5nIGNvbnZlcnRpbmcgc3RyaW5nIGRhdGVzIHRvIERhdGUuIE5vdGU6IG9ubHkgbmVlZGVkIGZvciBub3cgd2hlbiB1c2luZyBQcm90b3Mgd2l0aCBEYXRlIGF0dHJpYnV0ZXNcbiAgICAvLyB3aGVuIHdlIG1vdmUgdG8gZnVsbCBncnBjIHRoaXMgd2lsbCBub3QgYmUgbmVlZGVkIGJlY2F1c2Ugbm90IGxvbmdlciB1c2luZyBqc29uLlxuICAgIGlmICh0eXBlb2YgY3JlZGVudGlhbC5leHBpcmF0aW9uRGF0ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldE9iai5zdHJpbmdpZmllZERhdGVzID0gdHJ1ZTtcbiAgICAgIGNyZWRlbnRpYWwuaXNzdWFuY2VEYXRlID0gbmV3IERhdGUoY3JlZGVudGlhbC5pc3N1YW5jZURhdGUpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgY3JlZGVudGlhbC5leHBpcmF0aW9uRGF0ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldE9iai5zdHJpbmdpZmllZERhdGVzID0gdHJ1ZTtcbiAgICAgIGNyZWRlbnRpYWwuZXhwaXJhdGlvbkRhdGUgPSBuZXcgRGF0ZShjcmVkZW50aWFsLmV4cGlyYXRpb25EYXRlKTtcbiAgICB9XG5cbiAgICBpZiAoIWNyZWRlbnRpYWwucHJvb2YpIHtcbiAgICAgIHJldE9iai52YWxpZCA9IGZhbHNlO1xuICAgICAgcmV0T2JqLm1zZyA9IGAke2ludmFsaWRNc2d9IHByb29mIGlzIHJlcXVpcmVkLmA7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBDaGVjayBAY29udGV4dCBpcyBhbiBhcnJheSBhbmQgbm90IGVtcHR5XG4gICAgaWYgKGlzQXJyYXlFbXB0eShjcmVkZW50aWFsLmNvbnRleHQpKSB7XG4gICAgICByZXRPYmoudmFsaWQgPSBmYWxzZTtcbiAgICAgIHJldE9iai5tc2cgPSBgJHtpbnZhbGlkTXNnfSBjb250ZXh0IG11c3QgYmUgYSBub24tZW1wdHkgYXJyYXkuYDtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIENoZWNrIENyZWRlbnRpYWxTdGF0dXMgb2JqZWN0IGhhcyBpZCBhbmQgdHlwZSBlbGVtZW50cy5cbiAgICBpZiAoIWNyZWRlbnRpYWwuY3JlZGVudGlhbFN0YXR1cy5pZCB8fCAhY3JlZGVudGlhbC5jcmVkZW50aWFsU3RhdHVzLnR5cGUpIHtcbiAgICAgIHJldE9iai52YWxpZCA9IGZhbHNlO1xuICAgICAgcmV0T2JqLm1zZyA9IGAke2ludmFsaWRNc2d9IGNyZWRlbnRpYWxTdGF0dXMgbXVzdCBjb250YWluIGlkIGFuZCB0eXBlIHByb3BlcnRpZXMuYDtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGNyZWRlbnRpYWxTdWJqZWN0IG9iamVjdCBoYXMgaWQgZWxlbWVudC5cbiAgICBjb25zdCBjcmVkZW50aWFsU3ViamVjdDogQ3JlZGVudGlhbFN1YmplY3QgPSBjb252ZXJ0Q3JlZGVudGlhbFN1YmplY3QoY3JlZGVudGlhbC5jcmVkZW50aWFsU3ViamVjdCk7XG4gICAgaWYgKCFjcmVkZW50aWFsU3ViamVjdC5pZCkge1xuICAgICAgcmV0T2JqLnZhbGlkID0gZmFsc2U7XG4gICAgICByZXRPYmoubXNnID0gYCR7aW52YWxpZE1zZ30gY3JlZGVudGlhbFN1YmplY3QgbXVzdCBjb250YWluIGlkIHByb3BlcnR5LmA7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBDaGVjayB0eXBlIGlzIGFuIGFycmF5IGFuZCBub3QgZW1wdHlcbiAgICBpZiAoaXNBcnJheUVtcHR5KGNyZWRlbnRpYWwudHlwZSkpIHtcbiAgICAgIHJldE9iai52YWxpZCA9IGZhbHNlO1xuICAgICAgcmV0T2JqLm1zZyA9IGAke2ludmFsaWRNc2d9IHR5cGUgbXVzdCBiZSBhIG5vbi1lbXB0eSBhcnJheS5gO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhhdCBwcm9vZiBvYmplY3QgaXMgdmFsaWRcbiAgICBjcmVkZW50aWFsLnByb29mID0gdmFsaWRhdGVQcm9vZihjcmVkZW50aWFsLnByb29mKTtcblxuICAgIC8vIEhBQ0sgQUxFUlQgY29udGludWVkOiB0aGlzIGlzIGFzc3VtaW5nIHRoYXQgaWYgb25lIGNyZWRlbnRpYWwgZGF0ZSBhdHRyaWJ1dGUgaXMgYSBzdHJpbmcgdGhlbiBhbGwgb2YgdGhlbSBhcmUuXG4gICAgLy8gdGhpcyByZXN1bHRhbnRDcmVkZW50aWFscyBhcnJheSBpcyB0aGVuIHRha2UgdGhlIHBsYWNlIG9mIHRoZSBjcmVkcyBpbiB0aGUgcHJlc2VudGF0aW9uXG4gICAgaWYgKHJldE9iai5zdHJpbmdpZmllZERhdGVzKSB7XG4gICAgICAvLyBBZGRpbmcgdGhlIGNyZWRlbnRpYWwgdG8gdGhlIHJlc3VsdCBsaXN0IHNvIGNhbiB1c2UgdGhlIGZ1bGx5IGNyZWF0ZWQgb2JqZWN0cyBkb3duc3RyZWFtXG4gICAgICByZXRPYmoucmVzdWx0YW50Q3JlZGVudGlhbHMucHVzaChjcmVkZW50aWFsKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gKHJldE9iaik7XG59O1xuXG4vKipcbiAqIFZhbGlkYXRlcyB0aGUgcHJlc2VudGF0aW9uIG9iamVjdCBoYXMgdGhlIHByb3BlciBhdHRyaWJ1dGVzLlxuICogUmV0dXJucyB0aGUgZnVsbHkgZm9ybWVkIHZlcmlmaWFibGVDcmVkZW50aWFsIG9iamVjdCBsaXN0IGlmIGFwcGxpY2FibGUgKGlmIHdhcyBzZW50IGFzIGEgc3RyaW5naWZpZWQgb2JqZWN0KVxuICogQHBhcmFtIHByZXNlbnRhdGlvbiBQcmVzZW50YXRpb25cbiAqL1xuY29uc3QgdmFsaWRhdGVQcmVzZW50YXRpb24gPSAocHJlc2VudGF0aW9uOiBQcmVzZW50YXRpb25QYik6IFByZXNlbnRhdGlvblBiID0+IHtcbiAgbG9nZ2VyLmRlYnVnKCdWYWxpZGF0aW5nIGEgUHJlc2VudGF0aW9uIGlucHV0Jyk7XG4gIGNvbnN0IHsgdHlwZSwgdmVyaWZpYWJsZUNyZWRlbnRpYWwsIHByb29mLCBwcmVzZW50YXRpb25SZXF1ZXN0SWQsIHZlcmlmaWVyRGlkLCBjb250ZXh0IH0gPSBwcmVzZW50YXRpb247XG4gIGxldCByZXRPYmo6IEpTT05PYmogPSB7fTtcblxuICAvLyB2YWxpZGF0ZSByZXF1aXJlZCBmaWVsZHNcbiAgaWYgKCFjb250ZXh0KSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvbjogY29udGV4dCBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICghdHlwZSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb246IHR5cGUgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAoIXByb29mKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvbjogcHJvb2YgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAoIXByZXNlbnRhdGlvblJlcXVlc3RJZCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb246IHByZXNlbnRhdGlvblJlcXVlc3RJZCBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICghdmVyaWZpYWJsZUNyZWRlbnRpYWwgfHwgaXNBcnJheUVtcHR5KHZlcmlmaWFibGVDcmVkZW50aWFsKSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb246IHZlcmlmaWFibGVDcmVkZW50aWFsIG11c3QgYmUgYSBub24tZW1wdHkgYXJyYXkuJyk7IC8vIGl0IHNob3VsZCBuZXZlciBtYWtlIGl0IGhlcmUsIG91Z2h0IHRvIGJlIGluIHRoZSBOb1ByZXNlbnRhdGlvbkhlbHBlclxuICB9XG5cbiAgaWYgKCF2ZXJpZmllckRpZCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb246IHZlcmlmaWVyRGlkIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKGlzQXJyYXlFbXB0eShjb250ZXh0KSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb246IGNvbnRleHQgbXVzdCBiZSBhIG5vbi1lbXB0eSBhcnJheS4nKTtcbiAgfVxuXG4gIGlmIChpc0FycmF5RW1wdHkodHlwZSkpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uOiB0eXBlIG11c3QgYmUgYSBub24tZW1wdHkgYXJyYXkuJyk7XG4gIH1cblxuICBpZiAodHlwZVswXSAhPT0gJ1ZlcmlmaWFibGVQcmVzZW50YXRpb24nKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvbjogdHlwZVxcJ3MgZmlyc3QgYXJyYXkgZWxlbWVudCBtdXN0IGJlIFZlcmlmaWFibGVQcmVzZW50YXRpb24uJyk7XG4gIH1cblxuICByZXRPYmogPSB2YWxpZGF0ZUNyZWRlbnRpYWxJbnB1dCh2ZXJpZmlhYmxlQ3JlZGVudGlhbCk7XG4gIGlmICghcmV0T2JqLnZhbGlkKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsIHJldE9iai5tc2cpO1xuICB9IGVsc2UgaWYgKHJldE9iai5zdHJpbmdpZmllZERhdGVzKSB7XG4gICAgLy8gYWRkaW5nIHRoZSBjcmVkZW50aWFscywgd2hpY2ggd2hpY2ggbm93IGhhdmUgdGhlIHByb3BlciBkYXRlIGF0dHJpYnV0ZXMsIERhdGUgZm9yIHByb3RvIGVuY29kaW5nIGZvciBzaWduYXR1cmUgdmVyaWZpY2F0aW9uLlxuICAgIHByZXNlbnRhdGlvbi52ZXJpZmlhYmxlQ3JlZGVudGlhbCA9IHJldE9iai5yZXN1bHRhbnRDcmVkZW50aWFscztcbiAgfVxuXG4gIC8vIENoZWNrIHByb29mIG9iamVjdCBpcyBmb3JtYXR0ZWQgY29ycmVjdGx5XG4gIHByZXNlbnRhdGlvbi5wcm9vZiA9IHZhbGlkYXRlUHJvb2YocHJvb2YpO1xuXG4gIGxvZ2dlci5kZWJ1ZygnUHJlc2VudGF0aW9uIGlucHV0IGlzIHZhbGlkYXRlZCcpO1xuICByZXR1cm4gcHJlc2VudGF0aW9uO1xufTtcblxuLyoqXG4gKiBWYWxpZGF0ZXMgdGhhdDpcbiAqIGEuIGFsbCByZXF1ZXN0ZWQgY3JlZGVudGlhbHMgdHlwZXMgYXJlIHByZXNlbnRcbiAqIGIuIGNyZWRlbnRpYWxzIGFyZSBvbmx5IGZyb20gbGlzdCBvZiByZXF1aXJlZCBpc3N1ZXJzLCBpZiB0aGUgbGlzdCBpcyBwcmVzZW50XG4gKiBAcGFyYW0gcHJlc2VudGF0aW9uIFByZXNlbnRhdGlvblxuICogQHBhcmFtIGNyZWRlbnRpYWxSZXF1ZXN0cyBDcmVkZW50aWFsUmVxdWVzdFtdXG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlUHJlc2VudGF0aW9uTWVldHNSZXF1ZXN0ZWRDcmVkZW50aWFscyAocHJlc2VudGF0aW9uOiBQcmVzZW50YXRpb25QYiwgY3JlZGVudGlhbFJlcXVlc3RzOiBDcmVkZW50aWFsUmVxdWVzdFtdKSB7XG4gIGlmICghcHJlc2VudGF0aW9uLnZlcmlmaWFibGVDcmVkZW50aWFsKSB7XG4gICAgcmV0dXJuOyAvLyBqdXN0IHNraXAgYmVjYXVzZSB0aGlzIGlzIGEgZGVjbGluZWQgcHJlc2VudGF0aW9uXG4gIH1cblxuICBmb3IgKGNvbnN0IHJlcXVlc3RlZENyZWQgb2YgY3JlZGVudGlhbFJlcXVlc3RzKSB7XG4gICAgaWYgKHJlcXVlc3RlZENyZWQucmVxdWlyZWQpIHtcbiAgICAgIC8vIGNoZWNrIHRoYXQgdGhlIHJlcXVlc3QgY3JlZGVudGlhbCBpcyBwcmVzZW50IGluIHRoZSBwcmVzZW50YXRpb25cbiAgICAgIGNvbnN0IHByZXNlbnRhdGlvbkNyZWRzOkNyZWRlbnRpYWxQYltdID0gcHJlc2VudGF0aW9uLnZlcmlmaWFibGVDcmVkZW50aWFsO1xuICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgICBmb3IgKGNvbnN0IHByZXNlbnRhdGlvbkNyZWQgb2YgcHJlc2VudGF0aW9uQ3JlZHMpIHtcbiAgICAgICAgLy8gY2hlY2tpbmcgcmVxdWlyZWQgY3JlZGVudGlhbCB0eXBlcyBhcmUgcHJlc2VudFxuICAgICAgICBpZiAocHJlc2VudGF0aW9uQ3JlZC50eXBlLmluY2x1ZGVzKHJlcXVlc3RlZENyZWQudHlwZSkpIHtcbiAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgICAvLyBjaGVja2luZyByZXF1aXJlZCBpc3N1ZXJzIGFyZSBwcmVzZW50XG4gICAgICAgICAgaWYgKGlzQXJyYXlOb3RFbXB0eShyZXF1ZXN0ZWRDcmVkLmlzc3VlcnMpICYmICFyZXF1ZXN0ZWRDcmVkLmlzc3VlcnMuaW5jbHVkZXMocHJlc2VudGF0aW9uQ3JlZC5pc3N1ZXIpKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJNZXNzYWdlID0gYEludmFsaWQgUHJlc2VudGF0aW9uOiBjcmVkZW50aWFscyBwcm92aWRlZCBkaWQgbm90IG1lZXQgaXNzdWVyIHJlcXVpcmVtZW50cy4gSXNzdWVycyByZXF1ZXN0ZWQ6IFske3JlcXVlc3RlZENyZWQuaXNzdWVyc31dLiBJc3N1ZXIgb2YgdGhlIGNyZWRlbnRpYWwgcmVjZWl2ZWQ6IFske3ByZXNlbnRhdGlvbkNyZWQuaXNzdWVyfV0uYDtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKGVyck1lc3NhZ2UpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsIGVyck1lc3NhZ2UpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGNhbiBicmVhayBmcm9tIGlubmVyIGxvb3AgYmVjYXVzZSB2YWxpZGF0aW9uIGhhcyBiZWVuIG1ldC5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgIGNvbnN0IGVyck1lc3NhZ2UgPSBgSW52YWxpZCBQcmVzZW50YXRpb246IGNyZWRlbnRpYWxzIHByb3ZpZGVkIGRpZCBub3QgbWVldCB0eXBlIHJlcXVpcmVtZW50cy4gUHJlc2VudGVkIGNyZWRlbnRpYWxzOiBbJHtwcmVzZW50YXRpb25DcmVkcy5tYXAocGMgPT4gcGMudHlwZS5maWx0ZXIodCA9PiB0ICE9PSAnVmVyaWZpYWJsZUNyZWRlbnRpYWwnKSl9XS4gUmVxdWVzdGVkIGNyZWRlbnRpYWxzOiBbJHtjcmVkZW50aWFsUmVxdWVzdHMubWFwKGNyID0+IGNyLnR5cGUpfV0uYDtcbiAgICAgICAgbG9nZ2VyLndhcm4oZXJyTWVzc2FnZSk7XG4gICAgICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCBlcnJNZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBIYW5kbGVyIHRvIHNlbmQgaW5mb3JtYXRpb24gcmVnYXJkaW5nIHRoZSB1c2VyIGFncmVlaW5nIHRvIHNoYXJlIGEgY3JlZGVudGlhbCBQcmVzZW50YXRpb24uXG4gKiBAcGFyYW0gYXV0aG9yaXphdGlvblxuICogQHBhcmFtIHByZXNlbnRhdGlvblxuICogQHBhcmFtIHZlcmlmaWVyXG4gKi9cbmV4cG9ydCBjb25zdCB2ZXJpZnlQcmVzZW50YXRpb25IZWxwZXIgPSBhc3luYyAoYXV0aG9yaXphdGlvbjogc3RyaW5nLCBwcmVzZW50YXRpb246IFByZXNlbnRhdGlvblBiLCB2ZXJpZmllcjogc3RyaW5nLCBjcmVkZW50aWFsUmVxdWVzdHM6IENyZWRlbnRpYWxSZXF1ZXN0W10sIHJlcXVlc3RVdWlkOiBzdHJpbmcpOiBQcm9taXNlPFVudW1EdG88VmVyaWZpZWRTdGF0dXM+PiA9PiB7XG4gIHRyeSB7XG4gICAgcmVxdWlyZUF1dGgoYXV0aG9yaXphdGlvbik7XG5cbiAgICBpZiAoIXByZXNlbnRhdGlvbikge1xuICAgICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdwcmVzZW50YXRpb24gaXMgcmVxdWlyZWQuJyk7XG4gICAgfVxuXG4gICAgaWYgKCF2ZXJpZmllcikge1xuICAgICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICd2ZXJpZmllciBpcyByZXF1aXJlZC4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBkYXRhOiBVbnNpZ25lZFByZXNlbnRhdGlvblBiID0gb21pdChwcmVzZW50YXRpb24sICdwcm9vZicpO1xuICAgIHByZXNlbnRhdGlvbiA9IHZhbGlkYXRlUHJlc2VudGF0aW9uKHByZXNlbnRhdGlvbik7XG5cbiAgICBjb25zdCBwcm9vZjogUHJvb2ZQYiA9IHByZXNlbnRhdGlvbi5wcm9vZiBhcyBQcm9vZlBiOyAvLyBhbHJlYWR5IHZhbGlkYXRlZCBleGlzdGVuY2UgaW4gdmFsaWRhdGVQcmVzZW50YXRpb25cbiAgICBjb25zdCBzdWJqZWN0ID0gcHJvb2YudmVyaWZpY2F0aW9uTWV0aG9kO1xuICAgIGNvbnN0IGNyZWRlbnRpYWxUeXBlcyA9IHByZXNlbnRhdGlvbi52ZXJpZmlhYmxlQ3JlZGVudGlhbC5mbGF0TWFwKGNyZWQgPT4gY3JlZC50eXBlLnNsaWNlKDEpKTsgLy8gY3V0IG9mZiB0aGUgcHJlY2VkaW5nICdWZXJpZmlhYmxlQ3JlZGVudGlhbCcgc3RyaW5nIGluIGVhY2ggYXJyYXlcbiAgICBjb25zdCBjcmVkZW50aWFsSWRzID0gcHJlc2VudGF0aW9uLnZlcmlmaWFibGVDcmVkZW50aWFsICYmIGlzQXJyYXlOb3RFbXB0eShwcmVzZW50YXRpb24udmVyaWZpYWJsZUNyZWRlbnRpYWwpID8gcHJlc2VudGF0aW9uLnZlcmlmaWFibGVDcmVkZW50aWFsLmZsYXRNYXAoY3JlZCA9PiBjcmVkLmlkKSA6IFtdO1xuICAgIGNvbnN0IGlzc3VlcnMgPSBwcmVzZW50YXRpb24udmVyaWZpYWJsZUNyZWRlbnRpYWwubWFwKGNyZWQgPT4gY3JlZC5pc3N1ZXIpO1xuICAgIC8vIGNvbnN0IGNyZWRlbnRpYWxSZXF1ZXN0czogQ3JlZGVudGlhbFJlcXVlc3RbXSA9IHByZXNlbnRhdGlvblJlcXVlc3QuY3JlZGVudGlhbFJlcXVlc3RzO1xuXG4gICAgLy8gdmFsaWRhdGUgdGhhdCB0aGUgdmVyaWZpZXIgZGlkIHByb3ZpZGVkIG1hdGNoZXMgdGhlIHZlcmlmaWVyIGRpZCBpbiB0aGUgcHJlc2VudGF0aW9uXG4gICAgaWYgKHByZXNlbnRhdGlvbi52ZXJpZmllckRpZCAhPT0gdmVyaWZpZXIpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgVGhlIHByZXNlbnRhdGlvbiB3YXMgbWVhbnQgZm9yIHZlcmlmaWVyLCAke3ByZXNlbnRhdGlvbi52ZXJpZmllckRpZH0sIG5vdCB0aGUgcHJvdmlkZWQgdmVyaWZpZXIsICR7dmVyaWZpZXJ9LmA7XG5cbiAgICAgIC8vIHNlbmQgUHJlc2VudGF0aW9uVmVyaWZpZWQgcmVjZWlwdFxuICAgICAgY29uc3QgYXV0aFRva2VuID0gYXdhaXQgc2VuZFByZXNlbnRhdGlvblZlcmlmaWVkUmVjZWlwdChhdXRob3JpemF0aW9uLCB2ZXJpZmllciwgcHJvb2YudmVyaWZpY2F0aW9uTWV0aG9kLCAnYXBwcm92ZWQnLCBmYWxzZSwgcHJlc2VudGF0aW9uLnByZXNlbnRhdGlvblJlcXVlc3RJZCwgcmVxdWVzdFV1aWQsIG1lc3NhZ2UsIGlzc3VlcnMsIGNyZWRlbnRpYWxUeXBlcywgY3JlZGVudGlhbElkcyk7XG5cbiAgICAgIGxvZ2dlci53YXJuKGBQcmVzZW50YXRpb24gdmVyaWZpZXIgbm90IG1hdGNoaW5nIGlucHV0IHZlcmlmaWVyLiAke21lc3NhZ2V9YCk7XG4gICAgICBjb25zdCByZXN1bHQ6IFVudW1EdG88VmVyaWZpZWRTdGF0dXM+ID0ge1xuICAgICAgICBhdXRoVG9rZW4sXG4gICAgICAgIGJvZHk6IHtcbiAgICAgICAgICBpc1ZlcmlmaWVkOiBmYWxzZSxcbiAgICAgICAgICBtZXNzYWdlXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8vIGlmIHNwZWNpZmljIGNyZWRlbnRpYWwgcmVxdWVzdHMsIHRoZW4gbmVlZCB0byBjb25maXJtIHRoZSBwcmVzZW50YXRpb24gcHJvdmlkZWQgbWVldHMgdGhlIHJlcXVpcmVtZW50c1xuICAgIGlmIChpc0FycmF5Tm90RW1wdHkoY3JlZGVudGlhbFJlcXVlc3RzKSkge1xuICAgICAgdmFsaWRhdGVQcmVzZW50YXRpb25NZWV0c1JlcXVlc3RlZENyZWRlbnRpYWxzKHByZXNlbnRhdGlvbiwgY3JlZGVudGlhbFJlcXVlc3RzIGFzIENyZWRlbnRpYWxSZXF1ZXN0W10pO1xuICAgIH1cblxuICAgIC8vIHByb29mLnZlcmlmaWNhdGlvbk1ldGhvZCBpcyB0aGUgc3ViamVjdCdzIGRpZFxuICAgIC8vIGdyYWIgYWxsICdzZWNwMjU2cjEnIGtleXMgZnJvbSB0aGUgRElEIGRvY3VtZW50XG4gICAgY29uc3QgcHVibGljS2V5SW5mb1Jlc3BvbnNlOiBVbnVtRHRvPFB1YmxpY0tleUluZm9bXT4gPSBhd2FpdCBnZXREaWREb2NQdWJsaWNLZXlzKGF1dGhvcml6YXRpb24sIHByb29mLnZlcmlmaWNhdGlvbk1ldGhvZCwgJ3NlY3AyNTZyMScpO1xuICAgIGNvbnN0IHB1YmxpY0tleUluZm9MaXN0OiBQdWJsaWNLZXlJbmZvW10gPSBwdWJsaWNLZXlJbmZvUmVzcG9uc2UuYm9keTtcbiAgICBsZXQgYXV0aFRva2VuID0gcHVibGljS2V5SW5mb1Jlc3BvbnNlLmF1dGhUb2tlbjtcblxuICAgIGxldCBpc1ByZXNlbnRhdGlvblZlcmlmaWVkID0gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgIC8vIGNyZWF0ZSBieXRlIGFycmF5IGZyb20gcHJvdG9idWYgaGVscGVyc1xuICAgICAgY29uc3QgYnl0ZXMgPSBVbnNpZ25lZFByZXNlbnRhdGlvblBiLmVuY29kZShkYXRhKS5maW5pc2goKTtcblxuICAgICAgLy8gY2hlY2sgYWxsIHRoZSBwdWJsaWMga2V5cyB0byBzZWUgaWYgYW55IHdvcmssIHN0b3AgaWYgb25lIGRvZXNcbiAgICAgIGZvciAoY29uc3QgcHVibGljS2V5SW5mbyBvZiBwdWJsaWNLZXlJbmZvTGlzdCkge1xuICAgICAgICAvLyB2ZXJpZnkgdGhlIHNpZ25hdHVyZVxuICAgICAgICBpc1ByZXNlbnRhdGlvblZlcmlmaWVkID0gZG9WZXJpZnkocHJvb2Yuc2lnbmF0dXJlVmFsdWUsIGJ5dGVzLCBwdWJsaWNLZXlJbmZvKTtcbiAgICAgICAgaWYgKGlzUHJlc2VudGF0aW9uVmVyaWZpZWQpIGJyZWFrO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlIGluc3RhbmNlb2YgQ3J5cHRvRXJyb3IpIHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKGBDcnlwdG9FcnJvciB2ZXJpZnlpbmcgcHJlc2VudGF0aW9uICR7SlNPTi5zdHJpbmdpZnkocHJlc2VudGF0aW9uKX0gc2lnbmF0dXJlYCwgZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2dnZXIuZXJyb3IoYEVycm9yIHZlcmlmeWluZyBwcmVzZW50YXRpb24gJHtKU09OLnN0cmluZ2lmeShwcmVzZW50YXRpb24pfSBzaWduYXR1cmVgLCBlKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbWVzc2FnZSA9IGBFeGNlcHRpb24gdmVyaWZ5aW5nIHByZXNlbnRhdGlvbiBzaWduYXR1cmUuICR7ZS5tZXNzYWdlfWA7XG5cbiAgICAgIC8vIHNlbmQgUHJlc2VudGF0aW9uVmVyaWZpZWQgcmVjZWlwdFxuICAgICAgYXV0aFRva2VuID0gYXdhaXQgc2VuZFByZXNlbnRhdGlvblZlcmlmaWVkUmVjZWlwdChhdXRoVG9rZW4sIHZlcmlmaWVyLCBwcm9vZi52ZXJpZmljYXRpb25NZXRob2QsICdhcHByb3ZlZCcsIGZhbHNlLCBwcmVzZW50YXRpb24ucHJlc2VudGF0aW9uUmVxdWVzdElkLCByZXF1ZXN0VXVpZCwgbWVzc2FnZSwgaXNzdWVycywgY3JlZGVudGlhbFR5cGVzLCBjcmVkZW50aWFsSWRzKTtcblxuICAgICAgLy8gbmVlZCB0byByZXR1cm4gdGhlIFVudW1EdG8gd2l0aCB0aGUgKHBvdGVudGlhbGx5KSB1cGRhdGVkIGF1dGhUb2tlblxuICAgICAgY29uc3QgcmVzdWx0OiBVbnVtRHRvPFZlcmlmaWVkU3RhdHVzPiA9IHtcbiAgICAgICAgYXV0aFRva2VuLFxuICAgICAgICBib2R5OiB7XG4gICAgICAgICAgaXNWZXJpZmllZDogZmFsc2UsXG4gICAgICAgICAgbWVzc2FnZVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBpZiAoIWlzUHJlc2VudGF0aW9uVmVyaWZpZWQpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnUHJlc2VudGF0aW9uIHNpZ25hdHVyZSBjYW4gbm90IGJlIHZlcmlmaWVkJztcblxuICAgICAgLy8gc2VuZCBQcmVzZW50YXRpb25WZXJpZmllZCByZWNlaXB0XG4gICAgICBhdXRoVG9rZW4gPSBhd2FpdCBzZW5kUHJlc2VudGF0aW9uVmVyaWZpZWRSZWNlaXB0KGF1dGhUb2tlbiwgdmVyaWZpZXIsIHByb29mLnZlcmlmaWNhdGlvbk1ldGhvZCwgJ2FwcHJvdmVkJywgZmFsc2UsIHByZXNlbnRhdGlvbi5wcmVzZW50YXRpb25SZXF1ZXN0SWQsIHJlcXVlc3RVdWlkLCBtZXNzYWdlLCBpc3N1ZXJzLCBjcmVkZW50aWFsVHlwZXMsIGNyZWRlbnRpYWxJZHMpO1xuXG4gICAgICBjb25zdCByZXN1bHQ6IFVudW1EdG88VmVyaWZpZWRTdGF0dXM+ID0ge1xuICAgICAgICBhdXRoVG9rZW4sXG4gICAgICAgIGJvZHk6IHtcbiAgICAgICAgICBpc1ZlcmlmaWVkOiBmYWxzZSxcbiAgICAgICAgICBtZXNzYWdlXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGxvZ2dlci53YXJuKGBQcmVzZW50YXRpb24gc2lnbmF0dXJlIGNhbiBub3QgYmUgdmVyaWZpZWQuICR7bWVzc2FnZX1gKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgbG9nZ2VyLmRlYnVnKGBQcmVzZW50YXRpb24gc2lnbmF0dXJlIHZlcmlmaWVkOiAke2lzUHJlc2VudGF0aW9uVmVyaWZpZWR9LmApO1xuXG4gICAgbGV0IGFyZUNyZWRlbnRpYWxzVmFsaWQgPSB0cnVlO1xuICAgIGxldCBjcmVkZW50aWFsSW52YWxpZE1lc3NhZ2U7XG5cbiAgICAvLyBnZXQgYWxsIHRoZSBwcmVzZW50YXRpb24ncyBjcmVkZW50aWFsSWRzIHRvIG1ha2Ugb25lIGJhdGNoZWQgY2FsbCBmb3IgdGhlaXIgc3RhdHVzZXMgdG8gdGhlIHNhYXNcbiAgICBjb25zdCBwcmVzZW50YXRpb25DcmVkZW50aWFsSWRzID0gcHJlc2VudGF0aW9uLnZlcmlmaWFibGVDcmVkZW50aWFsLm1hcChjcmVkZW50aWFsID0+IGNyZWRlbnRpYWwuaWQpO1xuICAgIGNvbnN0IGlzU3RhdHVzVmFsaWRSZXNwb25zZTogVW51bUR0bzxDcmVkZW50aWFsSWRUb1N0YXR1c01hcD4gPSBhd2FpdCBjaGVja0NyZWRlbnRpYWxTdGF0dXNlcyhhdXRoVG9rZW4sIHByZXNlbnRhdGlvbkNyZWRlbnRpYWxJZHMpO1xuICAgIGF1dGhUb2tlbiA9IGlzU3RhdHVzVmFsaWRSZXNwb25zZS5hdXRoVG9rZW47XG5cbiAgICBmb3IgKGNvbnN0IGNyZWRlbnRpYWwgb2YgcHJlc2VudGF0aW9uLnZlcmlmaWFibGVDcmVkZW50aWFsKSB7XG4gICAgICBjb25zdCBpc0V4cGlyZWQgPSBpc0NyZWRlbnRpYWxFeHBpcmVkKGNyZWRlbnRpYWwpO1xuXG4gICAgICBpZiAoaXNFeHBpcmVkKSB7XG4gICAgICAgIGFyZUNyZWRlbnRpYWxzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgY3JlZGVudGlhbEludmFsaWRNZXNzYWdlID0gYENyZWRlbnRpYWwgJHtjcmVkZW50aWFsLnR5cGV9ICR7Y3JlZGVudGlhbC5pZH0gaXMgZXhwaXJlZC5gO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgY29uc3QgaXNTdGF0dXNWYWxpZCA9IGdldENyZWRlbnRpYWxTdGF0dXNGcm9tTWFwKGNyZWRlbnRpYWwuaWQsIGlzU3RhdHVzVmFsaWRSZXNwb25zZS5ib2R5KTtcbiAgICAgIGF1dGhUb2tlbiA9IGlzU3RhdHVzVmFsaWRSZXNwb25zZS5hdXRoVG9rZW47XG5cbiAgICAgIGlmICghaXNTdGF0dXNWYWxpZCkge1xuICAgICAgICBhcmVDcmVkZW50aWFsc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgIGNyZWRlbnRpYWxJbnZhbGlkTWVzc2FnZSA9IGBDcmVkZW50aWFsICR7Y3JlZGVudGlhbC50eXBlfSAke2NyZWRlbnRpYWwuaWR9IHN0YXR1cyBpcyBpbnZhbGlkLmA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpc1ZlcmlmaWVkUmVzcG9uc2U6IFVudW1EdG88Ym9vbGVhbj4gPSBhd2FpdCB2ZXJpZnlDcmVkZW50aWFsKGF1dGhUb2tlbiwgY3JlZGVudGlhbCk7XG4gICAgICBjb25zdCBpc1ZlcmlmaWVkID0gaXNWZXJpZmllZFJlc3BvbnNlLmJvZHk7XG4gICAgICBhdXRoVG9rZW4gPSBpc1ZlcmlmaWVkUmVzcG9uc2UuYXV0aFRva2VuO1xuXG4gICAgICBpZiAoIWlzVmVyaWZpZWQpIHtcbiAgICAgICAgYXJlQ3JlZGVudGlhbHNWYWxpZCA9IGZhbHNlO1xuICAgICAgICBjcmVkZW50aWFsSW52YWxpZE1lc3NhZ2UgPSBgQ3JlZGVudGlhbCAke2NyZWRlbnRpYWwudHlwZX0gJHtjcmVkZW50aWFsLmlkfSBzaWduYXR1cmUgY2FuIG5vdCBiZSB2ZXJpZmllZC5gO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWFyZUNyZWRlbnRpYWxzVmFsaWQpIHtcbiAgICAgIC8vIHNlbmQgUHJlc2VudGF0aW9uVmVyaWZpZWQgcmVjZWlwdFxuICAgICAgYXV0aFRva2VuID0gYXdhaXQgc2VuZFByZXNlbnRhdGlvblZlcmlmaWVkUmVjZWlwdChhdXRoVG9rZW4sIHZlcmlmaWVyLCBwcm9vZi52ZXJpZmljYXRpb25NZXRob2QsICdhcHByb3ZlZCcsIGZhbHNlLCBwcmVzZW50YXRpb24ucHJlc2VudGF0aW9uUmVxdWVzdElkLCByZXF1ZXN0VXVpZCwgY3JlZGVudGlhbEludmFsaWRNZXNzYWdlLCBpc3N1ZXJzLCBjcmVkZW50aWFsVHlwZXMsIGNyZWRlbnRpYWxJZHMpO1xuXG4gICAgICBjb25zdCByZXN1bHQ6IFVudW1EdG88VmVyaWZpZWRTdGF0dXM+ID0ge1xuICAgICAgICBhdXRoVG9rZW4sXG4gICAgICAgIGJvZHk6IHtcbiAgICAgICAgICBpc1ZlcmlmaWVkOiBmYWxzZSxcbiAgICAgICAgICBtZXNzYWdlOiBjcmVkZW50aWFsSW52YWxpZE1lc3NhZ2VcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgbG9nZ2VyLndhcm4oYFByZXNlbnRhdGlvbiBjcmVkZW50aWFscyBhcmUgbm90IHZhbGlkLiAke2NyZWRlbnRpYWxJbnZhbGlkTWVzc2FnZX1gKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGxvZ2dlci5kZWJ1ZyhgQ3JlZGVudGlhbCBzaWduYXR1cmVzIGFyZSB2ZXJpZmllZDogJHthcmVDcmVkZW50aWFsc1ZhbGlkfWApO1xuXG4gICAgY29uc3QgaXNWZXJpZmllZCA9IGlzUHJlc2VudGF0aW9uVmVyaWZpZWQgJiYgYXJlQ3JlZGVudGlhbHNWYWxpZDsgLy8gYWx3YXlzIHRydWUgaWYgaGVyZVxuXG4gICAgYXV0aFRva2VuID0gYXdhaXQgc2VuZFByZXNlbnRhdGlvblZlcmlmaWVkUmVjZWlwdChhdXRoVG9rZW4sIHZlcmlmaWVyLCBzdWJqZWN0LCAnYXBwcm92ZWQnLCBpc1ZlcmlmaWVkLCBwcmVzZW50YXRpb24ucHJlc2VudGF0aW9uUmVxdWVzdElkLCByZXF1ZXN0VXVpZCwgdW5kZWZpbmVkLCBpc3N1ZXJzLCBjcmVkZW50aWFsVHlwZXMsIGNyZWRlbnRpYWxJZHMpO1xuXG4gICAgY29uc3QgcmVzdWx0OiBVbnVtRHRvPFZlcmlmaWVkU3RhdHVzPiA9IHtcbiAgICAgIGF1dGhUb2tlbixcbiAgICAgIGJvZHk6IHtcbiAgICAgICAgaXNWZXJpZmllZFxuICAgICAgfVxuICAgIH07XG5cbiAgICBsb2dnZXIuaW5mbyhgUHJlc2VudGF0aW9uIGlzIHZlcmlmaWVkOiAke2lzVmVyaWZpZWR9YCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIHZlcmlmeWluZyBQcmVzZW50YXRpb24uJywgZXJyb3IpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuIl19