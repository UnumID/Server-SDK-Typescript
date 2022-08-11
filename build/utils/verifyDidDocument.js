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
exports.verifySignedDid = void 0;
var types_1 = require("@unumid/types");
var requireAuth_1 = require("../requireAuth");
var error_1 = require("../utils/error");
var lodash_1 = require("lodash");
var didHelper_1 = require("../utils/didHelper");
var config_1 = require("../config");
var verify_1 = require("../utils/verify");
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
var logger_1 = __importDefault(require("../logger"));
/**
 * Validates the attributes for a DidDocument
 * @param requests CredentialRequest
 */
var validateSignedDid = function (did) {
    if (!did) {
        throw new error_1.CustError(400, 'SignedDid is required.');
    }
    var id = did.id, proof = did.proof;
    if (!proof) {
        throw new error_1.CustError(400, 'proof is required.');
    }
    if (!id) {
        throw new error_1.CustError(400, 'id is required.');
    }
};
/**
 * Verify the CredentialRequests signatures.
 */
function verifySignedDid(authorization, issuerDid, signedDid) {
    return __awaiter(this, void 0, void 0, function () {
        var authToken, result, _a, isVerified, message;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    requireAuth_1.requireAuth(authorization);
                    // validate the DID
                    validateSignedDid(signedDid);
                    authToken = authorization;
                    return [4 /*yield*/, verifyDidSignature(authToken, signedDid)];
                case 1:
                    result = _b.sent();
                    _a = result.body, isVerified = _a.isVerified, message = _a.message;
                    authToken = result.authToken;
                    return [4 /*yield*/, handleSubjectDidDocumentVerifiedReceipt(authToken, issuerDid, signedDid, isVerified, message)];
                case 2:
                    // handle sending back the SubjectDidDocumentVerified receipt
                    authToken = _b.sent();
                    return [2 /*return*/, {
                            authToken: authToken,
                            body: {
                                isVerified: isVerified,
                                message: message
                            }
                        }];
            }
        });
    });
}
exports.verifySignedDid = verifySignedDid;
/**
 * Helper function to verify a Did signature.
 * @param authToken
 * @param did
 * @returns
 */
function verifyDidSignature(authToken, did) {
    return __awaiter(this, void 0, void 0, function () {
        var verificationMethod, signatureValue, publicKeyInfoResponse, publicKeyInfoList, unsignedDid, bytes, isVerified, _i, publicKeyInfoList_1, publicKeyInfo, result_1, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    verificationMethod = did.proof.verificationMethod;
                    signatureValue = did.proof.signatureValue;
                    return [4 /*yield*/, didHelper_1.getDidDocPublicKeys(authToken, verificationMethod, 'secp256r1')];
                case 1:
                    publicKeyInfoResponse = _a.sent();
                    publicKeyInfoList = publicKeyInfoResponse.body;
                    authToken = publicKeyInfoResponse.authToken;
                    unsignedDid = lodash_1.omit(did, 'proof');
                    bytes = types_1.UnsignedDID.encode(unsignedDid).finish();
                    isVerified = false;
                    // check all the public keys to see if any work, stop if one does
                    for (_i = 0, publicKeyInfoList_1 = publicKeyInfoList; _i < publicKeyInfoList_1.length; _i++) {
                        publicKeyInfo = publicKeyInfoList_1[_i];
                        // verify the signature over the byte array
                        isVerified = verify_1.doVerify(signatureValue, bytes, publicKeyInfo);
                        if (isVerified) {
                            break;
                        }
                    }
                    if (!isVerified) {
                        result_1 = {
                            authToken: authToken,
                            body: {
                                isVerified: false,
                                message: 'Did signature can not be verified.'
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
/**
 * Handle sending back the SubjectDidDocumentVerified receipt
 */
function handleSubjectDidDocumentVerifiedReceipt(authorization, issuerDid, did, isVerified, message) {
    return __awaiter(this, void 0, void 0, function () {
        var subjectDid, data, receiptOptions, receiptCallOptions, resp, authToken, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    subjectDid = did.id;
                    data = {
                        did: subjectDid,
                        isVerified: isVerified,
                        reason: message
                    };
                    receiptOptions = {
                        type: 'SubjectDidDocumentVerified',
                        issuer: issuerDid,
                        subject: subjectDid,
                        data: data
                    };
                    receiptCallOptions = {
                        method: 'POST',
                        baseUrl: config_1.configData.SaaSUrl,
                        endPoint: 'receipt',
                        header: { Authorization: authorization },
                        data: receiptOptions
                    };
                    return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(receiptCallOptions)];
                case 1:
                    resp = _a.sent();
                    authToken = networkRequestHelper_1.handleAuthTokenHeader(resp, authorization);
                    return [2 /*return*/, authToken];
                case 2:
                    e_1 = _a.sent();
                    logger_1.default.error("Error sending SubjectCredentialRequestVerification Receipt to Unum ID SaaS. Error " + e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, authorization];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5RGlkRG9jdW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvdmVyaWZ5RGlkRG9jdW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsdUNBQWdJO0FBQ2hJLDhDQUE2QztBQUM3Qyx3Q0FBMkM7QUFDM0MsaUNBQThCO0FBQzlCLGdEQUF5RDtBQUN6RCxvQ0FBdUM7QUFDdkMsMENBQTJDO0FBQzNDLHNFQUEwRjtBQUMxRixxREFBK0I7QUFFL0I7OztHQUdHO0FBQ0gsSUFBTSxpQkFBaUIsR0FBRyxVQUFDLEdBQVE7SUFDakMsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNSLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0tBQ3BEO0lBRU8sSUFBQSxFQUFFLEdBQVksR0FBRyxHQUFmLEVBQUUsS0FBSyxHQUFLLEdBQUcsTUFBUixDQUFTO0lBRTFCLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDVixNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztLQUNoRDtJQUVELElBQUksQ0FBQyxFQUFFLEVBQUU7UUFDUCxNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztLQUM3QztBQUNILENBQUMsQ0FBQztBQUVGOztHQUVHO0FBQ0gsU0FBc0IsZUFBZSxDQUFFLGFBQXFCLEVBQUUsU0FBaUIsRUFBRSxTQUFjOzs7Ozs7b0JBQzdGLHlCQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBRTNCLG1CQUFtQjtvQkFDbkIsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBRXpCLFNBQVMsR0FBRyxhQUFhLENBQUM7b0JBRVUscUJBQU0sa0JBQWtCLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFBOztvQkFBaEYsTUFBTSxH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LENBQUM7b0JBRW9CLHFCQUFNLHlDQUFrQixDQUFVLGtCQUFrQixDQUFDLEVBQUE7O29CQUFyRSxJQUFJLEdBQVksU0FBcUQ7b0JBRXJFLFNBQVMsR0FBRyw0Q0FBcUIsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7b0JBRTdELHNCQUFPLFNBQVMsRUFBQzs7O29CQUVqQixnQkFBTSxDQUFDLEtBQUssQ0FBQyx1RkFBcUYsR0FBRyxDQUFDLENBQUM7O3dCQUd6RyxzQkFBTyxhQUFhLEVBQUM7Ozs7Q0FDdEIiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCB7IFJFU1REYXRhLCBVbnVtRHRvLCBWZXJpZmllZFN0YXR1cyB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IEpTT05PYmosIFJlY2VpcHRPcHRpb25zLCBSZWNlaXB0U3ViamVjdERpZERvY3VtZW50VmVyaWZpZWREYXRhLCBESUQsIFVuc2lnbmVkRElELCBQdWJsaWNLZXlJbmZvIH0gZnJvbSAnQHVudW1pZC90eXBlcyc7XG5pbXBvcnQgeyByZXF1aXJlQXV0aCB9IGZyb20gJy4uL3JlcXVpcmVBdXRoJztcbmltcG9ydCB7IEN1c3RFcnJvciB9IGZyb20gJy4uL3V0aWxzL2Vycm9yJztcbmltcG9ydCB7IG9taXQgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgZ2V0RGlkRG9jUHVibGljS2V5cyB9IGZyb20gJy4uL3V0aWxzL2RpZEhlbHBlcic7XG5pbXBvcnQgeyBjb25maWdEYXRhIH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7IGRvVmVyaWZ5IH0gZnJvbSAnLi4vdXRpbHMvdmVyaWZ5JztcbmltcG9ydCB7IGhhbmRsZUF1dGhUb2tlbkhlYWRlciwgbWFrZU5ldHdvcmtSZXF1ZXN0IH0gZnJvbSAnLi4vdXRpbHMvbmV0d29ya1JlcXVlc3RIZWxwZXInO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuLi9sb2dnZXInO1xuXG4vKipcbiAqIFZhbGlkYXRlcyB0aGUgYXR0cmlidXRlcyBmb3IgYSBEaWREb2N1bWVudFxuICogQHBhcmFtIHJlcXVlc3RzIENyZWRlbnRpYWxSZXF1ZXN0XG4gKi9cbmNvbnN0IHZhbGlkYXRlU2lnbmVkRGlkID0gKGRpZDogRElEKTogdm9pZCA9PiB7XG4gIGlmICghZGlkKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdTaWduZWREaWQgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBjb25zdCB7IGlkLCBwcm9vZiB9ID0gZGlkO1xuXG4gIGlmICghcHJvb2YpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ3Byb29mIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKCFpZCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnaWQgaXMgcmVxdWlyZWQuJyk7XG4gIH1cbn07XG5cbi8qKlxuICogVmVyaWZ5IHRoZSBDcmVkZW50aWFsUmVxdWVzdHMgc2lnbmF0dXJlcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeVNpZ25lZERpZCAoYXV0aG9yaXphdGlvbjogc3RyaW5nLCBpc3N1ZXJEaWQ6IHN0cmluZywgc2lnbmVkRGlkOiBESUQpOiBQcm9taXNlPFVudW1EdG88VmVyaWZpZWRTdGF0dXM+PiB7XG4gIHJlcXVpcmVBdXRoKGF1dGhvcml6YXRpb24pO1xuXG4gIC8vIHZhbGlkYXRlIHRoZSBESURcbiAgdmFsaWRhdGVTaWduZWREaWQoc2lnbmVkRGlkKTtcblxuICBsZXQgYXV0aFRva2VuID0gYXV0aG9yaXphdGlvbjtcblxuICBjb25zdCByZXN1bHQ6IFVudW1EdG88VmVyaWZpZWRTdGF0dXM+ID0gYXdhaXQgdmVyaWZ5RGlkU2lnbmF0dXJlKGF1dGhUb2tlbiwgc2lnbmVkRGlkKTtcbiAgY29uc3QgeyBpc1ZlcmlmaWVkLCBtZXNzYWdlIH0gPSByZXN1bHQuYm9keTtcbiAgYXV0aFRva2VuID0gcmVzdWx0LmF1dGhUb2tlbjtcblxuICAvLyBoYW5kbGUgc2VuZGluZyBiYWNrIHRoZSBTdWJqZWN0RGlkRG9jdW1lbnRWZXJpZmllZCByZWNlaXB0XG4gIGF1dGhUb2tlbiA9IGF3YWl0IGhhbmRsZVN1YmplY3REaWREb2N1bWVudFZlcmlmaWVkUmVjZWlwdChhdXRoVG9rZW4sIGlzc3VlckRpZCwgc2lnbmVkRGlkLCBpc1ZlcmlmaWVkLCBtZXNzYWdlKTtcblxuICByZXR1cm4ge1xuICAgIGF1dGhUb2tlbixcbiAgICBib2R5OiB7XG4gICAgICBpc1ZlcmlmaWVkLFxuICAgICAgbWVzc2FnZVxuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gdmVyaWZ5IGEgRGlkIHNpZ25hdHVyZS5cbiAqIEBwYXJhbSBhdXRoVG9rZW5cbiAqIEBwYXJhbSBkaWRcbiAqIEByZXR1cm5zXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHZlcmlmeURpZFNpZ25hdHVyZSAoYXV0aFRva2VuOiBzdHJpbmcsIGRpZDogRElEKTogUHJvbWlzZTxVbnVtRHRvPFZlcmlmaWVkU3RhdHVzPj4ge1xuICBjb25zdCB2ZXJpZmljYXRpb25NZXRob2QgPSBkaWQucHJvb2YudmVyaWZpY2F0aW9uTWV0aG9kIGFzIHN0cmluZztcbiAgY29uc3Qgc2lnbmF0dXJlVmFsdWUgPSBkaWQucHJvb2Yuc2lnbmF0dXJlVmFsdWUgYXMgc3RyaW5nO1xuXG4gIC8vIGdyYWIgYWxsICdzZWNwMjU2cjEnIGtleXMgZnJvbSB0aGUgRElEIGRvY3VtZW50XG4gIGNvbnN0IHB1YmxpY0tleUluZm9SZXNwb25zZTogVW51bUR0bzxQdWJsaWNLZXlJbmZvW10+ID0gYXdhaXQgZ2V0RGlkRG9jUHVibGljS2V5cyhhdXRoVG9rZW4sIHZlcmlmaWNhdGlvbk1ldGhvZCwgJ3NlY3AyNTZyMScpO1xuICBjb25zdCBwdWJsaWNLZXlJbmZvTGlzdDogUHVibGljS2V5SW5mb1tdID0gcHVibGljS2V5SW5mb1Jlc3BvbnNlLmJvZHk7XG4gIGF1dGhUb2tlbiA9IHB1YmxpY0tleUluZm9SZXNwb25zZS5hdXRoVG9rZW47XG5cbiAgY29uc3QgdW5zaWduZWREaWQ6IFVuc2lnbmVkRElEID0gb21pdChkaWQsICdwcm9vZicpO1xuXG4gIC8vIGNvbnZlcnQgdG8gYnl0ZSBhcnJheVxuICBjb25zdCBieXRlczogVWludDhBcnJheSA9IFVuc2lnbmVkRElELmVuY29kZSh1bnNpZ25lZERpZCkuZmluaXNoKCk7XG5cbiAgbGV0IGlzVmVyaWZpZWQgPSBmYWxzZTtcblxuICAvLyBjaGVjayBhbGwgdGhlIHB1YmxpYyBrZXlzIHRvIHNlZSBpZiBhbnkgd29yaywgc3RvcCBpZiBvbmUgZG9lc1xuICBmb3IgKGNvbnN0IHB1YmxpY0tleUluZm8gb2YgcHVibGljS2V5SW5mb0xpc3QpIHtcbiAgICAvLyB2ZXJpZnkgdGhlIHNpZ25hdHVyZSBvdmVyIHRoZSBieXRlIGFycmF5XG4gICAgaXNWZXJpZmllZCA9IGRvVmVyaWZ5KHNpZ25hdHVyZVZhbHVlLCBieXRlcywgcHVibGljS2V5SW5mbyk7XG5cbiAgICBpZiAoaXNWZXJpZmllZCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFpc1ZlcmlmaWVkKSB7XG4gICAgY29uc3QgcmVzdWx0OiBVbnVtRHRvPFZlcmlmaWVkU3RhdHVzPiA9IHtcbiAgICAgIGF1dGhUb2tlbixcbiAgICAgIGJvZHk6IHtcbiAgICAgICAgaXNWZXJpZmllZDogZmFsc2UsXG4gICAgICAgIG1lc3NhZ2U6ICdEaWQgc2lnbmF0dXJlIGNhbiBub3QgYmUgdmVyaWZpZWQuJ1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGNvbnN0IHJlc3VsdDogVW51bUR0bzxWZXJpZmllZFN0YXR1cz4gPSB7XG4gICAgYXV0aFRva2VuLFxuICAgIGJvZHk6IHtcbiAgICAgIGlzVmVyaWZpZWQ6IHRydWVcbiAgICB9XG4gIH07XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogSGFuZGxlIHNlbmRpbmcgYmFjayB0aGUgU3ViamVjdERpZERvY3VtZW50VmVyaWZpZWQgcmVjZWlwdFxuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTdWJqZWN0RGlkRG9jdW1lbnRWZXJpZmllZFJlY2VpcHQgKGF1dGhvcml6YXRpb246IHN0cmluZywgaXNzdWVyRGlkOiBzdHJpbmcsIGRpZDogRElELCBpc1ZlcmlmaWVkOiBib29sZWFuLCBtZXNzYWdlPzpzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICB0cnkge1xuICAgIGNvbnN0IHN1YmplY3REaWQgPSBkaWQuaWQ7XG5cbiAgICBjb25zdCBkYXRhOiBSZWNlaXB0U3ViamVjdERpZERvY3VtZW50VmVyaWZpZWREYXRhID0ge1xuICAgICAgZGlkOiBzdWJqZWN0RGlkLFxuICAgICAgaXNWZXJpZmllZCxcbiAgICAgIHJlYXNvbjogbWVzc2FnZVxuICAgIH07XG5cbiAgICBjb25zdCByZWNlaXB0T3B0aW9uczogUmVjZWlwdE9wdGlvbnM8UmVjZWlwdFN1YmplY3REaWREb2N1bWVudFZlcmlmaWVkRGF0YT4gPSB7XG4gICAgICB0eXBlOiAnU3ViamVjdERpZERvY3VtZW50VmVyaWZpZWQnLFxuICAgICAgaXNzdWVyOiBpc3N1ZXJEaWQsXG4gICAgICBzdWJqZWN0OiBzdWJqZWN0RGlkLFxuICAgICAgZGF0YVxuICAgIH07XG5cbiAgICBjb25zdCByZWNlaXB0Q2FsbE9wdGlvbnM6IFJFU1REYXRhID0ge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBiYXNlVXJsOiBjb25maWdEYXRhLlNhYVNVcmwsXG4gICAgICBlbmRQb2ludDogJ3JlY2VpcHQnLFxuICAgICAgaGVhZGVyOiB7IEF1dGhvcml6YXRpb246IGF1dGhvcml6YXRpb24gfSxcbiAgICAgIGRhdGE6IHJlY2VpcHRPcHRpb25zXG4gICAgfTtcblxuICAgIGNvbnN0IHJlc3A6IEpTT05PYmogPSBhd2FpdCBtYWtlTmV0d29ya1JlcXVlc3Q8SlNPTk9iaj4ocmVjZWlwdENhbGxPcHRpb25zKTtcblxuICAgIGNvbnN0IGF1dGhUb2tlbiA9IGhhbmRsZUF1dGhUb2tlbkhlYWRlcihyZXNwLCBhdXRob3JpemF0aW9uKTtcblxuICAgIHJldHVybiBhdXRoVG9rZW47XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2dnZXIuZXJyb3IoYEVycm9yIHNlbmRpbmcgU3ViamVjdENyZWRlbnRpYWxSZXF1ZXN0VmVyaWZpY2F0aW9uIFJlY2VpcHQgdG8gVW51bSBJRCBTYWFTLiBFcnJvciAke2V9YCk7XG4gIH1cblxuICByZXR1cm4gYXV0aG9yaXphdGlvbjtcbn1cbiJdfQ==