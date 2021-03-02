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
exports.revokeCredential = void 0;
var config_1 = require("../config");
var requireAuth_1 = require("../requireAuth");
var library_issuer_verifier_utility_1 = require("@unumid/library-issuer-verifier-utility");
var logger_1 = __importDefault(require("../logger"));
/**
 * Helper to validate request inputs.
 * @param req Request
 */
var validateInputs = function (credentialId) {
    // Credential ID is mandatory.
    if (!credentialId) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'credentialId is required.');
    }
};
/**
 * Handler to revoke credentials. It relays the revoke credential metadata to UnumID's SaaS.
 * @param authorization
 * @param credentialId
 */
exports.revokeCredential = function (authorization, credentialId) { return __awaiter(void 0, void 0, void 0, function () {
    var restData, response, authToken, revokedCredential, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                requireAuth_1.requireAuth(authorization);
                validateInputs(credentialId);
                restData = {
                    method: 'PATCH',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'credentialStatus/' + credentialId,
                    header: { Authorization: authorization },
                    data: { status: 'revoked' }
                };
                return [4 /*yield*/, library_issuer_verifier_utility_1.makeNetworkRequest(restData)];
            case 1:
                response = _a.sent();
                authToken = library_issuer_verifier_utility_1.handleAuthToken(response);
                revokedCredential = {
                    authToken: authToken,
                    body: undefined
                };
                return [2 /*return*/, revokedCredential];
            case 2:
                error_1 = _a.sent();
                logger_1.default.error("Error revoking a credential with UnumID SaaS. " + error_1);
                throw error_1;
            case 3: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV2b2tlQ3JlZGVudGlhbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaXNzdWVyL3Jldm9rZUNyZWRlbnRpYWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG9DQUF1QztBQUN2Qyw4Q0FBNkM7QUFFN0MsMkZBQTRIO0FBRTVILHFEQUErQjtBQUUvQjs7O0dBR0c7QUFDSCxJQUFNLGNBQWMsR0FBRyxVQUFDLFlBQW9CO0lBQzFDLDhCQUE4QjtJQUM5QixJQUFJLENBQUMsWUFBWSxFQUFFO1FBQ2pCLE1BQU0sSUFBSSwyQ0FBUyxDQUFDLEdBQUcsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO0tBQ3ZEO0FBQ0gsQ0FBQyxDQUFDO0FBRUY7Ozs7R0FJRztBQUNVLFFBQUEsZ0JBQWdCLEdBQUcsVUFBTyxhQUFxQixFQUFFLFlBQW9COzs7Ozs7Z0JBRTlFLHlCQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBRTNCLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFdkIsUUFBUSxHQUFhO29CQUN6QixNQUFNLEVBQUUsT0FBTztvQkFDZixPQUFPLEVBQUUsbUJBQVUsQ0FBQyxPQUFPO29CQUMzQixRQUFRLEVBQUUsbUJBQW1CLEdBQUcsWUFBWTtvQkFDNUMsTUFBTSxFQUFFLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRTtvQkFDeEMsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRTtpQkFDNUIsQ0FBQztnQkFHd0IscUJBQU0sb0RBQWtCLENBQXVCLFFBQVEsQ0FBQyxFQUFBOztnQkFBNUUsUUFBUSxHQUFZLFNBQXdEO2dCQUU1RSxTQUFTLEdBQVcsaURBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFOUMsaUJBQWlCLEdBQXVCO29CQUM1QyxTQUFTLFdBQUE7b0JBQ1QsSUFBSSxFQUFFLFNBQVM7aUJBQ2hCLENBQUM7Z0JBRUYsc0JBQU8saUJBQWlCLEVBQUM7OztnQkFFekIsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsbURBQWlELE9BQU8sQ0FBQyxDQUFDO2dCQUN2RSxNQUFNLE9BQUssQ0FBQzs7OztLQUVmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjb25maWdEYXRhIH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7IHJlcXVpcmVBdXRoIH0gZnJvbSAnLi4vcmVxdWlyZUF1dGgnO1xuXG5pbXBvcnQgeyBDdXN0RXJyb3IsIFJFU1REYXRhLCBtYWtlTmV0d29ya1JlcXVlc3QsIEpTT05PYmosIGhhbmRsZUF1dGhUb2tlbiB9IGZyb20gJ0B1bnVtaWQvbGlicmFyeS1pc3N1ZXItdmVyaWZpZXItdXRpbGl0eSc7XG5pbXBvcnQgeyBVbnVtRHRvIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuLi9sb2dnZXInO1xuXG4vKipcbiAqIEhlbHBlciB0byB2YWxpZGF0ZSByZXF1ZXN0IGlucHV0cy5cbiAqIEBwYXJhbSByZXEgUmVxdWVzdFxuICovXG5jb25zdCB2YWxpZGF0ZUlucHV0cyA9IChjcmVkZW50aWFsSWQ6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAvLyBDcmVkZW50aWFsIElEIGlzIG1hbmRhdG9yeS5cbiAgaWYgKCFjcmVkZW50aWFsSWQpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ2NyZWRlbnRpYWxJZCBpcyByZXF1aXJlZC4nKTtcbiAgfVxufTtcblxuLyoqXG4gKiBIYW5kbGVyIHRvIHJldm9rZSBjcmVkZW50aWFscy4gSXQgcmVsYXlzIHRoZSByZXZva2UgY3JlZGVudGlhbCBtZXRhZGF0YSB0byBVbnVtSUQncyBTYWFTLlxuICogQHBhcmFtIGF1dGhvcml6YXRpb25cbiAqIEBwYXJhbSBjcmVkZW50aWFsSWRcbiAqL1xuZXhwb3J0IGNvbnN0IHJldm9rZUNyZWRlbnRpYWwgPSBhc3luYyAoYXV0aG9yaXphdGlvbjogc3RyaW5nLCBjcmVkZW50aWFsSWQ6IHN0cmluZyk6IFByb21pc2U8VW51bUR0bzx1bmRlZmluZWQ+PiA9PiB7XG4gIHRyeSB7XG4gICAgcmVxdWlyZUF1dGgoYXV0aG9yaXphdGlvbik7XG5cbiAgICB2YWxpZGF0ZUlucHV0cyhjcmVkZW50aWFsSWQpO1xuXG4gICAgY29uc3QgcmVzdERhdGE6IFJFU1REYXRhID0ge1xuICAgICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgICAgYmFzZVVybDogY29uZmlnRGF0YS5TYWFTVXJsLFxuICAgICAgZW5kUG9pbnQ6ICdjcmVkZW50aWFsU3RhdHVzLycgKyBjcmVkZW50aWFsSWQsXG4gICAgICBoZWFkZXI6IHsgQXV0aG9yaXphdGlvbjogYXV0aG9yaXphdGlvbiB9LFxuICAgICAgZGF0YTogeyBzdGF0dXM6ICdyZXZva2VkJyB9XG4gICAgfTtcblxuICAgIC8vIG1ha2UgcmVxdWVzdCB0byBTYWFTIHRvIHVwZGF0ZSB0aGUgQ3JlZGVudGlhbFN0YXR1c1xuICAgIGNvbnN0IHJlc3BvbnNlOiBKU09OT2JqID0gYXdhaXQgbWFrZU5ldHdvcmtSZXF1ZXN0PHsgc3VjY2VzczogYm9vbGVhbiB9PihyZXN0RGF0YSk7XG5cbiAgICBjb25zdCBhdXRoVG9rZW46IHN0cmluZyA9IGhhbmRsZUF1dGhUb2tlbihyZXNwb25zZSk7XG5cbiAgICBjb25zdCByZXZva2VkQ3JlZGVudGlhbDogVW51bUR0bzx1bmRlZmluZWQ+ID0ge1xuICAgICAgYXV0aFRva2VuLFxuICAgICAgYm9keTogdW5kZWZpbmVkXG4gICAgfTtcblxuICAgIHJldHVybiByZXZva2VkQ3JlZGVudGlhbDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoYEVycm9yIHJldm9raW5nIGEgY3JlZGVudGlhbCB3aXRoIFVudW1JRCBTYWFTLiAke2Vycm9yfWApO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuIl19