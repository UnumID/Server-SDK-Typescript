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
exports.sendPresentationVerifiedReceipt = void 0;
var config_1 = require("../config");
var logger_1 = __importDefault(require("../logger"));
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
/**
 * Helper to send a PresentationVerified Receipt to the Unum ID SaaS
 * @param authorization
 * @param verifier
 * @param subject
 * @param reply
 * @param isVerified
 * @param reason
 * @param issuers
 * @param credentialTypes
 * @returns
 */
function sendPresentationVerifiedReceipt(authorization, verifier, subject, reply, isVerified, requestId, requestUuid, reason, issuers, credentialTypes, credentialIds) {
    if (issuers === void 0) { issuers = []; }
    if (credentialTypes === void 0) { credentialTypes = []; }
    if (credentialIds === void 0) { credentialIds = []; }
    return __awaiter(this, void 0, void 0, function () {
        var receiptOptions, receiptCallOptions, resp, authToken, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    receiptOptions = {
                        type: 'PresentationVerified',
                        verifier: verifier,
                        subject: subject,
                        data: {
                            reply: reply,
                            isVerified: isVerified,
                            reason: reason,
                            credentialTypes: credentialTypes,
                            credentialIds: credentialIds,
                            issuers: issuers,
                            requestId: requestId,
                            requestUuid: requestUuid
                        }
                    };
                    receiptCallOptions = {
                        method: 'POST',
                        baseUrl: config_1.configData.SaaSUrl,
                        endPoint: 'receipt',
                        header: { Authorization: authorization },
                        data: receiptOptions
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(receiptCallOptions)];
                case 2:
                    resp = _a.sent();
                    authToken = networkRequestHelper_1.handleAuthTokenHeader(resp, authorization);
                    return [2 /*return*/, authToken];
                case 3:
                    e_1 = _a.sent();
                    logger_1.default.error("Error sending PresentationVerified Receipt to Unum ID SaaS. Error " + e_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, authorization];
            }
        });
    });
}
exports.sendPresentationVerifiedReceipt = sendPresentationVerifiedReceipt;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VuZFByZXNlbnRhdGlvblZlcmlmaWVkUmVjZWlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92ZXJpZmllci9zZW5kUHJlc2VudGF0aW9uVmVyaWZpZWRSZWNlaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLG9DQUF1QztBQUN2QyxxREFBK0I7QUFFL0Isc0VBQTBGO0FBRTFGOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsU0FBc0IsK0JBQStCLENBQUUsYUFBcUIsRUFBRSxRQUFnQixFQUFFLE9BQWUsRUFBRSxLQUFhLEVBQUUsVUFBbUIsRUFBRSxTQUFpQixFQUFFLFdBQW1CLEVBQUUsTUFBZSxFQUFFLE9BQXNCLEVBQUUsZUFBOEIsRUFBRSxhQUE0QjtJQUFwRix3QkFBQSxFQUFBLFlBQXNCO0lBQUUsZ0NBQUEsRUFBQSxvQkFBOEI7SUFBRSw4QkFBQSxFQUFBLGtCQUE0Qjs7Ozs7O29CQUMxUixjQUFjLEdBQUc7d0JBQ3JCLElBQUksRUFBRSxzQkFBc0I7d0JBQzVCLFFBQVEsVUFBQTt3QkFDUixPQUFPLFNBQUE7d0JBQ1AsSUFBSSxFQUFFOzRCQUNKLEtBQUssT0FBQTs0QkFDTCxVQUFVLFlBQUE7NEJBQ1YsTUFBTSxRQUFBOzRCQUNOLGVBQWUsaUJBQUE7NEJBQ2YsYUFBYSxlQUFBOzRCQUNiLE9BQU8sU0FBQTs0QkFDUCxTQUFTLFdBQUE7NEJBQ1QsV0FBVyxhQUFBO3lCQUNaO3FCQUNGLENBQUM7b0JBRUksa0JBQWtCLEdBQWE7d0JBQ25DLE1BQU0sRUFBRSxNQUFNO3dCQUNkLE9BQU8sRUFBRSxtQkFBVSxDQUFDLE9BQU87d0JBQzNCLFFBQVEsRUFBRSxTQUFTO3dCQUNuQixNQUFNLEVBQUUsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFO3dCQUN4QyxJQUFJLEVBQUUsY0FBYztxQkFDckIsQ0FBQzs7OztvQkFHc0IscUJBQU0seUNBQWtCLENBQVUsa0JBQWtCLENBQUMsRUFBQTs7b0JBQXJFLElBQUksR0FBWSxTQUFxRDtvQkFFckUsU0FBUyxHQUFHLDRDQUFxQixDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQztvQkFFN0Qsc0JBQU8sU0FBUyxFQUFDOzs7b0JBRWpCLGdCQUFNLENBQUMsS0FBSyxDQUFDLHVFQUFxRSxHQUFHLENBQUMsQ0FBQzs7d0JBR3pGLHNCQUFPLGFBQWEsRUFBQzs7OztDQUN0QjtBQXBDRCwwRUFvQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBKU09OT2JqIH0gZnJvbSAnQHVudW1pZC90eXBlcyc7XG5pbXBvcnQgeyBjb25maWdEYXRhIH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCB7IFJFU1REYXRhIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgaGFuZGxlQXV0aFRva2VuSGVhZGVyLCBtYWtlTmV0d29ya1JlcXVlc3QgfSBmcm9tICcuLi91dGlscy9uZXR3b3JrUmVxdWVzdEhlbHBlcic7XG5cbi8qKlxuICogSGVscGVyIHRvIHNlbmQgYSBQcmVzZW50YXRpb25WZXJpZmllZCBSZWNlaXB0IHRvIHRoZSBVbnVtIElEIFNhYVNcbiAqIEBwYXJhbSBhdXRob3JpemF0aW9uXG4gKiBAcGFyYW0gdmVyaWZpZXJcbiAqIEBwYXJhbSBzdWJqZWN0XG4gKiBAcGFyYW0gcmVwbHlcbiAqIEBwYXJhbSBpc1ZlcmlmaWVkXG4gKiBAcGFyYW0gcmVhc29uXG4gKiBAcGFyYW0gaXNzdWVyc1xuICogQHBhcmFtIGNyZWRlbnRpYWxUeXBlc1xuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlbmRQcmVzZW50YXRpb25WZXJpZmllZFJlY2VpcHQgKGF1dGhvcml6YXRpb246IHN0cmluZywgdmVyaWZpZXI6IHN0cmluZywgc3ViamVjdDogc3RyaW5nLCByZXBseTogc3RyaW5nLCBpc1ZlcmlmaWVkOiBib29sZWFuLCByZXF1ZXN0SWQ6IHN0cmluZywgcmVxdWVzdFV1aWQ6IHN0cmluZywgcmVhc29uPzogc3RyaW5nLCBpc3N1ZXJzOiBzdHJpbmdbXSA9IFtdLCBjcmVkZW50aWFsVHlwZXM6IHN0cmluZ1tdID0gW10sIGNyZWRlbnRpYWxJZHM6IHN0cmluZ1tdID0gW10pOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCByZWNlaXB0T3B0aW9ucyA9IHtcbiAgICB0eXBlOiAnUHJlc2VudGF0aW9uVmVyaWZpZWQnLFxuICAgIHZlcmlmaWVyLFxuICAgIHN1YmplY3QsXG4gICAgZGF0YToge1xuICAgICAgcmVwbHksXG4gICAgICBpc1ZlcmlmaWVkLFxuICAgICAgcmVhc29uLFxuICAgICAgY3JlZGVudGlhbFR5cGVzLFxuICAgICAgY3JlZGVudGlhbElkcyxcbiAgICAgIGlzc3VlcnMsXG4gICAgICByZXF1ZXN0SWQsXG4gICAgICByZXF1ZXN0VXVpZFxuICAgIH1cbiAgfTtcblxuICBjb25zdCByZWNlaXB0Q2FsbE9wdGlvbnM6IFJFU1REYXRhID0ge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGJhc2VVcmw6IGNvbmZpZ0RhdGEuU2FhU1VybCxcbiAgICBlbmRQb2ludDogJ3JlY2VpcHQnLFxuICAgIGhlYWRlcjogeyBBdXRob3JpemF0aW9uOiBhdXRob3JpemF0aW9uIH0sXG4gICAgZGF0YTogcmVjZWlwdE9wdGlvbnNcbiAgfTtcblxuICB0cnkge1xuICAgIGNvbnN0IHJlc3A6IEpTT05PYmogPSBhd2FpdCBtYWtlTmV0d29ya1JlcXVlc3Q8SlNPTk9iaj4ocmVjZWlwdENhbGxPcHRpb25zKTtcblxuICAgIGNvbnN0IGF1dGhUb2tlbiA9IGhhbmRsZUF1dGhUb2tlbkhlYWRlcihyZXNwLCBhdXRob3JpemF0aW9uKTtcblxuICAgIHJldHVybiBhdXRoVG9rZW47XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2dnZXIuZXJyb3IoYEVycm9yIHNlbmRpbmcgUHJlc2VudGF0aW9uVmVyaWZpZWQgUmVjZWlwdCB0byBVbnVtIElEIFNhYVMuIEVycm9yICR7ZX1gKTtcbiAgfVxuXG4gIHJldHVybiBhdXRob3JpemF0aW9uO1xufVxuIl19