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
var config_1 = require("../config");
var logger_1 = __importDefault(require("../logger"));
var requireAuth_1 = require("../requireAuth");
var error_1 = require("../utils/error");
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
/**
 * Validates the EmailRequestBody attributes.
 * @param body EmailRequestBody
 */
var validateEmailRequestBody = function (body) {
    var to = body.to, deeplink = body.deeplink;
    if (!to) {
        throw new error_1.CustError(400, 'to is required.');
    }
    if (!deeplink) {
        throw new error_1.CustError(400, 'deeplink is required.');
    }
    if (typeof to !== 'string') {
        throw new error_1.CustError(400, 'Invalid to: expected string.');
    }
    if (typeof deeplink !== 'string') {
        throw new error_1.CustError(400, 'Invalid deeplink: expected string.');
    }
    if (deeplink.split('presentationRequest/').length !== 2) {
        throw new error_1.CustError(400, 'Invalid deeplink: expected to end in the format presentationRequest/<uuid>.');
    }
};
/**
 * Handler to send an email using UnumID's SaaS.
 * Designed to be used with a deeplink which creates a templated message.
 * @param authorization
 * @param to
 * @param deeplink
 */
exports.sendEmail = function (authorization, to, deeplink) { return __awaiter(void 0, void 0, void 0, function () {
    var body, data, apiResponse, authToken, result, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                requireAuth_1.requireAuth(authorization);
                body = { to: to, deeplink: deeplink };
                validateEmailRequestBody(body);
                data = {
                    method: 'POST',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'email',
                    header: { Authorization: authorization },
                    data: body
                };
                return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(data)];
            case 1:
                apiResponse = _a.sent();
                authToken = networkRequestHelper_1.handleAuthTokenHeader(apiResponse, authorization);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VuZEVtYWlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3ZlcmlmaWVyL3NlbmRFbWFpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxvQ0FBdUM7QUFDdkMscURBQStCO0FBQy9CLDhDQUE2QztBQUU3Qyx3Q0FBMkM7QUFDM0Msc0VBQTBGO0FBTTFGOzs7R0FHRztBQUNILElBQU0sd0JBQXdCLEdBQUcsVUFBQyxJQUFpQztJQUN6RCxJQUFBLEVBQUUsR0FBZSxJQUFJLEdBQW5CLEVBQUUsUUFBUSxHQUFLLElBQUksU0FBVCxDQUFVO0lBRTlCLElBQUksQ0FBQyxFQUFFLEVBQUU7UUFDUCxNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztLQUM3QztJQUVELElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDYixNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztLQUNuRDtJQUVELElBQUksT0FBTyxFQUFFLEtBQUssUUFBUSxFQUFFO1FBQzFCLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO0tBQzFEO0lBRUQsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUU7UUFDaEMsTUFBTSxJQUFJLGlCQUFTLENBQUMsR0FBRyxFQUFFLG9DQUFvQyxDQUFDLENBQUM7S0FDaEU7SUFFRCxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3ZELE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSw2RUFBNkUsQ0FBQyxDQUFDO0tBQ3pHO0FBQ0gsQ0FBQyxDQUFDO0FBRUY7Ozs7OztHQU1HO0FBQ1UsUUFBQSxTQUFTLEdBQUcsVUFBTyxhQUFxQixFQUFFLEVBQVUsRUFBRSxRQUFnQjs7Ozs7O2dCQUUvRSx5QkFBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUVyQixJQUFJLEdBQWdDLEVBQUUsRUFBRSxJQUFBLEVBQUUsUUFBUSxVQUFBLEVBQUUsQ0FBQztnQkFDM0Qsd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRXpCLElBQUksR0FBRztvQkFDWCxNQUFNLEVBQUUsTUFBTTtvQkFDZCxPQUFPLEVBQUUsbUJBQVUsQ0FBQyxPQUFPO29CQUMzQixRQUFRLEVBQUUsT0FBTztvQkFDakIsTUFBTSxFQUFFLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRTtvQkFDeEMsSUFBSSxFQUFFLElBQUk7aUJBQ1gsQ0FBQztnQkFFa0IscUJBQU0seUNBQWtCLENBQW9CLElBQUksQ0FBQyxFQUFBOztnQkFBL0QsV0FBVyxHQUFHLFNBQWlEO2dCQUUvRCxTQUFTLEdBQVcsNENBQXFCLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUV0RSxNQUFNLEdBQXVCO29CQUNqQyxTQUFTLFdBQUE7b0JBQ1QsSUFBSSxFQUFFLFNBQVM7aUJBQ2hCLENBQUM7Z0JBRUYsc0JBQU8sTUFBTSxFQUFDOzs7Z0JBRWQsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsK0NBQTZDLEdBQUcsQ0FBQyxDQUFDO2dCQUMvRCxNQUFNLEdBQUMsQ0FBQzs7OztLQUVYLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFeHRlcm5hbENoYW5uZWxNZXNzYWdlSW5wdXQgfSBmcm9tICdAdW51bWlkL3R5cGVzJztcbmltcG9ydCB7IGNvbmZpZ0RhdGEgfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IHsgcmVxdWlyZUF1dGggfSBmcm9tICcuLi9yZXF1aXJlQXV0aCc7XG5pbXBvcnQgeyBVbnVtRHRvIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgQ3VzdEVycm9yIH0gZnJvbSAnLi4vdXRpbHMvZXJyb3InO1xuaW1wb3J0IHsgaGFuZGxlQXV0aFRva2VuSGVhZGVyLCBtYWtlTmV0d29ya1JlcXVlc3QgfSBmcm9tICcuLi91dGlscy9uZXR3b3JrUmVxdWVzdEhlbHBlcic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW1haWxSZXNwb25zZUJvZHkge1xuICBzdWNjZXNzOiBib29sZWFuO1xufVxuXG4vKipcbiAqIFZhbGlkYXRlcyB0aGUgRW1haWxSZXF1ZXN0Qm9keSBhdHRyaWJ1dGVzLlxuICogQHBhcmFtIGJvZHkgRW1haWxSZXF1ZXN0Qm9keVxuICovXG5jb25zdCB2YWxpZGF0ZUVtYWlsUmVxdWVzdEJvZHkgPSAoYm9keTogRXh0ZXJuYWxDaGFubmVsTWVzc2FnZUlucHV0KTogdm9pZCA9PiB7XG4gIGNvbnN0IHsgdG8sIGRlZXBsaW5rIH0gPSBib2R5O1xuXG4gIGlmICghdG8pIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ3RvIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKCFkZWVwbGluaykge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnZGVlcGxpbmsgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAodHlwZW9mIHRvICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCB0bzogZXhwZWN0ZWQgc3RyaW5nLicpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBkZWVwbGluayAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgZGVlcGxpbms6IGV4cGVjdGVkIHN0cmluZy4nKTtcbiAgfVxuXG4gIGlmIChkZWVwbGluay5zcGxpdCgncHJlc2VudGF0aW9uUmVxdWVzdC8nKS5sZW5ndGggIT09IDIpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgZGVlcGxpbms6IGV4cGVjdGVkIHRvIGVuZCBpbiB0aGUgZm9ybWF0IHByZXNlbnRhdGlvblJlcXVlc3QvPHV1aWQ+LicpO1xuICB9XG59O1xuXG4vKipcbiAqIEhhbmRsZXIgdG8gc2VuZCBhbiBlbWFpbCB1c2luZyBVbnVtSUQncyBTYWFTLlxuICogRGVzaWduZWQgdG8gYmUgdXNlZCB3aXRoIGEgZGVlcGxpbmsgd2hpY2ggY3JlYXRlcyBhIHRlbXBsYXRlZCBtZXNzYWdlLlxuICogQHBhcmFtIGF1dGhvcml6YXRpb25cbiAqIEBwYXJhbSB0b1xuICogQHBhcmFtIGRlZXBsaW5rXG4gKi9cbmV4cG9ydCBjb25zdCBzZW5kRW1haWwgPSBhc3luYyAoYXV0aG9yaXphdGlvbjogc3RyaW5nLCB0bzogc3RyaW5nLCBkZWVwbGluazogc3RyaW5nKTogUHJvbWlzZTxVbnVtRHRvPHVuZGVmaW5lZD4+ID0+IHtcbiAgdHJ5IHtcbiAgICByZXF1aXJlQXV0aChhdXRob3JpemF0aW9uKTtcblxuICAgIGNvbnN0IGJvZHk6IEV4dGVybmFsQ2hhbm5lbE1lc3NhZ2VJbnB1dCA9IHsgdG8sIGRlZXBsaW5rIH07XG4gICAgdmFsaWRhdGVFbWFpbFJlcXVlc3RCb2R5KGJvZHkpO1xuXG4gICAgY29uc3QgZGF0YSA9IHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgYmFzZVVybDogY29uZmlnRGF0YS5TYWFTVXJsLFxuICAgICAgZW5kUG9pbnQ6ICdlbWFpbCcsXG4gICAgICBoZWFkZXI6IHsgQXV0aG9yaXphdGlvbjogYXV0aG9yaXphdGlvbiB9LFxuICAgICAgZGF0YTogYm9keVxuICAgIH07XG5cbiAgICBjb25zdCBhcGlSZXNwb25zZSA9IGF3YWl0IG1ha2VOZXR3b3JrUmVxdWVzdDxFbWFpbFJlc3BvbnNlQm9keT4oZGF0YSk7XG5cbiAgICBjb25zdCBhdXRoVG9rZW46IHN0cmluZyA9IGhhbmRsZUF1dGhUb2tlbkhlYWRlcihhcGlSZXNwb25zZSwgYXV0aG9yaXphdGlvbik7XG5cbiAgICBjb25zdCByZXN1bHQ6IFVudW1EdG88dW5kZWZpbmVkPiA9IHtcbiAgICAgIGF1dGhUb2tlbixcbiAgICAgIGJvZHk6IHVuZGVmaW5lZFxuICAgIH07XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGNhdGNoIChlKSB7XG4gICAgbG9nZ2VyLmVycm9yKGBFcnJvciBzZW5kaW5nRW1haWwgdGhyb3VnaCBVbnVtSUQncyBzYWFzLiAke2V9YCk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcbiJdfQ==