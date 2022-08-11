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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueCredentials = void 0;
var config_1 = require("../config");
var requireAuth_1 = require("../requireAuth");
var types_1 = require("@unumid/types");
var logger_1 = __importDefault(require("../logger"));
var didHelper_1 = require("../utils/didHelper");
var encrypt_1 = require("../utils/encrypt");
var createProof_1 = require("../utils/createProof");
var helpers_1 = require("../utils/helpers");
var error_1 = require("../utils/error");
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
var convertCredentialSubject_1 = require("../utils/convertCredentialSubject");
var semver_1 = require("semver");
var versionList_1 = require("../utils/versionList");
var library_crypto_1 = require("@unumid/library-crypto");
var getCredentialType_1 = require("../utils/getCredentialType");
var lodash_1 = require("lodash");
function isCredentialPb(cred) {
    // HACK ALERT: just check if the cred object has a property unique to CredentialPb types
    return cred.context !== undefined;
}
/**
 * Creates an object of type EncryptedCredentialOptions which encapsulates information relating to the encrypted credential data
 * @param cred
 * @param publicKeyInfos
 */
var constructEncryptedCredentialOpts = function (cred, publicKeyInfos) {
    var credentialSubject = convertCredentialSubject_1.convertCredentialSubject(cred.credentialSubject);
    var subjectDid = credentialSubject.id;
    logger_1.default.debug("Encrypting credential " + cred);
    // create an encrypted copy of the credential with each RSA public key
    return publicKeyInfos.map(function (publicKeyInfo) {
        var subjectDidWithKeyFragment = subjectDid + "#" + publicKeyInfo.id;
        // use the protobuf byte array encryption if dealing with a CredentialPb cred type
        var encryptedData = isCredentialPb(cred)
            ? encrypt_1.doEncryptPb(subjectDidWithKeyFragment, publicKeyInfo, types_1.CredentialPb.encode(cred).finish())
            : encrypt_1.doEncrypt(subjectDidWithKeyFragment, publicKeyInfo, cred);
        // Removing the w3c credential spec of "VerifiableCredential" from the Unum ID internal type for simplicity
        var credentialType = getCredentialType_1.getCredentialType(cred.type);
        var encryptedCredentialOptions = {
            credentialId: cred.id,
            subject: subjectDidWithKeyFragment,
            issuer: cred.issuer,
            type: credentialType,
            data: encryptedData,
            expirationDate: cred.expirationDate
        };
        return encryptedCredentialOptions;
    });
};
/**
 * Creates a signed credential with all the relevant information. The proof serves as a cryptographic signature.
 * @param usCred UnsignedCredentialPb
 * @param privateKey String
 */
var constructSignedCredentialPbObj = function (usCred, privateKey) {
    try {
        // convert the protobuf to a byte array
        var bytes = types_1.UnsignedCredentialPb.encode(usCred).finish();
        var proof = createProof_1.createProofPb(bytes, privateKey, usCred.issuer);
        var credential = {
            context: usCred.context,
            credentialStatus: usCred.credentialStatus,
            credentialSubject: usCred.credentialSubject,
            issuer: usCred.issuer,
            type: usCred.type,
            id: usCred.id,
            issuanceDate: usCred.issuanceDate,
            expirationDate: usCred.expirationDate,
            proof: proof
        };
        return (credential);
    }
    catch (e) {
        if (e instanceof library_crypto_1.CryptoError) {
            logger_1.default.error("Issue in the crypto lib while creating credential " + usCred.id + " proof. " + e + ".");
        }
        else {
            logger_1.default.error("Issue while creating creating credential " + usCred.id + " proof " + e + ".");
        }
        throw e;
    }
};
/**
 * Creates a signed credential with all the relevant information. The proof serves as a cryptographic signature.
 * @param usCred UnsignedCredential
 * @param privateKey String
 */
var constructSignedCredentialObj = function (usCred, privateKey) {
    var proof = createProof_1.createProof(usCred, privateKey, usCred.issuer, 'pem');
    var credential = {
        '@context': usCred['@context'],
        credentialStatus: usCred.credentialStatus,
        credentialSubject: usCred.credentialSubject,
        issuer: usCred.issuer,
        type: usCred.type,
        id: usCred.id,
        issuanceDate: usCred.issuanceDate,
        expirationDate: usCred.expirationDate,
        proof: proof
    };
    return (credential);
};
/**
 * Creates all the attributes associated with an unsigned credential.
 * @param credOpts CredentialOptions
 * @param credentialId
 */
var constructUnsignedCredentialPbObj = function (credOpts) {
    var expirationDate = credOpts.expirationDate, credentialId = credOpts.credentialId, credentialSubject = credOpts.credentialSubject, issuer = credOpts.issuer, type = credOpts.type;
    // credential subject is a string to facilitate handling arbitrary data in the protobuf object
    var credentialSubjectStringified = JSON.stringify(credentialSubject);
    var unsCredObj = {
        context: ['https://www.w3.org/2018/credentials/v1'],
        credentialStatus: {
            id: config_1.configData.SaaSUrl + "/credentialStatus/" + credentialId,
            type: 'CredentialStatus'
        },
        credentialSubject: credentialSubjectStringified,
        issuer: issuer,
        type: __spreadArrays(['VerifiableCredential'], type),
        id: credentialId,
        issuanceDate: new Date(),
        expirationDate: expirationDate
    };
    return unsCredObj;
};
/**
 * Creates all the attributes associated with an unsigned credential.
 * @param credOpts CredentialOptions
 * @return Unsigned credential
 */
var constructUnsignedCredentialObj = function (credOpts) {
    var expirationDate = credOpts.expirationDate, credentialId = credOpts.credentialId, credentialSubject = credOpts.credentialSubject, issuer = credOpts.issuer, type = credOpts.type;
    // CredentialSubject type is dependent on version. V2 is a string for passing to holder so iOS can handle it as a concrete type instead of a map of unknown keys.
    var credentialSubjectStringified = JSON.stringify(credentialSubject);
    var unsCredObj = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        credentialStatus: {
            id: config_1.configData.SaaSUrl + "/credentialStatus/" + credentialId,
            type: 'CredentialStatus'
        },
        credentialSubject: credentialSubjectStringified,
        issuer: issuer,
        type: __spreadArrays(['VerifiableCredential'], type),
        id: credentialId,
        issuanceDate: new Date(),
        expirationDate: expirationDate
    };
    return unsCredObj;
};
/**
 * Handle input validation.
 * @param issuer
 * @param subjectDid
 * @param credentialDataList
 * @param signingPrivateKey
 * @param expirationDate
 */
var validateInputs = function (issuer, subjectDid, credentialDataList, signingPrivateKey, expirationDate) {
    if (!issuer) {
        throw new error_1.CustError(400, 'issuer is required.');
    }
    if (!subjectDid) {
        throw new error_1.CustError(400, 'subjectDid is required.');
    }
    if (!signingPrivateKey) {
        throw new error_1.CustError(400, 'signingPrivateKey is required.');
    }
    if (typeof issuer !== 'string') {
        throw new error_1.CustError(400, 'issuer must be a string.');
    }
    if (typeof signingPrivateKey !== 'string') {
        throw new error_1.CustError(400, 'signingPrivateKey must be a string.');
    }
    // expirationDate must be a Date object and return a properly formed time. Invalid Date.getTime() will produce NaN
    if (expirationDate && (!(expirationDate instanceof Date) || isNaN(expirationDate.getTime()))) {
        throw new error_1.CustError(400, 'expirationDate must be a valid Date object.');
    }
    if (expirationDate && expirationDate < new Date()) {
        throw new error_1.CustError(400, 'expirationDate must be in the future.');
    }
    // validate credentialDataList
    validateCredentialDataList(credentialDataList);
};
/**
 * Multiplexed handler for issuing credentials with UnumID's SaaS.
 * @param authorization
 * @param issuer
 * @param subjectDid
 * @param credentialDataList
 * @param signingPrivateKey
 * @param expirationDate
 */
exports.issueCredentials = function (authorization, issuerDid, subjectDid, credentialDataList, signingPrivateKey, expirationDate, issueCredentialsToSelf) {
    if (issueCredentialsToSelf === void 0) { issueCredentialsToSelf = true; }
    return __awaiter(void 0, void 0, void 0, function () {
        var publicKeyInfoResponse, publicKeyInfos, issuerPublicKeyInfos, publicKeyInfoResponse_1, creds, proofOfCreds, i, type, credData, credSubject, credentialId, credentialVersionPairs, proofOfType, proofOfCredentialSubject, proofOfCredentailId, proofOfCredentialVersionPairs, issuerCredSubject, issuerCredentialVersionPairs, issuerProofOfType, issuerProofOfCredentialSubject, issuerProofOfCredentialVersionPairs, _loop_1, _i, versionList_2, version, latestVersion, resultantCredentials;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // The authorization string needs to be passed for the SaaS to authorize getting the DID document associated with the holder / subject.
                    requireAuth_1.requireAuth(authorization);
                    // Validate inputs.
                    validateInputs(issuerDid, subjectDid, credentialDataList, signingPrivateKey, expirationDate);
                    return [4 /*yield*/, didHelper_1.getDidDocPublicKeys(authorization, subjectDid, 'RSA')];
                case 1:
                    publicKeyInfoResponse = _a.sent();
                    publicKeyInfos = publicKeyInfoResponse.body;
                    authorization = publicKeyInfoResponse.authToken;
                    issuerPublicKeyInfos = [];
                    if (!issueCredentialsToSelf) return [3 /*break*/, 3];
                    return [4 /*yield*/, didHelper_1.getDidDocPublicKeys(authorization, issuerDid, 'RSA')];
                case 2:
                    publicKeyInfoResponse_1 = _a.sent();
                    issuerPublicKeyInfos = publicKeyInfoResponse_1.body;
                    authorization = publicKeyInfoResponse_1.authToken;
                    _a.label = 3;
                case 3:
                    creds = [];
                    proofOfCreds = [];
                    for (i = 0; i < credentialDataList.length; i++) {
                        type = credentialDataList[i].type;
                        credData = lodash_1.omit(credentialDataList[i], 'type');
                        credSubject = __assign({ id: subjectDid }, credData);
                        credentialId = helpers_1.getUUID();
                        credentialVersionPairs = constructEncryptedCredentialOfEachVersion(authorization, type, issuerDid, credentialId, credSubject, signingPrivateKey, publicKeyInfos, expirationDate);
                        // add all credentialVersionPairs to creds array
                        Array.prototype.push.apply(creds, credentialVersionPairs);
                        proofOfType = "ProofOf" + type;
                        proofOfCredentialSubject = { id: credSubject.id };
                        proofOfCredentailId = helpers_1.getUUID();
                        proofOfCredentialVersionPairs = constructEncryptedCredentialOfEachVersion(authorization, proofOfType, issuerDid, proofOfCredentailId, proofOfCredentialSubject, signingPrivateKey, publicKeyInfos, expirationDate);
                        // add all proofOfCredentialVersionPairs to creds array
                        Array.prototype.push.apply(proofOfCreds, proofOfCredentialVersionPairs);
                        if (issueCredentialsToSelf) {
                            issuerCredSubject = __assign({ id: issuerDid }, credData);
                            issuerCredentialVersionPairs = constructEncryptedCredentialOfEachVersion(authorization, type, issuerDid, credentialId, issuerCredSubject, signingPrivateKey, issuerPublicKeyInfos, expirationDate);
                            // add all issuerCredentialVersionPairs to creds array
                            Array.prototype.push.apply(creds, issuerCredentialVersionPairs);
                            issuerProofOfType = "ProofOf" + type;
                            issuerProofOfCredentialSubject = { id: issuerCredSubject.id };
                            issuerProofOfCredentialVersionPairs = constructEncryptedCredentialOfEachVersion(authorization, issuerProofOfType, issuerDid, proofOfCredentailId, issuerProofOfCredentialSubject, signingPrivateKey, publicKeyInfos, expirationDate);
                            // add all proofOfCredentialVersionPairs to creds array
                            Array.prototype.push.apply(proofOfCreds, issuerProofOfCredentialVersionPairs);
                        }
                    }
                    _loop_1 = function (version) {
                        var resultantEncryptedCredentials, result, proofOfResultantEncryptedCredentials, proofOfResult;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    resultantEncryptedCredentials = creds.filter(function (credPair) { return credPair.version === version; }).map(function (credPair) { return credPair.encryptedCredential; });
                                    return [4 /*yield*/, sendEncryptedCredentials(authorization, { credentialRequests: resultantEncryptedCredentials }, version)];
                                case 1:
                                    result = _a.sent();
                                    authorization = result.authToken;
                                    proofOfResultantEncryptedCredentials = proofOfCreds.filter(function (credPair) { return credPair.version === version; }).map(function (credPair) { return credPair.encryptedCredential; });
                                    return [4 /*yield*/, sendEncryptedCredentials(authorization, { credentialRequests: proofOfResultantEncryptedCredentials }, version)];
                                case 2:
                                    proofOfResult = _a.sent();
                                    authorization = proofOfResult.authToken;
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, versionList_2 = versionList_1.versionList;
                    _a.label = 4;
                case 4:
                    if (!(_i < versionList_2.length)) return [3 /*break*/, 7];
                    version = versionList_2[_i];
                    return [5 /*yield**/, _loop_1(version)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7:
                    latestVersion = versionList_1.versionList[versionList_1.versionList.length - 1];
                    resultantCredentials = creds.filter(function (credPair) { return credPair.version === latestVersion; }).map(function (credPair) { return credPair.credential; });
                    return [2 /*return*/, {
                            authToken: authorization,
                            body: resultantCredentials
                        }];
            }
        });
    });
};
/**
 * Helper to construct a Credential's CredentialOptions
 * @param type
 * @param issuer
 * @param credentialSubject
 * @param expirationDate
 * @returns
 */
var constructCredentialOptions = function (type, issuer, credentialId, credentialSubject, expirationDate) {
    // HACK ALERT: removing duplicate 'VerifiableCredential' if present in type string[]
    var typeList = ['VerifiableCredential'].concat(type); // Need to have some value in the "base" array so just using the keyword we are going to filter over.
    var types = typeList.filter(function (t) { return t !== 'VerifiableCredential'; });
    var credOpt = {
        credentialSubject: credentialSubject,
        issuer: issuer,
        type: types,
        expirationDate: expirationDate,
        credentialId: credentialId
    };
    return (credOpt);
};
/**
 * Helper to construct versioned CredentialPairs of each version.
 * Also, handles issuing credentials to the Issuer's DID if desired..
 * @param authorization
 * @param type
 * @param issuer
 * @param credentialSubject
 * @param signingPrivateKey
 * @param publicKeyInfos
 * @param expirationDate
 * @returns
 */
var constructEncryptedCredentialOfEachVersion = function (authorization, type, issuer, credentialId, credentialSubject, signingPrivateKey, publicKeyInfos, expirationDate) {
    var credentialOptions = constructCredentialOptions(type, issuer, credentialId, credentialSubject, expirationDate);
    var results = [];
    logger_1.default.debug("credentialId's " + credentialOptions.credentialId + " credentialOptions: " + credentialOptions);
    /**
     * Need to loop through all versions except most recent so that can issued credentials could be backwards compatible with older holder versions.
     * However only care to return the most recent Credential type for customers to use.
     */
    for (var v = 0; v < versionList_1.versionList.length - 1; v++) { // note: purposely terminating one index early, which ought to be the most recent version.
        var version = versionList_1.versionList[v];
        if (semver_1.gte(version, '2.0.0') && semver_1.lt(version, '3.0.0')) {
            // Create latest version of the UnsignedCredential object
            var unsignedCredential_1 = constructUnsignedCredentialObj(credentialOptions);
            // Create the signed Credential object from the unsignedCredential object
            var credential_1 = constructSignedCredentialObj(unsignedCredential_1, signingPrivateKey);
            // Create the encrypted credential issuance dto
            var encryptedCredentialUploadOptions_1 = constructIssueCredentialOptions(credential_1, publicKeyInfos, credentialSubject.id);
            var credPair_1 = {
                credential: credential_1,
                encryptedCredential: encryptedCredentialUploadOptions_1,
                version: version
            };
            results.push(credPair_1);
        }
    }
    // Grabbing the latest version as defined in the version list, 3.0.0
    var latestVersion = versionList_1.versionList[versionList_1.versionList.length - 1];
    // Create latest version of the UnsignedCredential object
    var unsignedCredential = constructUnsignedCredentialPbObj(credentialOptions);
    // const unsignedProofOfCredential = constructUnsignedCredentialPbObj(proofOfCredentialOptions);
    // Create the signed Credential object from the unsignedCredential object
    var credential = constructSignedCredentialPbObj(unsignedCredential, signingPrivateKey);
    // Create the encrypted credential issuance dto
    var encryptedCredentialUploadOptions = constructIssueCredentialOptions(credential, publicKeyInfos, credentialSubject.id);
    var credPair = {
        credential: credential,
        encryptedCredential: encryptedCredentialUploadOptions,
        version: latestVersion
    };
    results.push(credPair);
    return results;
};
/**
 * Helper to construct a IssueCredentialOptions prior to sending to the Saas
 * @param credential
 * @param proofOfCredential
 * @param publicKeyInfos
 * @param subjectDid
 * @returns
 */
var constructIssueCredentialOptions = function (credential, publicKeyInfos, subjectDid) {
    // Create the attributes for an encrypted credential. The authorization string is used to get the DID Document containing the subject's public key for encryption.
    var encryptedCredentialOptions = constructEncryptedCredentialOpts(credential, publicKeyInfos);
    // Removing the 'credential' of "VerifiableCredential" from the Unum ID internal type for simplicity
    var credentialType = getCredentialType_1.getCredentialType(credential.type);
    var encryptedCredentialUploadOptions = {
        credentialId: credential.id,
        subject: subjectDid,
        issuer: credential.issuer,
        type: credentialType,
        encryptedCredentials: encryptedCredentialOptions
    };
    return encryptedCredentialUploadOptions;
};
/**
 * Helper to send multiple encrypted credentials, IssueCredentialsOptions, to the Saas
 * @param authorization
 * @param encryptedCredentialUploadOptions
 * @param version
 * @returns
 */
var sendEncryptedCredentials = function (authorization, encryptedCredentialUploadOptions, version) { return __awaiter(void 0, void 0, void 0, function () {
    var restData, restResp, authToken, issuedCredential;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                restData = {
                    method: 'POST',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'credentialsRepository',
                    header: { Authorization: authorization, version: version },
                    data: encryptedCredentialUploadOptions
                };
                return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(restData)];
            case 1:
                restResp = _a.sent();
                authToken = networkRequestHelper_1.handleAuthTokenHeader(restResp, authorization);
                issuedCredential = { body: restResp.body, authToken: authToken };
                return [2 /*return*/, issuedCredential];
        }
    });
}); };
/**
 * Validates the credential data objects
 * @param credentialDataList
 */
function validateCredentialDataList(credentialDataList) {
    for (var _i = 0, credentialDataList_1 = credentialDataList; _i < credentialDataList_1.length; _i++) {
        var data = credentialDataList_1[_i];
        if (!data.type) {
            throw new error_1.CustError(400, 'Credential Data needs to contain the credential type');
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWVDcmVkZW50aWFscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pc3N1ZXIvaXNzdWVDcmVkZW50aWFscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvQ0FBdUM7QUFFdkMsOENBQTZDO0FBQzdDLHVDQUFtUTtBQUduUSxxREFBK0I7QUFDL0IsZ0RBQXlEO0FBQ3pELDRDQUEwRDtBQUMxRCxvREFBa0U7QUFDbEUsNENBQTJDO0FBQzNDLHdDQUEyQztBQUMzQyxzRUFBMEY7QUFDMUYsOEVBQTZFO0FBQzdFLGlDQUFpQztBQUNqQyxvREFBbUQ7QUFDbkQseURBQXFEO0FBQ3JELGdFQUErRDtBQUMvRCxpQ0FBOEI7QUFTOUIsU0FBUyxjQUFjLENBQUUsSUFBK0I7SUFDdEQsd0ZBQXdGO0lBQ3hGLE9BQVEsSUFBcUIsQ0FBQyxPQUFPLEtBQUssU0FBUyxDQUFDO0FBQ3RELENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsSUFBTSxnQ0FBZ0MsR0FBRyxVQUFDLElBQStCLEVBQUUsY0FBK0I7SUFDeEcsSUFBTSxpQkFBaUIsR0FBc0IsbURBQXdCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDOUYsSUFBTSxVQUFVLEdBQUcsaUJBQWlCLENBQUMsRUFBRSxDQUFDO0lBRXhDLGdCQUFNLENBQUMsS0FBSyxDQUFDLDJCQUF5QixJQUFNLENBQUMsQ0FBQztJQUM5QyxzRUFBc0U7SUFDdEUsT0FBTyxjQUFjLENBQUMsR0FBRyxDQUFDLFVBQUEsYUFBYTtRQUNyQyxJQUFNLHlCQUF5QixHQUFNLFVBQVUsU0FBSSxhQUFhLENBQUMsRUFBSSxDQUFDO1FBRXRFLGtGQUFrRjtRQUNsRixJQUFNLGFBQWEsR0FBa0IsY0FBYyxDQUFDLElBQUksQ0FBQztZQUN2RCxDQUFDLENBQUMscUJBQVcsQ0FBQyx5QkFBeUIs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U0FBUyxXQUFBLEVBQUUsQ0FBQztnQkFFM0Usc0JBQU8sZ0JBQWdCLEVBQUM7OztLQUN6QixDQUFDO0FBRUY7OztHQUdHO0FBQ0gsU0FBUywwQkFBMEIsQ0FBRSxrQkFBb0M7SUFDdkUsS0FBbUIsVUFBa0IsRUFBbEIseUNBQWtCLEVBQWxCLGdDQUFrQixFQUFsQixJQUFrQixFQUFFO1FBQWxDLElBQU0sSUFBSSwyQkFBQTtRQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ2QsTUFBTSxJQUFJLGlCQUFTLENBQUMsR0FBRyxFQUFFLHNEQUFzRCxDQUFDLENBQUM7U0FDbEY7S0FDRjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjb25maWdEYXRhIH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7IENyZWRlbnRpYWxPcHRpb25zLCBSRVNURGF0YSwgVW51bUR0byB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IHJlcXVpcmVBdXRoIH0gZnJvbSAnLi4vcmVxdWlyZUF1dGgnO1xuaW1wb3J0IHsgQ3JlZGVudGlhbFN1YmplY3QsIEVuY3J5cHRlZENyZWRlbnRpYWxPcHRpb25zLCBFbmNyeXB0ZWREYXRhLCBQcm9vZiwgQ3JlZGVudGlhbCwgSlNPTk9iaiwgVW5zaWduZWRDcmVkZW50aWFsUGIsIENyZWRlbnRpYWxQYiwgUHJvb2ZQYiwgUHVibGljS2V5SW5mbywgQ3JlZGVudGlhbERhdGEsIElzc3VlQ3JlZGVudGlhbHNPcHRpb25zLCBXaXRoVmVyc2lvbiwgSXNzdWVDcmVkZW50aWFsT3B0aW9ucyB9IGZyb20gJ0B1bnVtaWQvdHlwZXMnO1xuaW1wb3J0IHsgVW5zaWduZWRDcmVkZW50aWFsIGFzIFVuc2lnbmVkQ3JlZGVudGlhbFYyLCBDcmVkZW50aWFsIGFzIENyZWRlbnRpYWxWMiB9IGZyb20gJ0B1bnVtaWQvdHlwZXMtdjInO1xuXG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBnZXREaWREb2NQdWJsaWNLZXlzIH0gZnJvbSAnLi4vdXRpbHMvZGlkSGVscGVyJztcbmltcG9ydCB7IGRvRW5jcnlwdCwgZG9FbmNyeXB0UGIgfSBmcm9tICcuLi91dGlscy9lbmNyeXB0JztcbmltcG9ydCB7IGNyZWF0ZVByb29mLCBjcmVhdGVQcm9vZlBiIH0gZnJvbSAnLi4vdXRpbHMvY3JlYXRlUHJvb2YnO1xuaW1wb3J0IHsgZ2V0VVVJRCB9IGZyb20gJy4uL3V0aWxzL2hlbHBlcnMnO1xuaW1wb3J0IHsgQ3VzdEVycm9yIH0gZnJvbSAnLi4vdXRpbHMvZXJyb3InO1xuaW1wb3J0IHsgaGFuZGxlQXV0aFRva2VuSGVhZGVyLCBtYWtlTmV0d29ya1JlcXVlc3QgfSBmcm9tICcuLi91dGlscy9uZXR3b3JrUmVxdWVzdEhlbHBlcic7XG5pbXBvcnQgeyBjb252ZXJ0Q3JlZGVudGlhbFN1YmplY3QgfSBmcm9tICcuLi91dGlscy9jb252ZXJ0Q3JlZGVudGlhbFN1YmplY3QnO1xuaW1wb3J0IHsgZ3RlLCBsdCB9IGZyb20gJ3NlbXZlcic7XG5pbXBvcnQgeyB2ZXJzaW9uTGlzdCB9IGZyb20gJy4uL3V0aWxzL3ZlcnNpb25MaXN0JztcbmltcG9ydCB7IENyeXB0b0Vycm9yIH0gZnJvbSAnQHVudW1pZC9saWJyYXJ5LWNyeXB0byc7XG5pbXBvcnQgeyBnZXRDcmVkZW50aWFsVHlwZSB9IGZyb20gJy4uL3V0aWxzL2dldENyZWRlbnRpYWxUeXBlJztcbmltcG9ydCB7IG9taXQgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgdjQgfSBmcm9tICd1dWlkJztcblxuLy8gaW50ZXJmYWNlIHRvIGhhbmRsZSBncm91cGluZyBDcmVkZW50aWFscyBhbmQgdGhlaXIgZW5jcnlwdGVkIGZvcm1cbmludGVyZmFjZSBDcmVkZW50aWFsUGFpciB7XG4gIGVuY3J5cHRlZENyZWRlbnRpYWw6IElzc3VlQ3JlZGVudGlhbE9wdGlvbnMsXG4gIGNyZWRlbnRpYWw6IENyZWRlbnRpYWxQYiB8IENyZWRlbnRpYWxcbn1cblxuZnVuY3Rpb24gaXNDcmVkZW50aWFsUGIgKGNyZWQ6IENyZWRlbnRpYWwgfCBDcmVkZW50aWFsUGIpOiBib29sZWFuIHtcbiAgLy8gSEFDSyBBTEVSVDoganVzdCBjaGVjayBpZiB0aGUgY3JlZCBvYmplY3QgaGFzIGEgcHJvcGVydHkgdW5pcXVlIHRvIENyZWRlbnRpYWxQYiB0eXBlc1xuICByZXR1cm4gKGNyZWQgYXMgQ3JlZGVudGlhbFBiKS5jb250ZXh0ICE9PSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBvYmplY3Qgb2YgdHlwZSBFbmNyeXB0ZWRDcmVkZW50aWFsT3B0aW9ucyB3aGljaCBlbmNhcHN1bGF0ZXMgaW5mb3JtYXRpb24gcmVsYXRpbmcgdG8gdGhlIGVuY3J5cHRlZCBjcmVkZW50aWFsIGRhdGFcbiAqIEBwYXJhbSBjcmVkXG4gKiBAcGFyYW0gcHVibGljS2V5SW5mb3NcbiAqL1xuY29uc3QgY29uc3RydWN0RW5jcnlwdGVkQ3JlZGVudGlhbE9wdHMgPSAoY3JlZDogQ3JlZGVudGlhbCB8IENyZWRlbnRpYWxQYiwgcHVibGljS2V5SW5mb3M6IFB1YmxpY0tleUluZm9bXSk6IEVuY3J5cHRlZENyZWRlbnRpYWxPcHRpb25zW10gPT4ge1xuICBjb25zdCBjcmVkZW50aWFsU3ViamVjdDogQ3JlZGVudGlhbFN1YmplY3QgPSBjb252ZXJ0Q3JlZGVudGlhbFN1YmplY3QoY3JlZC5jcmVkZW50aWFsU3ViamVjdCk7XG4gIGNvbnN0IHN1YmplY3REaWQgPSBjcmVkZW50aWFsU3ViamVjdC5pZDtcblxuICBsb2dnZXIuZGVidWcoYEVuY3J5cHRpbmcgY3JlZGVudGlhbCAke2NyZWR9YCk7XG4gIC8vIGNyZWF0ZSBhbiBlbmNyeXB0ZWQgY29weSBvZiB0aGUgY3JlZGVudGlhbCB3aXRoIGVhY2ggUlNBIHB1YmxpYyBrZXlcbiAgcmV0dXJuIHB1YmxpY0tleUluZm9zLm1hcChwdWJsaWNLZXlJbmZvID0+IHtcbiAgICBjb25zdCBzdWJqZWN0RGlkV2l0aEtleUZyYWdtZW50ID0gYCR7c3ViamVjdERpZH0jJHtwdWJsaWNLZXlJbmZvLmlkfWA7XG5cbiAgICAvLyB1c2UgdGhlIHByb3RvYnVmIGJ5dGUgYXJyYXkgZW5jcnlwdGlvbiBpZiBkZWFsaW5nIHdpdGggYSBDcmVkZW50aWFsUGIgY3JlZCB0eXBlXG4gICAgY29uc3QgZW5jcnlwdGVkRGF0YTogRW5jcnlwdGVkRGF0YSA9IGlzQ3JlZGVudGlhbFBiKGNyZWQpXG4gICAgICA/IGRvRW5jcnlwdFBiKHN1YmplY3REaWRXaXRoS2V5RnJhZ21lbnQsIHB1YmxpY0tleUluZm8sIENyZWRlbnRpYWxQYi5lbmNvZGUoY3JlZCBhcyBDcmVkZW50aWFsUGIpLmZpbmlzaCgpKVxuICAgICAgOiBkb0VuY3J5cHQoc3ViamVjdERpZFdpdGhLZXlGcmFnbWVudCwgcHVibGljS2V5SW5mbywgY3JlZCk7XG5cbiAgICAvLyBSZW1vdmluZyB0aGUgdzNjIGNyZWRlbnRpYWwgc3BlYyBvZiBcIlZlcmlmaWFibGVDcmVkZW50aWFsXCIgZnJvbSB0aGUgVW51bSBJRCBpbnRlcm5hbCB0eXBlIGZvciBzaW1wbGljaXR5XG4gICAgY29uc3QgY3JlZGVudGlhbFR5cGUgPSBnZXRDcmVkZW50aWFsVHlwZShjcmVkLnR5cGUpO1xuXG4gICAgY29uc3QgZW5jcnlwdGVkQ3JlZGVudGlhbE9wdGlvbnM6IEVuY3J5cHRlZENyZWRlbnRpYWxPcHRpb25zID0ge1xuICAgICAgY3JlZGVudGlhbElkOiBjcmVkLmlkLFxuICAgICAgc3ViamVjdDogc3ViamVjdERpZFdpdGhLZXlGcmFnbWVudCxcbiAgICAgIGlzc3VlcjogY3JlZC5pc3N1ZXIsXG4gICAgICB0eXBlOiBjcmVkZW50aWFsVHlwZSxcbiAgICAgIGRhdGE6IGVuY3J5cHRlZERhdGEsXG4gICAgICBleHBpcmF0aW9uRGF0ZTogY3JlZC5leHBpcmF0aW9uRGF0ZVxuICAgIH07XG5cbiAgICByZXR1cm4gZW5jcnlwdGVkQ3JlZGVudGlhbE9wdGlvbnM7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgc2lnbmVkIGNyZWRlbnRpYWwgd2l0aCBhbGwgdGhlIHJlbGV2YW50IGluZm9ybWF0aW9uLiBUaGUgcHJvb2Ygc2VydmVzIGFzIGEgY3J5cHRvZ3JhcGhpYyBzaWduYXR1cmUuXG4gKiBAcGFyYW0gdXNDcmVkIFVuc2lnbmVkQ3JlZGVudGlhbFBiXG4gKiBAcGFyYW0gcHJpdmF0ZUtleSBTdHJpbmdcbiAqL1xuY29uc3QgY29uc3RydWN0U2lnbmVkQ3JlZGVudGlhbFBiT2JqID0gKHVzQ3JlZDogVW5zaWduZWRDcmVkZW50aWFsUGIsIHByaXZhdGVLZXk6IHN0cmluZyk6IENyZWRlbnRpYWxQYiA9PiB7XG4gIHRyeSB7XG4gICAgLy8gY29udmVydCB0aGUgcHJvdG9idWYgdG8gYSBieXRlIGFycmF5XG4gICAgY29uc3QgYnl0ZXM6IFVpbnQ4QXJyYXkgPSBVbnNpZ25lZENyZWRlbnRpYWxQYi5lbmNvZGUodXNDcmVkKS5maW5pc2goKTtcblxuICAgIGNvbnN0IHByb29mOiBQcm9vZlBiID0gY3JlYXRlUHJvb2ZQYihieXRlcywgcHJpdmF0ZUtleSwgdXNDcmVkLmlzc3Vlcik7XG5cbiAgICBjb25zdCBjcmVkZW50aWFsOiBDcmVkZW50aWFsUGIgPSB7XG4gICAgICBjb250ZXh0OiB1c0NyZWQuY29udGV4dCxcbiAgICAgIGNyZWRlbnRpYWxTdGF0dXM6IHVzQ3JlZC5jcmVkZW50aWFsU3RhdHVzLFxuICAgICAgY3JlZGVudGlhbFN1YmplY3Q6IHVzQ3JlZC5jcmVkZW50aWFsU3ViamVjdCxcbiAgICAgIGlzc3VlcjogdXNDcmVkLmlzc3VlcixcbiAgICAgIHR5cGU6IHVzQ3JlZC50eXBlLFxuICAgICAgaWQ6IHVzQ3JlZC5pZCxcbiAgICAgIGlzc3VhbmNlRGF0ZTogdXNDcmVkLmlzc3VhbmNlRGF0ZSxcbiAgICAgIGV4cGlyYXRpb25EYXRlOiB1c0NyZWQuZXhwaXJhdGlvbkRhdGUsXG4gICAgICBwcm9vZjogcHJvb2ZcbiAgICB9O1xuXG4gICAgcmV0dXJuIChjcmVkZW50aWFsKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChlIGluc3RhbmNlb2YgQ3J5cHRvRXJyb3IpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihgSXNzdWUgaW4gdGhlIGNyeXB0byBsaWIgd2hpbGUgY3JlYXRpbmcgY3JlZGVudGlhbCAke3VzQ3JlZC5pZH0gcHJvb2YuICR7ZX0uYCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ2dlci5lcnJvcihgSXNzdWUgd2hpbGUgY3JlYXRpbmcgY3JlYXRpbmcgY3JlZGVudGlhbCAke3VzQ3JlZC5pZH0gcHJvb2YgJHtlfS5gKTtcbiAgICB9XG5cbiAgICB0aHJvdyBlO1xuICB9XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBzaWduZWQgY3JlZGVudGlhbCB3aXRoIGFsbCB0aGUgcmVsZXZhbnQgaW5mb3JtYXRpb24uIFRoZSBwcm9vZiBzZXJ2ZXMgYXMgYSBjcnlwdG9ncmFwaGljIHNpZ25hdHVyZS5cbiAqIEBwYXJhbSB1c0NyZWQgVW5zaWduZWRDcmVkZW50aWFsXG4gKiBAcGFyYW0gcHJpdmF0ZUtleSBTdHJpbmdcbiAqL1xuY29uc3QgY29uc3RydWN0U2lnbmVkQ3JlZGVudGlhbE9iaiA9ICh1c0NyZWQ6IFVuc2lnbmVkQ3JlZGVudGlhbFYyLCBwcml2YXRlS2V5OiBzdHJpbmcpOiBDcmVkZW50aWFsVjIgPT4ge1xuICBjb25zdCBwcm9vZjogUHJvb2YgPSBjcmVhdGVQcm9vZih1c0NyZWQsIHByaXZhdGVLZXksIHVzQ3JlZC5pc3N1ZXIsICdwZW0nKTtcbiAgY29uc3QgY3JlZGVudGlhbDogQ3JlZGVudGlhbFYyID0ge1xuICAgICdAY29udGV4dCc6IHVzQ3JlZFsnQGNvbnRleHQnXSxcbiAgICBjcmVkZW50aWFsU3RhdHVzOiB1c0NyZWQuY3JlZGVudGlhbFN0YXR1cyxcbiAgICBjcmVkZW50aWFsU3ViamVjdDogdXNDcmVkLmNyZWRlbnRpYWxTdWJqZWN0LFxuICAgIGlzc3VlcjogdXNDcmVkLmlzc3VlcixcbiAgICB0eXBlOiB1c0NyZWQudHlwZSxcbiAgICBpZDogdXNDcmVkLmlkLFxuICAgIGlzc3VhbmNlRGF0ZTogdXNDcmVkLmlzc3VhbmNlRGF0ZSxcbiAgICBleHBpcmF0aW9uRGF0ZTogdXNDcmVkLmV4cGlyYXRpb25EYXRlLFxuICAgIHByb29mOiBwcm9vZlxuICB9O1xuXG4gIHJldHVybiAoY3JlZGVudGlhbCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYWxsIHRoZSBhdHRyaWJ1dGVzIGFzc29jaWF0ZWQgd2l0aCBhbiB1bnNpZ25lZCBjcmVkZW50aWFsLlxuICogQHBhcmFtIGNyZWRPcHRzIENyZWRlbnRpYWxPcHRpb25zXG4gKiBAcGFyYW0gY3JlZGVudGlhbElkXG4gKi9cbmNvbnN0IGNvbnN0cnVjdFVuc2lnbmVkQ3JlZGVudGlhbFBiT2JqID0gKGNyZWRPcHRzOiBDcmVkZW50aWFsT3B0aW9ucyk6IFVuc2lnbmVkQ3JlZGVudGlhbFBiID0+IHtcbiAgY29uc3QgeyBleHBpcmF0aW9uRGF0ZSwgY3JlZGVudGlhbElkLCBjcmVkZW50aWFsU3ViamVjdCwgaXNzdWVyLCB0eXBlIH0gPSBjcmVkT3B0cztcblxuICAvLyBjcmVkZW50aWFsIHN1YmplY3QgaXMgYSBzdHJpbmcgdG8gZmFjaWxpdGF0ZSBoYW5kbGluZyBhcmJpdHJhcnkgZGF0YSBpbiB0aGUgcHJvdG9idWYgb2JqZWN0XG4gIGNvbnN0IGNyZWRlbnRpYWxTdWJqZWN0U3RyaW5naWZpZWQgPSBKU09OLnN0cmluZ2lmeShjcmVkZW50aWFsU3ViamVjdCk7XG5cbiAgY29uc3QgdW5zQ3JlZE9iajogVW5zaWduZWRDcmVkZW50aWFsUGIgPSB7XG4gICAgY29udGV4dDogWydodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSddLFxuICAgIGNyZWRlbnRpYWxTdGF0dXM6IHtcbiAgICAgIGlkOiBgJHtjb25maWdEYXRhLlNhYVNVcmx9L2NyZWRlbnRpYWxTdGF0dXMvJHtjcmVkZW50aWFsSWR9YCxcbiAgICAgIHR5cGU6ICdDcmVkZW50aWFsU3RhdHVzJ1xuICAgIH0sXG4gICAgY3JlZGVudGlhbFN1YmplY3Q6IGNyZWRlbnRpYWxTdWJqZWN0U3RyaW5naWZpZWQsXG4gICAgaXNzdWVyLFxuICAgIHR5cGU6IFsnVmVyaWZpYWJsZUNyZWRlbnRpYWwnLCAuLi50eXBlXSxcbiAgICBpZDogY3JlZGVudGlhbElkLFxuICAgIGlzc3VhbmNlRGF0ZTogbmV3IERhdGUoKSxcbiAgICBleHBpcmF0aW9uRGF0ZTogZXhwaXJhdGlvbkRhdGVcbiAgfTtcblxuICByZXR1cm4gdW5zQ3JlZE9iajtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhbGwgdGhlIGF0dHJpYnV0ZXMgYXNzb2NpYXRlZCB3aXRoIGFuIHVuc2lnbmVkIGNyZWRlbnRpYWwuXG4gKiBAcGFyYW0gY3JlZE9wdHMgQ3JlZGVudGlhbE9wdGlvbnNcbiAqIEByZXR1cm4gVW5zaWduZWQgY3JlZGVudGlhbFxuICovXG5jb25zdCBjb25zdHJ1Y3RVbnNpZ25lZENyZWRlbnRpYWxPYmogPSAoY3JlZE9wdHM6IENyZWRlbnRpYWxPcHRpb25zKTogVW5zaWduZWRDcmVkZW50aWFsVjIgPT4ge1xuICBjb25zdCB7IGV4cGlyYXRpb25EYXRlLCBjcmVkZW50aWFsSWQsIGNyZWRlbnRpYWxTdWJqZWN0LCBpc3N1ZXIsIHR5cGUgfSA9IGNyZWRPcHRzO1xuXG4gIC8vIENyZWRlbnRpYWxTdWJqZWN0IHR5cGUgaXMgZGVwZW5kZW50IG9uIHZlcnNpb24uIFYyIGlzIGEgc3RyaW5nIGZvciBwYXNzaW5nIHRvIGhvbGRlciBzbyBpT1MgY2FuIGhhbmRsZSBpdCBhcyBhIGNvbmNyZXRlIHR5cGUgaW5zdGVhZCBvZiBhIG1hcCBvZiB1bmtub3duIGtleXMuXG4gIGNvbnN0IGNyZWRlbnRpYWxTdWJqZWN0U3RyaW5naWZpZWQgPSBKU09OLnN0cmluZ2lmeShjcmVkZW50aWFsU3ViamVjdCk7XG5cbiAgY29uc3QgdW5zQ3JlZE9iajogVW5zaWduZWRDcmVkZW50aWFsVjIgPSB7XG4gICAgJ0Bjb250ZXh0JzogWydodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSddLFxuICAgIGNyZWRlbnRpYWxTdGF0dXM6IHtcbiAgICAgIGlkOiBgJHtjb25maWdEYXRhLlNhYVNVcmx9L2NyZWRlbnRpYWxTdGF0dXMvJHtjcmVkZW50aWFsSWR9YCxcbiAgICAgIHR5cGU6ICdDcmVkZW50aWFsU3RhdHVzJ1xuICAgIH0sXG4gICAgY3JlZGVudGlhbFN1YmplY3Q6IGNyZWRlbnRpYWxTdWJqZWN0U3RyaW5naWZpZWQsXG4gICAgaXNzdWVyLFxuICAgIHR5cGU6IFsnVmVyaWZpYWJsZUNyZWRlbnRpYWwnLCAuLi50eXBlXSxcbiAgICBpZDogY3JlZGVudGlhbElkLFxuICAgIGlzc3VhbmNlRGF0ZTogbmV3IERhdGUoKSxcbiAgICBleHBpcmF0aW9uRGF0ZTogZXhwaXJhdGlvbkRhdGVcbiAgfTtcblxuICByZXR1cm4gdW5zQ3JlZE9iajtcbn07XG5cbi8qKlxuICogSGFuZGxlIGlucHV0IHZhbGlkYXRpb24uXG4gKiBAcGFyYW0gaXNzdWVyXG4gKiBAcGFyYW0gc3ViamVjdERpZFxuICogQHBhcmFtIGNyZWRlbnRpYWxEYXRhTGlzdFxuICogQHBhcmFtIHNpZ25pbmdQcml2YXRlS2V5XG4gKiBAcGFyYW0gZXhwaXJhdGlvbkRhdGVcbiAqL1xuY29uc3QgdmFsaWRhdGVJbnB1dHMgPSAoaXNzdWVyOiBzdHJpbmcsIHN1YmplY3REaWQ6IHN0cmluZywgY3JlZGVudGlhbERhdGFMaXN0OiBDcmVkZW50aWFsRGF0YVtdLCBzaWduaW5nUHJpdmF0ZUtleTogc3RyaW5nLCBleHBpcmF0aW9uRGF0ZT86IERhdGUpOiB2b2lkID0+IHtcbiAgaWYgKCFpc3N1ZXIpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ2lzc3VlciBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICghc3ViamVjdERpZCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnc3ViamVjdERpZCBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICghc2lnbmluZ1ByaXZhdGVLZXkpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ3NpZ25pbmdQcml2YXRlS2V5IGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBpc3N1ZXIgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdpc3N1ZXIgbXVzdCBiZSBhIHN0cmluZy4nKTtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygc2lnbmluZ1ByaXZhdGVLZXkgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdzaWduaW5nUHJpdmF0ZUtleSBtdXN0IGJlIGEgc3RyaW5nLicpO1xuICB9XG5cbiAgLy8gZXhwaXJhdGlvbkRhdGUgbXVzdCBiZSBhIERhdGUgb2JqZWN0IGFuZCByZXR1cm4gYSBwcm9wZXJseSBmb3JtZWQgdGltZS4gSW52YWxpZCBEYXRlLmdldFRpbWUoKSB3aWxsIHByb2R1Y2UgTmFOXG4gIGlmIChleHBpcmF0aW9uRGF0ZSAmJiAoIShleHBpcmF0aW9uRGF0ZSBpbnN0YW5jZW9mIERhdGUpIHx8IGlzTmFOKGV4cGlyYXRpb25EYXRlLmdldFRpbWUoKSkpKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdleHBpcmF0aW9uRGF0ZSBtdXN0IGJlIGEgdmFsaWQgRGF0ZSBvYmplY3QuJyk7XG4gIH1cblxuICBpZiAoZXhwaXJhdGlvbkRhdGUgJiYgZXhwaXJhdGlvbkRhdGUgPCBuZXcgRGF0ZSgpKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdleHBpcmF0aW9uRGF0ZSBtdXN0IGJlIGluIHRoZSBmdXR1cmUuJyk7XG4gIH1cblxuICAvLyB2YWxpZGF0ZSBjcmVkZW50aWFsRGF0YUxpc3RcbiAgdmFsaWRhdGVDcmVkZW50aWFsRGF0YUxpc3QoY3JlZGVudGlhbERhdGFMaXN0KTtcbn07XG5cbi8qKlxuICogTXVsdGlwbGV4ZWQgaGFuZGxlciBmb3IgaXNzdWluZyBjcmVkZW50aWFscyB3aXRoIFVudW1JRCdzIFNhYVMuXG4gKiBAcGFyYW0gYXV0aG9yaXphdGlvblxuICogQHBhcmFtIGlzc3VlclxuICogQHBhcmFtIHN1YmplY3REaWRcbiAqIEBwYXJhbSBjcmVkZW50aWFsRGF0YUxpc3RcbiAqIEBwYXJhbSBzaWduaW5nUHJpdmF0ZUtleVxuICogQHBhcmFtIGV4cGlyYXRpb25EYXRlXG4gKi9cbmV4cG9ydCBjb25zdCBpc3N1ZUNyZWRlbnRpYWxzID0gYXN5bmMgKGF1dGhvcml6YXRpb246IHN0cmluZywgaXNzdWVyRGlkOiBzdHJpbmcsIHN1YmplY3REaWQ6IHN0cmluZywgY3JlZGVudGlhbERhdGFMaXN0OiBDcmVkZW50aWFsRGF0YVtdLCBzaWduaW5nUHJpdmF0ZUtleTogc3RyaW5nLCBleHBpcmF0aW9uRGF0ZT86IERhdGUsIGlzc3VlQ3JlZGVudGlhbHNUb1NlbGYgPSB0cnVlKTogUHJvbWlzZTxVbnVtRHRvPChDcmVkZW50aWFsUGIgfCBDcmVkZW50aWFsKVtdPj4gPT4ge1xuICAvLyBUaGUgYXV0aG9yaXphdGlvbiBzdHJpbmcgbmVlZHMgdG8gYmUgcGFzc2VkIGZvciB0aGUgU2FhUyB0byBhdXRob3JpemUgZ2V0dGluZyB0aGUgRElEIGRvY3VtZW50IGFzc29jaWF0ZWQgd2l0aCB0aGUgaG9sZGVyIC8gc3ViamVjdC5cbiAgcmVxdWlyZUF1dGgoYXV0aG9yaXphdGlvbik7XG5cbiAgLy8gVmFsaWRhdGUgaW5wdXRzLlxuICB2YWxpZGF0ZUlucHV0cyhpc3N1ZXJEaWQsIHN1YmplY3REaWQsIGNyZWRlbnRpYWxEYXRhTGlzdCwgc2lnbmluZ1ByaXZhdGVLZXksIGV4cGlyYXRpb25EYXRlKTtcblxuICAvLyBHZXQgdGFyZ2V0IFN1YmplY3QncyBESUQgZG9jdW1lbnQgcHVibGljIGtleXMgZm9yIGVuY3J5cHRpbmcgYWxsIHRoZSBjcmVkZW50aWFscyBpc3N1ZWQuXG4gIGNvbnN0IHB1YmxpY0tleUluZm9SZXNwb25zZTogVW51bUR0bzxQdWJsaWNLZXlJbmZvW10+ID0gYXdhaXQgZ2V0RGlkRG9jUHVibGljS2V5cyhhdXRob3JpemF0aW9uLCBzdWJqZWN0RGlkLCAnUlNBJyk7XG4gIGNvbnN0IHB1YmxpY0tleUluZm9zID0gcHVibGljS2V5SW5mb1Jlc3BvbnNlLmJvZHk7XG4gIGF1dGhvcml6YXRpb24gPSBwdWJsaWNLZXlJbmZvUmVzcG9uc2UuYXV0aFRva2VuO1xuXG4gIGxldCBpc3N1ZXJQdWJsaWNLZXlJbmZvczogUHVibGljS2V5SW5mb1tdID0gW107XG4gIGlmIChpc3N1ZUNyZWRlbnRpYWxzVG9TZWxmKSB7XG4gICAgLy8gbmVlZCB0byBnZXQgdGhlIERJRCBkb2N1bWVudCBwdWJsaWMga2V5cyBmb3IgdGhlIGlzc3VlciBpbiBvcmRlciB0byBpc3N1ZSBjcmVkZW50aWFscyB0byBzZWxmXG4gICAgY29uc3QgcHVibGljS2V5SW5mb1Jlc3BvbnNlOiBVbnVtRHRvPFB1YmxpY0tleUluZm9bXT4gPSBhd2FpdCBnZXREaWREb2NQdWJsaWNLZXlzKGF1dGhvcml6YXRpb24sIGlzc3VlckRpZCwgJ1JTQScpO1xuICAgIGlzc3VlclB1YmxpY0tleUluZm9zID0gcHVibGljS2V5SW5mb1Jlc3BvbnNlLmJvZHk7XG4gICAgYXV0aG9yaXphdGlvbiA9IHB1YmxpY0tleUluZm9SZXNwb25zZS5hdXRoVG9rZW47XG4gIH1cblxuICAvLyBsb29wIHRocm91Z2ggdGhlIHR5cGVzIGFuZCBjcmVkZW50aWFsIGRhdGEgbGlzdHMgaW5wdXR0ZWQgdG8gY3JlYXRlIENyZWRlbnRpYWxQYWlycyBvZiBlYWNoIHN1cHBvcnRlZCB2ZXJzaW9uIGZvciBlYWNoXG4gIGNvbnN0IGNyZWRzOiBXaXRoVmVyc2lvbjxDcmVkZW50aWFsUGFpcj5bXSA9IFtdO1xuICBjb25zdCBwcm9vZk9mQ3JlZHM6IFdpdGhWZXJzaW9uPENyZWRlbnRpYWxQYWlyPltdID0gW107XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjcmVkZW50aWFsRGF0YUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCB0eXBlID0gY3JlZGVudGlhbERhdGFMaXN0W2ldLnR5cGU7XG4gICAgY29uc3QgY3JlZERhdGEgPSBvbWl0KGNyZWRlbnRpYWxEYXRhTGlzdFtpXSwgJ3R5cGUnKTtcblxuICAgIC8vIGNvbnN0cnVjdCB0aGUgQ3JlZGVudGlhbCdzIGNyZWRlbnRpYWxTdWJqZWN0XG4gICAgY29uc3QgY3JlZFN1YmplY3Q6IENyZWRlbnRpYWxTdWJqZWN0ID0geyBpZDogc3ViamVjdERpZCwgLi4uY3JlZERhdGEgfTtcbiAgICBjb25zdCBjcmVkZW50aWFsSWQgPSBnZXRVVUlEKCk7XG5cbiAgICAvLyBjb25zdHJ1Y3QgdGhlIENyZWRlbnRpYWxzIGFuZCB0aGVpciBlbmNyeXB0ZWQgZm9ybSBmb3IgZWFjaCBzdXBwb3J0ZWQgdmVyc2lvblxuICAgIGNvbnN0IGNyZWRlbnRpYWxWZXJzaW9uUGFpcnM6IENyZWRlbnRpYWxQYWlyW10gPSBjb25zdHJ1Y3RFbmNyeXB0ZWRDcmVkZW50aWFsT2ZFYWNoVmVyc2lvbihhdXRob3JpemF0aW9uLCB0eXBlLCBpc3N1ZXJEaWQsIGNyZWRlbnRpYWxJZCwgY3JlZFN1YmplY3QsIHNpZ25pbmdQcml2YXRlS2V5LCBwdWJsaWNLZXlJbmZvcywgZXhwaXJhdGlvbkRhdGUpO1xuXG4gICAgLy8gYWRkIGFsbCBjcmVkZW50aWFsVmVyc2lvblBhaXJzIHRvIGNyZWRzIGFycmF5XG4gICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoY3JlZHMsIGNyZWRlbnRpYWxWZXJzaW9uUGFpcnMpO1xuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIGNvbnN0cnVjdGlvbiBvZiB0aGUgUHJvb2ZPZkNyZWRlbnRpYWxzIGFuZCB0aGVpciBlbmNyeXB0ZWQgZm9ybSBmb3IgZWFjaCBzdXBwb3J0ZWQgdmVyc2lvblxuICAgICAqL1xuICAgIGNvbnN0IHByb29mT2ZUeXBlID0gYFByb29mT2Yke3R5cGV9YDsgLy8gcHJlZml4aW5nIHRoZSB0eXBlIHdpdGggUHJvb2ZPZlxuICAgIGNvbnN0IHByb29mT2ZDcmVkZW50aWFsU3ViamVjdCA9IHsgaWQ6IGNyZWRTdWJqZWN0LmlkIH07IC8vIG5vIGNyZWRlbnRpYWwgZGF0YSBmb3IgYSBQcm9vZk9mIENyZWRlbnRpYWxcbiAgICBjb25zdCBwcm9vZk9mQ3JlZGVudGFpbElkID0gZ2V0VVVJRCgpOyAvLyBwcm9vZk9mIGNyZWRlbnRpYWxzIGRvIG5vdCBzaGFyZSBhIGNyZWRlbnRpYWxJZCBiZWNhdXNlIGRpZmZlcmVudCBjcmVkZW50aWFsIGRhdGEgKGVtcHR5KVxuICAgIGNvbnN0IHByb29mT2ZDcmVkZW50aWFsVmVyc2lvblBhaXJzOiBDcmVkZW50aWFsUGFpcltdID0gY29uc3RydWN0RW5jcnlwdGVkQ3JlZGVudGlhbE9mRWFjaFZlcnNpb24oYXV0aG9yaXphdGlvbiwgcHJvb2ZPZlR5cGUsIGlzc3VlckRpZCwgcHJvb2ZPZkNyZWRlbnRhaWxJZCwgcHJvb2ZPZkNyZWRlbnRpYWxTdWJqZWN0LCBzaWduaW5nUHJpdmF0ZUtleSwgcHVibGljS2V5SW5mb3MsIGV4cGlyYXRpb25EYXRlKTtcblxuICAgIC8vIGFkZCBhbGwgcHJvb2ZPZkNyZWRlbnRpYWxWZXJzaW9uUGFpcnMgdG8gY3JlZHMgYXJyYXlcbiAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShwcm9vZk9mQ3JlZHMsIHByb29mT2ZDcmVkZW50aWFsVmVyc2lvblBhaXJzKTtcblxuICAgIGlmIChpc3N1ZUNyZWRlbnRpYWxzVG9TZWxmKSB7XG4gICAgICAvLyBjb25zdHJ1Y3QgdGhlIENyZWRlbnRpYWwncyBjcmVkZW50aWFsU3ViamVjdCBmb3IgdGhlIGlzc3VlckRpZFxuICAgICAgY29uc3QgaXNzdWVyQ3JlZFN1YmplY3Q6IENyZWRlbnRpYWxTdWJqZWN0ID0geyBpZDogaXNzdWVyRGlkLCAuLi5jcmVkRGF0YSB9O1xuXG4gICAgICAvLyBjb25zdHJ1Y3QgdGhlIENyZWRlbnRpYWxzIGFuZCB0aGVpciBlbmNyeXB0ZWQgZm9ybSBmb3IgZWFjaCBzdXBwb3J0ZWQgdmVyc2lvbiBmb3IgdGhlIGlzc3VlclxuICAgICAgY29uc3QgaXNzdWVyQ3JlZGVudGlhbFZlcnNpb25QYWlyczogQ3JlZGVudGlhbFBhaXJbXSA9IGNvbnN0cnVjdEVuY3J5cHRlZENyZWRlbnRpYWxPZkVhY2hWZXJzaW9uKGF1dGhvcml6YXRpb24sIHR5cGUsIGlzc3VlckRpZCwgY3JlZGVudGlhbElkLCBpc3N1ZXJDcmVkU3ViamVjdCwgc2lnbmluZ1ByaXZhdGVLZXksIGlzc3VlclB1YmxpY0tleUluZm9zLCBleHBpcmF0aW9uRGF0ZSk7XG5cbiAgICAgIC8vIGFkZCBhbGwgaXNzdWVyQ3JlZGVudGlhbFZlcnNpb25QYWlycyB0byBjcmVkcyBhcnJheVxuICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoY3JlZHMsIGlzc3VlckNyZWRlbnRpYWxWZXJzaW9uUGFpcnMpO1xuXG4gICAgICAvKipcbiAgICAgICAqIEhhbmRsZSBjb25zdHJ1Y3Rpb24gb2YgdGhlIFByb29mT2ZDcmVkZW50aWFscyBhbmQgdGhlaXIgZW5jcnlwdGVkIGZvcm0gZm9yIGVhY2ggc3VwcG9ydGVkIHZlcnNpb25cbiAgICAgICAqL1xuICAgICAgY29uc3QgaXNzdWVyUHJvb2ZPZlR5cGUgPSBgUHJvb2ZPZiR7dHlwZX1gOyAvLyBwcmVmaXhpbmcgdGhlIHR5cGUgd2l0aCBQcm9vZk9mXG4gICAgICBjb25zdCBpc3N1ZXJQcm9vZk9mQ3JlZGVudGlhbFN1YmplY3QgPSB7IGlkOiBpc3N1ZXJDcmVkU3ViamVjdC5pZCB9OyAvLyBubyBjcmVkZW50aWFsIGRhdGEgZm9yIGEgUHJvb2ZPZiBDcmVkZW50aWFsXG4gICAgICBjb25zdCBpc3N1ZXJQcm9vZk9mQ3JlZGVudGlhbFZlcnNpb25QYWlyczogQ3JlZGVudGlhbFBhaXJbXSA9IGNvbnN0cnVjdEVuY3J5cHRlZENyZWRlbnRpYWxPZkVhY2hWZXJzaW9uKGF1dGhvcml6YXRpb24sIGlzc3VlclByb29mT2ZUeXBlLCBpc3N1ZXJEaWQsIHByb29mT2ZDcmVkZW50YWlsSWQsIGlzc3VlclByb29mT2ZDcmVkZW50aWFsU3ViamVjdCwgc2lnbmluZ1ByaXZhdGVLZXksIHB1YmxpY0tleUluZm9zLCBleHBpcmF0aW9uRGF0ZSk7XG5cbiAgICAgIC8vIGFkZCBhbGwgcHJvb2ZPZkNyZWRlbnRpYWxWZXJzaW9uUGFpcnMgdG8gY3JlZHMgYXJyYXlcbiAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHByb29mT2ZDcmVkcywgaXNzdWVyUHJvb2ZPZkNyZWRlbnRpYWxWZXJzaW9uUGFpcnMpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGxvb3AgdGhyb3VnaCB0aGUgdmVyc2lvbnMgbGlzdCBhbmQgc2VuZCBhbGwgdGhlIGVuY3J5cHRlZCBjcmVkZW50aWFscyB0byB0aGUgc2FhcyBncm91cGVkIGJ5IHZlcnNpb24gYW5kIGNyZWRlbnRpYWxJZHMuXG4gIC8vIE5vdGU6IHByb29mT2YgQ3JlZGVudGlhbHMgaGF2ZSBhIHNlcGFyYXRlIGNyZWRlbnRpYWxJZCBidXQgdGhlIGlzc3VlckNyZWRlbnRpYWxzIHNoYXJlIG9uZSAoYmVjYXVzZSBzYW1lIGNyZWRlbnRpYWwgZGF0YSlcbiAgZm9yIChjb25zdCB2ZXJzaW9uIG9mIHZlcnNpb25MaXN0KSB7XG4gICAgLy8gb25seSBncmFiIHRoZSBlbmNyeXB0ZWQgY3JlZGVudGlhbHMgb2YgdGhlIGN1cnJlbnQgdmVyc2lvblxuICAgIGNvbnN0IHJlc3VsdGFudEVuY3J5cHRlZENyZWRlbnRpYWxzOiBJc3N1ZUNyZWRlbnRpYWxPcHRpb25zW10gPSBjcmVkcy5maWx0ZXIoY3JlZFBhaXIgPT4gY3JlZFBhaXIudmVyc2lvbiA9PT0gdmVyc2lvbikubWFwKGNyZWRQYWlyID0+IGNyZWRQYWlyLmVuY3J5cHRlZENyZWRlbnRpYWwpO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2VuZEVuY3J5cHRlZENyZWRlbnRpYWxzKGF1dGhvcml6YXRpb24sIHsgY3JlZGVudGlhbFJlcXVlc3RzOiByZXN1bHRhbnRFbmNyeXB0ZWRDcmVkZW50aWFscyB9LCB2ZXJzaW9uKTtcbiAgICBhdXRob3JpemF0aW9uID0gcmVzdWx0LmF1dGhUb2tlbjtcblxuICAgIC8vIG9ubHkgZ3JhYiB0aGUgcHJvb2Ygb2YgZW5jcnlwdGVkIGNyZWRlbnRpYWxzIG9mIHRoZSBjdXJyZW50IHZlcnNpb25cbiAgICBjb25zdCBwcm9vZk9mUmVzdWx0YW50RW5jcnlwdGVkQ3JlZGVudGlhbHM6IElzc3VlQ3JlZGVudGlhbE9wdGlvbnNbXSA9IHByb29mT2ZDcmVkcy5maWx0ZXIoY3JlZFBhaXIgPT4gY3JlZFBhaXIudmVyc2lvbiA9PT0gdmVyc2lvbikubWFwKGNyZWRQYWlyID0+IGNyZWRQYWlyLmVuY3J5cHRlZENyZWRlbnRpYWwpO1xuXG4gICAgY29uc3QgcHJvb2ZPZlJlc3VsdCA9IGF3YWl0IHNlbmRFbmNyeXB0ZWRDcmVkZW50aWFscyhhdXRob3JpemF0aW9uLCB7IGNyZWRlbnRpYWxSZXF1ZXN0czogcHJvb2ZPZlJlc3VsdGFudEVuY3J5cHRlZENyZWRlbnRpYWxzIH0sIHZlcnNpb24pO1xuICAgIGF1dGhvcml6YXRpb24gPSBwcm9vZk9mUmVzdWx0LmF1dGhUb2tlbjtcbiAgfVxuXG4gIC8vIGdyYWIgYWxsIHRoZSBjcmVkZW50aWFscyBvZiB0aGUgbGF0ZXN0IHZlcnNpb24gZnJvbSB0aGUgQ3JlZGVudGlhbFBhaXJzIGZvciB0aGUgcmVzcG9uc2VcbiAgLy8gTm90ZTogbm90IHJldHVybmluZyB0aGUgUHJvb2ZPZiBjcmVkZW50aWFscy5cbiAgY29uc3QgbGF0ZXN0VmVyc2lvbiA9IHZlcnNpb25MaXN0W3ZlcnNpb25MaXN0Lmxlbmd0aCAtIDFdO1xuICBjb25zdCByZXN1bHRhbnRDcmVkZW50aWFsczogKENyZWRlbnRpYWwgfCBDcmVkZW50aWFsUGIpW10gPSBjcmVkcy5maWx0ZXIoY3JlZFBhaXIgPT4gY3JlZFBhaXIudmVyc2lvbiA9PT0gbGF0ZXN0VmVyc2lvbikubWFwKGNyZWRQYWlyID0+IGNyZWRQYWlyLmNyZWRlbnRpYWwpO1xuXG4gIHJldHVybiB7XG4gICAgYXV0aFRva2VuOiBhdXRob3JpemF0aW9uLFxuICAgIGJvZHk6IHJlc3VsdGFudENyZWRlbnRpYWxzXG4gIH07XG59O1xuXG4vKipcbiAqIEhlbHBlciB0byBjb25zdHJ1Y3QgYSBDcmVkZW50aWFsJ3MgQ3JlZGVudGlhbE9wdGlvbnNcbiAqIEBwYXJhbSB0eXBlXG4gKiBAcGFyYW0gaXNzdWVyXG4gKiBAcGFyYW0gY3JlZGVudGlhbFN1YmplY3RcbiAqIEBwYXJhbSBleHBpcmF0aW9uRGF0ZVxuICogQHJldHVybnNcbiAqL1xuY29uc3QgY29uc3RydWN0Q3JlZGVudGlhbE9wdGlvbnMgPSAodHlwZTogc3RyaW5nfHN0cmluZ1tdLCBpc3N1ZXI6IHN0cmluZywgY3JlZGVudGlhbElkOiBzdHJpbmcsIGNyZWRlbnRpYWxTdWJqZWN0OiBDcmVkZW50aWFsU3ViamVjdCwgZXhwaXJhdGlvbkRhdGU/OiBEYXRlKTogQ3JlZGVudGlhbE9wdGlvbnMgPT4ge1xuICAvLyBIQUNLIEFMRVJUOiByZW1vdmluZyBkdXBsaWNhdGUgJ1ZlcmlmaWFibGVDcmVkZW50aWFsJyBpZiBwcmVzZW50IGluIHR5cGUgc3RyaW5nW11cbiAgY29uc3QgdHlwZUxpc3Q6IHN0cmluZ1tdID0gWydWZXJpZmlhYmxlQ3JlZGVudGlhbCddLmNvbmNhdCh0eXBlKTsgLy8gTmVlZCB0byBoYXZlIHNvbWUgdmFsdWUgaW4gdGhlIFwiYmFzZVwiIGFycmF5IHNvIGp1c3QgdXNpbmcgdGhlIGtleXdvcmQgd2UgYXJlIGdvaW5nIHRvIGZpbHRlciBvdmVyLlxuICBjb25zdCB0eXBlcyA9IHR5cGVMaXN0LmZpbHRlcih0ID0+IHQgIT09ICdWZXJpZmlhYmxlQ3JlZGVudGlhbCcpO1xuXG4gIGNvbnN0IGNyZWRPcHQ6IENyZWRlbnRpYWxPcHRpb25zID0ge1xuICAgIGNyZWRlbnRpYWxTdWJqZWN0LFxuICAgIGlzc3VlcixcbiAgICB0eXBlOiB0eXBlcyxcbiAgICBleHBpcmF0aW9uRGF0ZTogZXhwaXJhdGlvbkRhdGUsXG4gICAgY3JlZGVudGlhbElkXG4gIH07XG5cbiAgcmV0dXJuIChjcmVkT3B0KTtcbn07XG5cbi8qKlxuICogSGVscGVyIHRvIGNvbnN0cnVjdCB2ZXJzaW9uZWQgQ3JlZGVudGlhbFBhaXJzIG9mIGVhY2ggdmVyc2lvbi5cbiAqIEFsc28sIGhhbmRsZXMgaXNzdWluZyBjcmVkZW50aWFscyB0byB0aGUgSXNzdWVyJ3MgRElEIGlmIGRlc2lyZWQuLlxuICogQHBhcmFtIGF1dGhvcml6YXRpb25cbiAqIEBwYXJhbSB0eXBlXG4gKiBAcGFyYW0gaXNzdWVyXG4gKiBAcGFyYW0gY3JlZGVudGlhbFN1YmplY3RcbiAqIEBwYXJhbSBzaWduaW5nUHJpdmF0ZUtleVxuICogQHBhcmFtIHB1YmxpY0tleUluZm9zXG4gKiBAcGFyYW0gZXhwaXJhdGlvbkRhdGVcbiAqIEByZXR1cm5zXG4gKi9cbmNvbnN0IGNvbnN0cnVjdEVuY3J5cHRlZENyZWRlbnRpYWxPZkVhY2hWZXJzaW9uID0gKGF1dGhvcml6YXRpb246IHN0cmluZywgdHlwZTogc3RyaW5nIHwgc3RyaW5nW10sIGlzc3Vlcjogc3RyaW5nLCBjcmVkZW50aWFsSWQ6IHN0cmluZywgY3JlZGVudGlhbFN1YmplY3Q6IENyZWRlbnRpYWxTdWJqZWN0LCBzaWduaW5nUHJpdmF0ZUtleTogc3RyaW5nLCBwdWJsaWNLZXlJbmZvczogUHVibGljS2V5SW5mb1tdLCBleHBpcmF0aW9uRGF0ZT86IERhdGUpOiBXaXRoVmVyc2lvbjxDcmVkZW50aWFsUGFpcj5bXSA9PiB7XG4gIGNvbnN0IGNyZWRlbnRpYWxPcHRpb25zID0gY29uc3RydWN0Q3JlZGVudGlhbE9wdGlvbnModHlwZSwgaXNzdWVyLCBjcmVkZW50aWFsSWQsIGNyZWRlbnRpYWxTdWJqZWN0LCBleHBpcmF0aW9uRGF0ZSk7XG5cbiAgY29uc3QgcmVzdWx0czogV2l0aFZlcnNpb248Q3JlZGVudGlhbFBhaXI+W10gPSBbXTtcblxuICBsb2dnZXIuZGVidWcoYGNyZWRlbnRpYWxJZCdzICR7Y3JlZGVudGlhbE9wdGlvbnMuY3JlZGVudGlhbElkfSBjcmVkZW50aWFsT3B0aW9uczogJHtjcmVkZW50aWFsT3B0aW9uc31gKTtcblxuICAvKipcbiAgICogTmVlZCB0byBsb29wIHRocm91Z2ggYWxsIHZlcnNpb25zIGV4Y2VwdCBtb3N0IHJlY2VudCBzbyB0aGF0IGNhbiBpc3N1ZWQgY3JlZGVudGlhbHMgY291bGQgYmUgYmFja3dhcmRzIGNvbXBhdGlibGUgd2l0aCBvbGRlciBob2xkZXIgdmVyc2lvbnMuXG4gICAqIEhvd2V2ZXIgb25seSBjYXJlIHRvIHJldHVybiB0aGUgbW9zdCByZWNlbnQgQ3JlZGVudGlhbCB0eXBlIGZvciBjdXN0b21lcnMgdG8gdXNlLlxuICAgKi9cbiAgZm9yIChsZXQgdiA9IDA7IHYgPCB2ZXJzaW9uTGlzdC5sZW5ndGggLSAxOyB2KyspIHsgLy8gbm90ZTogcHVycG9zZWx5IHRlcm1pbmF0aW5nIG9uZSBpbmRleCBlYXJseSwgd2hpY2ggb3VnaHQgdG8gYmUgdGhlIG1vc3QgcmVjZW50IHZlcnNpb24uXG4gICAgY29uc3QgdmVyc2lvbjogc3RyaW5nID0gdmVyc2lvbkxpc3Rbdl07XG5cbiAgICBpZiAoZ3RlKHZlcnNpb24sICcyLjAuMCcpICYmIGx0KHZlcnNpb24sICczLjAuMCcpKSB7XG4gICAgICAvLyBDcmVhdGUgbGF0ZXN0IHZlcnNpb24gb2YgdGhlIFVuc2lnbmVkQ3JlZGVudGlhbCBvYmplY3RcbiAgICAgIGNvbnN0IHVuc2lnbmVkQ3JlZGVudGlhbDogVW5zaWduZWRDcmVkZW50aWFsVjIgPSBjb25zdHJ1Y3RVbnNpZ25lZENyZWRlbnRpYWxPYmooY3JlZGVudGlhbE9wdGlvbnMpO1xuXG4gICAgICAvLyBDcmVhdGUgdGhlIHNpZ25lZCBDcmVkZW50aWFsIG9iamVjdCBmcm9tIHRoZSB1bnNpZ25lZENyZWRlbnRpYWwgb2JqZWN0XG4gICAgICBjb25zdCBjcmVkZW50aWFsOiBDcmVkZW50aWFsVjIgPSBjb25zdHJ1Y3RTaWduZWRDcmVkZW50aWFsT2JqKHVuc2lnbmVkQ3JlZGVudGlhbCwgc2lnbmluZ1ByaXZhdGVLZXkpO1xuXG4gICAgICAvLyBDcmVhdGUgdGhlIGVuY3J5cHRlZCBjcmVkZW50aWFsIGlzc3VhbmNlIGR0b1xuICAgICAgY29uc3QgZW5jcnlwdGVkQ3JlZGVudGlhbFVwbG9hZE9wdGlvbnM6IElzc3VlQ3JlZGVudGlhbE9wdGlvbnMgPSBjb25zdHJ1Y3RJc3N1ZUNyZWRlbnRpYWxPcHRpb25zKGNyZWRlbnRpYWwsIHB1YmxpY0tleUluZm9zLCBjcmVkZW50aWFsU3ViamVjdC5pZCk7XG5cbiAgICAgIGNvbnN0IGNyZWRQYWlyOiBXaXRoVmVyc2lvbjxDcmVkZW50aWFsUGFpcj4gPSB7XG4gICAgICAgIGNyZWRlbnRpYWwsXG4gICAgICAgIGVuY3J5cHRlZENyZWRlbnRpYWw6IGVuY3J5cHRlZENyZWRlbnRpYWxVcGxvYWRPcHRpb25zLFxuICAgICAgICB2ZXJzaW9uXG4gICAgICB9O1xuXG4gICAgICByZXN1bHRzLnB1c2goY3JlZFBhaXIpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEdyYWJiaW5nIHRoZSBsYXRlc3QgdmVyc2lvbiBhcyBkZWZpbmVkIGluIHRoZSB2ZXJzaW9uIGxpc3QsIDMuMC4wXG4gIGNvbnN0IGxhdGVzdFZlcnNpb246IHN0cmluZyA9IHZlcnNpb25MaXN0W3ZlcnNpb25MaXN0Lmxlbmd0aCAtIDFdO1xuXG4gIC8vIENyZWF0ZSBsYXRlc3QgdmVyc2lvbiBvZiB0aGUgVW5zaWduZWRDcmVkZW50aWFsIG9iamVjdFxuICBjb25zdCB1bnNpZ25lZENyZWRlbnRpYWwgPSBjb25zdHJ1Y3RVbnNpZ25lZENyZWRlbnRpYWxQYk9iaihjcmVkZW50aWFsT3B0aW9ucyk7XG4gIC8vIGNvbnN0IHVuc2lnbmVkUHJvb2ZPZkNyZWRlbnRpYWwgPSBjb25zdHJ1Y3RVbnNpZ25lZENyZWRlbnRpYWxQYk9iaihwcm9vZk9mQ3JlZGVudGlhbE9wdGlvbnMpO1xuXG4gIC8vIENyZWF0ZSB0aGUgc2lnbmVkIENyZWRlbnRpYWwgb2JqZWN0IGZyb20gdGhlIHVuc2lnbmVkQ3JlZGVudGlhbCBvYmplY3RcbiAgY29uc3QgY3JlZGVudGlhbCA9IGNvbnN0cnVjdFNpZ25lZENyZWRlbnRpYWxQYk9iaih1bnNpZ25lZENyZWRlbnRpYWwsIHNpZ25pbmdQcml2YXRlS2V5KTtcblxuICAvLyBDcmVhdGUgdGhlIGVuY3J5cHRlZCBjcmVkZW50aWFsIGlzc3VhbmNlIGR0b1xuICBjb25zdCBlbmNyeXB0ZWRDcmVkZW50aWFsVXBsb2FkT3B0aW9uczogSXNzdWVDcmVkZW50aWFsT3B0aW9ucyA9IGNvbnN0cnVjdElzc3VlQ3JlZGVudGlhbE9wdGlvbnMoY3JlZGVudGlhbCwgcHVibGljS2V5SW5mb3MsIGNyZWRlbnRpYWxTdWJqZWN0LmlkKTtcbiAgY29uc3QgY3JlZFBhaXI6IFdpdGhWZXJzaW9uPENyZWRlbnRpYWxQYWlyPiA9IHtcbiAgICBjcmVkZW50aWFsLFxuICAgIGVuY3J5cHRlZENyZWRlbnRpYWw6IGVuY3J5cHRlZENyZWRlbnRpYWxVcGxvYWRPcHRpb25zLFxuICAgIHZlcnNpb246IGxhdGVzdFZlcnNpb25cbiAgfTtcblxuICByZXN1bHRzLnB1c2goY3JlZFBhaXIpO1xuXG4gIHJldHVybiByZXN1bHRzO1xufTtcblxuLyoqXG4gKiBIZWxwZXIgdG8gY29uc3RydWN0IGEgSXNzdWVDcmVkZW50aWFsT3B0aW9ucyBwcmlvciB0byBzZW5kaW5nIHRvIHRoZSBTYWFzXG4gKiBAcGFyYW0gY3JlZGVudGlhbFxuICogQHBhcmFtIHByb29mT2ZDcmVkZW50aWFsXG4gKiBAcGFyYW0gcHVibGljS2V5SW5mb3NcbiAqIEBwYXJhbSBzdWJqZWN0RGlkXG4gKiBAcmV0dXJuc1xuICovXG5jb25zdCBjb25zdHJ1Y3RJc3N1ZUNyZWRlbnRpYWxPcHRpb25zID0gKGNyZWRlbnRpYWw6IENyZWRlbnRpYWwgfCBDcmVkZW50aWFsUGIsIHB1YmxpY0tleUluZm9zOiBQdWJsaWNLZXlJbmZvW10sIHN1YmplY3REaWQ6IHN0cmluZyk6IElzc3VlQ3JlZGVudGlhbE9wdGlvbnMgPT4ge1xuICAvLyBDcmVhdGUgdGhlIGF0dHJpYnV0ZXMgZm9yIGFuIGVuY3J5cHRlZCBjcmVkZW50aWFsLiBUaGUgYXV0aG9yaXphdGlvbiBzdHJpbmcgaXMgdXNlZCB0byBnZXQgdGhlIERJRCBEb2N1bWVudCBjb250YWluaW5nIHRoZSBzdWJqZWN0J3MgcHVibGljIGtleSBmb3IgZW5jcnlwdGlvbi5cbiAgY29uc3QgZW5jcnlwdGVkQ3JlZGVudGlhbE9wdGlvbnMgPSBjb25zdHJ1Y3RFbmNyeXB0ZWRDcmVkZW50aWFsT3B0cyhjcmVkZW50aWFsLCBwdWJsaWNLZXlJbmZvcyk7XG5cbiAgLy8gUmVtb3ZpbmcgdGhlICdjcmVkZW50aWFsJyBvZiBcIlZlcmlmaWFibGVDcmVkZW50aWFsXCIgZnJvbSB0aGUgVW51bSBJRCBpbnRlcm5hbCB0eXBlIGZvciBzaW1wbGljaXR5XG4gIGNvbnN0IGNyZWRlbnRpYWxUeXBlID0gZ2V0Q3JlZGVudGlhbFR5cGUoY3JlZGVudGlhbC50eXBlKTtcblxuICBjb25zdCBlbmNyeXB0ZWRDcmVkZW50aWFsVXBsb2FkT3B0aW9uczogSXNzdWVDcmVkZW50aWFsT3B0aW9ucyA9IHtcbiAgICBjcmVkZW50aWFsSWQ6IGNyZWRlbnRpYWwuaWQsXG4gICAgc3ViamVjdDogc3ViamVjdERpZCxcbiAgICBpc3N1ZXI6IGNyZWRlbnRpYWwuaXNzdWVyLFxuICAgIHR5cGU6IGNyZWRlbnRpYWxUeXBlLFxuICAgIGVuY3J5cHRlZENyZWRlbnRpYWxzOiBlbmNyeXB0ZWRDcmVkZW50aWFsT3B0aW9uc1xuICB9O1xuXG4gIHJldHVybiBlbmNyeXB0ZWRDcmVkZW50aWFsVXBsb2FkT3B0aW9ucztcbn07XG5cbi8qKlxuICogSGVscGVyIHRvIHNlbmQgbXVsdGlwbGUgZW5jcnlwdGVkIGNyZWRlbnRpYWxzLCBJc3N1ZUNyZWRlbnRpYWxzT3B0aW9ucywgdG8gdGhlIFNhYXNcbiAqIEBwYXJhbSBhdXRob3JpemF0aW9uXG4gKiBAcGFyYW0gZW5jcnlwdGVkQ3JlZGVudGlhbFVwbG9hZE9wdGlvbnNcbiAqIEBwYXJhbSB2ZXJzaW9uXG4gKiBAcmV0dXJuc1xuICovXG5jb25zdCBzZW5kRW5jcnlwdGVkQ3JlZGVudGlhbHMgPSBhc3luYyAoYXV0aG9yaXphdGlvbjogc3RyaW5nLCBlbmNyeXB0ZWRDcmVkZW50aWFsVXBsb2FkT3B0aW9uczogSXNzdWVDcmVkZW50aWFsc09wdGlvbnMsIHZlcnNpb246IHN0cmluZykgOlByb21pc2U8VW51bUR0bzx2b2lkPj4gPT4ge1xuICBjb25zdCByZXN0RGF0YTogUkVTVERhdGEgPSB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgYmFzZVVybDogY29uZmlnRGF0YS5TYWFTVXJsLFxuICAgIGVuZFBvaW50OiAnY3JlZGVudGlhbHNSZXBvc2l0b3J5JyxcbiAgICBoZWFkZXI6IHsgQXV0aG9yaXphdGlvbjogYXV0aG9yaXphdGlvbiwgdmVyc2lvbiB9LFxuICAgIGRhdGE6IGVuY3J5cHRlZENyZWRlbnRpYWxVcGxvYWRPcHRpb25zXG4gIH07XG5cbiAgY29uc3QgcmVzdFJlc3A6IEpTT05PYmogPSBhd2FpdCBtYWtlTmV0d29ya1JlcXVlc3QocmVzdERhdGEpO1xuXG4gIGNvbnN0IGF1dGhUb2tlbjogc3RyaW5nID0gaGFuZGxlQXV0aFRva2VuSGVhZGVyKHJlc3RSZXNwLCBhdXRob3JpemF0aW9uIGFzIHN0cmluZyk7XG5cbiAgY29uc3QgaXNzdWVkQ3JlZGVudGlhbDogVW51bUR0bzx2b2lkPiA9IHsgYm9keTogcmVzdFJlc3AuYm9keSwgYXV0aFRva2VuIH07XG5cbiAgcmV0dXJuIGlzc3VlZENyZWRlbnRpYWw7XG59O1xuXG4vKipcbiAqIFZhbGlkYXRlcyB0aGUgY3JlZGVudGlhbCBkYXRhIG9iamVjdHNcbiAqIEBwYXJhbSBjcmVkZW50aWFsRGF0YUxpc3RcbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVDcmVkZW50aWFsRGF0YUxpc3QgKGNyZWRlbnRpYWxEYXRhTGlzdDogQ3JlZGVudGlhbERhdGFbXSkge1xuICBmb3IgKGNvbnN0IGRhdGEgb2YgY3JlZGVudGlhbERhdGFMaXN0KSB7XG4gICAgaWYgKCFkYXRhLnR5cGUpIHtcbiAgICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnQ3JlZGVudGlhbCBEYXRhIG5lZWRzIHRvIGNvbnRhaW4gdGhlIGNyZWRlbnRpYWwgdHlwZScpO1xuICAgIH1cbiAgfVxufVxuIl19