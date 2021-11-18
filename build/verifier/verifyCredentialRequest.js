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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCredentialRequests = void 0;
var types_1 = require("@unumid/types");
var requireAuth_1 = require("../requireAuth");
// import { verifyCredentialHelper } from './verifyCredentialHelper';
var error_1 = require("../utils/error");
var helpers_1 = require("../utils/helpers");
var lodash_1 = require("lodash");
var didHelper_1 = require("../utils/didHelper");
var config_1 = require("../config");
var verify_1 = require("../utils/verify");
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
function isDeclinedPresentation(credential) {
    return helpers_1.isArrayEmpty(credential.verifiableCredential);
}
/**
 * Validates the credential object has the proper attributes.
 * @param credential Presentation
 */
// const validateCredential = (credential: PresentationPb): PresentationPb => {
//   // const context = (credential as Presentation)['@context'] ? (credential as Presentation)['@context'] : (credential as PresentationPb).context;
//   const { type, proof, credentialRequestId, verifierDid, context } = credential;
//   // validate required fields
//   if (!context) {
//     throw new CustError(400, 'Invalid Presentation: context is required.');
//   }
//   if (!type) {
//     throw new CustError(400, 'Invalid Presentation: type is required.');
//   }
//   if (!proof) {
//     throw new CustError(400, 'Invalid Presentation: proof is required.');
//   }
//   if (!credentialRequestId) {
//     throw new CustError(400, 'Invalid Presentation: credentialRequestId is required.');
//   }
//   if (!verifierDid) {
//     throw new CustError(400, 'Invalid Presentation: verifierDid is required.');
//   }
//   if (isArrayEmpty(context)) {
//     throw new CustError(400, 'Invalid Presentation: context must be a non-empty array.');
//   }
//   if (isArrayEmpty(type)) {
//     throw new CustError(400, 'Invalid Presentation: type must be a non-empty array.');
//   }
//   // // HACK ALERT: Handling converting string dates to Date. Note: only needed for now when using Protos with Date attributes
//   // // when we move to full grpc this will not be needed because not longer using json.
//   // if (!uuid) {
//   //   credential.uuid = '';
//   // }
//   // Check proof object is formatted correctly
//   const updatedProof = validateProof(proof);
//   credential.proof = updatedProof;
//   return credential;
// };
// /**
//  * Validates the credential request object has the proper attributes.
//  * @param credential Presentation
//  */
// const validateCredentialRequest = (credentialRequest: CredentialRequestPb): PresentationRequestPb => {
//   const { type, issuers, required } = credentialRequest;
//   // validate required fields
//   if (!type) {
//     throw new CustError(400, `Invalid credentialRequest${credPosStr}: type must be defined.`);
//   }
//   if (typeof type !== 'string') {
//     throw new CustError(400, `Invalid credentialRequest${credPosStr}: type must be a string.`);
//   }
//   if (!issuers) {
//     throw new CustError(400, `Invalid PresentationRequest CredentialRequest${credPosStr}: issuers must be defined.`);
//   }
//   validateCredentialRequests(credentialRequest.credentialRequests);
//   // Check proof object is formatted correctly while converting to protobuf type
//   const result: PresentationRequestPb = {
//     ...credentialRequest,
//     proof: validateProof(convertProof(proof)),
//     expiresAt: credentialRequest.expiresAt ? credentialRequest.expiresAt : undefined,
//     metadata: credentialRequest.metadata ? credentialRequest.metadata : undefined
//   };
//   return result;
// };
/**
 * Validates the attributes for a credential request to UnumID's SaaS.
 * @param requests CredentialRequest
 */
var validateCredentialRequests = function (requests) {
    if (helpers_1.isArrayEmpty(requests)) {
        throw new error_1.CustError(400, 'credentialRequests must be a non-empty array.');
    }
    var totCred = requests.length;
    for (var i = 0; i < totCred; i++) {
        var credPosStr = '[' + i + ']';
        var request = requests[i];
        if (!request.proof) {
            throw new error_1.CustError(400, "Invalid CredentialRequest" + credPosStr + ": proof must be defined.");
        }
        if (!request.type) {
            throw new error_1.CustError(400, "Invalid CredentialRequest" + credPosStr + ": type must be defined.");
        }
        if (typeof request.type !== 'string') {
            throw new error_1.CustError(400, "Invalid CredentialRequest" + credPosStr + ": type must be a string.");
        }
        if (!request.issuers) {
            throw new error_1.CustError(400, "Invalid CredentialRequest" + credPosStr + ": issuers must be defined.");
        }
    }
};
/**
 * Verify the CredentialRequests signatures.
 */
function verifyCredentialRequests(authorization, credentialRequests) {
    return __awaiter(this, void 0, void 0, function () {
        var authToken, _i, credentialRequests_1, credentialRequest, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requireAuth_1.requireAuth(authorization);
                    // validate credentialRequests input
                    validateCredentialRequests(credentialRequests);
                    authToken = authorization;
                    _i = 0, credentialRequests_1 = credentialRequests;
                    _a.label = 1;
                case 1:
                    if (!(_i < credentialRequests_1.length)) return [3 /*break*/, 5];
                    credentialRequest = credentialRequests_1[_i];
                    return [4 /*yield*/, verifyCredentialRequest(authToken, credentialRequest)];
                case 2:
                    result = _a.sent();
                    authToken = result.authToken;
                    if (!!result.body.isVerified) return [3 /*break*/, 4];
                    return [4 /*yield*/, handleSubjectCredentialRequestVerificationReceipt(authToken, credentialRequest, result.body)];
                case 3:
                    // handle sending back the PresentationVerified receipt with the verification failure reason
                    authToken = _a.sent();
                    return [2 /*return*/, __assign(__assign({}, result), { authToken: authToken })];
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: 
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
exports.verifyCredentialRequests = verifyCredentialRequests;
function verifyCredentialRequest(authorization, credentialRequest) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var verificationMethod, signatureValue, didDocumentResponse, authToken, publicKeyInfos, _c, publicKey, encoding, unsignedCredentialRequest, bytes, isVerified, result_1, result;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    verificationMethod = (_a = credentialRequest.proof) === null || _a === void 0 ? void 0 : _a.verificationMethod;
                    signatureValue = (_b = credentialRequest.proof) === null || _b === void 0 ? void 0 : _b.signatureValue;
                    return [4 /*yield*/, didHelper_1.getDIDDoc(config_1.configData.SaaSUrl, authorization, verificationMethod)];
                case 1:
                    didDocumentResponse = _d.sent();
                    if (didDocumentResponse instanceof Error) {
                        throw didDocumentResponse;
                    }
                    authToken = networkRequestHelper_1.handleAuthTokenHeader(didDocumentResponse, authorization);
                    publicKeyInfos = didHelper_1.getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');
                    _c = publicKeyInfos[0], publicKey = _c.publicKey, encoding = _c.encoding;
                    unsignedCredentialRequest = lodash_1.omit(credentialRequest, 'proof');
                    bytes = types_1.CredentialRequestPb.encode(unsignedCredentialRequest).finish();
                    isVerified = verify_1.doVerify(signatureValue, bytes, publicKey, encoding);
                    if (!isVerified) {
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
                    return [2 /*return*/, result];
            }
        });
    });
}
// /**
//  * Handler to send information regarding the user agreeing to share a credential Presentation.
//  * @param authorization: string
//  * @param encryptedPresentation: EncryptedData
//  * @param verifierDid: string
//  */
// export const verifyCredential = async (authorization: string, encryptedPresentation: EncryptedData, verifierDid: string, encryptionPrivateKey: string, credentialRequest?: PresentationRequestDto): Promise<UnumDto<DecryptedPresentation>> => {
//   try {
//     requireAuth(authorization);
//     if (!encryptedPresentation) {
//       throw new CustError(400, 'encryptedPresentation is required.');
//     }
//     if (!verifierDid) { // verifier did
//       throw new CustError(400, 'verifier is required.');
//     }
//     if (!encryptionPrivateKey) {
//       throw new CustError(400, 'verifier encryptionPrivateKey is required.');
//     }
//     if (credentialRequest && credentialRequest.verifier.did !== verifierDid) {
//       throw new CustError(400, `verifier provided, ${verifierDid}, does not match the credential request verifier, ${credentialRequest.verifier.did}.`);
//     }
//     // decrypt the credential
//     const credentialBytes = decryptBytes(encryptionPrivateKey, encryptedPresentation);
//     const credential: PresentationPb = PresentationPb.decode(credentialBytes);
//     if (configData.debug) {
//       logger.debug(`Decrypted Presentation: ${JSON.stringify(credential)}`);
//     }
//     // validate credential
//     validateCredential(credential);
//     if (!credentialRequest) {
//       // grab the credential request from Unum ID SaaS for verification purposes
//       const credentialRequestResponse = await getPresentationRequest(authorization, credential.credentialRequestId);
//       authorization = handleAuthTokenHeader(credentialRequestResponse, authorization);
//       credentialRequest = extractPresentationRequest(credentialRequestResponse.body);
//     }
//     // verify the credential request uuid match
//     if (credentialRequest.credentialRequest.id !== credential.credentialRequestId) {
//       throw new CustError(400, `credential request id provided, ${credentialRequest.credentialRequest.id}, does not match the credentialRequestId that the credential was in response to, ${credential.credentialRequestId}.`);
//     }
//     // verify the credential request signature
//     if (credentialRequest.credentialRequest) {
//       // validate the provided credential request
//       const credentialRequestPb: PresentationRequestPb = validateCredentialRequest(credentialRequest.credentialRequest);
//       const requestVerificationResult: UnumDto<VerifiedStatus> = await verifyCredentialRequest(authorization, credentialRequestPb);
//       authorization = requestVerificationResult.authToken;
//       // if invalid then can stop here but still send back the decrypted credential with the verification results
//       if (!requestVerificationResult.body.isVerified) {
//         // handle sending back the PresentationVerified receipt with the request verification failure reason
//         const authToken = await handleSubjectCredentialRequestVerificationReceipt(requestVerificationResult.authToken, credential, verifierDid, requestVerificationResult.body.message as string, credentialRequest.credentialRequest.uuid);
//         const type = isDeclinedPresentation(credential) ? 'DeclinedPresentation' : 'VerifiablePresentation';
//         const result: UnumDto<DecryptedPresentation> = {
//           authToken,
//           body: {
//             ...requestVerificationResult.body,
//             type,
//             credential: credential
//           }
//         };
//         return result;
//       }
//     }
//     if (isDeclinedPresentation(credential)) {
//       const verificationResult: UnumDto<VerifiedStatus> = await verifyNoPresentationHelper(authorization, credential, verifierDid, credentialRequest.credentialRequest.uuid);
//       const result: UnumDto<DecryptedPresentation> = {
//         authToken: verificationResult.authToken,
//         body: {
//           ...verificationResult.body,
//           type: 'DeclinedPresentation',
//           credential: credential
//         }
//       };
//       return result;
//     }
//     const credentialRequests: CredentialRequest[] = credentialRequest.credentialRequest.credentialRequests;
//     const verificationResult: UnumDto<VerifiedStatus> = await verifyCredentialHelper(authorization, credential, verifierDid, credentialRequests, credentialRequest.credentialRequest.uuid);
//     const result: UnumDto<DecryptedPresentation> = {
//       authToken: verificationResult.authToken,
//       body: {
//         ...verificationResult.body,
//         type: 'VerifiablePresentation',
//         credential: credential
//       }
//     };
//     return result;
//   } catch (error) {
//     if (error instanceof CryptoError) {
//       logger.error(`Crypto error handling encrypted credential ${error}`);
//     } if (error instanceof TypeError) {
//       logger.error(`Type error handling decoding credential, credential or proof from bytes to protobufs ${error}`);
//     } else {
//       logger.error(`Error handling encrypted credential. ${error}`);
//     }
//     throw error;
//   }
// };
/**
 * Handle sending back the SubjectCredentialRequestVerified receipt
 */
function handleSubjectCredentialRequestVerificationReceipt(authToken, credentialRequest, verifiedStatus) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // TODO
            //   try {
            //     const credentialTypes = credential.verifiableCredential && isArrayNotEmpty(credential.verifiableCredential) ? credential.verifiableCredential.flatMap(cred => cred.type.slice(1)) : []; // cut off the preceding 'VerifiableCredential' string in each array
            //     const credentialIds = credential.verifiableCredential && isArrayNotEmpty(credential.verifiableCredential) ? credential.verifiableCredential.flatMap(cred => cred.id) : [];
            //     const issuers = credential.verifiableCredential && isArrayNotEmpty(credential.verifiableCredential) ? credential.verifiableCredential.map(cred => cred.issuer) : [];
            //     const reply = isDeclinedPresentation(credential) ? 'declined' : 'approved';
            //     const proof = credential.proof as ProofPb; // existence has already been validated
            //     return sendPresentationVerifiedReceipt(authToken, verifier, proof.verificationMethod, reply, false, credential.credentialRequestId, requestUuid, message, issuers, credentialTypes, credentialIds);
            //   } catch (e) {
            //     logger.error('Something went wrong handling the PresentationVerification receipt for the a failed request verification');
            //   }
            return [2 /*return*/, authToken];
        });
    });
}
//# sourceMappingURL=verifyCredentialRequest.js.map