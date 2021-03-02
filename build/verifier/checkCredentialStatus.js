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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCredentialStatus = void 0;
var library_issuer_verifier_utility_1 = require("@unumid/library-issuer-verifier-utility");
var config_1 = require("../config");
/**
 * Helper to check the status of a credential: verified, revoked, etc.
 * @param credential
 * @param authHeader
 */
exports.checkCredentialStatus = function (credential, authHeader) { return __awaiter(void 0, void 0, void 0, function () {
    var options, credentialStatusResponse, credentialStatus, authToken, valid, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                options = {
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: "credentialStatus/" + credential.id,
                    method: 'GET',
                    header: { Authorization: authHeader }
                };
                return [4 /*yield*/, library_issuer_verifier_utility_1.makeNetworkRequest(options)];
            case 1:
                credentialStatusResponse = _a.sent();
                credentialStatus = credentialStatusResponse.body;
                authToken = library_issuer_verifier_utility_1.handleAuthToken(credentialStatusResponse);
                valid = credentialStatus.status === 'valid';
                result = {
                    authToken: authToken,
                    body: valid
                };
                return [2 /*return*/, result];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tDcmVkZW50aWFsU3RhdHVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3ZlcmlmaWVyL2NoZWNrQ3JlZGVudGlhbFN0YXR1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyRkFBOEY7QUFHOUYsb0NBQXVDO0FBRXZDOzs7O0dBSUc7QUFDVSxRQUFBLHFCQUFxQixHQUFHLFVBQU8sVUFBZ0MsRUFBRSxVQUFrQjs7Ozs7Z0JBQ3hGLE9BQU8sR0FBRztvQkFDZCxPQUFPLEVBQUUsbUJBQVUsQ0FBQyxPQUFPO29CQUMzQixRQUFRLEVBQUUsc0JBQW9CLFVBQVUsQ0FBQyxFQUFJO29CQUM3QyxNQUFNLEVBQUUsS0FBSztvQkFDYixNQUFNLEVBQUUsRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFO2lCQUN0QyxDQUFDO2dCQUUrQixxQkFBTSxvREFBa0IsQ0FBbUIsT0FBTyxDQUFDLEVBQUE7O2dCQUE5RSx3QkFBd0IsR0FBRyxTQUFtRDtnQkFDOUUsZ0JBQWdCLEdBQUcsd0JBQXdCLENBQUMsSUFBSSxDQUFDO2dCQUNqRCxTQUFTLEdBQVcsaURBQWUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO2dCQUU5RCxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxLQUFLLE9BQU8sQ0FBQztnQkFDNUMsTUFBTSxHQUFxQjtvQkFDL0IsU0FBUyxXQUFBO29CQUNULElBQUksRUFBRSxLQUFLO2lCQUNaLENBQUM7Z0JBRUYsc0JBQU8sTUFBTSxFQUFDOzs7S0FDZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaGFuZGxlQXV0aFRva2VuLCBtYWtlTmV0d29ya1JlcXVlc3QgfSBmcm9tICdAdW51bWlkL2xpYnJhcnktaXNzdWVyLXZlcmlmaWVyLXV0aWxpdHknO1xuXG5pbXBvcnQgeyBWZXJpZmlhYmxlQ3JlZGVudGlhbCwgQ3JlZGVudGlhbFN0YXR1cywgVW51bUR0byB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IGNvbmZpZ0RhdGEgfSBmcm9tICcuLi9jb25maWcnO1xuXG4vKipcbiAqIEhlbHBlciB0byBjaGVjayB0aGUgc3RhdHVzIG9mIGEgY3JlZGVudGlhbDogdmVyaWZpZWQsIHJldm9rZWQsIGV0Yy5cbiAqIEBwYXJhbSBjcmVkZW50aWFsXG4gKiBAcGFyYW0gYXV0aEhlYWRlclxuICovXG5leHBvcnQgY29uc3QgY2hlY2tDcmVkZW50aWFsU3RhdHVzID0gYXN5bmMgKGNyZWRlbnRpYWw6IFZlcmlmaWFibGVDcmVkZW50aWFsLCBhdXRoSGVhZGVyOiBzdHJpbmcpOiBQcm9taXNlPFVudW1EdG88Ym9vbGVhbj4+ID0+IHtcbiAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICBiYXNlVXJsOiBjb25maWdEYXRhLlNhYVNVcmwsXG4gICAgZW5kUG9pbnQ6IGBjcmVkZW50aWFsU3RhdHVzLyR7Y3JlZGVudGlhbC5pZH1gLFxuICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgaGVhZGVyOiB7IEF1dGhvcml6YXRpb246IGF1dGhIZWFkZXIgfVxuICB9O1xuXG4gIGNvbnN0IGNyZWRlbnRpYWxTdGF0dXNSZXNwb25zZSA9IGF3YWl0IG1ha2VOZXR3b3JrUmVxdWVzdDxDcmVkZW50aWFsU3RhdHVzPihvcHRpb25zKTtcbiAgY29uc3QgY3JlZGVudGlhbFN0YXR1cyA9IGNyZWRlbnRpYWxTdGF0dXNSZXNwb25zZS5ib2R5O1xuICBjb25zdCBhdXRoVG9rZW46IHN0cmluZyA9IGhhbmRsZUF1dGhUb2tlbihjcmVkZW50aWFsU3RhdHVzUmVzcG9uc2UpO1xuXG4gIGNvbnN0IHZhbGlkID0gY3JlZGVudGlhbFN0YXR1cy5zdGF0dXMgPT09ICd2YWxpZCc7XG4gIGNvbnN0IHJlc3VsdDogVW51bUR0bzxib29sZWFuPiA9IHtcbiAgICBhdXRoVG9rZW4sXG4gICAgYm9keTogdmFsaWRcbiAgfTtcblxuICByZXR1cm4gcmVzdWx0O1xufTtcbiJdfQ==