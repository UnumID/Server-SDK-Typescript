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
        var restData, response, authToken, revokedCredential, error_2;
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
                    revokedCredential = {
                        authToken: authToken,
                        body: undefined
                    };
                    return [2 /*return*/, revokedCredential];
                case 2:
                    error_2 = _a.sent();
                    logger_1.default.error("Error revoking a credential with UnumID SaaS. " + error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
};
//# sourceMappingURL=updateCredentialStatus.js.map