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
exports.verifyNoPresentation = exports.validateNoPresentationParams = void 0;
var library_issuer_verifier_utility_1 = require("@unumid/library-issuer-verifier-utility");
var lodash_1 = require("lodash");
var validateProof_1 = require("./validateProof");
var config_1 = require("../config");
var requireAuth_1 = require("../requireAuth");
var logger_1 = __importDefault(require("../logger"));
/**
 * Validates the NoPresentation type to ensure the necessary attributes.
 * @param noPresentation NoPresentation
 */
exports.validateNoPresentationParams = function (noPresentation) {
    var type = noPresentation.type, holder = noPresentation.holder, proof = noPresentation.proof, presentationRequestUuid = noPresentation.presentationRequestUuid;
    if (!type) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: type is required.');
    }
    if (library_issuer_verifier_utility_1.isArrayEmpty(type)) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: type must be a non-empty array.');
    }
    if (!proof) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: proof is required.');
    }
    if (!holder) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: holder is required.');
    }
    if (!presentationRequestUuid) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: presentationRequestUuid is required.');
    }
    if (type[0] !== 'NoPresentation') {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid type: first element must be \'NoPresentation\'.');
    }
    if (typeof holder !== 'string') {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid holder: must be a string.');
    }
    if (typeof presentationRequestUuid !== 'string') {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid presentationRequestUuid: must be a string.');
    }
    validateProof_1.validateProof(proof);
};
/**
 * Handler for when a user does not agree to share the information in the credential request.
 * @param authorization
 * @param noPresentation
 * @param verifier
 */
exports.verifyNoPresentation = function (authorization, noPresentation, verifier) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, verificationMethod, signatureValue, didDocumentResponse, authToken, publicKeyInfos, _b, publicKey, encoding, unsignedNoPresentation, isVerified, result_1, receiptOptions, receiptCallOptions, resp, result, e_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                requireAuth_1.requireAuth(authorization);
                exports.validateNoPresentationParams(noPresentation);
                _a = noPresentation.proof, verificationMethod = _a.verificationMethod, signatureValue = _a.signatureValue;
                return [4 /*yield*/, library_issuer_verifier_utility_1.getDIDDoc(config_1.configData.SaaSUrl, authorization, verificationMethod)];
            case 1:
                didDocumentResponse = _c.sent();
                if (didDocumentResponse instanceof Error) {
                    throw didDocumentResponse;
                }
                authToken = library_issuer_verifier_utility_1.handleAuthToken(didDocumentResponse);
                publicKeyInfos = library_issuer_verifier_utility_1.getKeyFromDIDDoc(didDocumentResponse.body, 'secp256r1');
                _b = publicKeyInfos[0], publicKey = _b.publicKey, encoding = _b.encoding;
                unsignedNoPresentation = lodash_1.omit(noPresentation, 'proof');
                isVerified = library_issuer_verifier_utility_1.doVerify(signatureValue, unsignedNoPresentation, publicKey, encoding);
                if (!isVerified) {
                    result_1 = {
                        authToken: authToken,
                        body: {
                            isVerified: false,
                            message: 'Credential signature can not be verified.'
                        }
                    };
                    return [2 /*return*/, result_1];
                }
                receiptOptions = {
                    type: noPresentation.type,
                    verifier: verifier,
                    subject: noPresentation.holder,
                    data: {
                        isVerified: isVerified
                    }
                };
                receiptCallOptions = {
                    method: 'POST',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'receipt',
                    header: { Authorization: authorization },
                    data: receiptOptions
                };
                return [4 /*yield*/, library_issuer_verifier_utility_1.makeNetworkRequest(receiptCallOptions)];
            case 2:
                resp = _c.sent();
                authToken = library_issuer_verifier_utility_1.handleAuthToken(resp);
                result = {
                    authToken: authToken,
                    body: {
                        isVerified: isVerified
                    }
                };
                return [2 /*return*/, result];
            case 3:
                e_1 = _c.sent();
                logger_1.default.error("Error sending a verifyNoPresentation request to UnumID Saas. Error " + e_1);
                throw e_1;
            case 4: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5Tm9QcmVzZW50YXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdmVyaWZpZXIvdmVyaWZ5Tm9QcmVzZW50YXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkZBVWlEO0FBQ2pELGlDQUE4QjtBQUc5QixpREFBZ0Q7QUFDaEQsb0NBQXVDO0FBQ3ZDLDhDQUE2QztBQUM3QyxxREFBK0I7QUFFL0I7OztHQUdHO0FBQ1UsUUFBQSw0QkFBNEIsR0FBRyxVQUFDLGNBQThCO0lBRXZFLElBQUEsSUFBSSxHQUlGLGNBQWMsS0FKWixFQUNKLE1BQU0sR0FHSixjQUFjLE9BSFYsRUFDTixLQUFLLEdBRUgsY0FBYyxNQUZYLEVBQ0wsdUJBQXVCLEdBQ3JCLGNBQWMsd0JBRE8sQ0FDTjtJQUVuQixJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1QsTUFBTSxJQUFJLDJDQUFTLENBQUMsR0FBRyxFQUFFLHlDQUF5QyxDQUFDLENBQUM7S0FDckU7SUFFRCxJQUFJLDhDQUFZLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDdEIsTUFBTSxJQUFJLDJDQUFTLENBQUMsR0FBRyxFQUFFLHVEQUF1RCxDQUFDLENBQUM7S0FDbkY7SUFFRCxJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ1YsTUFBTSxJQUFJLDJDQUFTLENBQUMsR0FBRyxFQUFFLDBDQUEwQyxDQUFDLENBQUM7S0FDdEU7SUFFRCxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1gsTUFBTSxJQUFJLDJDQUFTLENBQUMsR0FBRyxFQUFFLDJDQUEyQyxDQUFDLENBQUM7S0FDdkU7SUFFRCxJQUFJLENBQUMsdUJBQXVCLEVBQUU7UUFDNUIsTUFBTSxJQUFJLDJDQUFTLENBQUMsR0FBRyxFQUFFLDREQUE0RCxDQUFDLENBQUM7S0FDeEY7SUFFRCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxnQkFBZ0Is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cnJvcixcbiAgZ2V0S2V5RnJvbURJRERvYyxcbiAgZG9WZXJpZnksXG4gIGdldERJRERvYyxcbiAgbWFrZU5ldHdvcmtSZXF1ZXN0LFxuICBSRVNURGF0YSxcbiAgSlNPTk9iaixcbiAgaXNBcnJheUVtcHR5LFxuICBoYW5kbGVBdXRoVG9rZW5cbn0gZnJvbSAnQHVudW1pZC9saWJyYXJ5LWlzc3Vlci12ZXJpZmllci11dGlsaXR5JztcbmltcG9ydCB7IG9taXQgfSBmcm9tICdsb2Rhc2gnO1xuXG5pbXBvcnQgeyBOb1ByZXNlbnRhdGlvbiwgVW51bUR0bywgVmVyaWZpZWRTdGF0dXMgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyB2YWxpZGF0ZVByb29mIH0gZnJvbSAnLi92YWxpZGF0ZVByb29mJztcbmltcG9ydCB7IGNvbmZpZ0RhdGEgfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgcmVxdWlyZUF1dGggfSBmcm9tICcuLi9yZXF1aXJlQXV0aCc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4uL2xvZ2dlcic7XG5cbi8qKlxuICogVmFsaWRhdGVzIHRoZSBOb1ByZXNlbnRhdGlvbiB0eXBlIHRvIGVuc3VyZSB0aGUgbmVjZXNzYXJ5IGF0dHJpYnV0ZXMuXG4gKiBAcGFyYW0gbm9QcmVzZW50YXRpb24gTm9QcmVzZW50YXRpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHZhbGlkYXRlTm9QcmVzZW50YXRpb25QYXJhbXMgPSAobm9QcmVzZW50YXRpb246IE5vUHJlc2VudGF0aW9uKTogdm9pZCA9PiB7XG4gIGNvbnN0IHtcbiAgICB0eXBlLFxuICAgIGhvbGRlcixcbiAgICBwcm9vZixcbiAgICBwcmVzZW50YXRpb25SZXF1ZXN0VXVpZFxuICB9ID0gbm9QcmVzZW50YXRpb247XG5cbiAgaWYgKCF0eXBlKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvbjogdHlwZSBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmIChpc0FycmF5RW1wdHkodHlwZSkpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uOiB0eXBlIG11c3QgYmUgYSBub24tZW1wdHkgYXJyYXkuJyk7XG4gIH1cblxuICBpZiAoIXByb29mKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvbjogcHJvb2YgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAoIWhvbGRlcikge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb246IGhvbGRlciBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICghcHJlc2VudGF0aW9uUmVxdWVzdFV1aWQpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uOiBwcmVzZW50YXRpb25SZXF1ZXN0VXVpZCBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICh0eXBlWzBdICE9PSAnTm9QcmVzZW50YXRpb24nKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIHR5cGU6IGZpcnN0IGVsZW1lbnQgbXVzdCBiZSBcXCdOb1ByZXNlbnRhdGlvblxcJy4nKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgaG9sZGVyICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBob2xkZXI6IG11c3QgYmUgYSBzdHJpbmcuJyk7XG4gIH1cblxuICBpZiAodHlwZW9mIHByZXNlbnRhdGlvblJlcXVlc3RVdWlkICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBwcmVzZW50YXRpb25SZXF1ZXN0VXVpZDogbXVzdCBiZSBhIHN0cmluZy4nKTtcbiAgfVxuXG4gIHZhbGlkYXRlUHJvb2YocHJvb2YpO1xufTtcblxuLyoqXG4gKiBIYW5kbGVyIGZvciB3aGVuIGEgdXNlciBkb2VzIG5vdCBhZ3JlZSB0byBzaGFyZSB0aGUgaW5mb3JtYXRpb24gaW4gdGhlIGNyZWRlbnRpYWwgcmVxdWVzdC5cbiAqIEBwYXJhbSBhdXRob3JpemF0aW9uXG4gKiBAcGFyYW0gbm9QcmVzZW50YXRpb25cbiAqIEBwYXJhbSB2ZXJpZmllclxuICovXG5leHBvcnQgY29uc3QgdmVyaWZ5Tm9QcmVzZW50YXRpb24gPSBhc3luYyAoYXV0aG9yaXphdGlvbjogc3RyaW5nLCBub1ByZXNlbnRhdGlvbjogTm9QcmVzZW50YXRpb24sIHZlcmlmaWVyOiBzdHJpbmcpOiBQcm9taXNlPFVudW1EdG88VmVyaWZpZWRTdGF0dXM+PiA9PiB7XG4gIHRyeSB7XG4gICAgcmVxdWlyZUF1dGgoYXV0aG9yaXphdGlvbik7XG5cbiAgICB2YWxpZGF0ZU5vUHJlc2VudGF0aW9uUGFyYW1zKG5vUHJlc2VudGF0aW9uKTtcblxuICAgIGNvbnN0IHsgcHJvb2Y6IHsgdmVyaWZpY2F0aW9uTWV0aG9kLCBzaWduYXR1cmVWYWx1ZSB9IH0gPSBub1ByZXNlbnRhdGlvbjtcblxuICAgIGNvbnN0IGRpZERvY3VtZW50UmVzcG9uc2UgPSBhd2FpdCBnZXRESUREb2MoY29uZmlnRGF0YS5TYWFTVXJsLCBhdXRob3JpemF0aW9uIGFzIHN0cmluZywgdmVyaWZpY2F0aW9uTWV0aG9kKTtcblxuICAgIGlmIChkaWREb2N1bWVudFJlc3BvbnNlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHRocm93IGRpZERvY3VtZW50UmVzcG9uc2U7XG4gICAgfVxuXG4gICAgbGV0IGF1dGhUb2tlbjogc3RyaW5nID0gaGFuZGxlQXV0aFRva2VuKGRpZERvY3VtZW50UmVzcG9uc2UpO1xuICAgIGNvbnN0IHB1YmxpY0tleUluZm9zID0gZ2V0S2V5RnJvbURJRERvYyhkaWREb2N1bWVudFJlc3BvbnNlLmJvZHksICdzZWNwMjU2cjEnKTtcblxuICAgIGNvbnN0IHsgcHVibGljS2V5LCBlbmNvZGluZyB9ID0gcHVibGljS2V5SW5mb3NbMF07XG5cbiAgICBjb25zdCB1bnNpZ25lZE5vUHJlc2VudGF0aW9uID0gb21pdChub1ByZXNlbnRhdGlvbiwgJ3Byb29mJyk7XG5cbiAgICBjb25zdCBpc1ZlcmlmaWVkID0gZG9WZXJpZnkoc2lnbmF0dXJlVmFsdWUsIHVuc2lnbmVkTm9QcmVzZW50YXRpb24sIHB1YmxpY0tleSwgZW5jb2RpbmcpO1xuXG4gICAgaWYgKCFpc1ZlcmlmaWVkKSB7XG4gICAgICBjb25zdCByZXN1bHQ6IFVudW1EdG88VmVyaWZpZWRTdGF0dXM+ID0ge1xuICAgICAgICBhdXRoVG9rZW4sXG4gICAgICAgIGJvZHk6IHtcbiAgICAgICAgICBpc1ZlcmlmaWVkOiBmYWxzZSxcbiAgICAgICAgICBtZXNzYWdlOiAnQ3JlZGVudGlhbCBzaWduYXR1cmUgY2FuIG5vdCBiZSB2ZXJpZmllZC4nXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGNvbnN0IHJlY2VpcHRPcHRpb25zID0ge1xuICAgICAgdHlwZTogbm9QcmVzZW50YXRpb24udHlwZSxcbiAgICAgIHZlcmlmaWVyLFxuICAgICAgc3ViamVjdDogbm9QcmVzZW50YXRpb24uaG9sZGVyLFxuICAgICAgZGF0YToge1xuICAgICAgICBpc1ZlcmlmaWVkXG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IHJlY2VpcHRDYWxsT3B0aW9uczogUkVTVERhdGEgPSB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGJhc2VVcmw6IGNvbmZpZ0RhdGEuU2FhU1VybCxcbiAgICAgIGVuZFBvaW50OiAncmVjZWlwdCcsXG4gICAgICBoZWFkZXI6IHsgQXV0aG9yaXphdGlvbjogYXV0aG9yaXphdGlvbiB9LFxuICAgICAgZGF0YTogcmVjZWlwdE9wdGlvbnNcbiAgICB9O1xuXG4gICAgY29uc3QgcmVzcDogSlNPTk9iaiA9IGF3YWl0IG1ha2VOZXR3b3JrUmVxdWVzdDxKU09OT2JqPihyZWNlaXB0Q2FsbE9wdGlvbnMpO1xuXG4gICAgYXV0aFRva2VuID0gaGFuZGxlQXV0aFRva2VuKHJlc3ApO1xuXG4gICAgY29uc3QgcmVzdWx0OiBVbnVtRHRvPFZlcmlmaWVkU3RhdHVzPiA9IHtcbiAgICAgIGF1dGhUb2tlbixcbiAgICAgIGJvZHk6IHtcbiAgICAgICAgaXNWZXJpZmllZFxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGNhdGNoIChlKSB7XG4gICAgbG9nZ2VyLmVycm9yKGBFcnJvciBzZW5kaW5nIGEgdmVyaWZ5Tm9QcmVzZW50YXRpb24gcmVxdWVzdCB0byBVbnVtSUQgU2Fhcy4gRXJyb3IgJHtlfWApO1xuICAgIHRocm93IGU7XG4gIH1cbn07XG4iXX0=