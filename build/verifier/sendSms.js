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
exports.sendSms = void 0;
var library_issuer_verifier_utility_1 = require("@unumid/library-issuer-verifier-utility");
var config_1 = require("../config");
var logger_1 = __importDefault(require("../logger"));
var requireAuth_1 = require("../requireAuth");
/**
 * Validates the SmsRequestBody attributes.
 * @param body SmsRequestBody
 */
var validateSmsRequestBody = function (body) {
    var to = body.to, msg = body.msg;
    if (!to) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'to is required.');
    }
    if (!msg) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'msg is required.');
    }
    if (typeof to !== 'string') {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid to: expected string.');
    }
    if (typeof msg !== 'string') {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid msg: expected string.');
    }
};
/**
 * Handler to send a SMS using UnumID's SaaS.
 * Designed to be used to present a deeplink.
 *
 * @param authorization
 * @param to
 * @param msg
 */
exports.sendSms = function (authorization, to, msg) { return __awaiter(void 0, void 0, void 0, function () {
    var body, data, apiResponse, authToken, result, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                body = { to: to, msg: msg };
                requireAuth_1.requireAuth(authorization);
                validateSmsRequestBody(body);
                data = {
                    method: 'POST',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'sms',
                    header: { Authorization: authorization },
                    data: body
                };
                return [4 /*yield*/, library_issuer_verifier_utility_1.makeNetworkRequest(data)];
            case 1:
                apiResponse = _a.sent();
                if (!apiResponse.body.success) {
                    throw new library_issuer_verifier_utility_1.CustError(500, 'Unknown error during sendSms');
                }
                authToken = library_issuer_verifier_utility_1.handleAuthToken(apiResponse);
                result = {
                    authToken: authToken,
                    body: undefined
                };
                return [2 /*return*/, result];
            case 2:
                e_1 = _a.sent();
                logger_1.default.error("Error during sendSms to UnumID Saas. " + e_1);
                throw e_1;
            case 3: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VuZFNtcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92ZXJpZmllci9zZW5kU21zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLDJGQUF5RztBQUV6RyxvQ0FBdUM7QUFDdkMscURBQStCO0FBQy9CLDhDQUE2QztBQWU3Qzs7O0dBR0c7QUFDSCxJQUFNLHNCQUFzQixHQUFHLFVBQUMsSUFBb0I7SUFDMUMsSUFBQSxFQUFFLEdBQVUsSUFBSSxHQUFkLEVBQUUsR0FBRyxHQUFLLElBQUksSUFBVCxDQUFVO0lBRXpCLElBQUksQ0FBQyxFQUFFLEVBQUU7UUFDUCxNQUFNLElBQUksMkNBQVMsQ0FBQyxHQUFHLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztLQUM3QztJQUVELElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDUixNQUFNLElBQUksMkNBQVMsQ0FBQyxHQUFHLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztLQUM5QztJQUVELElBQUksT0FBTyxFQUFFLEtBQUssUUFBUSxFQUFFO1FBQzFCLE1BQU0sSUFBSSwyQ0FBUyxDQUFDLEdBQUcsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO0tBQzFEO0lBRUQsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7UUFDM0IsTUFBTSxJQUFJLDJDQUFTLENBQUMsR0FBRyxFQUFFLCtCQUErQixDQUFDLENBQUM7S0FDM0Q7QUFDSCxDQUFDLENBQUM7QUFFRjs7Ozs7OztHQU9HO0FBQ1UsUUFBQSxPQUFPLEdBQUcsVUFBTyxhQUFxQixFQUFFLEVBQVUsRUFBRSxHQUFXOzs7Ozs7Z0JBRWxFLElBQUksR0FBRyxFQUFFLEVBQUUsSUFBQSxFQUFFLEdBQUcsS0FBQSxFQUFFLENBQUM7Z0JBRXpCLHlCQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQzNCLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUV2QixJQUFJLEdBQUc7b0JBQ1gsTUFBTSxFQUFFLE1BQU07b0JBQ2QsT0FBTyxFQUFFLG1CQUFVLENBQUMsT0FBTztvQkFDM0IsUUFBUSxFQUFFLEtBQUs7b0JBQ2YsTUFBTSxFQUFFLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRTtvQkFDeEMsSUFBSSxFQUFFLElBQUk7aUJBQ1gsQ0FBQztnQkFFa0IscUJBQU0sb0RBQWtCLENBQWtCLElBQUksQ0FBQyxFQUFBOztnQkFBN0QsV0FBVyxHQUFHLFNBQStDO2dCQUVuRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQzdCLE1BQU0sSUFBSSwyQ0FBUyxDQUFDLEdBQUcsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO2lCQUMxRDtnQkFFSyxTQUFTLEdBQVcsaURBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFFakQsTUFBTSxHQUF1QjtvQkFDakMsU0FBUyxXQUFBO29CQUNULElBQUksRUFBRSxTQUFTO2lCQUNoQixDQUFDO2dCQUVGLHNCQUFPLE1BQU0sRUFBQzs7O2dCQUVkLGdCQUFNLENBQUMsS0FBSyxDQUFDLDBDQUF3QyxHQUFHLENBQUMsQ0FBQztnQkFDMUQsTUFBTSxHQUFDLENBQUM7Ozs7S0FFWCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJztcbmltcG9ydCB7IFBhcmFtc0RpY3Rpb25hcnkgfSBmcm9tICdleHByZXNzLXNlcnZlLXN0YXRpYy1jb3JlJztcbmltcG9ydCB7IEN1c3RFcnJvciwgaGFuZGxlQXV0aFRva2VuLCBtYWtlTmV0d29ya1JlcXVlc3QgfSBmcm9tICdAdW51bWlkL2xpYnJhcnktaXNzdWVyLXZlcmlmaWVyLXV0aWxpdHknO1xuXG5pbXBvcnQgeyBjb25maWdEYXRhIH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCB7IHJlcXVpcmVBdXRoIH0gZnJvbSAnLi4vcmVxdWlyZUF1dGgnO1xuaW1wb3J0IHsgVW51bUR0byB9IGZyb20gJy4uL3R5cGVzJztcblxuaW50ZXJmYWNlIFNtc1JlcXVlc3RCb2R5IHtcbiAgdG86IHN0cmluZztcbiAgbXNnOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU21zUmVzcG9uc2VCb2R5IHtcbiAgc3VjY2VzczogYm9vbGVhbjtcbn1cblxudHlwZSBTZW5kU21zUmVxdWVzdCA9IFJlcXVlc3Q8UGFyYW1zRGljdGlvbmFyeSwgU21zUmVzcG9uc2VCb2R5LCBTbXNSZXF1ZXN0Qm9keT47XG50eXBlIFNlbmRTbXNSZXNwb25zZSA9IFJlc3BvbnNlPFNtc1Jlc3BvbnNlQm9keT47XG5cbi8qKlxuICogVmFsaWRhdGVzIHRoZSBTbXNSZXF1ZXN0Qm9keSBhdHRyaWJ1dGVzLlxuICogQHBhcmFtIGJvZHkgU21zUmVxdWVzdEJvZHlcbiAqL1xuY29uc3QgdmFsaWRhdGVTbXNSZXF1ZXN0Qm9keSA9IChib2R5OiBTbXNSZXF1ZXN0Qm9keSk6IHZvaWQgPT4ge1xuICBjb25zdCB7IHRvLCBtc2cgfSA9IGJvZHk7XG5cbiAgaWYgKCF0bykge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAndG8gaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAoIW1zZykge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnbXNnIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB0byAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgdG86IGV4cGVjdGVkIHN0cmluZy4nKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgbXNnICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBtc2c6IGV4cGVjdGVkIHN0cmluZy4nKTtcbiAgfVxufTtcblxuLyoqXG4gKiBIYW5kbGVyIHRvIHNlbmQgYSBTTVMgdXNpbmcgVW51bUlEJ3MgU2FhUy5cbiAqIERlc2lnbmVkIHRvIGJlIHVzZWQgdG8gcHJlc2VudCBhIGRlZXBsaW5rLlxuICpcbiAqIEBwYXJhbSBhdXRob3JpemF0aW9uXG4gKiBAcGFyYW0gdG9cbiAqIEBwYXJhbSBtc2dcbiAqL1xuZXhwb3J0IGNvbnN0IHNlbmRTbXMgPSBhc3luYyAoYXV0aG9yaXphdGlvbjogc3RyaW5nLCB0bzogc3RyaW5nLCBtc2c6IHN0cmluZyk6IFByb21pc2U8VW51bUR0bzx1bmRlZmluZWQ+PiA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgYm9keSA9IHsgdG8sIG1zZyB9O1xuXG4gICAgcmVxdWlyZUF1dGgoYXV0aG9yaXphdGlvbik7XG4gICAgdmFsaWRhdGVTbXNSZXF1ZXN0Qm9keShib2R5KTtcblxuICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGJhc2VVcmw6IGNvbmZpZ0RhdGEuU2FhU1VybCxcbiAgICAgIGVuZFBvaW50OiAnc21zJyxcbiAgICAgIGhlYWRlcjogeyBBdXRob3JpemF0aW9uOiBhdXRob3JpemF0aW9uIH0sXG4gICAgICBkYXRhOiBib2R5XG4gICAgfTtcblxuICAgIGNvbnN0IGFwaVJlc3BvbnNlID0gYXdhaXQgbWFrZU5ldHdvcmtSZXF1ZXN0PFNtc1Jlc3BvbnNlQm9keT4oZGF0YSk7XG5cbiAgICBpZiAoIWFwaVJlc3BvbnNlLmJvZHkuc3VjY2Vzcykge1xuICAgICAgdGhyb3cgbmV3IEN1c3RFcnJvcig1MDAsICdVbmtub3duIGVycm9yIGR1cmluZyBzZW5kU21zJyk7XG4gICAgfVxuXG4gICAgY29uc3QgYXV0aFRva2VuOiBzdHJpbmcgPSBoYW5kbGVBdXRoVG9rZW4oYXBpUmVzcG9uc2UpO1xuXG4gICAgY29uc3QgcmVzdWx0OiBVbnVtRHRvPHVuZGVmaW5lZD4gPSB7XG4gICAgICBhdXRoVG9rZW4sXG4gICAgICBib2R5OiB1bmRlZmluZWRcbiAgICB9O1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGxvZ2dlci5lcnJvcihgRXJyb3IgZHVyaW5nIHNlbmRTbXMgdG8gVW51bUlEIFNhYXMuICR7ZX1gKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuIl19