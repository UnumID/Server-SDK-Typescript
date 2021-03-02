"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.verifyCredential = void 0;
var library_issuer_verifier_utility_1 = require("@unumid/library-issuer-verifier-utility");
var library_crypto_1 = require("@unumid/library-crypto");
var lodash_1 = __importStar(require("lodash"));
var config_1 = require("../config");
var logger_1 = __importDefault(require("../logger"));
/**
 * Verify the signature on the provided data object.
 * @param signature
 * @param data
 * @param publicKey
 * @param encoding String ('base58' | 'pem'), defaults to 'pem'
 */
var doVerifyString = function (signature, dataString, data, publicKey, encoding) {
    if (encoding === void 0) { encoding = 'pem'; }
    logger_1.default.debug("Credential Signature verification using public key " + publicKey);
    var result = library_crypto_1.verifyString(signature, dataString, publicKey, encoding);
    logger_1.default.debug("Credential Signature STRING is valid: " + result + ".");
    var finalResult = false;
    if (result) {
        // need to also verify that the stringData converted to an object matches the data object
        finalResult = lodash_1.default.isEqual(data, JSON.parse(dataString));
    }
    logger_1.default.debug("Credential Signature STRING is valid FINAL: " + finalResult + ".");
    return finalResult;
};
/**
 * Used to verify the credential signature given the corresponding Did document's public key.
 * @param credential
 * @param authorization
 */
exports.verifyCredential = function (credential, authorization) { return __awaiter(void 0, void 0, void 0, function () {
    var proof, didDocumentResponse, authToken, publicKeyObject, data, isVerifiedData, isVerifiedString, isVerified, result, result;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                proof = credential.proof;
                return [4 /*yield*/, library_issuer_verifier_utility_1.getDIDDoc(config_1.configData.SaaSUrl, authorization, proof.verificationMethod)];
            case 1:
                didDocumentResponse = _b.sent();
                if (didDocumentResponse instanceof Error) {
                    throw didDocumentResponse;
                }
                authToken = library_issuer_verifier_utility_1.handleAuthToken(didDocumentResponse);
                publicKeyObject = library_issuer_verifier_utility_1.getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');
                data = lodash_1.omit(credential, 'proof');
                try {
                    isVerifiedData = library_issuer_verifier_utility_1.doVerify(proof.signatureValue, data, publicKeyObject[0].publicKey, publicKeyObject[0].encoding);
                    isVerifiedString = (_a = !isVerifiedData) !== null && _a !== void 0 ? _a : doVerifyString(proof.signatureValue, proof.unsignedValue, data, publicKeyObject[0].publicKey, publicKeyObject[0].encoding);
                    isVerified = isVerifiedData || isVerifiedString;
                    result = {
                        authToken: authToken,
                        body: isVerified
                    };
                    return [2 /*return*/, result];
                }
                catch (e) {
                    if (e instanceof library_crypto_1.CryptoError) {
                        logger_1.default.error('Crypto error verifying the credential signature', e);
                    }
                    else {
                        logger_1.default.error("Error verifying credential " + credential.id + " signature", e);
                    }
                    result = {
                        authToken: authToken,
                        body: false
                    };
                    return [2 /*return*/, result];
                }
                return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5Q3JlZGVudGlhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92ZXJpZmllci92ZXJpZnlDcmVkZW50aWFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyRkFBMEg7QUFDMUgseURBQW1FO0FBQ25FLCtDQUFpQztBQUdqQyxvQ0FBdUM7QUFDdkMscURBQStCO0FBRS9COzs7Ozs7R0FNRztBQUNILElBQU0sY0FBYyxHQUFHLFVBQUMsU0FBaUIsRUFBRSxVQUFrQixFQUFFLElBQWEsRUFBRSxTQUFpQixFQUFFLFFBQWtDO0lBQWxDLHlCQUFBLEVBQUEsZ0JBQWtDO0lBQ2pJLGdCQUFNLENBQUMsS0FBSyxDQUFDLHdEQUFzRCxTQUFXLENBQUMsQ0FBQztJQUNoRixJQUFNLE1BQU0sR0FBVyw2QkFBWSxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBRWhGLGdCQUFNLENBQUMsS0FBSyxDQUFDLDJDQUF5QyxNQUFNLE1BQUcsQ0FBQyxDQUFDO0lBQ2pFLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztJQUN4QixJQUFJLE1BQU0sRUFBRTtRQUNWLHlGQUF5RjtRQUN6RixXQUFXLEdBQUcsZ0JBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztLQUN2RDtJQUVELGdCQUFNLENBQUMsS0FBSyxDQUFDLGlEQUErQyxXQUFXLE1BQUcsQ0FBQyxDQUFDO0lBQzVFLE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUMsQ0FBQztBQUVGOzs7O0dBSUc7QUFDVSxRQUFBLGdCQUFnQixHQUFHLFVBQU8sVUFBZ0MsRUFBRSxhQUFxQjs7Ozs7O2dCQUNwRixLQUFLLEdBQUssVUFBVSxNQUFmLENBQWdCO2dCQUNELHFCQUFNLDJDQUFTLENBQUMsbUJBQVUsQ0FBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxFQUFBOztnQkFBbEcsbUJBQW1CLEdBQUcsU0FBNEU7Z0JBRXhHLElBQUksbUJBQW1CLFlBQVksS0FBSyxFQUFFO29CQUN4QyxNQUFNLG1CQUFtQixDQUFDO2lCQUMzQjtnQkFFSyxTQUFTLEdBQVcsaURBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUN6RCxlQUFlLEdBQUcsa0RBQWdCLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUMxRSxJQUFJLEdBQUcsYUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFFdkMsSUFBSTtvQkFDSSxjQUFjLEdBQUcsMENBQVEsQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDakgsZ0JBQWdCLFNBQUcsQ0FBQyxjQUFjLG1DQUFJLGNBQWMsQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUVqSyxVQUFVLEdBQUcsY0FBYyxJQUFJLGdCQUFnQixDQUFDO29CQUNoRCxNQUFNLEdBQXFCO3dCQUMvQixTQUFTLFdBQUE7d0JBQ1QsSUFBSSxFQUFFLFVBQVU7cUJBQ2pCLENBQUM7b0JBRUYsc0JBQU8sTUFBTSxFQUFDO2lCQUNmO2dCQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNWLElBQUksQ0FBQyxZQUFZLDRCQUFXLEVBQUU7d0JBQzVCLGdCQUFNLENBQUMsS0FBSyxDQUFDLGlEQUFpRCxFQUFFLENBQUMsQ0FBQyxDQUFDO3FCQUNwRTt5QkFBTTt3QkFDTCxnQkFBTSxDQUFDLEtBQUssQ0FBQyxnQ0FBOEIsVUFBVSxDQUFDLEVBQUUsZUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO3FCQUMxRTtvQkFHSyxNQUFNLEdBQXFCO3dCQUMvQixTQUFTLFdBQUE7d0JBQ1QsSUFBSSxFQUFFLEtBQUs7cUJBQ1osQ0FBQztvQkFFRixzQkFBTyxNQUFNLEVBQUM7aUJBQ2Y7Ozs7S0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0RElERG9jLCBnZXRLZXlGcm9tRElERG9jLCBkb1ZlcmlmeSwgaGFuZGxlQXV0aFRva2VuLCBKU09OT2JqIH0gZnJvbSAnQHVudW1pZC9saWJyYXJ5LWlzc3Vlci12ZXJpZmllci11dGlsaXR5JztcbmltcG9ydCB7IENyeXB0b0Vycm9yLCB2ZXJpZnlTdHJpbmcgfSBmcm9tICdAdW51bWlkL2xpYnJhcnktY3J5cHRvJztcbmltcG9ydCBfLCB7IG9taXQgfSBmcm9tICdsb2Rhc2gnO1xuXG5pbXBvcnQgeyBVbnVtRHRvLCBWZXJpZmlhYmxlQ3JlZGVudGlhbCB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IGNvbmZpZ0RhdGEgfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuLi9sb2dnZXInO1xuXG4vKipcbiAqIFZlcmlmeSB0aGUgc2lnbmF0dXJlIG9uIHRoZSBwcm92aWRlZCBkYXRhIG9iamVjdC5cbiAqIEBwYXJhbSBzaWduYXR1cmVcbiAqIEBwYXJhbSBkYXRhXG4gKiBAcGFyYW0gcHVibGljS2V5XG4gKiBAcGFyYW0gZW5jb2RpbmcgU3RyaW5nICgnYmFzZTU4JyB8ICdwZW0nKSwgZGVmYXVsdHMgdG8gJ3BlbSdcbiAqL1xuY29uc3QgZG9WZXJpZnlTdHJpbmcgPSAoc2lnbmF0dXJlOiBzdHJpbmcsIGRhdGFTdHJpbmc6IHN0cmluZywgZGF0YTogSlNPTk9iaiwgcHVibGljS2V5OiBzdHJpbmcsIGVuY29kaW5nOiAnYmFzZTU4JyB8ICdwZW0nID0gJ3BlbScpOiBib29sZWFuID0+IHtcbiAgbG9nZ2VyLmRlYnVnKGBDcmVkZW50aWFsIFNpZ25hdHVyZSB2ZXJpZmljYXRpb24gdXNpbmcgcHVibGljIGtleSAke3B1YmxpY0tleX1gKTtcbiAgY29uc3QgcmVzdWx0OmJvb2xlYW4gPSB2ZXJpZnlTdHJpbmcoc2lnbmF0dXJlLCBkYXRhU3RyaW5nLCBwdWJsaWNLZXksIGVuY29kaW5nKTtcblxuICBsb2dnZXIuZGVidWcoYENyZWRlbnRpYWwgU2lnbmF0dXJlIFNUUklORyBpcyB2YWxpZDogJHtyZXN1bHR9LmApO1xuICBsZXQgZmluYWxSZXN1bHQgPSBmYWxzZTtcbiAgaWYgKHJlc3VsdCkge1xuICAgIC8vIG5lZWQgdG8gYWxzbyB2ZXJpZnkgdGhhdCB0aGUgc3RyaW5nRGF0YSBjb252ZXJ0ZWQgdG8gYW4gb2JqZWN0IG1hdGNoZXMgdGhlIGRhdGEgb2JqZWN0XG4gICAgZmluYWxSZXN1bHQgPSBfLmlzRXF1YWwoZGF0YSwgSlNPTi5wYXJzZShkYXRhU3RyaW5nKSk7XG4gIH1cblxuICBsb2dnZXIuZGVidWcoYENyZWRlbnRpYWwgU2lnbmF0dXJlIFNUUklORyBpcyB2YWxpZCBGSU5BTDogJHtmaW5hbFJlc3VsdH0uYCk7XG4gIHJldHVybiBmaW5hbFJlc3VsdDtcbn07XG5cbi8qKlxuICogVXNlZCB0byB2ZXJpZnkgdGhlIGNyZWRlbnRpYWwgc2lnbmF0dXJlIGdpdmVuIHRoZSBjb3JyZXNwb25kaW5nIERpZCBkb2N1bWVudCdzIHB1YmxpYyBrZXkuXG4gKiBAcGFyYW0gY3JlZGVudGlhbFxuICogQHBhcmFtIGF1dGhvcml6YXRpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHZlcmlmeUNyZWRlbnRpYWwgPSBhc3luYyAoY3JlZGVudGlhbDogVmVyaWZpYWJsZUNyZWRlbnRpYWwsIGF1dGhvcml6YXRpb246IHN0cmluZyk6IFByb21pc2U8VW51bUR0bzxib29sZWFuPj4gPT4ge1xuICBjb25zdCB7IHByb29mIH0gPSBjcmVkZW50aWFsO1xuICBjb25zdCBkaWREb2N1bWVudFJlc3BvbnNlID0gYXdhaXQgZ2V0RElERG9jKGNvbmZpZ0RhdGEuU2FhU1VybCwgYXV0aG9yaXphdGlvbiwgcHJvb2YudmVyaWZpY2F0aW9uTWV0aG9kKTtcblxuICBpZiAoZGlkRG9jdW1lbnRSZXNwb25zZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgdGhyb3cgZGlkRG9jdW1lbnRSZXNwb25zZTtcbiAgfVxuXG4gIGNvbnN0IGF1dGhUb2tlbjogc3RyaW5nID0gaGFuZGxlQXV0aFRva2VuKGRpZERvY3VtZW50UmVzcG9uc2UpO1xuICBjb25zdCBwdWJsaWNLZXlPYmplY3QgPSBnZXRLZXlGcm9tRElERG9jKGRpZERvY3VtZW50UmVzcG9uc2UuYm9keSwgJ3NlY3AyNTZyMScpO1xuICBjb25zdCBkYXRhID0gb21pdChjcmVkZW50aWFsLCAncHJvb2YnKTtcblxuICB0cnkge1xuICAgIGNvbnN0IGlzVmVyaWZpZWREYXRhID0gZG9WZXJpZnkocHJvb2Yuc2lnbmF0dXJlVmFsdWUsIGRhdGEsIHB1YmxpY0tleU9iamVjdFswXS5wdWJsaWNLZXksIHB1YmxpY0tleU9iamVjdFswXS5lbmNvZGluZyk7XG4gICAgY29uc3QgaXNWZXJpZmllZFN0cmluZyA9ICFpc1ZlcmlmaWVkRGF0YSA/PyBkb1ZlcmlmeVN0cmluZyhwcm9vZi5zaWduYXR1cmVWYWx1ZSwgcHJvb2YudW5zaWduZWRWYWx1ZSwgZGF0YSwgcHVibGljS2V5T2JqZWN0WzBdLnB1YmxpY0tleSwgcHVibGljS2V5T2JqZWN0WzBdLmVuY29kaW5nKTtcblxuICAgIGNvbnN0IGlzVmVyaWZpZWQgPSBpc1ZlcmlmaWVkRGF0YSB8fCBpc1ZlcmlmaWVkU3RyaW5nO1xuICAgIGNvbnN0IHJlc3VsdDogVW51bUR0bzxib29sZWFuPiA9IHtcbiAgICAgIGF1dGhUb2tlbixcbiAgICAgIGJvZHk6IGlzVmVyaWZpZWRcbiAgICB9O1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChlIGluc3RhbmNlb2YgQ3J5cHRvRXJyb3IpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignQ3J5cHRvIGVycm9yIHZlcmlmeWluZyB0aGUgY3JlZGVudGlhbCBzaWduYXR1cmUnLCBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nZ2VyLmVycm9yKGBFcnJvciB2ZXJpZnlpbmcgY3JlZGVudGlhbCAke2NyZWRlbnRpYWwuaWR9IHNpZ25hdHVyZWAsIGUpO1xuICAgIH1cblxuICAgIC8vIG5lZWQgdG8gcmV0dXJuIHRoZSBVbnVtRHRvIHdpdGggdGhlIChwb3RlbnRpYWxseSkgdXBkYXRlZCBhdXRoVG9rZW5cbiAgICBjb25zdCByZXN1bHQ6IFVudW1EdG88Ym9vbGVhbj4gPSB7XG4gICAgICBhdXRoVG9rZW4sXG4gICAgICBib2R5OiBmYWxzZVxuICAgIH07XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59O1xuIl19