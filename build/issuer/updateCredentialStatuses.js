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
exports.updateCredentialStatuses = void 0;
var config_1 = require("../config");
var requireAuth_1 = require("../requireAuth");
var logger_1 = __importDefault(require("../logger"));
var types_1 = require("@unumid/types");
var error_1 = require("../utils/error");
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
var helpers_1 = require("../utils/helpers");
var queryStringHelper_1 = require("../utils/queryStringHelper");
/**
 * Helper to validate request inputs.
 * @param req Request
 */
var validateInputs = function (credentialIds, status) {
    // Credential ID is mandatory.
    if (helpers_1.isArrayEmpty(credentialIds)) {
        throw new error_1.CustError(400, 'credentialIds are required.');
    }
    try {
        types_1._CredentialStatusOptions.check(status);
    }
    catch (e) {
        throw new error_1.CustError(400, 'status does not match a valid CredentialStatusOptions string literal.');
    }
};
/**
 * Handler to change a credential's status. It relays the updated credential metadata to UnumID's SaaS.
 * @param authorization string // auth string
 * @param credentialId string // id of credential to revoke
 * @param status CredentialStatusOptions // status to update the credential to (defaults to 'revoked')
 */
exports.updateCredentialStatuses = function (authorization, credentialIds, status) {
    if (status === void 0) { status = 'revoked'; }
    return __awaiter(void 0, void 0, void 0, function () {
        var query, restData, response, authToken, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    requireAuth_1.requireAuth(authorization);
                    validateInputs(credentialIds, status);
                    query = queryStringHelper_1.createListQueryString('credentialId', credentialIds);
                    restData = {
                        method: 'PATCH',
                        baseUrl: config_1.configData.SaaSUrl,
                        endPoint: "credentialStatus?" + query,
                        header: { Authorization: authorization },
                        data: { status: status }
                    };
                    return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(restData)];
                case 1:
                    response = _a.sent();
                    authToken = networkRequestHelper_1.handleAuthTokenHeader(response, authorization);
                    result = {
                        authToken: authToken,
                        body: undefined
                    };
                    return [2 /*return*/, result];
                case 2:
                    error_2 = _a.sent();
                    logger_1.default.error("Error revoking a credential with UnumID SaaS. " + error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlQ3JlZGVudGlhbFN0YXR1c2VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2lzc3Vlci91cGRhdGVDcmVkZW50aWFsU3RhdHVzZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsb0NBQXVDO0FBQ3ZDLDhDQUE2QztBQUc3QyxxREFBK0I7QUFDL0IsdUNBQTJGO0FBQzNGLHdDQUEyQztBQUMzQyxzRUFBMEY7QUFDMUYsNENBQWlFO0FBRWpFLGdFQUFtRTtBQUVuRTs7O0dBR0c7QUFDSCxJQUFNLGNBQWMsR0FBRyxVQUFDLGFBQXVCLEVBQUUsTUFBK0I7SUFDOUUsOEJBQThCO0lBQzlCLElBQUksc0JBQVksQ0FBQyxhQUFhLENBQUMsRUFBRTtRQUMvQixNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztLQUN6RDtJQUVELElBQUk7UUFDRixnQ0FBd0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDeEM7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSx1RUFBdUUsQ0FBQyxDQUFDO0tBQ25HO0FBQ0gsQ0FBQyxDQUFDO0FBRUY7Ozs7O0dBS0c7QUFDVSxRQUFBLHdCQUF3QixHQUFHLFVBQU8sYUFBcUIsRUFBRSxhQUF1QixFQUFFLE1BQTJDO0lBQTNDLHVCQUFBLEVBQUEsa0JBQTJDOzs7Ozs7O29CQUV0SSx5QkFBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUUzQixjQUFjLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUVoQyxLQUFLLEdBQUcseUNBQXFCLENBQUMsY0FBYyxFQUFFLGFBQWEsQ0FBQyxDQUFDO29CQUU3RCxRQUFRLEdBQWE7d0JBQ3pCLE1BQU0sRUFBRSxPQUFPO3dCQUNmLE9BQU8sRUFBRSxtQkFBVSxDQUFDLE9BQU87d0JBQzNCLFFBQVEsRUFBRSxzQkFBb0IsS0FBTzt3QkFDckMsTUFBTSxFQUFFLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRTt3QkFDeEMsSUFBSSxFQUFFLEVBQUUsTUFBTSxRQUFBLEVBQUU7cUJBQ2pCLENBQUM7b0JBR3dCLHFCQUFNLHlDQUFrQixDQUF1QixRQUFRLENBQUMsRUFBQTs7b0JBQTVFLFFBQVEsR0FBWSxTQUF3RDtvQkFFNUUsU0FBUyxHQUFXLDRDQUFxQixDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztvQkFFbkUsTUFBTSxHQUF1Qjt3QkFDakMsU0FBUyxXQUFBO3dCQUNULElBQUksRUFBRSxTQUFTO3FCQUNoQixDQUFDO29CQUVGLHNCQUFPLE1BQU0sRUFBQzs7O29CQUVkLGdCQUFNLENBQUMsS0FBSyxDQUFDLG1EQUFpRCxPQUFPLENBQUMsQ0FBQztvQkFDdkUsTUFBTSxPQUFLLENBQUM7Ozs7O0NBRWYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNvbmZpZ0RhdGEgfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgcmVxdWlyZUF1dGggfSBmcm9tICcuLi9yZXF1aXJlQXV0aCc7XG5cbmltcG9ydCB7IFJFU1REYXRhLCBVbnVtRHRvIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IHsgQ3JlZGVudGlhbFN0YXR1c09wdGlvbnMsIEpTT05PYmosIF9DcmVkZW50aWFsU3RhdHVzT3B0aW9ucyB9IGZyb20gJ0B1bnVtaWQvdHlwZXMnO1xuaW1wb3J0IHsgQ3VzdEVycm9yIH0gZnJvbSAnLi4vdXRpbHMvZXJyb3InO1xuaW1wb3J0IHsgaGFuZGxlQXV0aFRva2VuSGVhZGVyLCBtYWtlTmV0d29ya1JlcXVlc3QgfSBmcm9tICcuLi91dGlscy9uZXR3b3JrUmVxdWVzdEhlbHBlcic7XG5pbXBvcnQgeyBpc0FycmF5RW1wdHksIGlzQXJyYXlOb3RFbXB0eSB9IGZyb20gJy4uL3V0aWxzL2hlbHBlcnMnO1xuaW1wb3J0IHsgQ3JlZGVudGlhbFN0YXR1c2VzT3B0aW9ucyB9IGZyb20gJ0B1bnVtaWQvdHlwZXMvYnVpbGQvcHJvdG9zL2NyZWRlbnRpYWwnO1xuaW1wb3J0IHsgY3JlYXRlTGlzdFF1ZXJ5U3RyaW5nIH0gZnJvbSAnLi4vdXRpbHMvcXVlcnlTdHJpbmdIZWxwZXInO1xuXG4vKipcbiAqIEhlbHBlciB0byB2YWxpZGF0ZSByZXF1ZXN0IGlucHV0cy5cbiAqIEBwYXJhbSByZXEgUmVxdWVzdFxuICovXG5jb25zdCB2YWxpZGF0ZUlucHV0cyA9IChjcmVkZW50aWFsSWRzOiBzdHJpbmdbXSwgc3RhdHVzOiBDcmVkZW50aWFsU3RhdHVzT3B0aW9ucyk6IHZvaWQgPT4ge1xuICAvLyBDcmVkZW50aWFsIElEIGlzIG1hbmRhdG9yeS5cbiAgaWYgKGlzQXJyYXlFbXB0eShjcmVkZW50aWFsSWRzKSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnY3JlZGVudGlhbElkcyBhcmUgcmVxdWlyZWQuJyk7XG4gIH1cblxuICB0cnkge1xuICAgIF9DcmVkZW50aWFsU3RhdHVzT3B0aW9ucy5jaGVjayhzdGF0dXMpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdzdGF0dXMgZG9lcyBub3QgbWF0Y2ggYSB2YWxpZCBDcmVkZW50aWFsU3RhdHVzT3B0aW9ucyBzdHJpbmcgbGl0ZXJhbC4nKTtcbiAgfVxufTtcblxuLyoqXG4gKiBIYW5kbGVyIHRvIGNoYW5nZSBhIGNyZWRlbnRpYWwncyBzdGF0dXMuIEl0IHJlbGF5cyB0aGUgdXBkYXRlZCBjcmVkZW50aWFsIG1ldGFkYXRhIHRvIFVudW1JRCdzIFNhYVMuXG4gKiBAcGFyYW0gYXV0aG9yaXphdGlvbiBzdHJpbmcgLy8gYXV0aCBzdHJpbmdcbiAqIEBwYXJhbSBjcmVkZW50aWFsSWQgc3RyaW5nIC8vIGlkIG9mIGNyZWRlbnRpYWwgdG8gcmV2b2tlXG4gKiBAcGFyYW0gc3RhdHVzIENyZWRlbnRpYWxTdGF0dXNPcHRpb25zIC8vIHN0YXR1cyB0byB1cGRhdGUgdGhlIGNyZWRlbnRpYWwgdG8gKGRlZmF1bHRzIHRvICdyZXZva2VkJylcbiAqL1xuZXhwb3J0IGNvbnN0IHVwZGF0ZUNyZWRlbnRpYWxTdGF0dXNlcyA9IGFzeW5jIChhdXRob3JpemF0aW9uOiBzdHJpbmcsIGNyZWRlbnRpYWxJZHM6IHN0cmluZ1tdLCBzdGF0dXM6IENyZWRlbnRpYWxTdGF0dXNPcHRpb25zID0gJ3Jldm9rZWQnKTogUHJvbWlzZTxVbnVtRHRvPHVuZGVmaW5lZD4+ID0+IHtcbiAgdHJ5IHtcbiAgICByZXF1aXJlQXV0aChhdXRob3JpemF0aW9uKTtcblxuICAgIHZhbGlkYXRlSW5wdXRzKGNyZWRlbnRpYWxJZHMsIHN0YXR1cyk7XG5cbiAgICBjb25zdCBxdWVyeSA9IGNyZWF0ZUxpc3RRdWVyeVN0cmluZygnY3JlZGVudGlhbElkJywgY3JlZGVudGlhbElkcyk7XG5cbiAgICBjb25zdCByZXN0RGF0YTogUkVTVERhdGEgPSB7XG4gICAgICBtZXRob2Q6ICdQQVRDSCcsXG4gICAgICBiYXNlVXJsOiBjb25maWdEYXRhLlNhYVNVcmwsXG4gICAgICBlbmRQb2ludDogYGNyZWRlbnRpYWxTdGF0dXM/JHtxdWVyeX1gLFxuICAgICAgaGVhZGVyOiB7IEF1dGhvcml6YXRpb246IGF1dGhvcml6YXRpb24gfSxcbiAgICAgIGRhdGE6IHsgc3RhdHVzIH1cbiAgICB9O1xuXG4gICAgLy8gbWFrZSByZXF1ZXN0IHRvIFNhYVMgdG8gdXBkYXRlIHRoZSBDcmVkZW50aWFsU3RhdHVzXG4gICAgY29uc3QgcmVzcG9uc2U6IEpTT05PYmogPSBhd2FpdCBtYWtlTmV0d29ya1JlcXVlc3Q8eyBzdWNjZXNzOiBib29sZWFuIH0+KHJlc3REYXRhKTtcblxuICAgIGNvbnN0IGF1dGhUb2tlbjogc3RyaW5nID0gaGFuZGxlQXV0aFRva2VuSGVhZGVyKHJlc3BvbnNlLCBhdXRob3JpemF0aW9uKTtcblxuICAgIGNvbnN0IHJlc3VsdDogVW51bUR0bzx1bmRlZmluZWQ+ID0ge1xuICAgICAgYXV0aFRva2VuLFxuICAgICAgYm9keTogdW5kZWZpbmVkXG4gICAgfTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKGBFcnJvciByZXZva2luZyBhIGNyZWRlbnRpYWwgd2l0aCBVbnVtSUQgU2FhUy4gJHtlcnJvcn1gKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcbiJdfQ==