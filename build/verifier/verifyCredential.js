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
exports.verifyCredential = void 0;
var library_crypto_1 = require("@unumid/library-crypto");
var lodash_1 = require("lodash");
var logger_1 = __importDefault(require("../logger"));
var types_1 = require("@unumid/types");
var didHelper_1 = require("../utils/didHelper");
var verify_1 = require("../utils/verify");
var __1 = require("..");
/**
 * Used to verify the credential signature given the corresponding Did document's public key.
 * @param credential
 * @param authorization
 */
exports.verifyCredential = function (authorization, credential) { return __awaiter(void 0, void 0, void 0, function () {
    var proof, publicKeyInfoResponse, publicKeyInfoList, authToken, data, bytes, isVerified, _i, publicKeyInfoList_1, publicKeyInfo, result, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                proof = credential.proof;
                if (!proof) {
                    throw new __1.CustError(400, "Credential " + credential.id + " does not contain a proof attribute.");
                }
                return [4 /*yield*/, didHelper_1.getDidDocPublicKeys(authorization, proof.verificationMethod, 'secp256r1')];
            case 1:
                publicKeyInfoResponse = _a.sent();
                publicKeyInfoList = publicKeyInfoResponse.body;
                authToken = publicKeyInfoResponse.authToken;
                data = lodash_1.omit(credential, 'proof');
                try {
                    bytes = types_1.UnsignedCredentialPb.encode(data).finish();
                    isVerified = false;
                    // check all the public keys to see if any work, stop if one does
                    for (_i = 0, publicKeyInfoList_1 = publicKeyInfoList; _i < publicKeyInfoList_1.length; _i++) {
                        publicKeyInfo = publicKeyInfoList_1[_i];
                        // verify the signature
                        isVerified = verify_1.doVerify(proof.signatureValue, bytes, publicKeyInfo);
                        if (isVerified)
                            break;
                    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5Q3JlZGVudGlhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92ZXJpZmllci92ZXJpZnlDcmVkZW50aWFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLHlEQUFxRDtBQUNyRCxpQ0FBOEI7QUFHOUIscURBQStCO0FBQy9CLHVDQUFrRjtBQUNsRixnREFBeUQ7QUFDekQsMENBQTJDO0FBQzNDLHdCQUErQjtBQUUvQjs7OztHQUlHO0FBQ1UsUUFBQSxnQkFBZ0IsR0FBRyxVQUFPLGFBQXFCLEVBQUUsVUFBd0I7Ozs7O2dCQUM1RSxLQUFLLEdBQUssVUFBVSxNQUFmLENBQWdCO2dCQUU3QixJQUFJLENBQUMsS0FBSyxFQUFFO29CQUNWLE1BQU0sSUFBSSxhQUFTLENBQUMsR0FBRyxFQUFFLGdCQUFjLFVBQVUsQ0FBQyxFQUFFLHlDQUFzQyxDQUFDLENBQUM7aUJBQzdGO2dCQUd1RCxxQkFBTSwrQkFBbUIsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixFQUFFLFdBQVcsQ0FBQyxFQUFBOztnQkFBakkscUJBQXFCLEdBQTZCLFNBQStFO2dCQUNqSSxpQkFBaUIsR0FBb0IscUJBQXFCLENBQUMsSUFBSSxDQUFDO2dCQUNoRSxTQUFTLEdBQUcscUJBQXFCLENBQUMsU0FBUyxDQUFDO2dCQUU1QyxJQUFJLEdBQXlCLGFBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBRTdELElBQUk7b0JBQ0ksS0FBSyxHQUFHLDRCQUFvQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFFckQsVUFBVSxHQUFHLEtBQUssQ0FBQztvQkFFdkIsaUVBQWlFO29CQUNqRSxXQUE2QyxFQUFqQix1Q0FBaUIsRUFBakIsK0JBQWlCLEVBQWpCLElBQWlCLEVBQUU7d0JBQXBDLGFBQWE7d0JBQ3RCLHVCQUF1Qjt3QkFDdkIsVUFBVSxHQUFHLGlCQUFRLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7d0JBQ2xFLElBQUksVUFBVTs0QkFBRSxNQUFNO3FCQUN2QjtvQkFFSyxNQUFNLEdBQXFCO3dCQUMvQixTQUFTLFdBQUE7d0JBQ1QsSUFBSSxFQUFFLFVBQVU7cUJBQ2pCLENBQUM7b0JBRUYsc0JBQU8sTUFBTSxFQUFDO2lCQUNmO2dCQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNWLElBQUksQ0FBQyxZQUFZLDRCQUFXLEVBQUU7d0JBQzVCLGdCQUFNLENBQUMsS0FBSyxDQUFDLGlEQUFpRCxFQUFFLENBQUMsQ0FBQyxDQUFDO3FCQUNwRTt5QkFBTTt3QkFDTCxnQkFBTSxDQUFDLEtBQUssQ0FBQyxnQ0FBOEIsVUFBVSxDQUFDLEVBQUUsZUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO3FCQUMxRTtvQkFHSyxNQUFNLEdBQXFCO3dCQUMvQixTQUFTLFdBQUE7d0JBQ1QsSUFBSSxFQUFFLEtBQUs7cUJBQ1osQ0FBQztvQkFFRixzQkFBTyxNQUFNLEVBQUM7aUJBQ2Y7Ozs7S0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyBDcnlwdG9FcnJvciB9IGZyb20gJ0B1bnVtaWQvbGlicmFyeS1jcnlwdG8nO1xuaW1wb3J0IHsgb21pdCB9IGZyb20gJ2xvZGFzaCc7XG5cbmltcG9ydCB7IFVudW1EdG8gfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBDcmVkZW50aWFsUGIsIFB1YmxpY0tleUluZm8sIFVuc2lnbmVkQ3JlZGVudGlhbFBiIH0gZnJvbSAnQHVudW1pZC90eXBlcyc7XG5pbXBvcnQgeyBnZXREaWREb2NQdWJsaWNLZXlzIH0gZnJvbSAnLi4vdXRpbHMvZGlkSGVscGVyJztcbmltcG9ydCB7IGRvVmVyaWZ5IH0gZnJvbSAnLi4vdXRpbHMvdmVyaWZ5JztcbmltcG9ydCB7IEN1c3RFcnJvciB9IGZyb20gJy4uJztcblxuLyoqXG4gKiBVc2VkIHRvIHZlcmlmeSB0aGUgY3JlZGVudGlhbCBzaWduYXR1cmUgZ2l2ZW4gdGhlIGNvcnJlc3BvbmRpbmcgRGlkIGRvY3VtZW50J3MgcHVibGljIGtleS5cbiAqIEBwYXJhbSBjcmVkZW50aWFsXG4gKiBAcGFyYW0gYXV0aG9yaXphdGlvblxuICovXG5leHBvcnQgY29uc3QgdmVyaWZ5Q3JlZGVudGlhbCA9IGFzeW5jIChhdXRob3JpemF0aW9uOiBzdHJpbmcsIGNyZWRlbnRpYWw6IENyZWRlbnRpYWxQYik6IFByb21pc2U8VW51bUR0bzxib29sZWFuPj4gPT4ge1xuICBjb25zdCB7IHByb29mIH0gPSBjcmVkZW50aWFsO1xuXG4gIGlmICghcHJvb2YpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgYENyZWRlbnRpYWwgJHtjcmVkZW50aWFsLmlkfSBkb2VzIG5vdCBjb250YWluIGEgcHJvb2YgYXR0cmlidXRlLmApO1xuICB9XG5cbiAgLy8gZ3JhYiBhbGwgJ3NlY3AyNTZyMScga2V5cyBmcm9tIHRoZSBESUQgZG9jdW1lbnRcbiAgY29uc3QgcHVibGljS2V5SW5mb1Jlc3BvbnNlOiBVbnVtRHRvPFB1YmxpY0tleUluZm9bXT4gPSBhd2FpdCBnZXREaWREb2NQdWJsaWNLZXlzKGF1dGhvcml6YXRpb24sIHByb29mLnZlcmlmaWNhdGlvbk1ldGhvZCwgJ3NlY3AyNTZyMScpO1xuICBjb25zdCBwdWJsaWNLZXlJbmZvTGlzdDogUHVibGljS2V5SW5mb1tdID0gcHVibGljS2V5SW5mb1Jlc3BvbnNlLmJvZHk7XG4gIGNvbnN0IGF1dGhUb2tlbiA9IHB1YmxpY0tleUluZm9SZXNwb25zZS5hdXRoVG9rZW47XG5cbiAgY29uc3QgZGF0YTogVW5zaWduZWRDcmVkZW50aWFsUGIgPSBvbWl0KGNyZWRlbnRpYWwsICdwcm9vZicpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgYnl0ZXMgPSBVbnNpZ25lZENyZWRlbnRpYWxQYi5lbmNvZGUoZGF0YSkuZmluaXNoKCk7XG5cbiAgICBsZXQgaXNWZXJpZmllZCA9IGZhbHNlO1xuXG4gICAgLy8gY2hlY2sgYWxsIHRoZSBwdWJsaWMga2V5cyB0byBzZWUgaWYgYW55IHdvcmssIHN0b3AgaWYgb25lIGRvZXNcbiAgICBmb3IgKGNvbnN0IHB1YmxpY0tleUluZm8gb2YgcHVibGljS2V5SW5mb0xpc3QpIHtcbiAgICAgIC8vIHZlcmlmeSB0aGUgc2lnbmF0dXJlXG4gICAgICBpc1ZlcmlmaWVkID0gZG9WZXJpZnkocHJvb2Yuc2lnbmF0dXJlVmFsdWUsIGJ5dGVzLCBwdWJsaWNLZXlJbmZvKTtcbiAgICAgIGlmIChpc1ZlcmlmaWVkKSBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQ6IFVudW1EdG88Ym9vbGVhbj4gPSB7XG4gICAgICBhdXRoVG9rZW4sXG4gICAgICBib2R5OiBpc1ZlcmlmaWVkXG4gICAgfTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZSBpbnN0YW5jZW9mIENyeXB0b0Vycm9yKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0NyeXB0byBlcnJvciB2ZXJpZnlpbmcgdGhlIGNyZWRlbnRpYWwgc2lnbmF0dXJlJywgZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ2dlci5lcnJvcihgRXJyb3IgdmVyaWZ5aW5nIGNyZWRlbnRpYWwgJHtjcmVkZW50aWFsLmlkfSBzaWduYXR1cmVgLCBlKTtcbiAgICB9XG5cbiAgICAvLyBuZWVkIHRvIHJldHVybiB0aGUgVW51bUR0byB3aXRoIHRoZSAocG90ZW50aWFsbHkpIHVwZGF0ZWQgYXV0aFRva2VuXG4gICAgY29uc3QgcmVzdWx0OiBVbnVtRHRvPGJvb2xlYW4+ID0ge1xuICAgICAgYXV0aFRva2VuLFxuICAgICAgYm9keTogZmFsc2VcbiAgICB9O1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufTtcbiJdfQ==