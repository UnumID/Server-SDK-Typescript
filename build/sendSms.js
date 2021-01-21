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
var library_issuer_verifier_utility_1 = require("library-issuer-verifier-utility");
var config_1 = require("./config");
var logger_1 = __importDefault(require("./logger"));
var requireAuth_1 = require("./requireAuth");
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
                logger_1.default.error("Error during sendSms to UnumID Saas. Error: " + e_1);
                throw e_1;
            case 3: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=sendSms.js.map