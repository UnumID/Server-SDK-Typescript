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
var config_1 = require("../config");
var types_1 = require("@unumid/types");
var validateProof_1 = require("./validateProof");
var requireAuth_1 = require("../requireAuth");
var verifyCredential_1 = require("./verifyCredential");
var isCredentialExpired_1 = require("./isCredentialExpired");
var checkCredentialStatus_1 = require("./checkCredentialStatus");
var logger_1 = __importDefault(require("../logger"));
var library_crypto_1 = require("@unumid/library-crypto");
var helpers_1 = require("../utils/helpers");
var error_1 = require("../utils/error");
var didHelper_1 = require("../utils/didHelper");
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
var verify_1 = require("../utils/verify");
var convertCredentialSubject_1 = require("../utils/convertCredentialSubject");
/**
 * Validates the attributes for a credential request to UnumID's SaaS.
 * @param credentials JSONObj
 */
// const validateCredentialInput = (credentials: JSONObj): JSONObj => {
// TODO return a VerifiedStatus type
var validateCredentialInput = function (credentials) {
    // const retObj: JSONObj = { valid: true };
    var retObj = { valid: true, stringifiedDates: false, resultantCredentials: [] };
    // const retObj: JSONObj = { valid: true, resultantCredentials: [] };
    if (helpers_1.isArrayEmpty(credentials)) {
        retObj.valid = false;
        retObj.msg = 'Invalid Presentation: verifiableCredential must be a non-empty array.';
        return (retObj);
    }
    var totCred = credentials.length;
    for (var i = 0; i < totCred; i++) {
        var credPosStr = '[' + i + ']';
        var credential = credentials[i];
        // if (typeof credential === 'string') {
        //   retObj.stringifiedCredentials = true; // setting so know to add the object version of the stringified vc's
        //   credential = JSON.parse(credential);
        // }
        // Validate the existence of elements in Credential object
        var invalidMsg = "Invalid verifiableCredential" + credPosStr + ":";
        // if (!credential['@context']) {
        if (!credential.context) {
            retObj.valid = false;
            retObj.msg = invalidMsg + " @context is required.";
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
        // Handling converting string dates to Date. Note: only needed for now when using Protos with Date attributes
        // when we move to full grpc this will not be needed because not longer using json.
        if (credential.issuanceDate instanceof String) {
            retObj.stringifiedDates = true;
            credential.issuanceDate = new Date(credential.issuanceDate);
        }
        if (credential.expirationDate instanceof String) {
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
            retObj.msg = invalidMsg + " @context must be a non-empty array.";
            break;
        }
        // Check CredentialStatus object has id and type elements.
        if (!credential.credentialStatus.id || !credential.credentialStatus.type) {
            retObj.valid = false;
            retObj.msg = invalidMsg + " credentialStatus must contain id and type properties.";
            break;
        }
        // Check credentialSubject object has id element.
        // if (!credential.credentialSubject.id) {
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
        validateProof_1.validateProof(credential.proof);
        // if (retObj.stringifiedCredentials) {
        //   // Adding the credential to the result list so can use the fully created objects downstream
        //   retObj.resultantCredentials.push(credential);
        // }
    }
    return (retObj);
};
/**
 * Validates the presentation object has the proper attributes.
 * Returns the fully formed verifiableCredential object list if applicable (if was sent as a stringified object)
 * @param presentation Presentation
 */
var validatePresentation = function (presentation) {
    var type = presentation.type, verifiableCredential = presentation.verifiableCredential, proof = presentation.proof, presentationRequestUuid = presentation.presentationRequestUuid, verifierDid = presentation.verifierDid, context = presentation.context;
    var retObj = {};
    // validate required fields
    if (!context) {
        throw new error_1.CustError(400, 'Invalid Presentation: @context is required.');
    }
    if (!type) {
        throw new error_1.CustError(400, 'Invalid Presentation: type is required.');
    }
    if (!proof) {
        throw new error_1.CustError(400, 'Invalid Presentation: proof is required.');
    }
    if (!presentationRequestUuid) {
        throw new error_1.CustError(400, 'Invalid Presentation: presentationRequestUuid is required.');
    }
    if (!verifiableCredential || helpers_1.isArrayEmpty(verifiableCredential)) {
        throw new error_1.CustError(400, 'Invalid Presentation: verifiableCredential must be a non-empty array.'); // it should never make it here, ought to be in the NoPresentationHelper
    }
    if (!verifierDid) {
        throw new error_1.CustError(400, 'Invalid Presentation: verifierDid is required.');
    }
    if (helpers_1.isArrayEmpty(context)) {
        throw new error_1.CustError(400, 'Invalid Presentation: @context must be a non-empty array.');
    }
    if (helpers_1.isArrayEmpty(type)) {
        throw new error_1.CustError(400, 'Invalid Presentation: type must be a non-empty array.');
    }
    retObj = validateCredentialInput(verifiableCredential);
    if (!retObj.valid) {
        throw new error_1.CustError(400, retObj.msg);
    }
    // TODO probably want to not handle the string case... potential issues / vulnerabilities AND actually not needed in this pb case
    // else if (retObj.stringifiedCredentials) {
    //   // adding the "objectified" vc, which were sent in string format to appease iOS variable keyed object limitation: https://developer.apple.com/forums/thread/100417
    //   presentation.verifiableCredential = retObj.resultantCredentials;
    // }
    // Check proof object is formatted correctly
    validateProof_1.validateProof(proof);
    return presentation;
};
// /**
//  * Validates the presentation object has the proper attributes.
//  * Returns the fully formed verifiableCredential object list if applicable (if was sent as a stringified object)
//  * @param presentation Presentation
//  */
// const validatePresentation = (presentation: Presentation | PresentationPb): Presentation | PresentationPb => {
//   const context = (presentation as Presentation)['@context'] ? (presentation as Presentation)['@context'] : (presentation as PresentationPb).context; // RJS this is suspect. Hack alert.
//   const { type, verifiableCredential, proof, presentationRequestUuid, verifierDid } = presentation;
//   let retObj: JSONObj = {};
//   // validate required fields
//   if (!context) {
//     throw new CustError(400, 'Invalid Presentation: @context is required.');
//   }
//   if (!type) {
//     throw new CustError(400, 'Invalid Presentation: type is required.');
//   }
//   if (!proof) {
//     throw new CustError(400, 'Invalid Presentation: proof is required.');
//   }
//   if (!presentationRequestUuid) {
//     throw new CustError(400, 'Invalid Presentation: presentationRequestUuid is required.');
//   }
//   if (!verifiableCredential || isArrayEmpty(verifiableCredential)) {
//     throw new CustError(400, 'Invalid Presentation: verifiableCredential must be a non-empty array.'); // it should never make it here, ought to be in the NoPresentationHelper
//   }
//   if (!verifierDid) {
//     throw new CustError(400, 'Invalid Presentation: verifierDid is required.');
//   }
//   if (isArrayEmpty(context)) {
//     throw new CustError(400, 'Invalid Presentation: @context must be a non-empty array.');
//   }
//   if (isArrayEmpty(type)) {
//     throw new CustError(400, 'Invalid Presentation: type must be a non-empty array.');
//   }
//   // TODO probably want to not handle the string case... potential issues / vulnerabilities.
//   retObj = validateCredentialInput(verifiableCredential);
//   if (!retObj.valid) {
//     throw new CustError(400, retObj.msg);
//   } else if (retObj.stringifiedCredentials) {
//     // adding the "objectified" vc, which were sent in string format to appease iOS variable keyed object limitation: https://developer.apple.com/forums/thread/100417
//     presentation.verifiableCredential = retObj.resultantCredentials;
//   }
//   // Check proof object is formatted correctly
//   validateProof(proof);
//   return presentation;
// };
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
                // checking required credential types are presents
                if (presentationCred.type.includes(requestedCred.type)) {
                    found = true;
                }
                if (found) {
                    // checking required issuers are present
                    if (helpers_1.isArrayNotEmpty(requestedCred.issuers) && !requestedCred.issuers.includes(presentationCred.issuer)) {
                        var errMessage = "Invalid Presentation: credentials provided did not meet issuer requirements, [" + presentationCred.issuer + "], per the presentation request, [" + requestedCred.issuers + "].";
                        logger_1.default.warn(errMessage);
                        throw new error_1.CustError(400, errMessage);
                    }
                    // can break from inner loop because validation has been met.
                    break;
                }
            }
            if (!found) {
                var errMessage = "Invalid Presentation: credentials provided did not meet type requirements, [" + presentationCreds.map(function (pc) { return pc.type.filter(function (t) { return t !== 'VerifiableCredential'; }); }) + "], per the presentation request, [" + credentialRequests.map(function (cr) { return cr.type; }) + "].";
                logger_1.default.warn(errMessage);
                throw new error_1.CustError(400, errMessage);
            }
        }
    }
}
// /**
//  * Validates that:
//  * a. all requested credentials types are present
//  * b. credentials are only from list of required issuers, if the list is present
//  * @param presentation Presentation
//  * @param credentialRequests CredentialRequest[]
//  */
// function validatePresentationMeetsRequestedCredentials (presentation: Presentation, credentialRequests: CredentialRequest[]) {
//   if (!presentation.verifiableCredential) {
//     return; // just skip because this is a declined presentation
//   }
//   for (const requestedCred of credentialRequests) {
//     if (requestedCred.required) {
//       // check that the request credential is present in the presentation
//       const presentationCreds:Credential[] = presentation.verifiableCredential;
//       let found = false;
//       for (const presentationCred of presentationCreds) {
//         // checking required credential types are presents
//         if (presentationCred.type.includes(requestedCred.type)) {
//           found = true;
//         }
//         if (found) {
//           // checking required issuers are present
//           if (isArrayNotEmpty(requestedCred.issuers) && !requestedCred.issuers.includes(presentationCred.issuer)) {
//             const errMessage = `Invalid Presentation: credentials provided did not meet issuer requirements, [${presentationCred.issuer}], per the presentation request, [${requestedCred.issuers}].`;
//             logger.warn(errMessage);
//             throw new CustError(400, errMessage);
//           }
//           // can break from inner loop because validation has been met.
//           break;
//         }
//       }
//       if (!found) {
//         const errMessage = `Invalid Presentation: credentials provided did not meet type requirements, [${presentationCreds.map(pc => pc.type.filter(t => t !== 'VerifiableCredential'))}], per the presentation request, [${credentialRequests.map(cr => cr.type)}].`;
//         logger.warn(errMessage);
//         throw new CustError(400, errMessage);
//       }
//     }
//   }
// }
/**
 * Handler to send information regarding the user agreeing to share a credential Presentation.
 * @param authorization
 * @param presentation
 * @param verifier
 */
exports.verifyPresentationHelper = function (authorization, presentation, verifier, credentialRequests) { return __awaiter(void 0, void 0, void 0, function () {
    var data, result_1, proof, didDocumentResponse, authToken, pubKeyObj, result_2, isPresentationVerified, bytes, result_3, result_4, areCredentialsValid, _i, _a, credential, isExpired, isStatusValidResponse, isStatusValid, isVerifiedResponse, isVerified_1, result_5, isVerified, credentialTypes, issuers, subject, receiptOptions, receiptCallOptions, resp, result, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 8, , 9]);
                requireAuth_1.requireAuth(authorization);
                if (!presentation) {
                    throw new error_1.CustError(400, 'presentation is required.');
                }
                if (!verifier) {
                    throw new error_1.CustError(400, 'verifier is required.');
                }
                data = lodash_1.omit(presentation, 'proof');
                presentation = validatePresentation(presentation);
                if (!presentation.verifiableCredential) {
                    logger_1.default.error('The presentation has undefined verifiableCredential attribute, this should have already be checked.');
                    throw new error_1.CustError(500, 'presentation as an undefined verifiableCredentials'); // this should have already been checked.
                }
                // validate that the verifier did provided matches the verifier did in the presentation
                if (presentation.verifierDid !== verifier) {
                    result_1 = {
                        authToken: authorization,
                        body: {
                            isVerified: false,
                            message: "The presentation was meant for verifier, " + presentation.verifierDid + ", not the provided verifier, " + verifier + "."
                        }
                    };
                    return [2 /*return*/, result_1];
                }
                // if specific credential requests, then need to confirm the presentation provided meets the requirements
                if (helpers_1.isArrayNotEmpty(credentialRequests)) {
                    validatePresentationMeetsRequestedCredentials(presentation, credentialRequests);
                }
                if (!presentation.proof) {
                    throw new error_1.CustError(400, 'presentation proof is required.');
                }
                proof = presentation.proof;
                return [4 /*yield*/, didHelper_1.getDIDDoc(config_1.configData.SaaSUrl, authorization, proof.verificationMethod)];
            case 1:
                didDocumentResponse = _b.sent();
                if (didDocumentResponse instanceof Error) {
                    throw didDocumentResponse;
                }
                authToken = networkRequestHelper_1.handleAuthToken(didDocumentResponse, authorization);
                pubKeyObj = didHelper_1.getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');
                if (pubKeyObj.length === 0) {
                    result_2 = {
                        authToken: authToken,
                        body: {
                            isVerified: false,
                            message: 'Public key not found for the DID associated with the proof.verificationMethod'
                        }
                    };
                    return [2 /*return*/, result_2];
                }
                isPresentationVerified = false;
                try {
                    bytes = types_1.UnsignedPresentationPb.encode(data).finish();
                    // verify the signature
                    isPresentationVerified = verify_1.doVerify(proof.signatureValue, bytes, pubKeyObj[0].publicKey, pubKeyObj[0].encoding);
                }
                catch (e) {
                    if (e instanceof library_crypto_1.CryptoError) {
                        logger_1.default.error("CryptoError verifying presentation " + presentation.uuid + " signature", e);
                    }
                    else {
                        logger_1.default.error("Error verifying presentation " + presentation.uuid + " signature", e);
                    }
                    result_3 = {
                        authToken: authToken,
                        body: {
                            isVerified: false,
                            message: "Exception verifying presentation signature. " + e.message
                        }
                    };
                    return [2 /*return*/, result_3];
                }
                if (!isPresentationVerified) {
                    result_4 = {
                        authToken: authToken,
                        body: {
                            isVerified: false,
                            message: 'Presentation signature can not be verified'
                        }
                    };
                    return [2 /*return*/, result_4];
                }
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
                return [4 /*yield*/, checkCredentialStatus_1.checkCredentialStatus(authToken, credential.id)];
            case 3:
                isStatusValidResponse = _b.sent();
                isStatusValid = isStatusValidResponse.body.status === 'valid';
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
                if (!areCredentialsValid) {
                    result_5 = {
                        authToken: authToken,
                        body: {
                            isVerified: false,
                            message: 'Credential signature can not be verified.'
                        }
                    };
                    return [2 /*return*/, result_5];
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
                return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(receiptCallOptions)];
            case 7:
                resp = _b.sent();
                authToken = networkRequestHelper_1.handleAuthToken(resp, authToken);
                result = {
                    authToken: authToken,
                    body: {
                        isVerified: isVerified
                    }
                };
                return [2 /*return*/, result];
            case 8:
                error_2 = _b.sent();
                logger_1.default.error('Error sending a verifyPresentation request to UnumID Saas.', error_2);
                throw error_2;
            case 9: return [2 /*return*/];
        }
    });
}); };
// /**
//  * Handler to send information regarding the user agreeing to share a credential Presentation.
//  * @param authorization
//  * @param presentation
//  * @param verifier
//  */
// export const verifyPresentationHelper = async (authorization: string, presentation: Presentation, verifier: string, credentialRequests?: CredentialRequest[]): Promise<UnumDto<VerifiedStatus>> => {
//   try {
//     requireAuth(authorization);
//     if (!presentation) {
//       throw new CustError(400, 'presentation is required.');
//     }
//     if (!verifier) {
//       throw new CustError(400, 'verifier is required.');
//     }
//     const data = omit(presentation, 'proof'); // Note: important that this data variable is created prior to the validation thanks to validatePresentation taking potentially stringified VerifiableCredentials objects array and converting them to proper objects.
//     presentation = validatePresentation(presentation);
//     if (!presentation.verifiableCredential) {
//       logger.error('The presentation has undefined verifiableCredential attribute, this should have already be checked.');
//       throw new CustError(500, 'presentation as an undefined verifiableCredentials'); // this should have already been checked.
//     }
//     // validate that the verifier did provided matches the verifier did in the presentation
//     if (presentation.verifierDid !== verifier) {
//       const result: UnumDto<VerifiedStatus> = {
//         authToken: authorization,
//         body: {
//           isVerified: false,
//           message: `The presentation was meant for verifier, ${presentation.verifierDid}, not the provided verifier, ${verifier}.`
//         }
//       };
//       return result;
//     }
//     // if specific credential requests, then need to confirm the presentation provided meets the requirements
//     if (isArrayNotEmpty(credentialRequests)) {
//       validatePresentationMeetsRequestedCredentials(presentation, credentialRequests as CredentialRequest[]);
//     }
//     const proof: Proof = presentation.proof;
//     // proof.verificationMethod is the subject's did
//     const didDocumentResponse = await getDIDDoc(configData.SaaSUrl, authorization as string, proof.verificationMethod);
//     if (didDocumentResponse instanceof Error) {
//       throw didDocumentResponse;
//     }
//     let authToken: string = handleAuthToken(didDocumentResponse, authorization); // Note: going to use authToken instead of authorization for subsequent requests in case saas rolls to token.
//     const pubKeyObj: PublicKeyInfo[] = getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');
//     if (pubKeyObj.length === 0) {
//       const result: UnumDto<VerifiedStatus> = {
//         authToken,
//         body: {
//           isVerified: false,
//           message: 'Public key not found for the DID associated with the proof.verificationMethod'
//         }
//       };
//       return result;
//     }
//     // Verify the data given.  As of now only one secp256r1 public key is expected.
//     // In future, there is a possibility that, more than one secp256r1 public key can be there for a given DID.
//     // The same scenario would be handled later.
//     // verifiableCredential is an array.  As of now we are verifying the entire credential object together.  We will have to modify
//     // this logic to verify each credential present separately.  We can take this up later.
//     let isPresentationVerified = false;
//     try {
//       isPresentationVerified = doVerify(proof.signatureValue, data, pubKeyObj[0].publicKey, pubKeyObj[0].encoding, proof.unsignedValue);
//     } catch (e) {
//       if (e instanceof CryptoError) {
//         logger.error(`CryptoError verifying presentation ${presentation.uuid} signature`, e);
//       } else {
//         logger.error(`Error verifying presentation ${presentation.uuid} signature`, e);
//       }
//       // need to return the UnumDto with the (potentially) updated authToken
//       const result: UnumDto<VerifiedStatus> = {
//         authToken,
//         body: {
//           isVerified: false,
//           message: `Exception verifying presentation signature. ${e.message}`
//         }
//       };
//       return result;
//     }
//     if (!isPresentationVerified) {
//       const result: UnumDto<VerifiedStatus> = {
//         authToken,
//         body: {
//           isVerified: false,
//           message: 'Presentation signature can not be verified'
//         }
//       };
//       return result;
//     }
//     let areCredentialsValid = true;
//     for (const credential of presentation.verifiableCredential) {
//       const isExpired = isCredentialExpired(credential);
//       if (isExpired) {
//         areCredentialsValid = false;
//         break;
//       }
//       const isStatusValidResponse: UnumDto<CredentialStatusInfo> = await checkCredentialStatus(authToken, credential.id);
//       const isStatusValid = isStatusValidResponse.body.status === 'valid';
//       authToken = isStatusValidResponse.authToken;
//       if (!isStatusValid) {
//         areCredentialsValid = false;
//         break;
//       }
//       const isVerifiedResponse: UnumDto<boolean> = await verifyCredential(credential, authToken);
//       const isVerified = isVerifiedResponse.body;
//       authToken = isVerifiedResponse.authToken;
//       if (!isVerified) {
//         areCredentialsValid = false;
//         break;
//       }
//     }
//     if (!areCredentialsValid) {
//       const result: UnumDto<VerifiedStatus> = {
//         authToken,
//         body: {
//           isVerified: false,
//           message: 'Credential signature can not be verified.'
//         }
//       };
//       return result;
//     }
//     const isVerified = isPresentationVerified && areCredentialsValid; // always true if here
//     const credentialTypes = presentation.verifiableCredential.flatMap(cred => cred.type.slice(1)); // cut off the preceding 'VerifiableCredential' string in each array
//     const issuers = presentation.verifiableCredential.map(cred => cred.issuer);
//     const subject = proof.verificationMethod;
//     const receiptOptions = {
//       type: ['PresentationVerified'],
//       verifier,
//       subject,
//       data: {
//         credentialTypes,
//         issuers,
//         isVerified
//       }
//     };
//     const receiptCallOptions: RESTData = {
//       method: 'POST',
//       baseUrl: configData.SaaSUrl,
//       endPoint: 'receipt',
//       header: { Authorization: authToken },
//       data: receiptOptions
//     };
//     const resp: JSONObj = await makeNetworkRequest<JSONObj>(receiptCallOptions);
//     authToken = handleAuthToken(resp, authToken);
//     const result: UnumDto<VerifiedStatus> = {
//       authToken,
//       body: {
//         isVerified
//       }
//     };
//     return result;
//   } catch (error) {
//     logger.error('Error sending a verifyPresentation request to UnumID Saas.', error);
//     throw error;
//   }
// };
//# sourceMappingURL=verifyPresentationHelper.js.map