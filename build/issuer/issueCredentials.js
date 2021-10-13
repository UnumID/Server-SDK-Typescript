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
exports.issueCredential = exports.issueCredentials = void 0;
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
/**
 * Creates an object of type EncryptedCredentialOptions which encapsulates information relating to the encrypted credential data
 * @param cred Credential
 * @param authorization String
 */
var constructEncryptedCredentialOpts = function (authorization, cred, publicKeyInfos) { return __awaiter(void 0, void 0, void 0, function () {
    var credentialSubject, subjectDid;
    return __generator(this, function (_a) {
        credentialSubject = convertCredentialSubject_1.convertCredentialSubject(cred.credentialSubject);
        subjectDid = credentialSubject.id;
        // create an encrypted copy of the credential with each RSA public key
        return [2 /*return*/, publicKeyInfos.map(function (publicKeyInfo) {
                var subjectDidWithKeyFragment = subjectDid + "#" + publicKeyInfo.id;
                var encryptedData = encrypt_1.doEncrypt(subjectDidWithKeyFragment, publicKeyInfo, cred);
                // Removing the w3c credential spec of "VerifiableCredential" from the Unum ID internal type for simplicity
                var credentialType = getCredentialType_1.getCredentialType(cred.type);
                var encryptedCredentialOptions = {
                    credentialId: cred.id,
                    subject: subjectDidWithKeyFragment,
                    issuer: cred.issuer,
                    type: credentialType,
                    data: encryptedData
                };
                return encryptedCredentialOptions;
            })];
    });
}); };
/**
 * Creates a signed credential with all the relevant information. The proof serves as a cryptographic signature.
 * @param usCred UnsignedCredentialPb
 * @param privateKey String
 */
var constructSignedCredentialPbObj = function (usCred, privateKey) {
    try {
        // convert the protobuf to a byte array
        var bytes = types_1.UnsignedCredentialPb.encode(usCred).finish();
        var proof = createProof_1.createProofPb(bytes, privateKey, usCred.issuer, 'pem');
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
 */
var constructUnsignedCredentialPbObj = function (credOpts) {
    // CredentialSubject type is dependent on version. V2 is a string for passing to holder so iOS can handle it as a concrete type instead of a map of unknown keys.
    var credentialSubject = JSON.stringify(credOpts.credentialSubject);
    var credentialId = helpers_1.getUUID();
    var unsCredObj = {
        context: ['https://www.w3.org/2018/credentials/v1'],
        credentialStatus: {
            id: config_1.configData.SaaSUrl + "/credentialStatus/" + credentialId,
            type: 'CredentialStatus'
        },
        credentialSubject: credentialSubject,
        issuer: credOpts.issuer,
        type: __spreadArrays(['VerifiableCredential'], credOpts.type),
        id: credentialId,
        issuanceDate: new Date(),
        expirationDate: credOpts.expirationDate
    };
    return unsCredObj;
};
/**
 * Creates all the attributes associated with an unsigned credential.
 * @param credOpts CredentialOptions
 */
var constructUnsignedCredentialObj = function (credOpts) {
    // CredentialSubject type is dependent on version. V2 is a string for passing to holder so iOS can handle it as a concrete type instead of a map of unknown keys.
    var credentialSubject = JSON.stringify(credOpts.credentialSubject);
    var credentialId = helpers_1.getUUID();
    var unsCredObj = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        credentialStatus: {
            id: config_1.configData.SaaSUrl + "/credentialStatus/" + credentialId,
            type: 'CredentialStatus'
        },
        credentialSubject: credentialSubject,
        issuer: credOpts.issuer,
        type: __spreadArrays(['VerifiableCredential'], credOpts.type),
        id: credentialId,
        issuanceDate: new Date(),
        expirationDate: credOpts.expirationDate
    };
    return unsCredObj;
};
/**
 * Handle input validation.
 * @param type
 * @param issuer
 * @param credentialSubject
 * @param signingPrivateKey
 */
var validateInputs = function (type, issuer, credentialSubject, signingPrivateKey, expirationDate) {
    if (!type) {
        // type element is mandatory, and it can be either string or an array
        throw new error_1.CustError(400, 'type is required.');
    }
    if (!issuer) {
        throw new error_1.CustError(400, 'issuer is required.');
    }
    if (!credentialSubject) {
        throw new error_1.CustError(400, 'credentialSubject is required.');
    }
    if (!signingPrivateKey) {
        throw new error_1.CustError(400, 'signingPrivateKey is required.');
    }
    // id must be present in credentialSubject input parameter
    if (!credentialSubject.id) {
        throw new error_1.CustError(400, 'Invalid credentialSubject: id is required.');
    }
    if (!Array.isArray(type) && typeof type !== 'string') {
        throw new error_1.CustError(400, 'type must be an array or a string.');
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
};
var constructCredentialOptions = function (type, issuer, credentialSubject, expirationDate) {
    // HACK ALERT: removing duplicate 'VerifiableCredential' if present in type string[]
    var typeList = ['VerifiableCredential'].concat(type); // Need to have some value in the "base" array so just using the keyword we are going to filter over.
    var types = typeList.filter(function (t) { return t !== 'VerifiableCredential'; });
    var credOpt = {
        credentialSubject: credentialSubject,
        issuer: issuer,
        type: types,
        expirationDate: expirationDate
    };
    return (credOpt);
};
/**
 * Multiplexed handler for issuing credentials with UnumID's SaaS.
 *
 * @param authorization
 * @param type
 * @param issuer
 * @param credentialSubject
 * @param signingPrivateKey
 * @param expirationDate
 */
exports.issueCredentials = function (authorization, types, issuer, subjectDid, credentialDataList, signingPrivateKey, expirationDate) { return __awaiter(void 0, void 0, void 0, function () {
    var publicKeyInfos, creds, i, credData, type, credSubject, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (types.length !== credentialDataList.length) {
                    throw new error_1.CustError(400, 'Number of Credential types must match number of credentialSubjects.');
                }
                return [4 /*yield*/, didHelper_1.getDidDocPublicKeys(authorization, subjectDid)];
            case 1:
                publicKeyInfos = _c.sent();
                creds = [];
                i = 0;
                _c.label = 2;
            case 2:
                if (!(i < types.length)) return [3 /*break*/, 5];
                credData = credentialDataList[i];
                type = types[i];
                credSubject = __assign({ id: subjectDid }, credData);
                // creds.push(issueCredential(authorization, type, issuer, credSubject, signingPrivateKey, expirationDate));
                _b = (_a = creds).push;
                return [4 /*yield*/, issueCredentialHelper(authorization, type, issuer, credSubject, signingPrivateKey, publicKeyInfos, expirationDate)];
            case 3:
                // creds.push(issueCredential(authorization, type, issuer, credSubject, signingPrivateKey, expirationDate));
                _b.apply(_a, [_c.sent()]);
                _c.label = 4;
            case 4:
                i++;
                return [3 /*break*/, 2];
            case 5: 
            // await Promise.all(creds);
            return [2 /*return*/, {
                    authToken: authorization,
                    body: creds.map(function (unumCred) { return unumCred.body; })
                }];
        }
    });
}); };
/**
 * Handles issuing a credential with UnumID's SaaS.
 *
 * @param authorization
 * @param type
 * @param issuer
 * @param credentialSubject
 * @param signingPrivateKey
 * @param expirationDate
 */
exports.issueCredential = function (authorization, type, issuer, credentialSubject, signingPrivateKey, expirationDate) { return __awaiter(void 0, void 0, void 0, function () {
    var subjectDid, publicKeyInfos, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                // The authorization string needs to be passed for the SaaS to authorize getting the DID document associated with the holder / subject.
                requireAuth_1.requireAuth(authorization);
                // Validate the inputs
                validateInputs(type, issuer, credentialSubject, signingPrivateKey, expirationDate);
                subjectDid = credentialSubject.id;
                return [4 /*yield*/, didHelper_1.getDidDocPublicKeys(authorization, subjectDid)];
            case 1:
                publicKeyInfos = _a.sent();
                return [2 /*return*/, issueCredentialHelper(authorization, type, issuer, credentialSubject, signingPrivateKey, publicKeyInfos, expirationDate)];
            case 2:
                error_2 = _a.sent();
                logger_1.default.error("Error issuing a credential with UnumID SaaS. " + error_2);
                throw error_2;
            case 3: return [2 /*return*/];
        }
    });
}); };
var issueCredentialHelper = function (authorization, type, issuer, credentialSubject, signingPrivateKey, publicKeyInfos, expirationDate) { return __awaiter(void 0, void 0, void 0, function () {
    var credentialOptions, v, version, unsignedCredential_1, credential_1, encryptedCredentialOptions_1, credentialType_1, encryptedCredentialUploadOptions_1, restData_1, restResp_1, latestVersion, unsignedCredential, credential, encryptedCredentialOptions, credentialType, encryptedCredentialUploadOptions, restData, restResp, authToken, issuedCredential;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                credentialOptions = constructCredentialOptions(type, issuer, credentialSubject, expirationDate);
                v = 0;
                _a.label = 1;
            case 1:
                if (!(v < versionList_1.versionList.length - 1)) return [3 /*break*/, 5];
                version = versionList_1.versionList[v];
                if (!(semver_1.gte(version, '2.0.0') && semver_1.lt(version, '3.0.0'))) return [3 /*break*/, 4];
                unsignedCredential_1 = constructUnsignedCredentialObj(credentialOptions);
                credential_1 = constructSignedCredentialObj(unsignedCredential_1, signingPrivateKey);
                return [4 /*yield*/, constructEncryptedCredentialOpts(authorization, credential_1, publicKeyInfos)];
            case 2:
                encryptedCredentialOptions_1 = _a.sent();
                credentialType_1 = getCredentialType_1.getCredentialType(credential_1.type);
                encryptedCredentialUploadOptions_1 = {
                    credentialId: credential_1.id,
                    subject: credentialSubject.id,
                    issuer: credential_1.issuer,
                    type: credentialType_1,
                    encryptedCredentials: encryptedCredentialOptions_1
                };
                restData_1 = {
                    method: 'POST',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'credentialRepository',
                    header: { Authorization: authorization, version: version },
                    data: encryptedCredentialUploadOptions_1
                };
                return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(restData_1)];
            case 3:
                restResp_1 = _a.sent();
                authorization = networkRequestHelper_1.handleAuthTokenHeader(restResp_1, authorization);
                _a.label = 4;
            case 4:
                v++;
                return [3 /*break*/, 1];
            case 5:
                latestVersion = versionList_1.versionList[versionList_1.versionList.length - 1];
                unsignedCredential = constructUnsignedCredentialPbObj(credentialOptions);
                credential = constructSignedCredentialPbObj(unsignedCredential, signingPrivateKey);
                return [4 /*yield*/, constructEncryptedCredentialOpts(authorization, credential, publicKeyInfos)];
            case 6:
                encryptedCredentialOptions = _a.sent();
                credentialType = getCredentialType_1.getCredentialType(credential.type);
                encryptedCredentialUploadOptions = {
                    credentialId: credential.id,
                    subject: credentialSubject.id,
                    issuer: credential.issuer,
                    type: credentialType,
                    encryptedCredentials: encryptedCredentialOptions
                };
                restData = {
                    method: 'POST',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'credentialRepository',
                    header: { Authorization: authorization, version: latestVersion },
                    data: encryptedCredentialUploadOptions
                };
                return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(restData)];
            case 7:
                restResp = _a.sent();
                authToken = networkRequestHelper_1.handleAuthTokenHeader(restResp, authorization);
                issuedCredential = { body: credential, authToken: authToken };
                return [2 /*return*/, issuedCredential];
        }
    });
}); };
//# sourceMappingURL=issueCredentials.js.map