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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSubjectCredentialRequests = void 0;
var requireAuth_1 = require("../requireAuth");
var error_1 = require("../utils/error");
var reEncryptCredentials_1 = require("./reEncryptCredentials");
var verifySubjectCredentialRequests_1 = require("./verifySubjectCredentialRequests");
/**
 * Verify the CredentialRequests signatures and handle calling reEncryptCredentials.
 * Returns the verifiedStatus if the SubjectCredentialRequests are not valid. Otherwise, returns the re-encrypted credentials response which contains the re-encrypted credentials.
 */
function handleSubjectCredentialRequests(options) {
    return __awaiter(this, void 0, void 0, function () {
        var authorization, issuerDid, subjectDid, subjectCredentialRequests, _a, signingPrivateKey, encryptionPrivateKey, issuerEncryptionKeyId, credentialTypes, verifySubjectCredentialRequestsResult, authToken, _b, isVerified, message, reEncryptCredentialsResult;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    authorization = options.authorization, issuerDid = options.issuerDid, subjectDid = options.subjectDid, subjectCredentialRequests = options.subjectCredentialRequests, _a = options.reEncryptCredentialsOptions, signingPrivateKey = _a.signingPrivateKey, encryptionPrivateKey = _a.encryptionPrivateKey, issuerEncryptionKeyId = _a.issuerEncryptionKeyId, credentialTypes = _a.credentialTypes;
                    requireAuth_1.requireAuth(authorization);
                    return [4 /*yield*/, verifySubjectCredentialRequests_1.verifySubjectCredentialRequests(authorization, issuerDid, subjectDid, subjectCredentialRequests)];
                case 1:
                    verifySubjectCredentialRequestsResult = _c.sent();
                    authToken = verifySubjectCredentialRequestsResult.authToken;
                    _b = verifySubjectCredentialRequestsResult.body, isVerified = _b.isVerified, message = _b.message;
                    if (!isVerified) {
                        // return verifySubjectCredentialRequestsResult;
                        throw new error_1.CustError(500, message);
                    }
                    return [4 /*yield*/, reEncryptCredentials_1.reEncryptCredentials(authToken, issuerDid, subjectDid, signingPrivateKey, encryptionPrivateKey, issuerEncryptionKeyId, credentialTypes)];
                case 2:
                    reEncryptCredentialsResult = _c.sent();
                    return [2 /*return*/, reEncryptCredentialsResult];
            }
        });
    });
}
exports.handleSubjectCredentialRequests = handleSubjectCredentialRequests;
//# sourceMappingURL=handleSubjectCredentialRequets.js.map