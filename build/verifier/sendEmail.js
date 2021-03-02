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
exports.sendEmail = void 0;
var library_issuer_verifier_utility_1 = require("@unumid/library-issuer-verifier-utility");
var config_1 = require("../config");
var logger_1 = __importDefault(require("../logger"));
var requireAuth_1 = require("../requireAuth");
/**
 * Validates the EmailRequestBody attributes.
 * @param body EmailRequestBody
 */
var validateEmailRequestBody = function (body) {
    var to = body.to, subject = body.subject, textBody = body.textBody, htmlBody = body.htmlBody;
    if (!to) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'to is required.');
    }
    if (!subject) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'subject is required.');
    }
    if (!textBody && !htmlBody) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Either textBody or htmlBody is required.');
    }
    if (textBody && htmlBody) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Either textBody or htmlBody is required, not both.');
    }
    if (typeof to !== 'string') {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid to: expected string.');
    }
    if (typeof subject !== 'string') {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid subject: expected string.');
    }
    if (textBody && (typeof textBody !== 'string')) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid textBody: expected string.');
    }
    if (htmlBody && (typeof htmlBody !== 'string')) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid htmlBody: expected string.');
    }
};
/**
 * Handler to send an email using UnumID's SaaS.
 * @param authorization
 * @param to
 * @param subject
 * @param textBody
 * @param htmlBody
 */
exports.sendEmail = function (authorization, to, subject, textBody, htmlBody) { return __awaiter(void 0, void 0, void 0, function () {
    var body, data, apiResponse, authToken, result, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                requireAuth_1.requireAuth(authorization);
                body = { to: to, subject: subject, textBody: textBody, htmlBody: htmlBody };
                validateEmailRequestBody(body);
                data = {
                    method: 'POST',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'email',
                    header: { Authorization: authorization },
                    data: body
                };
                return [4 /*yield*/, library_issuer_verifier_utility_1.makeNetworkRequest(data)];
            case 1:
                apiResponse = _a.sent();
                authToken = library_issuer_verifier_utility_1.handleAuthToken(apiResponse);
                result = {
                    authToken: authToken,
                    body: undefined
                };
                return [2 /*return*/, result];
            case 2:
                e_1 = _a.sent();
                logger_1.default.error("Error sendingEmail through UnumID's saas. " + e_1);
                throw e_1;
            case 3: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VuZEVtYWlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3ZlcmlmaWVyL3NlbmRFbWFpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyRkFBd0k7QUFFeEksb0NBQXVDO0FBQ3ZDLHFEQUErQjtBQUMvQiw4Q0FBNkM7QUFjN0M7OztHQUdHO0FBQ0gsSUFBTSx3QkFBd0IsR0FBRyxVQUFDLElBQXNCO0lBQzlDLElBQUEsRUFBRSxHQUFrQyxJQUFJLEdBQXRDLEVBQUUsT0FBTyxHQUF5QixJQUFJLFFBQTdCLEVBQUUsUUFBUSxHQUFlLElBQUksU0FBbkIsRUFBRSxRQUFRLEdBQUssSUFBSSxTQUFULENBQVU7SUFFakQsSUFBSSxDQUFDLEVBQUUsRUFBRTtRQUNQLE1BQU0sSUFBSSwyQ0FBUyxDQUFDLEdBQUcsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0tBQzdDO0lBRUQsSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUNaLE1BQU0sSUFBSSwyQ0FBUyxDQUFDLEdBQUcsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0tBQ2xEO0lBRUQsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUMxQixNQUFNLElBQUksMkNBQVMsQ0FBQyxHQUFHLEVBQUUsMENBQTBDLENBQUMsQ0FBQztLQUN0RTtJQUVELElBQUksUUFBUSxJQUFJLFFBQVEsRUFBRTtRQUN4QixNQUFNLElBQUksMkNBQVMsQ0FBQyxHQUFHLEVBQUUsb0RBQW9ELENBQUMsQ0FBQztLQUNoRjtJQUVELElBQUksT0FBTyxFQUFFLEtBQUssUUFBUSxFQUFFO1FBQzFCLE1BQU0sSUFBSSwyQ0FBUyxDQUFDLEdBQUcsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO0tBQzFEO0lBRUQsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7UUFDL0IsTUFBTSxJQUFJLDJDQUFTLENBQUMsR0FBRyxFQUFFLG1DQUFtQyxDQUFDLENBQUM7S0FDL0Q7SUFFRCxJQUFJLFFBQVEsSUFBSSxDQUFDLE9BQU8sUUFBUSxLQUFLLFFBQVEsQ0FBQyxFQUFFO1FBQzlDLE1BQU0sSUFBSSwyQ0FBUyxDQUFDLEdBQUcsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDO0tBQ2hFO0lBRUQsSUFBSSxRQUFRLElBQUksQ0FBQyxPQUFPLFFBQVEsS0FBSyxRQUFRLENBQUMsRUFBRTtRQUM5QyxNQUFNLElBQUksMkNBQVMsQ0FBQyxHQUFHLEVBQUUsb0NBQW9DLENBQUMsQ0FBQztLQUNoRTtBQUNILENBQUMsQ0FBQztBQUVGOzs7Ozs7O0dBT0c7QUFDVSxRQUFBLFNBQVMsR0FBRyxVQUFPLGFBQXFCLEVBQUUsRUFBVSxFQUFFLE9BQWUsRUFBRSxRQUFpQixFQUFFLFFBQWlCOzs7Ozs7Z0JBRXBILHlCQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBRXJCLElBQUksR0FBcUIsRUFBRSxFQUFFLElBQUEsRUFBRSxPQUFPLFNBQUEsRUFBRSxRQUFRLFVBQUEsRUFBRSxRQUFRLFVBQUEsRUFBRSxDQUFDO2dCQUNuRSx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFekIsSUFBSSxHQUFHO29CQUNYLE1BQU0sRUFBRSxNQUFNO29CQUNkLE9BQU8sRUFBRSxtQkFBVSxDQUFDLE9BQU87b0JBQzNCLFFBQVEsRUFBRSxPQUFPO29CQUNqQixNQUFNLEVBQUUsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFO29CQUN4QyxJQUFJLEVBQUUsSUFBSTtpQkFDWCxDQUFDO2dCQUdrQixxQkFBTSxvREFBa0IsQ0FBb0IsSUFBSSxDQUFDLEVBQUE7O2dCQUEvRCxXQUFXLEdBQUcsU0FBaUQ7Z0JBRS9ELFNBQVMsR0FBVyxpREFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUVqRCxNQUFNLEdBQXVCO29CQUNqQyxTQUFTLFdBQUE7b0JBQ1QsSUFBSSxFQUFFLFNBQVM7aUJBQ2hCLENBQUM7Z0JBRUYsc0JBQU8sTUFBTSxFQUFDOzs7Z0JBRWQsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsK0NBQTZDLEdBQUcsQ0FBQyxDQUFDO2dCQUMvRCxNQUFNLEdBQUMsQ0FBQzs7OztLQUVYLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDdXN0RXJyb3IsIGhhbmRsZUF1dGhUb2tlbiwgaXNBcnJheUVtcHR5LCBpc0FycmF5Tm90RW1wdHksIG1ha2VOZXR3b3JrUmVxdWVzdCB9IGZyb20gJ0B1bnVtaWQvbGlicmFyeS1pc3N1ZXItdmVyaWZpZXItdXRpbGl0eSc7XG5cbmltcG9ydCB7IGNvbmZpZ0RhdGEgfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IHsgcmVxdWlyZUF1dGggfSBmcm9tICcuLi9yZXF1aXJlQXV0aCc7XG5pbXBvcnQgeyBVbnVtRHRvIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5pbnRlcmZhY2UgRW1haWxSZXF1ZXN0Qm9keSB7XG4gIHRvOiBzdHJpbmc7XG4gIHN1YmplY3Q6IHN0cmluZztcbiAgdGV4dEJvZHk/OiBzdHJpbmc7XG4gIGh0bWxCb2R5Pzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVtYWlsUmVzcG9uc2VCb2R5IHtcbiAgc3VjY2VzczogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgdGhlIEVtYWlsUmVxdWVzdEJvZHkgYXR0cmlidXRlcy5cbiAqIEBwYXJhbSBib2R5IEVtYWlsUmVxdWVzdEJvZHlcbiAqL1xuY29uc3QgdmFsaWRhdGVFbWFpbFJlcXVlc3RCb2R5ID0gKGJvZHk6IEVtYWlsUmVxdWVzdEJvZHkpOiB2b2lkID0+IHtcbiAgY29uc3QgeyB0bywgc3ViamVjdCwgdGV4dEJvZHksIGh0bWxCb2R5IH0gPSBib2R5O1xuXG4gIGlmICghdG8pIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ3RvIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKCFzdWJqZWN0KSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdzdWJqZWN0IGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKCF0ZXh0Qm9keSAmJiAhaHRtbEJvZHkpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0VpdGhlciB0ZXh0Qm9keSBvciBodG1sQm9keSBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICh0ZXh0Qm9keSAmJiBodG1sQm9keSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnRWl0aGVyIHRleHRCb2R5IG9yIGh0bWxCb2R5IGlzIHJlcXVpcmVkLCBub3QgYm90aC4nKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdG8gIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIHRvOiBleHBlY3RlZCBzdHJpbmcuJyk7XG4gIH1cblxuICBpZiAodHlwZW9mIHN1YmplY3QgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIHN1YmplY3Q6IGV4cGVjdGVkIHN0cmluZy4nKTtcbiAgfVxuXG4gIGlmICh0ZXh0Qm9keSAmJiAodHlwZW9mIHRleHRCb2R5ICE9PSAnc3RyaW5nJykpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgdGV4dEJvZHk6IGV4cGVjdGVkIHN0cmluZy4nKTtcbiAgfVxuXG4gIGlmIChodG1sQm9keSAmJiAodHlwZW9mIGh0bWxCb2R5ICE9PSAnc3RyaW5nJykpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgaHRtbEJvZHk6IGV4cGVjdGVkIHN0cmluZy4nKTtcbiAgfVxufTtcblxuLyoqXG4gKiBIYW5kbGVyIHRvIHNlbmQgYW4gZW1haWwgdXNpbmcgVW51bUlEJ3MgU2FhUy5cbiAqIEBwYXJhbSBhdXRob3JpemF0aW9uXG4gKiBAcGFyYW0gdG9cbiAqIEBwYXJhbSBzdWJqZWN0XG4gKiBAcGFyYW0gdGV4dEJvZHlcbiAqIEBwYXJhbSBodG1sQm9keVxuICovXG5leHBvcnQgY29uc3Qgc2VuZEVtYWlsID0gYXN5bmMgKGF1dGhvcml6YXRpb246IHN0cmluZywgdG86IHN0cmluZywgc3ViamVjdDogc3RyaW5nLCB0ZXh0Qm9keT86IHN0cmluZywgaHRtbEJvZHk/OiBzdHJpbmcpOiBQcm9taXNlPFVudW1EdG88dW5kZWZpbmVkPj4gPT4ge1xuICB0cnkge1xuICAgIHJlcXVpcmVBdXRoKGF1dGhvcml6YXRpb24pO1xuXG4gICAgY29uc3QgYm9keTogRW1haWxSZXF1ZXN0Qm9keSA9IHsgdG8sIHN1YmplY3QsIHRleHRCb2R5LCBodG1sQm9keSB9O1xuICAgIHZhbGlkYXRlRW1haWxSZXF1ZXN0Qm9keShib2R5KTtcblxuICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGJhc2VVcmw6IGNvbmZpZ0RhdGEuU2FhU1VybCxcbiAgICAgIGVuZFBvaW50OiAnZW1haWwnLFxuICAgICAgaGVhZGVyOiB7IEF1dGhvcml6YXRpb246IGF1dGhvcml6YXRpb24gfSxcbiAgICAgIGRhdGE6IGJvZHlcbiAgICB9O1xuXG4gICAgLy8gY29uc3QgYXBpUmVzcG9uc2UgPSBhd2FpdCBtYWtlTmV0d29ya1JlcXVlc3Q8RW1haWxSZXNwb25zZUJvZHk+KGRhdGEpO1xuICAgIGNvbnN0IGFwaVJlc3BvbnNlID0gYXdhaXQgbWFrZU5ldHdvcmtSZXF1ZXN0PEVtYWlsUmVzcG9uc2VCb2R5PihkYXRhKTtcblxuICAgIGNvbnN0IGF1dGhUb2tlbjogc3RyaW5nID0gaGFuZGxlQXV0aFRva2VuKGFwaVJlc3BvbnNlKTtcblxuICAgIGNvbnN0IHJlc3VsdDogVW51bUR0bzx1bmRlZmluZWQ+ID0ge1xuICAgICAgYXV0aFRva2VuLFxuICAgICAgYm9keTogdW5kZWZpbmVkXG4gICAgfTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2dnZXIuZXJyb3IoYEVycm9yIHNlbmRpbmdFbWFpbCB0aHJvdWdoIFVudW1JRCdzIHNhYXMuICR7ZX1gKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuIl19