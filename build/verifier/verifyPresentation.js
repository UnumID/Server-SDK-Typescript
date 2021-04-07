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
exports.verifyPresentation = void 0;
var requireAuth_1 = require("../requireAuth");
var library_crypto_1 = require("@unumid/library-crypto");
var library_issuer_verifier_utility_1 = require("@unumid/library-issuer-verifier-utility");
var logger_1 = __importDefault(require("../logger"));
var verifyNoPresentationHelper_1 = require("./verifyNoPresentationHelper");
var verifyPresentationHelper_1 = require("./verifyPresentationHelper");
function isPresentation(presentation) {
    return presentation.type[0] === 'VerifiablePresentation';
}
/**
 * Handler to send information regarding the user agreeing to share a credential Presentation.
 * @param authorization: string
 * @param encryptedPresentation: EncryptedData
 * @param verifierDid: string
 */
exports.verifyPresentation = function (authorization, encryptedPresentation, verifierDid, encryptionPrivateKey, presentationRequest) { return __awaiter(void 0, void 0, void 0, function () {
    var presentation, verificationResult_1, result_1, credentialRequests, verificationResult, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                requireAuth_1.requireAuth(authorization);
                if (!encryptedPresentation) {
                    throw new library_issuer_verifier_utility_1.CustError(400, 'encryptedPresentation is required.');
                }
                if (!verifierDid) { // verifier did
                    throw new library_issuer_verifier_utility_1.CustError(400, 'verifier is required.');
                }
                if (!encryptionPrivateKey) {
                    throw new library_issuer_verifier_utility_1.CustError(400, 'verifier encryptionPrivateKey is required.');
                }
                if (presentationRequest && presentationRequest.verifier.did !== verifierDid) {
                    throw new library_issuer_verifier_utility_1.CustError(400, 'verifier does not match presentation request.'); // TODO create test for this
                }
                presentation = library_crypto_1.decrypt(encryptionPrivateKey, encryptedPresentation);
                if (!!isPresentation(presentation)) return [3 /*break*/, 2];
                return [4 /*yield*/, verifyNoPresentationHelper_1.verifyNoPresentationHelper(authorization, presentation, verifierDid)];
            case 1:
                verificationResult_1 = _a.sent();
                result_1 = {
                    authToken: verificationResult_1.authToken,
                    body: __assign(__assign({}, verificationResult_1.body), { type: 'NoPresentation', presentation: presentation })
                };
                return [2 /*return*/, result_1];
            case 2:
                credentialRequests = presentationRequest === null || presentationRequest === void 0 ? void 0 : presentationRequest.presentationRequest.credentialRequests;
                return [4 /*yield*/, verifyPresentationHelper_1.verifyPresentationHelper(authorization, presentation, verifierDid, credentialRequests)];
            case 3:
                verificationResult = _a.sent();
                result = {
                    authToken: verificationResult.authToken,
                    body: __assign(__assign({}, verificationResult.body), { type: 'VerifiablePresentation', presentation: presentation })
                };
                return [2 /*return*/, result];
            case 4:
                error_1 = _a.sent();
                if (error_1 instanceof library_crypto_1.CryptoError) {
                    logger_1.default.error('Crypto error handling encrypted presentation', error_1);
                }
                else {
                    logger_1.default.error('Error handling encrypted presentation request to UnumID Saas.', error_1);
                }
                throw error_1;
            case 5: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=verifyPresentation.js.map