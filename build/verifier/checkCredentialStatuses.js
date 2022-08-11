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
exports.checkCredentialStatuses = void 0;
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
var config_1 = require("../config");
var logger_1 = __importDefault(require("../logger"));
/**
 * Function to check the status of one or more credentials by credentialId (valid, revoked, etc)
 * @param {string} authorization
 * @param {string[]} credentialIds
 * @returns {Promise<UnumDto<CredentialIdToStatusMap>>} a promise resolving to an UnumDto containing a list of zero or more CredentialStatuses
 */
exports.checkCredentialStatuses = function (authorization, credentialIds) { return __awaiter(void 0, void 0, void 0, function () {
    var searchParams, searchParamsString, options, credentialStatusesResponse, authToken, credentialIdToStatusMap, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                searchParams = new URLSearchParams();
                credentialIds.forEach(function (credentialId) { return searchParams.append('credentialId', credentialId); });
                searchParamsString = searchParams.toString();
                options = {
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: "credentialStatus?" + searchParamsString,
                    method: 'GET',
                    header: { Authorization: authorization }
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(options)];
            case 2:
                credentialStatusesResponse = _a.sent();
                authToken = networkRequestHelper_1.handleAuthTokenHeader(credentialStatusesResponse, authorization);
                credentialIdToStatusMap = credentialStatusesResponse.body.reduce(function (previous, current) {
                    var _a;
                    return __assign(__assign({}, previous), (_a = {}, _a[current.credentialId] = current, _a));
                }, {});
                return [2 /*return*/, {
                        authToken: authToken,
                        body: credentialIdToStatusMap
                    }];
            case 3:
                e_1 = _a.sent();
                logger_1.default.error('Error getting credential statuses', e_1);
                throw e_1;
            case 4: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tDcmVkZW50aWFsU3RhdHVzZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdmVyaWZpZXIvY2hlY2tDcmVkZW50aWFsU3RhdHVzZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFPQSxzRUFBMEY7QUFDMUYsb0NBQXVDO0FBQ3ZDLHFEQUErQjtBQUUvQjs7Ozs7R0FLRztBQUNVLFFBQUEsdUJBQXVCLEdBQUcsVUFDckMsYUFBcUIsRUFDckIsYUFBdUI7Ozs7O2dCQUVqQixZQUFZLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztnQkFFM0MsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFBLFlBQVksSUFBSSxPQUFBLFlBQVksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxFQUFqRCxDQUFpRCxDQUFDLENBQUM7Z0JBRW5GLGtCQUFrQixHQUFHLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDN0MsT0FBTyxHQUFHO29CQUNkLE9BQU8sRUFBRSxtQkFBVSxDQUFDLE9BQU87b0JBQzNCLFFBQVEsRUFBRSxzQkFBb0Isa0JBQW9CO29CQUNsRCxNQUFNLEVBQUUsS0FBSztvQkFDYixNQUFNLEVBQUUsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFO2lCQUN6QyxDQUFDOzs7O2dCQUdtQyxxQkFBTSx5Q0FBa0IsQ0FBeUIsT0FBTyxDQUFDLEVBQUE7O2dCQUF0RiwwQkFBMEIsR0FBRyxTQUF5RDtnQkFDdEYsU0FBUyxHQUFHLDRDQUFxQixDQUFDLDBCQUEwQixFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUU3RSx1QkFBdUIsR0FBNEIsMEJBQTBCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FDN0YsVUFBQyxRQUFRLEVBQUUsT0FBTzs7b0JBQ2hCLDZCQUNLLFFBQVEsZ0JBQ1YsT0FBTyxDQUFDLFlBQVksSUFBRyxPQUFPLE9BQy9CO2dCQUNKLENBQUMsRUFDRCxFQUFFLENBQ0gsQ0FBQztnQkFFRixzQkFBTzt3QkFDTCxTQUFTLFdBQUE7d0JBQ1QsSUFBSSxFQUFFLHVCQUF1QjtxQkFDOUIsRUFBQzs7O2dCQUVGLGdCQUFNLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxFQUFFLEdBQUMsQ0FBQyxDQUFDO2dCQUNyRCxNQUFNLEdBQUMsQ0FBQzs7OztLQUVYLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIE5PVEU6IFRoaXMgZG9lc24ndCByZWFsbHkgYmVsb25nIHVuZGVyIC92ZXJpZmllciwgYXMgaXQgbWF5IGJlIHVzZWQgYnkgYW55b25lXG4gKiAoYW5kIGluIGZhY3Qgd2FzIHdyaXR0ZW4gZm9yIHVzZSBieSBzdWJqZWN0cyBpbiB0aGUgd2ViIHdhbGxldCBzZXJ2ZXIpXG4gKi9cbmltcG9ydCB7IENyZWRlbnRpYWxJZFRvU3RhdHVzTWFwLCBDcmVkZW50aWFsU3RhdHVzSW5mbyB9IGZyb20gJ0B1bnVtaWQvdHlwZXMnO1xuXG5pbXBvcnQgeyBVbnVtRHRvIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgbWFrZU5ldHdvcmtSZXF1ZXN0LCBoYW5kbGVBdXRoVG9rZW5IZWFkZXIgfSBmcm9tICcuLi91dGlscy9uZXR3b3JrUmVxdWVzdEhlbHBlcic7XG5pbXBvcnQgeyBjb25maWdEYXRhIH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi4vbG9nZ2VyJztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjaGVjayB0aGUgc3RhdHVzIG9mIG9uZSBvciBtb3JlIGNyZWRlbnRpYWxzIGJ5IGNyZWRlbnRpYWxJZCAodmFsaWQsIHJldm9rZWQsIGV0YylcbiAqIEBwYXJhbSB7c3RyaW5nfSBhdXRob3JpemF0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBjcmVkZW50aWFsSWRzXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxVbnVtRHRvPENyZWRlbnRpYWxJZFRvU3RhdHVzTWFwPj59IGEgcHJvbWlzZSByZXNvbHZpbmcgdG8gYW4gVW51bUR0byBjb250YWluaW5nIGEgbGlzdCBvZiB6ZXJvIG9yIG1vcmUgQ3JlZGVudGlhbFN0YXR1c2VzXG4gKi9cbmV4cG9ydCBjb25zdCBjaGVja0NyZWRlbnRpYWxTdGF0dXNlcyA9IGFzeW5jIChcbiAgYXV0aG9yaXphdGlvbjogc3RyaW5nLFxuICBjcmVkZW50aWFsSWRzOiBzdHJpbmdbXVxuKTogUHJvbWlzZTxVbnVtRHRvPENyZWRlbnRpYWxJZFRvU3RhdHVzTWFwPj4gPT4ge1xuICBjb25zdCBzZWFyY2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKCk7XG5cbiAgY3JlZGVudGlhbElkcy5mb3JFYWNoKGNyZWRlbnRpYWxJZCA9PiBzZWFyY2hQYXJhbXMuYXBwZW5kKCdjcmVkZW50aWFsSWQnLCBjcmVkZW50aWFsSWQpKTtcblxuICBjb25zdCBzZWFyY2hQYXJhbXNTdHJpbmcgPSBzZWFyY2hQYXJhbXMudG9TdHJpbmcoKTtcbiAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICBiYXNlVXJsOiBjb25maWdEYXRhLlNhYVNVcmwsXG4gICAgZW5kUG9pbnQ6IGBjcmVkZW50aWFsU3RhdHVzPyR7c2VhcmNoUGFyYW1zU3RyaW5nfWAsXG4gICAgbWV0aG9kOiAnR0VUJyxcbiAgICBoZWFkZXI6IHsgQXV0aG9yaXphdGlvbjogYXV0aG9yaXphdGlvbiB9XG4gIH07XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBjcmVkZW50aWFsU3RhdHVzZXNSZXNwb25zZSA9IGF3YWl0IG1ha2VOZXR3b3JrUmVxdWVzdDxDcmVkZW50aWFsU3RhdHVzSW5mb1tdPihvcHRpb25zKTtcbiAgICBjb25zdCBhdXRoVG9rZW4gPSBoYW5kbGVBdXRoVG9rZW5IZWFkZXIoY3JlZGVudGlhbFN0YXR1c2VzUmVzcG9uc2UsIGF1dGhvcml6YXRpb24pO1xuXG4gICAgY29uc3QgY3JlZGVudGlhbElkVG9TdGF0dXNNYXA6IENyZWRlbnRpYWxJZFRvU3RhdHVzTWFwID0gY3JlZGVudGlhbFN0YXR1c2VzUmVzcG9uc2UuYm9keS5yZWR1Y2U8Q3JlZGVudGlhbElkVG9TdGF0dXNNYXA+KFxuICAgICAgKHByZXZpb3VzLCBjdXJyZW50KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4ucHJldmlvdXMsXG4gICAgICAgICAgW2N1cnJlbnQuY3JlZGVudGlhbElkXTogY3VycmVudFxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICAgIHt9XG4gICAgKTtcblxuICAgIHJldHVybiB7XG4gICAgICBhdXRoVG9rZW4sXG4gICAgICBib2R5OiBjcmVkZW50aWFsSWRUb1N0YXR1c01hcFxuICAgIH07XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGdldHRpbmcgY3JlZGVudGlhbCBzdGF0dXNlcycsIGUpO1xuICAgIHRocm93IGU7XG4gIH1cbn07XG4iXX0=