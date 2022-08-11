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
exports.revokeAllCredentials = void 0;
var config_1 = require("../config");
var requireAuth_1 = require("../requireAuth");
var logger_1 = __importDefault(require("../logger"));
var types_1 = require("@unumid/types");
var error_1 = require("../utils/error");
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
var __1 = require("..");
/**
 * Helper to validate request inputs.
 * @param req Request
 */
var validateInputs = function (issuerDid, signingPrivateKey, subjectDid) {
    // issuerDid is mandatory.
    if (!issuerDid) {
        throw new error_1.CustError(400, 'issuerDid is required.');
    }
    // signingPrivateKey is mandatory.
    if (!signingPrivateKey) {
        throw new error_1.CustError(400, 'signingPrivateKey is required.');
    }
    // subjectDid is mandatory.
    if (!subjectDid) {
        throw new error_1.CustError(400, 'subjectDid is required.');
    }
};
/**
 * Helper to revoke all credentials that the calling issuer (DID + signing private key) has issued a particular DID.
 * @param authorization
 * @param issuerDid
 * @param signingPrivateKey
 * @param subjectDid
 * @returns
 */
exports.revokeAllCredentials = function (authorization, issuerDid, signingPrivateKey, subjectDid) { return __awaiter(void 0, void 0, void 0, function () {
    var unsignedDto, bytes, proof, signedDto, restData, response, authToken, revokedResponse, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                requireAuth_1.requireAuth(authorization);
                validateInputs(issuerDid, signingPrivateKey, subjectDid);
                unsignedDto = {
                    did: subjectDid
                };
                bytes = types_1.UnsignedRevokeAllCredentials.encode(unsignedDto).finish();
                proof = __1.createProofPb(bytes, signingPrivateKey, issuerDid);
                signedDto = __assign(__assign({}, unsignedDto), { proof: proof });
                restData = {
                    method: 'POST',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'revokeAllCredentials/',
                    header: { Authorization: authorization },
                    data: signedDto
                };
                return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(restData)];
            case 1:
                response = _a.sent();
                authToken = networkRequestHelper_1.handleAuthTokenHeader(response, authorization);
                revokedResponse = {
                    authToken: authToken,
                    body: undefined
                };
                return [2 /*return*/, revokedResponse];
            case 2:
                error_2 = _a.sent();
                logger_1.default.error("Error revoking all " + subjectDid + "'s credentials with UnumID SaaS. " + error_2);
                throw error_2;
            case 3: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV2b2tlQWxsQ3JlZGVudGlhbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaXNzdWVyL3Jldm9rZUFsbENyZWRlbnRpYWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsb0NBQXVDO0FBQ3ZDLDhDQUE2QztBQUc3QyxxREFBK0I7QUFDL0IsdUNBQXdKO0FBQ3hKLHdDQUEyQztBQUMzQyxzRUFBMEY7QUFFMUYsd0JBQW1DO0FBRW5DOzs7R0FHRztBQUNILElBQU0sY0FBYyxHQUFHLFVBQUMsU0FBaUIsRUFBRSxpQkFBeUIsRUFBRSxVQUFrQjtJQUN0RiwwQkFBMEI7SUFDMUIsSUFBSSxDQUFDLFNBQVMsRUFBRTtRQUNkLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0tBQ3BEO0lBRUQsa0NBQWtDO0lBQ2xDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtRQUN0QixNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztLQUM1RDtJQUVELDJCQUEyQjtJQUMzQixJQUFJLENBQUMsVUFBVSxFQUFFO1FBQ2YsTUFBTSxJQUFJLGlCQUFTLENBQUMsR0FBRyxFQUFFLHlCQUF5QixDQUFDLENBQUM7S0FDckQ7QUFDSCxDQUFDLENBQUM7QUFFRjs7Ozs7OztHQU9HO0FBQ1UsUUFBQSxvQkFBb0IsR0FBRyxVQUFPLGFBQXFCLEVBQUUsU0FBaUIsRUFBRSxpQkFBeUIsRUFBRSxVQUFrQjs7Ozs7O2dCQUU5SCx5QkFBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUUzQixjQUFjLENBQUMsU0FBUyxFQUFFLGlCQUFpQixFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUduRCxXQUFXLEdBQWlDO29CQUNoRCxHQUFHLEVBQUUsVUFBVTtpQkFDaEIsQ0FBQztnQkFFSSxLQUFLLEdBQUcsb0NBQTRCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNsRSxLQUFLLEdBQVksaUJBQWEsQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBRXBFLFNBQVMseUJBQ1YsV0FBVyxLQUNkLEtBQUssT0FBQSxHQUNOLENBQUM7Z0JBRUksUUFBUSxHQUFhO29CQUN6QixNQUFNLEVBQUUsTUFBTTtvQkFDZCxPQUFPLEVBQUUsbUJBQVUsQ0FBQyxPQUFPO29CQUMzQixRQUFRLEVBQUUsdUJBQXVCO29CQUNqQyxNQUFNLEVBQUUsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFO29CQUN4QyxJQUFJLEVBQUUsU0FBUztpQkFDaEIsQ0FBQztnQkFHd0IscUJBQU0seUNBQWtCLENBQXVCLFFBQVEsQ0FBQyxFQUFBOztnQkFBNUUsUUFBUSxHQUFZLFNBQXdEO2dCQUU1RSxTQUFTLEdBQVcsNENBQXFCLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUVuRSxlQUFlLEdBQXVCO29CQUMxQyxTQUFTLFdBQUE7b0JBQ1QsSUFBSSxFQUFFLFNBQVM7aUJBQ2hCLENBQUM7Z0JBRUYsc0JBQU8sZUFBZSxFQUFDOzs7Z0JBRXZCLGdCQUFNLENBQUMsS0FBSyxDQUFDLHdCQUFzQixVQUFVLHlDQUFvQyxPQUFPLENBQUMsQ0FBQztnQkFDMUYsTUFBTSxPQUFLLENBQUM7Ozs7S0FFZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY29uZmlnRGF0YSB9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQgeyByZXF1aXJlQXV0aCB9IGZyb20gJy4uL3JlcXVpcmVBdXRoJztcblxuaW1wb3J0IHsgUkVTVERhdGEsIFVudW1EdG8gfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBDcmVkZW50aWFsU3RhdHVzT3B0aW9ucywgSlNPTk9iaiwgX0NyZWRlbnRpYWxTdGF0dXNPcHRpb25zLCBVbnNpZ25lZFJldm9rZUFsbENyZWRlbnRpYWxzLCBSZXZva2VBbGxDcmVkZW50aWFscywgUHJvb2ZQYiB9IGZyb20gJ0B1bnVtaWQvdHlwZXMnO1xuaW1wb3J0IHsgQ3VzdEVycm9yIH0gZnJvbSAnLi4vdXRpbHMvZXJyb3InO1xuaW1wb3J0IHsgaGFuZGxlQXV0aFRva2VuSGVhZGVyLCBtYWtlTmV0d29ya1JlcXVlc3QgfSBmcm9tICcuLi91dGlscy9uZXR3b3JrUmVxdWVzdEhlbHBlcic7XG5pbXBvcnQgeyBzaWduLCBzaWduQnl0ZXMgfSBmcm9tICdAdW51bWlkL2xpYnJhcnktY3J5cHRvJztcbmltcG9ydCB7IGNyZWF0ZVByb29mUGIgfSBmcm9tICcuLic7XG5cbi8qKlxuICogSGVscGVyIHRvIHZhbGlkYXRlIHJlcXVlc3QgaW5wdXRzLlxuICogQHBhcmFtIHJlcSBSZXF1ZXN0XG4gKi9cbmNvbnN0IHZhbGlkYXRlSW5wdXRzID0gKGlzc3VlckRpZDogc3RyaW5nLCBzaWduaW5nUHJpdmF0ZUtleTogc3RyaW5nLCBzdWJqZWN0RGlkOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgLy8gaXNzdWVyRGlkIGlzIG1hbmRhdG9yeS5cbiAgaWYgKCFpc3N1ZXJEaWQpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ2lzc3VlckRpZCBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIC8vIHNpZ25pbmdQcml2YXRlS2V5IGlzIG1hbmRhdG9yeS5cbiAgaWYgKCFzaWduaW5nUHJpdmF0ZUtleSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnc2lnbmluZ1ByaXZhdGVLZXkgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICAvLyBzdWJqZWN0RGlkIGlzIG1hbmRhdG9yeS5cbiAgaWYgKCFzdWJqZWN0RGlkKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdzdWJqZWN0RGlkIGlzIHJlcXVpcmVkLicpO1xuICB9XG59O1xuXG4vKipcbiAqIEhlbHBlciB0byByZXZva2UgYWxsIGNyZWRlbnRpYWxzIHRoYXQgdGhlIGNhbGxpbmcgaXNzdWVyIChESUQgKyBzaWduaW5nIHByaXZhdGUga2V5KSBoYXMgaXNzdWVkIGEgcGFydGljdWxhciBESUQuXG4gKiBAcGFyYW0gYXV0aG9yaXphdGlvblxuICogQHBhcmFtIGlzc3VlckRpZFxuICogQHBhcmFtIHNpZ25pbmdQcml2YXRlS2V5XG4gKiBAcGFyYW0gc3ViamVjdERpZFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGNvbnN0IHJldm9rZUFsbENyZWRlbnRpYWxzID0gYXN5bmMgKGF1dGhvcml6YXRpb246IHN0cmluZywgaXNzdWVyRGlkOiBzdHJpbmcsIHNpZ25pbmdQcml2YXRlS2V5OiBzdHJpbmcsIHN1YmplY3REaWQ6IHN0cmluZyk6IFByb21pc2U8VW51bUR0bzx1bmRlZmluZWQ+PiA9PiB7XG4gIHRyeSB7XG4gICAgcmVxdWlyZUF1dGgoYXV0aG9yaXphdGlvbik7XG5cbiAgICB2YWxpZGF0ZUlucHV0cyhpc3N1ZXJEaWQsIHNpZ25pbmdQcml2YXRlS2V5LCBzdWJqZWN0RGlkKTtcblxuICAgIC8vIG11c3Qgc2lnbiB0aGUgcmVxdWVzdCB3aXRoIHRoZSBpc3N1ZXIncyBzaWduaW5nIHByaXZhdGUga2V5LlxuICAgIGNvbnN0IHVuc2lnbmVkRHRvOiBVbnNpZ25lZFJldm9rZUFsbENyZWRlbnRpYWxzID0ge1xuICAgICAgZGlkOiBzdWJqZWN0RGlkXG4gICAgfTtcblxuICAgIGNvbnN0IGJ5dGVzID0gVW5zaWduZWRSZXZva2VBbGxDcmVkZW50aWFscy5lbmNvZGUodW5zaWduZWREdG8pLmZpbmlzaCgpO1xuICAgIGNvbnN0IHByb29mOiBQcm9vZlBiID0gY3JlYXRlUHJvb2ZQYihieXRlcywgc2lnbmluZ1ByaXZhdGVLZXksIGlzc3VlckRpZCk7XG5cbiAgICBjb25zdCBzaWduZWREdG86IFJldm9rZUFsbENyZWRlbnRpYWxzID0ge1xuICAgICAgLi4udW5zaWduZWREdG8sXG4gICAgICBwcm9vZlxuICAgIH07XG5cbiAgICBjb25zdCByZXN0RGF0YTogUkVTVERhdGEgPSB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGJhc2VVcmw6IGNvbmZpZ0RhdGEuU2FhU1VybCxcbiAgICAgIGVuZFBvaW50OiAncmV2b2tlQWxsQ3JlZGVudGlhbHMvJyxcbiAgICAgIGhlYWRlcjogeyBBdXRob3JpemF0aW9uOiBhdXRob3JpemF0aW9uIH0sXG4gICAgICBkYXRhOiBzaWduZWREdG9cbiAgICB9O1xuXG4gICAgLy8gbWFrZSByZXF1ZXN0IHRvIFNhYVMgdG8gdXBkYXRlIHRoZSBDcmVkZW50aWFsU3RhdHVzXG4gICAgY29uc3QgcmVzcG9uc2U6IEpTT05PYmogPSBhd2FpdCBtYWtlTmV0d29ya1JlcXVlc3Q8eyBzdWNjZXNzOiBib29sZWFuIH0+KHJlc3REYXRhKTtcblxuICAgIGNvbnN0IGF1dGhUb2tlbjogc3RyaW5nID0gaGFuZGxlQXV0aFRva2VuSGVhZGVyKHJlc3BvbnNlLCBhdXRob3JpemF0aW9uKTtcblxuICAgIGNvbnN0IHJldm9rZWRSZXNwb25zZTogVW51bUR0bzx1bmRlZmluZWQ+ID0ge1xuICAgICAgYXV0aFRva2VuLFxuICAgICAgYm9keTogdW5kZWZpbmVkXG4gICAgfTtcblxuICAgIHJldHVybiByZXZva2VkUmVzcG9uc2U7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKGBFcnJvciByZXZva2luZyBhbGwgJHtzdWJqZWN0RGlkfSdzIGNyZWRlbnRpYWxzIHdpdGggVW51bUlEIFNhYVMuICR7ZXJyb3J9YCk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG4iXX0=