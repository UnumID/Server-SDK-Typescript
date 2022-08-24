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
/**
 * Multiplexed handler for issuing credentials with UnumID's SaaS.
 * @param authorization
 * @param issuer
 * @param subjectDid
 * @param credentialDataList
 * @param signingPrivateKey
 * @param expirationDate
 */
exports.issueCredentials = function (authorization, issuerDid, subjectDid, credentialDataList, signingPrivateKey, expirationDate, declineIssueCredentialsToSelf) {
    if (declineIssueCredentialsToSelf === void 0) { declineIssueCredentialsToSelf = false; }
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
                    if (!!declineIssueCredentialsToSelf) return [3 /*break*/, 3];
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
                        if (!declineIssueCredentialsToSelf) {
                            issuerCredSubject = __assign(__assign({}, credData), { id: issuerDid });
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
                    resultantCredentials = creds.filter(function (credPair) { return (credPair.version === latestVersion && credPair.encryptedCredential.subject === subjectDid); }).map(function (credPair) { return credPair.credential; });
                    return [2 /*return*/, {
                            authToken: authorization,
                            body: resultantCredentials
                        }];
            }
        });
    });
};
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
        var proof = createProof_1.createProof(bytes, privateKey, usCred.issuer);
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
    if (typeof subjectDid !== 'string') {
        throw new error_1.CustError(400, 'subjectDid must be a string.');
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
        if (semver_1.gte(version, '3.0.0') && semver_1.lt(version, '4.0.0')) {
            // Create latest version of the UnsignedCredential object
            var unsignedCredential_1 = constructUnsignedCredentialPbObj(credentialOptions);
            // Create the signed Credential object from the unsignedCredential object
            var credential_1 = constructSignedCredentialPbObj(unsignedCredential_1, signingPrivateKey);
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
    // Grabbing the latest version as defined in the version list, 4.0.0
    var latestVersion = versionList_1.versionList[versionList_1.versionList.length - 1];
    // Create latest version of the UnsignedCredential object
    var unsignedCredential = constructUnsignedCredentialPbObj(credentialOptions);
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
        if (data.id) {
            throw new error_1.CustError(400, 'Credential Data has an invalid `id` key');
        }
    }
}
//# sourceMappingURL=issueCredentials.js.map