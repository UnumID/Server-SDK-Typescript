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
exports.issueCredential = void 0;
var config_1 = require("../config");
var requireAuth_1 = require("../requireAuth");
var library_issuer_verifier_utility_1 = require("@unumid/library-issuer-verifier-utility");
var logger_1 = __importDefault(require("../logger"));
/**
 * Creates an object of type EncryptedCredentialOptions which encapsulates information relating to the encrypted credential data
 * @param cred Credential
 * @param authorization String
 */
var constructEncryptedCredentialOpts = function (cred, authorization) { return __awaiter(void 0, void 0, void 0, function () {
    var subjectDid, didDocResponse, publicKeyInfos;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                subjectDid = cred.credentialSubject.id;
                return [4 /*yield*/, library_issuer_verifier_utility_1.getDIDDoc(config_1.configData.SaaSUrl, authorization, subjectDid)];
            case 1:
                didDocResponse = _a.sent();
                if (didDocResponse instanceof Error) {
                    throw didDocResponse;
                }
                publicKeyInfos = library_issuer_verifier_utility_1.getKeyFromDIDDoc(didDocResponse.body, 'RSA');
                if (publicKeyInfos.length === 0) {
                    throw new library_issuer_verifier_utility_1.CustError(404, 'Public key not found for the DID');
                }
                // create an encrypted copy of the credential with each RSA public key
                return [2 /*return*/, publicKeyInfos.map(function (publicKeyInfo) {
                        var subjectDidWithKeyFragment = subjectDid + "#" + publicKeyInfo.id;
                        var encryptedData = library_issuer_verifier_utility_1.doEncrypt(subjectDidWithKeyFragment, publicKeyInfo, cred);
                        var encryptedCredentialOptions = {
                            credentialId: cred.id,
                            subject: subjectDidWithKeyFragment,
                            issuer: cred.issuer,
                            type: cred.type,
                            data: encryptedData
                        };
                        return encryptedCredentialOptions;
                    })];
        }
    });
}); };
/**
 * Creates a signed credential with all the relevant information. The proof serves as a cryptographic signature.
 * @param usCred UnsignedCredential
 * @param privateKey String
 */
var constructSignedCredentialObj = function (usCred, privateKey) {
    var proof = library_issuer_verifier_utility_1.createProof(usCred, privateKey, usCred.issuer, 'pem');
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
var constructUnsignedCredentialObj = function (credOpts) {
    var credentialId = library_issuer_verifier_utility_1.getUUID();
    var unsCredObj = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        credentialStatus: {
            id: config_1.configData.SaaSUrl + "/credentialStatus/" + credentialId,
            type: 'CredentialStatus'
        },
        credentialSubject: credOpts.credentialSubject,
        issuer: credOpts.issuer,
        type: credOpts.type,
        id: credentialId,
        issuanceDate: new Date(),
        expirationDate: credOpts.expirationDate
    };
    return (unsCredObj);
};
/**
 * Handle input validation.
 * @param type
 * @param issuer
 * @param credentialSubject
 * @param eccPrivateKey
 */
var validateInputs = function (type, issuer, credentialSubject, eccPrivateKey, expirationDate) {
    if (!type) {
        // type element is mandatory, and it can be either string or an array
        throw new library_issuer_verifier_utility_1.CustError(400, 'type is required.');
    }
    if (!issuer) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'issuer is required.');
    }
    if (!credentialSubject) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'credentialSubject is required.');
    }
    if (!eccPrivateKey) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'eccPrivateKey is required.');
    }
    // id must be present in credentialSubject input parameter
    if (!credentialSubject.id) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid credentialSubject: id is required.');
    }
    if (!Array.isArray(type) && typeof type !== 'string') {
        throw new library_issuer_verifier_utility_1.CustError(400, 'type must be an array or a string.');
    }
    if (typeof issuer !== 'string') {
        throw new library_issuer_verifier_utility_1.CustError(400, 'issuer must be a string.');
    }
    if (typeof eccPrivateKey !== 'string') {
        throw new library_issuer_verifier_utility_1.CustError(400, 'eccPrivateKey must be a string.');
    }
    // expirationDate must be a Date object and return a properly formed time. Invalid Date.getTime() will produce NaN
    if (expirationDate && (!(expirationDate instanceof Date) || isNaN(expirationDate.getTime()))) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'expirationDate must be a valid Date object.');
    }
    if (expirationDate && expirationDate < new Date()) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'expirationDate must be in the future.');
    }
};
var constructCredentialOptions = function (type, issuer, credentialSubject, eccPrivateKey, expirationDate) {
    // HACK ALERT: removing duplicate 'VerifiableCredential' if present in type string[]
    var typeList = ['VerifiableCredential'].concat(type); // Need to have some value in the "base" array so just just the keyword we are going to filter over.
    var rawTypes = typeList.filter(function (t) { return t !== 'VerifiableCredential'; });
    var types = ['VerifiableCredential'].concat(rawTypes); // Adding back the filtered keyword, effectively ensuring there is only one at the start of the array
    var credOpt = {
        credentialSubject: credentialSubject,
        issuer: issuer,
        type: types,
        expirationDate: expirationDate
    };
    return (credOpt);
};
/**
 * Handles issuing a credential with UnumID's SaaS.
 *
 * @param authorization
 * @param type
 * @param issuer
 * @param credentialSubject
 * @param eccPrivateKey
 * @param expirationDate
 */
exports.issueCredential = function (authorization, type, issuer, credentialSubject, eccPrivateKey, expirationDate) { return __awaiter(void 0, void 0, void 0, function () {
    var credentialOptions, unsignedCredential, credential, encryptedCredentialOptions, encryptedCredentialUploadOptions, restData, restResp, authToken, issuedCredential, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                // The authorization string needs to be passed for the SaaS to authorize getting the DID document associated with the holder / subject.
                requireAuth_1.requireAuth(authorization);
                // Validate the inputs
                validateInputs(type, issuer, credentialSubject, eccPrivateKey, expirationDate);
                credentialOptions = constructCredentialOptions(type, issuer, credentialSubject, eccPrivateKey, expirationDate);
                unsignedCredential = constructUnsignedCredentialObj(credentialOptions);
                credential = constructSignedCredentialObj(unsignedCredential, eccPrivateKey);
                return [4 /*yield*/, constructEncryptedCredentialOpts(credential, authorization)];
            case 1:
                encryptedCredentialOptions = _a.sent();
                encryptedCredentialUploadOptions = {
                    credentialId: credential.id,
                    subject: credential.credentialSubject.id,
                    issuer: credential.issuer,
                    type: credential.type,
                    encryptedCredentials: encryptedCredentialOptions
                };
                restData = {
                    method: 'POST',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'credentialRepository',
                    header: { Authorization: authorization },
                    data: encryptedCredentialUploadOptions
                };
                return [4 /*yield*/, library_issuer_verifier_utility_1.makeNetworkRequest(restData)];
            case 2:
                restResp = _a.sent();
                authToken = library_issuer_verifier_utility_1.handleAuthToken(restResp);
                issuedCredential = { body: credential, authToken: authToken };
                return [2 /*return*/, issuedCredential];
            case 3:
                error_1 = _a.sent();
                logger_1.default.error("Error issuing a credential with UnumID SaaS. " + error_1);
                throw error_1;
            case 4: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWVDcmVkZW50aWFscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pc3N1ZXIvaXNzdWVDcmVkZW50aWFscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvQ0FBdUM7QUFFdkMsOENBQTZDO0FBRTdDLDJGQUF1TztBQUV2TyxxREFBK0I7QUFFL0I7Ozs7R0FJRztBQUNILElBQU0sZ0NBQWdDLEdBQUcsVUFBTyxJQUFnQixFQUFFLGFBQXFCOzs7OztnQkFDL0UsVUFBVSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7Z0JBR3RCLHFCQUFNLDJDQUFTLENBQUMsbUJBQVUsQ0FBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLFVBQVUsQ0FBQyxFQUFBOztnQkFBL0UsY0FBYyxHQUFHLFNBQThEO2dCQUVyRixJQUFJLGNBQWMsWUFBWSxLQUFLLEVBQUU7b0JBQ25DLE1BQU0sY0FBYyxDQUFDO2lCQUN0QjtnQkFHSyxjQUFjLEdBQUcsa0RBQWdCLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFFcEUsSUFBSSxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDL0IsTUFBTSxJQUFJLDJDQUFTLENBQUMsR0FBRyxFQUFFLGtDQUFrQyxDQUFDLENBQUM7aUJBQzlEO2dCQUVELHNFQUFzRTtnQkFDdEUsc0JBQU8sY0FBYyxDQUFDLEdBQUcsQ0FBQyxVQUFBLGFBQWE7d0JBQ3JDLElBQU0seUJBQXlCLEdBQU0sVUFBVSxTQUFJLGFBQWEsQ0FBQyxFQUFJLENBQUM7d0JBQ3RFLElBQU0sYUFBYSxHQUFrQiwyQ0FBUyxDQUFDLHlCQUF5QixFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQzt3QkFFL0YsSUFBTSwwQkFBMEIsR0FBK0I7NEJBQzdELFlBQVksRUFBRSxJQUFJLENBQUMsRUFBRTs0QkFD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LE9BQU87b0JBQzNCLFFBQVEsRUFBRSxzQkFBc0I7b0JBQ2hDLE1BQU0sRUFBRSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUU7b0JBQ3hDLElBQUksRUFBRSxnQ0FBZ0M7aUJBQ3ZDLENBQUM7Z0JBRXdCLHFCQUFNLG9EQUFrQixDQUFDLFFBQVEsQ0FBQyxFQUFBOztnQkFBdEQsUUFBUSxHQUFZLFNBQWtDO2dCQUV0RCxTQUFTLEdBQVcsaURBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFOUMsZ0JBQWdCLEdBQXdCLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxTQUFTLFdBQUEsRUFBRSxDQUFDO2dCQUU5RSxzQkFBTyxnQkFBZ0IsRUFBQzs7O2dCQUV4QixnQkFBTSxDQUFDLEtBQUssQ0FBQyxrREFBZ0QsT0FBTyxDQUFDLENBQUM7Z0JBQ3RFLE1BQU0sT0FBSyxDQUFDOzs7O0tBRWYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNvbmZpZ0RhdGEgfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgQ3JlZGVudGlhbE9wdGlvbnMsIEVuY3J5cHRlZENyZWRlbnRpYWxPcHRpb25zLCBVbnVtRHRvIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgcmVxdWlyZUF1dGggfSBmcm9tICcuLi9yZXF1aXJlQXV0aCc7XG5cbmltcG9ydCB7IENyZWRlbnRpYWwsIGdldERJRERvYywgZ2V0S2V5RnJvbURJRERvYywgQ3VzdEVycm9yLCBFbmNyeXB0ZWREYXRhLCBkb0VuY3J5cHQsIFVuc2lnbmVkQ3JlZGVudGlhbCwgUHJvb2YsIGNyZWF0ZVByb29mLCBnZXRVVUlELCBSRVNURGF0YSwgbWFrZU5ldHdvcmtSZXF1ZXN0LCBoYW5kbGVBdXRoVG9rZW4gfSBmcm9tICdAdW51bWlkL2xpYnJhcnktaXNzdWVyLXZlcmlmaWVyLXV0aWxpdHknO1xuaW1wb3J0IHsgQ3JlZGVudGlhbFN1YmplY3QsIEpTT05PYmogfSBmcm9tICdAdW51bWlkL2xpYnJhcnktaXNzdWVyLXZlcmlmaWVyLXV0aWxpdHkvYnVpbGQvdHlwZXMnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuLi9sb2dnZXInO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gb2JqZWN0IG9mIHR5cGUgRW5jcnlwdGVkQ3JlZGVudGlhbE9wdGlvbnMgd2hpY2ggZW5jYXBzdWxhdGVzIGluZm9ybWF0aW9uIHJlbGF0aW5nIHRvIHRoZSBlbmNyeXB0ZWQgY3JlZGVudGlhbCBkYXRhXG4gKiBAcGFyYW0gY3JlZCBDcmVkZW50aWFsXG4gKiBAcGFyYW0gYXV0aG9yaXphdGlvbiBTdHJpbmdcbiAqL1xuY29uc3QgY29uc3RydWN0RW5jcnlwdGVkQ3JlZGVudGlhbE9wdHMgPSBhc3luYyAoY3JlZDogQ3JlZGVudGlhbCwgYXV0aG9yaXphdGlvbjogc3RyaW5nKTogUHJvbWlzZTxFbmNyeXB0ZWRDcmVkZW50aWFsT3B0aW9uc1tdPiA9PiB7XG4gIGNvbnN0IHN1YmplY3REaWQgPSBjcmVkLmNyZWRlbnRpYWxTdWJqZWN0LmlkO1xuXG4gIC8vIHJlc29sdmUgdGhlIHN1YmplY3QncyBESURcbiAgY29uc3QgZGlkRG9jUmVzcG9uc2UgPSBhd2FpdCBnZXRESUREb2MoY29uZmlnRGF0YS5TYWFTVXJsLCBhdXRob3JpemF0aW9uLCBzdWJqZWN0RGlkKTtcblxuICBpZiAoZGlkRG9jUmVzcG9uc2UgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgIHRocm93IGRpZERvY1Jlc3BvbnNlO1xuICB9XG5cbiAgLy8gZ2V0IHN1YmplY3QncyBwdWJsaWMga2V5IGluZm8gZnJvbSBpdHMgRElEIGRvY3VtZW50XG4gIGNvbnN0IHB1YmxpY0tleUluZm9zID0gZ2V0S2V5RnJvbURJRERvYyhkaWREb2NSZXNwb25zZS5ib2R5LCAnUlNBJyk7XG5cbiAgaWYgKHB1YmxpY0tleUluZm9zLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDA0LCAnUHVibGljIGtleSBub3QgZm91bmQgZm9yIHRoZSBESUQnKTtcbiAgfVxuXG4gIC8vIGNyZWF0ZSBhbiBlbmNyeXB0ZWQgY29weSBvZiB0aGUgY3JlZGVudGlhbCB3aXRoIGVhY2ggUlNBIHB1YmxpYyBrZXlcbiAgcmV0dXJuIHB1YmxpY0tleUluZm9zLm1hcChwdWJsaWNLZXlJbmZvID0+IHtcbiAgICBjb25zdCBzdWJqZWN0RGlkV2l0aEtleUZyYWdtZW50ID0gYCR7c3ViamVjdERpZH0jJHtwdWJsaWNLZXlJbmZvLmlkfWA7XG4gICAgY29uc3QgZW5jcnlwdGVkRGF0YTogRW5jcnlwdGVkRGF0YSA9IGRvRW5jcnlwdChzdWJqZWN0RGlkV2l0aEtleUZyYWdtZW50LCBwdWJsaWNLZXlJbmZvLCBjcmVkKTtcblxuICAgIGNvbnN0IGVuY3J5cHRlZENyZWRlbnRpYWxPcHRpb25zOiBFbmNyeXB0ZWRDcmVkZW50aWFsT3B0aW9ucyA9IHtcbiAgICAgIGNyZWRlbnRpYWxJZDogY3JlZC5pZCxcbiAgICAgIHN1YmplY3Q6IHN1YmplY3REaWRXaXRoS2V5RnJhZ21lbnQsXG4gICAgICBpc3N1ZXI6IGNyZWQuaXNzdWVyLFxuICAgICAgdHlwZTogY3JlZC50eXBlLFxuICAgICAgZGF0YTogZW5jcnlwdGVkRGF0YVxuICAgIH07XG5cbiAgICByZXR1cm4gZW5jcnlwdGVkQ3JlZGVudGlhbE9wdGlvbnM7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgc2lnbmVkIGNyZWRlbnRpYWwgd2l0aCBhbGwgdGhlIHJlbGV2YW50IGluZm9ybWF0aW9uLiBUaGUgcHJvb2Ygc2VydmVzIGFzIGEgY3J5cHRvZ3JhcGhpYyBzaWduYXR1cmUuXG4gKiBAcGFyYW0gdXNDcmVkIFVuc2lnbmVkQ3JlZGVudGlhbFxuICogQHBhcmFtIHByaXZhdGVLZXkgU3RyaW5nXG4gKi9cbmNvbnN0IGNvbnN0cnVjdFNpZ25lZENyZWRlbnRpYWxPYmogPSAodXNDcmVkOiBVbnNpZ25lZENyZWRlbnRpYWwsIHByaXZhdGVLZXk6IHN0cmluZyk6IENyZWRlbnRpYWwgPT4ge1xuICBjb25zdCBwcm9vZjogUHJvb2YgPSBjcmVhdGVQcm9vZih1c0NyZWQsIHByaXZhdGVLZXksIHVzQ3JlZC5pc3N1ZXIsICdwZW0nKTtcbiAgY29uc3QgY3JlZGVudGlhbDogQ3JlZGVudGlhbCA9IHtcbiAgICAnQGNvbnRleHQnOiB1c0NyZWRbJ0Bjb250ZXh0J10sXG4gICAgY3JlZGVudGlhbFN0YXR1czogdXNDcmVkLmNyZWRlbnRpYWxTdGF0dXMsXG4gICAgY3JlZGVudGlhbFN1YmplY3Q6IHVzQ3JlZC5jcmVkZW50aWFsU3ViamVjdCxcbiAgICBpc3N1ZXI6IHVzQ3JlZC5pc3N1ZXIsXG4gICAgdHlwZTogdXNDcmVkLnR5cGUsXG4gICAgaWQ6IHVzQ3JlZC5pZCxcbiAgICBpc3N1YW5jZURhdGU6IHVzQ3JlZC5pc3N1YW5jZURhdGUsXG4gICAgZXhwaXJhdGlvbkRhdGU6IHVzQ3JlZC5leHBpcmF0aW9uRGF0ZSxcbiAgICBwcm9vZjogcHJvb2ZcbiAgfTtcblxuICByZXR1cm4gKGNyZWRlbnRpYWwpO1xufTtcbi8qKlxuICogQ3JlYXRlcyBhbGwgdGhlIGF0dHJpYnV0ZXMgYXNzb2NpYXRlZCB3aXRoIGFuIHVuc2lnbmVkIGNyZWRlbnRpYWwuXG4gKiBAcGFyYW0gY3JlZE9wdHMgQ3JlZGVudGlhbE9wdGlvbnNcbiAqL1xuY29uc3QgY29uc3RydWN0VW5zaWduZWRDcmVkZW50aWFsT2JqID0gKGNyZWRPcHRzOiBDcmVkZW50aWFsT3B0aW9ucyk6IFVuc2lnbmVkQ3JlZGVudGlhbCA9PiB7XG4gIGNvbnN0IGNyZWRlbnRpYWxJZDogc3RyaW5nID0gZ2V0VVVJRCgpO1xuICBjb25zdCB1bnNDcmVkT2JqOiBVbnNpZ25lZENyZWRlbnRpYWwgPSB7XG4gICAgJ0Bjb250ZXh0JzogWydodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSddLFxuICAgIGNyZWRlbnRpYWxTdGF0dXM6IHtcbiAgICAgIGlkOiBgJHtjb25maWdEYXRhLlNhYVNVcmx9L2NyZWRlbnRpYWxTdGF0dXMvJHtjcmVkZW50aWFsSWR9YCxcbiAgICAgIHR5cGU6ICdDcmVkZW50aWFsU3RhdHVzJ1xuICAgIH0sXG4gICAgY3JlZGVudGlhbFN1YmplY3Q6IGNyZWRPcHRzLmNyZWRlbnRpYWxTdWJqZWN0LFxuICAgIGlzc3VlcjogY3JlZE9wdHMuaXNzdWVyLFxuICAgIHR5cGU6IGNyZWRPcHRzLnR5cGUsXG4gICAgaWQ6IGNyZWRlbnRpYWxJZCxcbiAgICBpc3N1YW5jZURhdGU6IG5ldyBEYXRlKCksXG4gICAgZXhwaXJhdGlvbkRhdGU6IGNyZWRPcHRzLmV4cGlyYXRpb25EYXRlXG4gIH07XG5cbiAgcmV0dXJuICh1bnNDcmVkT2JqKTtcbn07XG5cbi8qKlxuICogSGFuZGxlIGlucHV0IHZhbGlkYXRpb24uXG4gKiBAcGFyYW0gdHlwZVxuICogQHBhcmFtIGlzc3VlclxuICogQHBhcmFtIGNyZWRlbnRpYWxTdWJqZWN0XG4gKiBAcGFyYW0gZWNjUHJpdmF0ZUtleVxuICovXG5jb25zdCB2YWxpZGF0ZUlucHV0cyA9ICh0eXBlOiBzdHJpbmd8c3RyaW5nW10sIGlzc3Vlcjogc3RyaW5nLCBjcmVkZW50aWFsU3ViamVjdDogQ3JlZGVudGlhbFN1YmplY3QsIGVjY1ByaXZhdGVLZXk6IHN0cmluZywgZXhwaXJhdGlvbkRhdGU/OiBEYXRlKTogdm9pZCA9PiB7XG4gIGlmICghdHlwZSkge1xuICAgIC8vIHR5cGUgZWxlbWVudCBpcyBtYW5kYXRvcnksIGFuZCBpdCBjYW4gYmUgZWl0aGVyIHN0cmluZyBvciBhbiBhcnJheVxuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAndHlwZSBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICghaXNzdWVyKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdpc3N1ZXIgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAoIWNyZWRlbnRpYWxTdWJqZWN0KSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdjcmVkZW50aWFsU3ViamVjdCBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICghZWNjUHJpdmF0ZUtleSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnZWNjUHJpdmF0ZUtleSBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIC8vIGlkIG11c3QgYmUgcHJlc2VudCBpbiBjcmVkZW50aWFsU3ViamVjdCBpbnB1dCBwYXJhbWV0ZXJcbiAgaWYgKCFjcmVkZW50aWFsU3ViamVjdC5pZCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBjcmVkZW50aWFsU3ViamVjdDogaWQgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAoIUFycmF5LmlzQXJyYXkodHlwZSkgJiYgdHlwZW9mIHR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICd0eXBlIG11c3QgYmUgYW4gYXJyYXkgb3IgYSBzdHJpbmcuJyk7XG4gIH1cblxuICBpZiAodHlwZW9mIGlzc3VlciAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ2lzc3VlciBtdXN0IGJlIGEgc3RyaW5nLicpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBlY2NQcml2YXRlS2V5ICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnZWNjUHJpdmF0ZUtleSBtdXN0IGJlIGEgc3RyaW5nLicpO1xuICB9XG5cbiAgLy8gZXhwaXJhdGlvbkRhdGUgbXVzdCBiZSBhIERhdGUgb2JqZWN0IGFuZCByZXR1cm4gYSBwcm9wZXJseSBmb3JtZWQgdGltZS4gSW52YWxpZCBEYXRlLmdldFRpbWUoKSB3aWxsIHByb2R1Y2UgTmFOXG4gIGlmIChleHBpcmF0aW9uRGF0ZSAmJiAoIShleHBpcmF0aW9uRGF0ZSBpbnN0YW5jZW9mIERhdGUpIHx8IGlzTmFOKGV4cGlyYXRpb25EYXRlLmdldFRpbWUoKSkpKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdleHBpcmF0aW9uRGF0ZSBtdXN0IGJlIGEgdmFsaWQgRGF0ZSBvYmplY3QuJyk7XG4gIH1cblxuICBpZiAoZXhwaXJhdGlvbkRhdGUgJiYgZXhwaXJhdGlvbkRhdGUgPCBuZXcgRGF0ZSgpKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdleHBpcmF0aW9uRGF0ZSBtdXN0IGJlIGluIHRoZSBmdXR1cmUuJyk7XG4gIH1cbn07XG5cbmNvbnN0IGNvbnN0cnVjdENyZWRlbnRpYWxPcHRpb25zID0gKHR5cGU6IHN0cmluZ3xzdHJpbmdbXSwgaXNzdWVyOiBzdHJpbmcsIGNyZWRlbnRpYWxTdWJqZWN0OiBDcmVkZW50aWFsU3ViamVjdCwgZWNjUHJpdmF0ZUtleTogc3RyaW5nLCBleHBpcmF0aW9uRGF0ZT86IERhdGUpOiBDcmVkZW50aWFsT3B0aW9ucyA9PiB7XG4gIC8vIEhBQ0sgQUxFUlQ6IHJlbW92aW5nIGR1cGxpY2F0ZSAnVmVyaWZpYWJsZUNyZWRlbnRpYWwnIGlmIHByZXNlbnQgaW4gdHlwZSBzdHJpbmdbXVxuICBjb25zdCB0eXBlTGlzdDogc3RyaW5nW10gPSBbJ1ZlcmlmaWFibGVDcmVkZW50aWFsJ10uY29uY2F0KHR5cGUpOyAvLyBOZWVkIHRvIGhhdmUgc29tZSB2YWx1ZSBpbiB0aGUgXCJiYXNlXCIgYXJyYXkgc28ganVzdCBqdXN0IHRoZSBrZXl3b3JkIHdlIGFyZSBnb2luZyB0byBmaWx0ZXIgb3Zlci5cbiAgY29uc3QgcmF3VHlwZXMgPSB0eXBlTGlzdC5maWx0ZXIodCA9PiB0ICE9PSAnVmVyaWZpYWJsZUNyZWRlbnRpYWwnKTtcbiAgY29uc3QgdHlwZXMgPSBbJ1ZlcmlmaWFibGVDcmVkZW50aWFsJ10uY29uY2F0KHJhd1R5cGVzKTsgLy8gQWRkaW5nIGJhY2sgdGhlIGZpbHRlcmVkIGtleXdvcmQsIGVmZmVjdGl2ZWx5IGVuc3VyaW5nIHRoZXJlIGlzIG9ubHkgb25lIGF0IHRoZSBzdGFydCBvZiB0aGUgYXJyYXlcblxuICBjb25zdCBjcmVkT3B0OiBDcmVkZW50aWFsT3B0aW9ucyA9IHtcbiAgICBjcmVkZW50aWFsU3ViamVjdCxcbiAgICBpc3N1ZXIsXG4gICAgdHlwZTogdHlwZXMsXG4gICAgZXhwaXJhdGlvbkRhdGU6IGV4cGlyYXRpb25EYXRlXG4gIH07XG5cbiAgcmV0dXJuIChjcmVkT3B0KTtcbn07XG5cbi8qKlxuICogSGFuZGxlcyBpc3N1aW5nIGEgY3JlZGVudGlhbCB3aXRoIFVudW1JRCdzIFNhYVMuXG4gKlxuICogQHBhcmFtIGF1dGhvcml6YXRpb25cbiAqIEBwYXJhbSB0eXBlXG4gKiBAcGFyYW0gaXNzdWVyXG4gKiBAcGFyYW0gY3JlZGVudGlhbFN1YmplY3RcbiAqIEBwYXJhbSBlY2NQcml2YXRlS2V5XG4gKiBAcGFyYW0gZXhwaXJhdGlvbkRhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IGlzc3VlQ3JlZGVudGlhbCA9IGFzeW5jIChhdXRob3JpemF0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWQsIHR5cGU6IHN0cmluZyB8IHN0cmluZ1tdLCBpc3N1ZXI6IHN0cmluZywgY3JlZGVudGlhbFN1YmplY3Q6IENyZWRlbnRpYWxTdWJqZWN0LCBlY2NQcml2YXRlS2V5OiBzdHJpbmcsIGV4cGlyYXRpb25EYXRlPzogRGF0ZSk6IFByb21pc2U8VW51bUR0bzxDcmVkZW50aWFsPj4gPT4ge1xuICB0cnkge1xuICAgIC8vIFRoZSBhdXRob3JpemF0aW9uIHN0cmluZyBuZWVkcyB0byBiZSBwYXNzZWQgZm9yIHRoZSBTYWFTIHRvIGF1dGhvcml6ZSBnZXR0aW5nIHRoZSBESUQgZG9jdW1lbnQgYXNzb2NpYXRlZCB3aXRoIHRoZSBob2xkZXIgLyBzdWJqZWN0LlxuICAgIHJlcXVpcmVBdXRoKGF1dGhvcml6YXRpb24pO1xuXG4gICAgLy8gVmFsaWRhdGUgdGhlIGlucHV0c1xuICAgIHZhbGlkYXRlSW5wdXRzKHR5cGUsIGlzc3VlciwgY3JlZGVudGlhbFN1YmplY3QsIGVjY1ByaXZhdGVLZXksIGV4cGlyYXRpb25EYXRlKTtcblxuICAgIC8vIENvbnN0cnVjdCBDcmVkZW50aWFsT3B0aW9ucyBvYmplY3RcbiAgICBjb25zdCBjcmVkZW50aWFsT3B0aW9ucyA9IGNvbnN0cnVjdENyZWRlbnRpYWxPcHRpb25zKHR5cGUsIGlzc3VlciwgY3JlZGVudGlhbFN1YmplY3QsIGVjY1ByaXZhdGVLZXksIGV4cGlyYXRpb25EYXRlKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgVW5zaWduZWRDcmVkZW50aWFsIG9iamVjdFxuICAgIGNvbnN0IHVuc2lnbmVkQ3JlZGVudGlhbCA9IGNvbnN0cnVjdFVuc2lnbmVkQ3JlZGVudGlhbE9iaihjcmVkZW50aWFsT3B0aW9ucyk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIHNpZ25lZCBDcmVkZW50aWFsIG9iamVjdCBmcm9tIHRoZSB1bnNpZ25lZENyZWRlbnRpYWwgb2JqZWN0XG4gICAgY29uc3QgY3JlZGVudGlhbCA9IGNvbnN0cnVjdFNpZ25lZENyZWRlbnRpYWxPYmoodW5zaWduZWRDcmVkZW50aWFsLCBlY2NQcml2YXRlS2V5KTtcblxuICAgIC8vIENyZWF0ZSB0aGUgYXR0cmlidXRlcyBmb3IgYW4gZW5jcnlwdGVkIGNyZWRlbnRpYWwuIFRoZSBhdXRob3JpemF0aW9uIHN0cmluZyBpcyB1c2VkIHRvIGdldCB0aGUgRElEIERvY3VtZW50IGNvbnRhaW5pbmcgdGhlIHN1YmplY3QncyBwdWJsaWMga2V5IGZvciBlbmNyeXB0aW9uLlxuICAgIGNvbnN0IGVuY3J5cHRlZENyZWRlbnRpYWxPcHRpb25zID0gYXdhaXQgY29uc3RydWN0RW5jcnlwdGVkQ3JlZGVudGlhbE9wdHMoY3JlZGVudGlhbCwgYXV0aG9yaXphdGlvbiBhcyBzdHJpbmcpO1xuXG4gICAgY29uc3QgZW5jcnlwdGVkQ3JlZGVudGlhbFVwbG9hZE9wdGlvbnMgPSB7XG4gICAgICBjcmVkZW50aWFsSWQ6IGNyZWRlbnRpYWwuaWQsXG4gICAgICBzdWJqZWN0OiBjcmVkZW50aWFsLmNyZWRlbnRpYWxTdWJqZWN0LmlkLFxuICAgICAgaXNzdWVyOiBjcmVkZW50aWFsLmlzc3VlcixcbiAgICAgIHR5cGU6IGNyZWRlbnRpYWwudHlwZSxcbiAgICAgIGVuY3J5cHRlZENyZWRlbnRpYWxzOiBlbmNyeXB0ZWRDcmVkZW50aWFsT3B0aW9uc1xuICAgIH07XG5cbiAgICBjb25zdCByZXN0RGF0YTogUkVTVERhdGEgPSB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGJhc2VVcmw6IGNvbmZpZ0RhdGEuU2FhU1VybCxcbiAgICAgIGVuZFBvaW50OiAnY3JlZGVudGlhbFJlcG9zaXRvcnknLFxuICAgICAgaGVhZGVyOiB7IEF1dGhvcml6YXRpb246IGF1dGhvcml6YXRpb24gfSxcbiAgICAgIGRhdGE6IGVuY3J5cHRlZENyZWRlbnRpYWxVcGxvYWRPcHRpb25zXG4gICAgfTtcblxuICAgIGNvbnN0IHJlc3RSZXNwOiBKU09OT2JqID0gYXdhaXQgbWFrZU5ldHdvcmtSZXF1ZXN0KHJlc3REYXRhKTtcblxuICAgIGNvbnN0IGF1dGhUb2tlbjogc3RyaW5nID0gaGFuZGxlQXV0aFRva2VuKHJlc3RSZXNwKTtcblxuICAgIGNvbnN0IGlzc3VlZENyZWRlbnRpYWw6IFVudW1EdG88Q3JlZGVudGlhbD4gPSB7IGJvZHk6IGNyZWRlbnRpYWwsIGF1dGhUb2tlbiB9O1xuXG4gICAgcmV0dXJuIGlzc3VlZENyZWRlbnRpYWw7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKGBFcnJvciBpc3N1aW5nIGEgY3JlZGVudGlhbCB3aXRoIFVudW1JRCBTYWFTLiAke2Vycm9yfWApO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuIl19