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
exports.updateCredentialStatus = void 0;
var config_1 = require("../config");
var requireAuth_1 = require("../requireAuth");
var logger_1 = __importDefault(require("../logger"));
var types_1 = require("@unumid/types");
var error_1 = require("../utils/error");
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
/**
 * Helper to validate request inputs.
 * @param req Request
 */
var validateInputs = function (credentialId, status) {
    // Credential ID is mandatory.
    if (!credentialId) {
        throw new error_1.CustError(400, 'credentialId is required.');
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
exports.updateCredentialStatus = function (authorization, credentialId, status) {
    if (status === void 0) { status = 'revoked'; }
    return __awaiter(void 0, void 0, void 0, function () {
        var restData, response, authToken, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    requireAuth_1.requireAuth(authorization);
                    validateInputs(credentialId, status);
                    restData = {
                        method: 'PATCH',
                        baseUrl: config_1.configData.SaaSUrl,
                        endPoint: 'credentialStatus/?credentialId=' + credentialId,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlQ3JlZGVudGlhbFN0YXR1cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pc3N1ZXIvdXBkYXRlQ3JlZGVudGlhbFN0YXR1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvQ0FBdUM7QUFDdkMsOENBQTZDO0FBRzdDLHFEQUErQjtBQUMvQix1Q0FBMkY7QUFDM0Ysd0NBQTJDO0FBQzNDLHNFQUEwRjtBQUUxRjs7O0dBR0c7QUFDSCxJQUFNLGNBQWMsR0FBRyxVQUFDLFlBQW9CLEVBQUUsTUFBK0I7SUFDM0UsOEJBQThCO0lBQzlCLElBQUksQ0FBQyxZQUFZLEVBQUU7UUFDakIsTUFBTSxJQUFJLGlCQUFTLENBQUMsR0FBRyxFQUFFLDJCQUEyQixDQUFDLENBQUM7S0FDdkQ7SUFFRCxJQUFJO1FBQ0YsZ0NBQXdCLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3hDO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsdUVBQXVFLENBQUMsQ0FBQztLQUNuRztBQUNILENBQUMsQ0FBQztBQUVGOzs7OztHQUtHO0FBQ1UsUUFBQSxzQkFBc0IsR0FBRyxVQUFPLGFBQXFCLEVBQUUsWUFBb0IsRUFBRSxNQUEyQztJQUEzQyx1QkFBQSxFQUFBLGtCQUEyQzs7Ozs7OztvQkFFakkseUJBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFFM0IsY0FBYyxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFFL0IsUUFBUSxHQUFhO3dCQUN6QixNQUFNLEVBQUUsT0FBTzt3QkFDZixPQUFPLEVBQUUsbUJBQVUsQ0FBQyxPQUFPO3dCQUMzQixRQUFRLEVBQUUsaUNBQWlDLEdBQUcsWUFBWTt3QkFDMUQsTUFBTSxFQUFFLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRTt3QkFDeEMsSUFBSSxFQUFFLEVBQUUsTUFBTSxRQUFBLEVBQUU7cUJBQ2pCLENBQUM7b0JBR3dCLHFCQUFNLHlDQUFrQixDQUF1QixRQUFRLENBQUMsRUFBQTs7b0JBQTVFLFFBQVEsR0FBWSxTQUF3RDtvQkFFNUUsU0FBUyxHQUFXLDRDQUFxQixDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztvQkFFbkUsTUFBTSxHQUF1Qjt3QkFDakMsU0FBUyxXQUFBO3dCQUNULElBQUksRUFBRSxTQUFTO3FCQUNoQixDQUFDO29CQUVGLHNCQUFPLE1BQU0sRUFBQzs7O29CQUVkLGdCQUFNLENBQUMsS0FBSyxDQUFDLG1EQUFpRCxPQUFPLENBQUMsQ0FBQztvQkFDdkUsTUFBTSxPQUFLLENBQUM7Ozs7O0NBRWYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNvbmZpZ0RhdGEgfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgcmVxdWlyZUF1dGggfSBmcm9tICcuLi9yZXF1aXJlQXV0aCc7XG5cbmltcG9ydCB7IFJFU1REYXRhLCBVbnVtRHRvIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IHsgQ3JlZGVudGlhbFN0YXR1c09wdGlvbnMsIEpTT05PYmosIF9DcmVkZW50aWFsU3RhdHVzT3B0aW9ucyB9IGZyb20gJ0B1bnVtaWQvdHlwZXMnO1xuaW1wb3J0IHsgQ3VzdEVycm9yIH0gZnJvbSAnLi4vdXRpbHMvZXJyb3InO1xuaW1wb3J0IHsgaGFuZGxlQXV0aFRva2VuSGVhZGVyLCBtYWtlTmV0d29ya1JlcXVlc3QgfSBmcm9tICcuLi91dGlscy9uZXR3b3JrUmVxdWVzdEhlbHBlcic7XG5cbi8qKlxuICogSGVscGVyIHRvIHZhbGlkYXRlIHJlcXVlc3QgaW5wdXRzLlxuICogQHBhcmFtIHJlcSBSZXF1ZXN0XG4gKi9cbmNvbnN0IHZhbGlkYXRlSW5wdXRzID0gKGNyZWRlbnRpYWxJZDogc3RyaW5nLCBzdGF0dXM6IENyZWRlbnRpYWxTdGF0dXNPcHRpb25zKTogdm9pZCA9PiB7XG4gIC8vIENyZWRlbnRpYWwgSUQgaXMgbWFuZGF0b3J5LlxuICBpZiAoIWNyZWRlbnRpYWxJZCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnY3JlZGVudGlhbElkIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBfQ3JlZGVudGlhbFN0YXR1c09wdGlvbnMuY2hlY2soc3RhdHVzKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnc3RhdHVzIGRvZXMgbm90IG1hdGNoIGEgdmFsaWQgQ3JlZGVudGlhbFN0YXR1c09wdGlvbnMgc3RyaW5nIGxpdGVyYWwuJyk7XG4gIH1cbn07XG5cbi8qKlxuICogSGFuZGxlciB0byBjaGFuZ2UgYSBjcmVkZW50aWFsJ3Mgc3RhdHVzLiBJdCByZWxheXMgdGhlIHVwZGF0ZWQgY3JlZGVudGlhbCBtZXRhZGF0YSB0byBVbnVtSUQncyBTYWFTLlxuICogQHBhcmFtIGF1dGhvcml6YXRpb24gc3RyaW5nIC8vIGF1dGggc3RyaW5nXG4gKiBAcGFyYW0gY3JlZGVudGlhbElkIHN0cmluZyAvLyBpZCBvZiBjcmVkZW50aWFsIHRvIHJldm9rZVxuICogQHBhcmFtIHN0YXR1cyBDcmVkZW50aWFsU3RhdHVzT3B0aW9ucyAvLyBzdGF0dXMgdG8gdXBkYXRlIHRoZSBjcmVkZW50aWFsIHRvIChkZWZhdWx0cyB0byAncmV2b2tlZCcpXG4gKi9cbmV4cG9ydCBjb25zdCB1cGRhdGVDcmVkZW50aWFsU3RhdHVzID0gYXN5bmMgKGF1dGhvcml6YXRpb246IHN0cmluZywgY3JlZGVudGlhbElkOiBzdHJpbmcsIHN0YXR1czogQ3JlZGVudGlhbFN0YXR1c09wdGlvbnMgPSAncmV2b2tlZCcpOiBQcm9taXNlPFVudW1EdG88dW5kZWZpbmVkPj4gPT4ge1xuICB0cnkge1xuICAgIHJlcXVpcmVBdXRoKGF1dGhvcml6YXRpb24pO1xuXG4gICAgdmFsaWRhdGVJbnB1dHMoY3JlZGVudGlhbElkLCBzdGF0dXMpO1xuXG4gICAgY29uc3QgcmVzdERhdGE6IFJFU1REYXRhID0ge1xuICAgICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgICAgYmFzZVVybDogY29uZmlnRGF0YS5TYWFTVXJsLFxuICAgICAgZW5kUG9pbnQ6ICdjcmVkZW50aWFsU3RhdHVzLz9jcmVkZW50aWFsSWQ9JyArIGNyZWRlbnRpYWxJZCxcbiAgICAgIGhlYWRlcjogeyBBdXRob3JpemF0aW9uOiBhdXRob3JpemF0aW9uIH0sXG4gICAgICBkYXRhOiB7IHN0YXR1cyB9XG4gICAgfTtcblxuICAgIC8vIG1ha2UgcmVxdWVzdCB0byBTYWFTIHRvIHVwZGF0ZSB0aGUgQ3JlZGVudGlhbFN0YXR1c1xuICAgIGNvbnN0IHJlc3BvbnNlOiBKU09OT2JqID0gYXdhaXQgbWFrZU5ldHdvcmtSZXF1ZXN0PHsgc3VjY2VzczogYm9vbGVhbiB9PihyZXN0RGF0YSk7XG5cbiAgICBjb25zdCBhdXRoVG9rZW46IHN0cmluZyA9IGhhbmRsZUF1dGhUb2tlbkhlYWRlcihyZXNwb25zZSwgYXV0aG9yaXphdGlvbik7XG5cbiAgICBjb25zdCByZXN1bHQ6IFVudW1EdG88dW5kZWZpbmVkPiA9IHtcbiAgICAgIGF1dGhUb2tlbixcbiAgICAgIGJvZHk6IHVuZGVmaW5lZFxuICAgIH07XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcihgRXJyb3IgcmV2b2tpbmcgYSBjcmVkZW50aWFsIHdpdGggVW51bUlEIFNhYVMuICR7ZXJyb3J9YCk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG4iXX0=