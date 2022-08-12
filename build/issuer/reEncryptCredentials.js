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
exports.reEncryptCredentials = void 0;
var config_1 = require("../config");
var requireAuth_1 = require("../requireAuth");
var types_1 = require("@unumid/types");
var error_1 = require("../utils/error");
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
var lodash_1 = __importDefault(require("lodash"));
var decrypt_1 = require("../utils/decrypt");
var issueCredentials_1 = require("./issueCredentials");
var constants_1 = require("../utils/constants");
var extractCredentialType_1 = require("../utils/extractCredentialType");
var queryStringHelper_1 = require("../utils/queryStringHelper");
var verifyCredential_1 = require("../verifier/verifyCredential");
var logger_1 = __importDefault(require("../logger"));
/**
 * Helper to facilitate an issuer re-encrypting any credentials it has issued to a target subject.
 * This is useful in the case of needing to provide a subject credential data encrypted with a new RSA key id.
 *
 * @param authorization
 * @param issuerDid
 * @param signingPrivateKey
 * @param encryptionPrivateKey
 * @param subjectDid
 */
exports.reEncryptCredentials = function (authorization, issuerDid, signingPrivateKey, encryptionPrivateKey, subjectDid, issuerEncryptionKeyId, credentialTypes) {
    if (credentialTypes === void 0) { credentialTypes = []; }
    return __awaiter(void 0, void 0, void 0, function () {
        var issuerDidWithFragment, credentialsResponse, credentials, credentialDataList, _i, credentials_1, credential, decryptedCredentialBytes, decryptedCredential, isVerified, credentialSubject, credentialData, reissuedCredentials;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // The authorization string needs to be passed for the SaaS to authorize getting the DID document associated with the holder / subject.
                    requireAuth_1.requireAuth(authorization);
                    // Validate inputs.
                    validateInputs(issuerDid, signingPrivateKey, encryptionPrivateKey, subjectDid, issuerEncryptionKeyId);
                    issuerDidWithFragment = issuerDid + "#" + issuerEncryptionKeyId;
                    return [4 /*yield*/, getRelevantCredentials(authorization, issuerDidWithFragment, subjectDid, credentialTypes)];
                case 1:
                    credentialsResponse = _a.sent();
                    authorization = credentialsResponse.authToken;
                    credentials = credentialsResponse.body;
                    credentialDataList = [];
                    _i = 0, credentials_1 = credentials;
                    _a.label = 2;
                case 2:
                    if (!(_i < credentials_1.length)) return [3 /*break*/, 6];
                    credential = credentials_1[_i];
                    return [4 /*yield*/, decrypt_1.doDecrypt(encryptionPrivateKey, credential.encryptedCredential.data)];
                case 3:
                    decryptedCredentialBytes = _a.sent();
                    decryptedCredential = types_1.CredentialPb.decode(decryptedCredentialBytes);
                    return [4 /*yield*/, verifyCredential_1.verifyCredential(authorization, decryptedCredential)];
                case 4:
                    isVerified = _a.sent();
                    if (!isVerified) {
                        logger_1.default.warn("Credential " + decryptedCredential.id + " signature could not be verified. This should never happen and is very suspicious. Please contact UnumID support.");
                        return [3 /*break*/, 5];
                    }
                    credentialSubject = JSON.parse(decryptedCredential.credentialSubject);
                    credentialData = __assign(__assign({}, lodash_1.default.omit(credentialSubject, 'id')), { 
                        /**
                         * HACK ALERT: assuming the credential type is ultimately only of length 2 with the first element being the 'VerifiableCredential' indicator.
                         * This will need to be updated if we want to actually sport multiple credential types being defined in one credential.
                         * However, lots of other parts of our product would have to updated too.
                         */
                        type: extractCredentialType_1.extractCredentialType(decryptedCredential.type)[0] });
                    // push the credential data to the array
                    credentialDataList.push(credentialData);
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6: return [4 /*yield*/, issueCredentials_1.issueCredentials(authorization, issuerDid, subjectDid, credentialDataList, signingPrivateKey, undefined, false)];
                case 7:
                    reissuedCredentials = _a.sent();
                    return [2 /*return*/, reissuedCredentials];
            }
        });
    });
};
function validateInputs(issuerDid, signingPrivateKey, encryptionPrivateKey, subjectDid, issuerEncryptionKeyId) {
    if (!issuerDid) {
        throw new error_1.CustError(400, 'issuerDid is required.');
    }
    if (!subjectDid) {
        throw new error_1.CustError(400, 'subjectDid is required.');
    }
    if (!signingPrivateKey) {
        throw new error_1.CustError(400, 'signingPrivateKey is required.');
    }
    if (!encryptionPrivateKey) {
        throw new error_1.CustError(400, 'encryptionPrivateKey is required.');
    }
    if (!issuerEncryptionKeyId) {
        throw new error_1.CustError(400, 'issuerEncryptionKeyId is required.');
    }
    if (typeof issuerDid !== 'string') {
        throw new error_1.CustError(400, 'issuer must be a string.');
    }
    if (typeof subjectDid !== 'string') {
        throw new error_1.CustError(400, 'subjectDid must be a string.');
    }
    if (typeof signingPrivateKey !== 'string') {
        throw new error_1.CustError(400, 'signingPrivateKey must be a string.');
    }
    if (typeof encryptionPrivateKey !== 'string') {
        throw new error_1.CustError(400, 'encryptionPrivateKey must be a string.');
    }
    if (typeof issuerEncryptionKeyId !== 'string') {
        throw new error_1.CustError(400, 'issuerEncryptionKeyId must be a string.');
    }
}
/**
 * Helper to get the relevant credentials issued by the issuer for the subject of which the issuer also issued to self.
 * @param authorization
 * @param issuerDid w/ keyId
 * @param subjectDid
 * @returns
 */
var getRelevantCredentials = function (authorization, issuerDidWithFragment, subjectDid, credentialTypes) { return __awaiter(void 0, void 0, void 0, function () {
    var typesQuery, restData, restResp, authToken, encryptedCredentials;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                typesQuery = queryStringHelper_1.createListQueryString('type', credentialTypes);
                restData = {
                    method: 'GET',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: "credentialReIssuanceRepository/" + encodeURIComponent(issuerDidWithFragment) + "?subject=" + encodeURIComponent(subjectDid) + "&version=" + encodeURIComponent(constants_1.sdkMajorVersion) + "&" + typesQuery,
                    header: { Authorization: authorization, version: constants_1.sdkMajorVersion }
                };
                return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(restData)];
            case 1:
                restResp = _a.sent();
                authToken = networkRequestHelper_1.handleAuthTokenHeader(restResp, authorization);
                encryptedCredentials = { body: restResp.body, authToken: authToken };
                return [2 /*return*/, encryptedCredentials];
        }
    });
}); };
//# sourceMappingURL=reEncryptCredentials.js.map