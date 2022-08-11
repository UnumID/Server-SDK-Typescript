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
exports.verifyNoPresentationHelper = exports.validateNoPresentationParams = void 0;
var lodash_1 = require("lodash");
var validateProof_1 = require("./validateProof");
var requireAuth_1 = require("../requireAuth");
var logger_1 = __importDefault(require("../logger"));
var error_1 = require("../utils/error");
var helpers_1 = require("../utils/helpers");
var verify_1 = require("../utils/verify");
var types_1 = require("@unumid/types");
var didHelper_1 = require("../utils/didHelper");
var sendPresentationVerifiedReceipt_1 = require("./sendPresentationVerifiedReceipt");
/**
 * Validates the NoPresentation type to ensure the necessary attributes.
 * @param noPresentation NoPresentation
 */
exports.validateNoPresentationParams = function (noPresentation) {
    logger_1.default.debug('Validating a NoPresentation input');
    var type = noPresentation.type, proof = noPresentation.proof, presentationRequestId = noPresentation.presentationRequestId, verifiableCredential = noPresentation.verifiableCredential, verifierDid = noPresentation.verifierDid;
    if (!type) {
        throw new error_1.CustError(400, 'Invalid Presentation: type is required.');
    }
    if (helpers_1.isArrayEmpty(type)) {
        throw new error_1.CustError(400, 'Invalid Presentation: type must be a non-empty array.');
    }
    if (!proof) {
        throw new error_1.CustError(400, 'Invalid Presentation: proof is required.');
    }
    if (!verifierDid) {
        throw new error_1.CustError(400, 'Invalid Presentation: verifierDid is required.');
    }
    if (!presentationRequestId) {
        throw new error_1.CustError(400, 'Invalid Presentation: presentationRequestId is required.');
    }
    if (typeof presentationRequestId !== 'string') {
        throw new error_1.CustError(400, 'Invalid presentationRequestId: must be a string.');
    }
    if (verifiableCredential && helpers_1.isArrayNotEmpty(verifiableCredential)) {
        throw new error_1.CustError(400, 'Invalid Declined Presentation: verifiableCredential must be undefined or empty.'); // this should never happen base on upstream logic
    }
    validateProof_1.validateProof(proof);
    logger_1.default.debug('NoPresentation input is validated');
    return noPresentation;
};
/**
 * Handler for when a user does not agree to share the information in the credential request.
 * @param authToken
 * @param noPresentation
 * @param verifier
 */
exports.verifyNoPresentationHelper = function (authToken, noPresentation, verifier, requestUuid) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, verificationMethod, signatureValue, verifierDid, message_1, result_1, publicKeyInfoResponse, publicKeyInfoList, unsignedNoPresentation, bytes, isVerified, _i, publicKeyInfoList_1, publicKeyInfo, message, result, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                requireAuth_1.requireAuth(authToken);
                noPresentation = exports.validateNoPresentationParams(noPresentation);
                if (!noPresentation.proof) {
                    throw new error_1.CustError(400, 'Invalid Presentation: proof is required.');
                }
                _a = noPresentation.proof, verificationMethod = _a.verificationMethod, signatureValue = _a.signatureValue, verifierDid = noPresentation.verifierDid;
                if (!(verifierDid !== verifier)) return [3 /*break*/, 2];
                message_1 = "The presentation was meant for verifier, " + verifierDid + ", not the provided verifier, " + verifier + ".";
                return [4 /*yield*/, sendPresentationVerifiedReceipt_1.sendPresentationVerifiedReceipt(authToken, verifier, noPresentation.proof.verificationMethod, 'declined', false, noPresentation.presentationRequestId, requestUuid, message_1)];
            case 1:
                // send PresentationVerified receipt
                authToken = _b.sent();
                result_1 = {
                    authToken: authToken,
                    body: {
                        isVerified: false,
                        message: message_1
                    }
                };
                return [2 /*return*/, result_1];
            case 2: return [4 /*yield*/, didHelper_1.getDidDocPublicKeys(authToken, verificationMethod, 'secp256r1')];
            case 3:
                publicKeyInfoResponse = _b.sent();
                publicKeyInfoList = publicKeyInfoResponse.body;
                authToken = publicKeyInfoResponse.authToken;
                unsignedNoPresentation = lodash_1.omit(noPresentation, 'proof');
                bytes = types_1.UnsignedPresentationPb.encode(unsignedNoPresentation).finish();
                isVerified = false;
                // check all the public keys to see if any work, stop if one does
                for (_i = 0, publicKeyInfoList_1 = publicKeyInfoList; _i < publicKeyInfoList_1.length; _i++) {
                    publicKeyInfo = publicKeyInfoList_1[_i];
                    // verify the signature
                    isVerified = verify_1.doVerify(signatureValue, bytes, publicKeyInfo);
                    if (isVerified)
                        break;
                }
                message = isVerified ? undefined : 'Presentation signature can not be verified.';
                return [4 /*yield*/, sendPresentationVerifiedReceipt_1.sendPresentationVerifiedReceipt(authToken, verifier, noPresentation.proof.verificationMethod, 'declined', isVerified, noPresentation.presentationRequestId, requestUuid, message)];
            case 4:
                authToken = _b.sent();
                result = {
                    authToken: authToken,
                    body: {
                        isVerified: isVerified,
                        message: message
                    }
                };
                logger_1.default.debug("NoPresentation is verified: " + isVerified + ". " + message);
                return [2 /*return*/, result];
            case 5:
                e_1 = _b.sent();
                logger_1.default.error("Error handling a declined presentation verification. Error " + e_1);
                throw e_1;
            case 6: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5Tm9QcmVzZW50YXRpb25IZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdmVyaWZpZXIvdmVyaWZ5Tm9QcmVzZW50YXRpb25IZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsaUNBQThCO0FBRzlCLGlEQUFnRDtBQUNoRCw4Q0FBNkM7QUFDN0MscURBQStCO0FBQy9CLHdDQUEyQztBQUMzQyw0Q0FBaUU7QUFDakUsMENBQTJDO0FBQzNDLHVDQUFzRjtBQUN0RixnREFBeUQ7QUFDekQscUZBQW9GO0FBRXBGOzs7R0FHRztBQUNVLFFBQUEsNEJBQTRCLEdBQUcsVUFBQyxjQUE4QjtJQUN6RSxnQkFBTSxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0lBR2hELElBQUEsSUFBSSxHQUtGLGNBQWMsS0FMWixFQUNKLEtBQUssR0FJSCxjQUFjLE1BSlgsRUFDTCxxQkFBcUIsR0FHbkIsY0FBYyxzQkFISyxFQUNyQixvQkFBb0IsR0FFbEIsY0FBYyxxQkFGSSxFQUNwQixXQUFXLEdBQ1QsY0FBYyxZQURMLENBQ007SUFFbkIsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNULE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSx5Q0FBeUMsQ0FBQyxDQUFDO0tBQ3JFO0lBRUQsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3RCLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSx1REFBdUQsQ0FBQyxDQUFDO0tBQ25GO0lBRUQsSUFBSSxDQUFDLEtBQUssRUFBRTtRQUNWLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSwwQ0FBMEMsQ0FBQyxDQUFDO0tBQ3RFO0lBRUQsSUFBSSxDQUFDLFdBQVcsRUFBRTtRQUNoQixNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsZ0RBQWdELENBQUMs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LFFBQVEsRUFBRSxjQUFjLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsY0FBYyxDQUFDLHFCQUFxQixFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUMsRUFBQTs7Z0JBQW5NLFNBQVMsR0FBRyxTQUF1TCxDQUFDO2dCQUU5TCxNQUFNLEdBQTRCO29CQUN0QyxTQUFTLFdBQUE7b0JBQ1QsSUFBSSxFQUFFO3dCQUNKLFVBQVUsWUFBQTt3QkFDVixPQUFPLFNBQUE7cUJBQ1I7aUJBQ0YsQ0FBQztnQkFFRixnQkFBTSxDQUFDLEtBQUssQ0FBQyxpQ0FBK0IsVUFBVSxVQUFLLE9BQVMsQ0FBQyxDQUFDO2dCQUV0RSxzQkFBTyxNQUFNLEVBQUM7OztnQkFFZCxnQkFBTSxDQUFDLEtBQUssQ0FBQyxnRUFBOEQsR0FBRyxDQUFDLENBQUM7Z0JBQ2hGLE1BQU0sR0FBQyxDQUFDOzs7O0tBRVgsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgb21pdCB9IGZyb20gJ2xvZGFzaCc7XG5cbmltcG9ydCB7IFVudW1EdG8sIFZlcmlmaWVkU3RhdHVzIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgdmFsaWRhdGVQcm9vZiB9IGZyb20gJy4vdmFsaWRhdGVQcm9vZic7XG5pbXBvcnQgeyByZXF1aXJlQXV0aCB9IGZyb20gJy4uL3JlcXVpcmVBdXRoJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCB7IEN1c3RFcnJvciB9IGZyb20gJy4uL3V0aWxzL2Vycm9yJztcbmltcG9ydCB7IGlzQXJyYXlFbXB0eSwgaXNBcnJheU5vdEVtcHR5IH0gZnJvbSAnLi4vdXRpbHMvaGVscGVycyc7XG5pbXBvcnQgeyBkb1ZlcmlmeSB9IGZyb20gJy4uL3V0aWxzL3ZlcmlmeSc7XG5pbXBvcnQgeyBQcmVzZW50YXRpb25QYiwgUHVibGljS2V5SW5mbywgVW5zaWduZWRQcmVzZW50YXRpb25QYiB9IGZyb20gJ0B1bnVtaWQvdHlwZXMnO1xuaW1wb3J0IHsgZ2V0RGlkRG9jUHVibGljS2V5cyB9IGZyb20gJy4uL3V0aWxzL2RpZEhlbHBlcic7XG5pbXBvcnQgeyBzZW5kUHJlc2VudGF0aW9uVmVyaWZpZWRSZWNlaXB0IH0gZnJvbSAnLi9zZW5kUHJlc2VudGF0aW9uVmVyaWZpZWRSZWNlaXB0JztcblxuLyoqXG4gKiBWYWxpZGF0ZXMgdGhlIE5vUHJlc2VudGF0aW9uIHR5cGUgdG8gZW5zdXJlIHRoZSBuZWNlc3NhcnkgYXR0cmlidXRlcy5cbiAqIEBwYXJhbSBub1ByZXNlbnRhdGlvbiBOb1ByZXNlbnRhdGlvblxuICovXG5leHBvcnQgY29uc3QgdmFsaWRhdGVOb1ByZXNlbnRhdGlvblBhcmFtcyA9IChub1ByZXNlbnRhdGlvbjogUHJlc2VudGF0aW9uUGIpOiBQcmVzZW50YXRpb25QYiA9PiB7XG4gIGxvZ2dlci5kZWJ1ZygnVmFsaWRhdGluZyBhIE5vUHJlc2VudGF0aW9uIGlucHV0Jyk7XG5cbiAgY29uc3Qge1xuICAgIHR5cGUsXG4gICAgcHJvb2YsXG4gICAgcHJlc2VudGF0aW9uUmVxdWVzdElkLFxuICAgIHZlcmlmaWFibGVDcmVkZW50aWFsLFxuICAgIHZlcmlmaWVyRGlkXG4gIH0gPSBub1ByZXNlbnRhdGlvbjtcblxuICBpZiAoIXR5cGUpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uOiB0eXBlIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKGlzQXJyYXlFbXB0eSh0eXBlKSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb246IHR5cGUgbXVzdCBiZSBhIG5vbi1lbXB0eSBhcnJheS4nKTtcbiAgfVxuXG4gIGlmICghcHJvb2YpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uOiBwcm9vZiBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICghdmVyaWZpZXJEaWQpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uOiB2ZXJpZmllckRpZCBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICghcHJlc2VudGF0aW9uUmVxdWVzdElkKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvbjogcHJlc2VudGF0aW9uUmVxdWVzdElkIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBwcmVzZW50YXRpb25SZXF1ZXN0SWQgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIHByZXNlbnRhdGlvblJlcXVlc3RJZDogbXVzdCBiZSBhIHN0cmluZy4nKTtcbiAgfVxuXG4gIGlmICh2ZXJpZmlhYmxlQ3JlZGVudGlhbCAmJiBpc0FycmF5Tm90RW1wdHkodmVyaWZpYWJsZUNyZWRlbnRpYWwpKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIERlY2xpbmVkIFByZXNlbnRhdGlvbjogdmVyaWZpYWJsZUNyZWRlbnRpYWwgbXVzdCBiZSB1bmRlZmluZWQgb3IgZW1wdHkuJyk7IC8vIHRoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbiBiYXNlIG9uIHVwc3RyZWFtIGxvZ2ljXG4gIH1cblxuICB2YWxpZGF0ZVByb29mKHByb29mKTtcblxuICBsb2dnZXIuZGVidWcoJ05vUHJlc2VudGF0aW9uIGlucHV0IGlzIHZhbGlkYXRlZCcpO1xuICByZXR1cm4gbm9QcmVzZW50YXRpb247XG59O1xuXG4vKipcbiAqIEhhbmRsZXIgZm9yIHdoZW4gYSB1c2VyIGRvZXMgbm90IGFncmVlIHRvIHNoYXJlIHRoZSBpbmZvcm1hdGlvbiBpbiB0aGUgY3JlZGVudGlhbCByZXF1ZXN0LlxuICogQHBhcmFtIGF1dGhUb2tlblxuICogQHBhcmFtIG5vUHJlc2VudGF0aW9uXG4gKiBAcGFyYW0gdmVyaWZpZXJcbiAqL1xuZXhwb3J0IGNvbnN0IHZlcmlmeU5vUHJlc2VudGF0aW9uSGVscGVyID0gYXN5bmMgKGF1dGhUb2tlbjogc3RyaW5nLCBub1ByZXNlbnRhdGlvbjogUHJlc2VudGF0aW9uUGIsIHZlcmlmaWVyOiBzdHJpbmcsIHJlcXVlc3RVdWlkOiBzdHJpbmcpOiBQcm9taXNlPFVudW1EdG88VmVyaWZpZWRTdGF0dXM+PiA9PiB7XG4gIHRyeSB7XG4gICAgcmVxdWlyZUF1dGgoYXV0aFRva2VuKTtcblxuICAgIG5vUHJlc2VudGF0aW9uID0gdmFsaWRhdGVOb1ByZXNlbnRhdGlvblBhcmFtcyhub1ByZXNlbnRhdGlvbik7XG5cbiAgICBpZiAoIW5vUHJlc2VudGF0aW9uLnByb29mKSB7XG4gICAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uOiBwcm9vZiBpcyByZXF1aXJlZC4nKTtcbiAgICB9XG5cbiAgICBjb25zdCB7IHByb29mOiB7IHZlcmlmaWNhdGlvbk1ldGhvZCwgc2lnbmF0dXJlVmFsdWUgfSwgdmVyaWZpZXJEaWQgfSA9IG5vUHJlc2VudGF0aW9uO1xuXG4gICAgLy8gdmFsaWRhdGUgdGhhdCB0aGUgdmVyaWZpZXIgZGlkIHByb3ZpZGVkIG1hdGNoZXMgdGhlIHZlcmlmaWVyIGRpZCBpbiB0aGUgcHJlc2VudGF0aW9uXG4gICAgaWYgKHZlcmlmaWVyRGlkICE9PSB2ZXJpZmllcikge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGBUaGUgcHJlc2VudGF0aW9uIHdhcyBtZWFudCBmb3IgdmVyaWZpZXIsICR7dmVyaWZpZXJEaWR9LCBub3QgdGhlIHByb3ZpZGVkIHZlcmlmaWVyLCAke3ZlcmlmaWVyfS5gO1xuXG4gICAgICAvLyBzZW5kIFByZXNlbnRhdGlvblZlcmlmaWVkIHJlY2VpcHRcbiAgICAgIGF1dGhUb2tlbiA9IGF3YWl0IHNlbmRQcmVzZW50YXRpb25WZXJpZmllZFJlY2VpcHQoYXV0aFRva2VuLCB2ZXJpZmllciwgbm9QcmVzZW50YXRpb24ucHJvb2YudmVyaWZpY2F0aW9uTWV0aG9kLCAnZGVjbGluZWQnLCBmYWxzZSwgbm9QcmVzZW50YXRpb24ucHJlc2VudGF0aW9uUmVxdWVzdElkLCByZXF1ZXN0VXVpZCwgbWVzc2FnZSk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdDogVW51bUR0bzxWZXJpZmllZFN0YXR1cz4gPSB7XG4gICAgICAgIGF1dGhUb2tlbixcbiAgICAgICAgYm9keToge1xuICAgICAgICAgIGlzVmVyaWZpZWQ6IGZhbHNlLFxuICAgICAgICAgIG1lc3NhZ2VcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gZ3JhYiBhbGwgJ3NlY3AyNTZyMScga2V5cyBmcm9tIHRoZSBESUQgZG9jdW1lbnRcbiAgICBjb25zdCBwdWJsaWNLZXlJbmZvUmVzcG9uc2U6IFVudW1EdG88UHVibGljS2V5SW5mb1tdPiA9IGF3YWl0IGdldERpZERvY1B1YmxpY0tleXMoYXV0aFRva2VuLCB2ZXJpZmljYXRpb25NZXRob2QsICdzZWNwMjU2cjEnKTtcbiAgICBjb25zdCBwdWJsaWNLZXlJbmZvTGlzdDogUHVibGljS2V5SW5mb1tdID0gcHVibGljS2V5SW5mb1Jlc3BvbnNlLmJvZHk7XG4gICAgYXV0aFRva2VuID0gcHVibGljS2V5SW5mb1Jlc3BvbnNlLmF1dGhUb2tlbjtcblxuICAgIC8vIHJlbW92ZSB0aGUgcHJvb2YgYXR0cmlidXRlXG4gICAgY29uc3QgdW5zaWduZWROb1ByZXNlbnRhdGlvbjogVW5zaWduZWRQcmVzZW50YXRpb25QYiA9IG9taXQobm9QcmVzZW50YXRpb24sICdwcm9vZicpO1xuXG4gICAgLy8gY3JlYXRlIGJ5dGUgYXJyYXkgZnJvbSBwcm90b2J1ZiBoZWxwZXJzXG4gICAgY29uc3QgYnl0ZXMgPSBVbnNpZ25lZFByZXNlbnRhdGlvblBiLmVuY29kZSh1bnNpZ25lZE5vUHJlc2VudGF0aW9uKS5maW5pc2goKTtcblxuICAgIGxldCBpc1ZlcmlmaWVkID0gZmFsc2U7XG5cbiAgICAvLyBjaGVjayBhbGwgdGhlIHB1YmxpYyBrZXlzIHRvIHNlZSBpZiBhbnkgd29yaywgc3RvcCBpZiBvbmUgZG9lc1xuICAgIGZvciAoY29uc3QgcHVibGljS2V5SW5mbyBvZiBwdWJsaWNLZXlJbmZvTGlzdCkge1xuICAgICAgLy8gdmVyaWZ5IHRoZSBzaWduYXR1cmVcbiAgICAgIGlzVmVyaWZpZWQgPSBkb1ZlcmlmeShzaWduYXR1cmVWYWx1ZSwgYnl0ZXMsIHB1YmxpY0tleUluZm8pO1xuICAgICAgaWYgKGlzVmVyaWZpZWQpIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnN0IG1lc3NhZ2UgPSBpc1ZlcmlmaWVkID8gdW5kZWZpbmVkIDogJ1ByZXNlbnRhdGlvbiBzaWduYXR1cmUgY2FuIG5vdCBiZSB2ZXJpZmllZC4nOyAvLyB0aGUgcmVjZWlwdCByZWFzb24sIG9ubHkgcG9wdWxhdGVkIGlmIG5vdCB2ZXJpZmllZFxuXG4gICAgYXV0aFRva2VuID0gYXdhaXQgc2VuZFByZXNlbnRhdGlvblZlcmlmaWVkUmVjZWlwdChhdXRoVG9rZW4sIHZlcmlmaWVyLCBub1ByZXNlbnRhdGlvbi5wcm9vZi52ZXJpZmljYXRpb25NZXRob2QsICdkZWNsaW5lZCcsIGlzVmVyaWZpZWQsIG5vUHJlc2VudGF0aW9uLnByZXNlbnRhdGlvblJlcXVlc3RJZCwgcmVxdWVzdFV1aWQsIG1lc3NhZ2UpO1xuXG4gICAgY29uc3QgcmVzdWx0OiBVbnVtRHRvPFZlcmlmaWVkU3RhdHVzPiA9IHtcbiAgICAgIGF1dGhUb2tlbixcbiAgICAgIGJvZHk6IHtcbiAgICAgICAgaXNWZXJpZmllZCxcbiAgICAgICAgbWVzc2FnZVxuICAgICAgfVxuICAgIH07XG5cbiAgICBsb2dnZXIuZGVidWcoYE5vUHJlc2VudGF0aW9uIGlzIHZlcmlmaWVkOiAke2lzVmVyaWZpZWR9LiAke21lc3NhZ2V9YCk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGNhdGNoIChlKSB7XG4gICAgbG9nZ2VyLmVycm9yKGBFcnJvciBoYW5kbGluZyBhIGRlY2xpbmVkIHByZXNlbnRhdGlvbiB2ZXJpZmljYXRpb24uIEVycm9yICR7ZX1gKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuIl19