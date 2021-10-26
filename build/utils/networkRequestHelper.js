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
exports.handleAuthTokenHeader = exports.makeNetworkRequest = void 0;
var node_fetch_1 = __importDefault(require("node-fetch"));
var error_1 = require("./error");
var logger_1 = __importDefault(require("../logger"));
var helpers_1 = require("./helpers");
var versionList_1 = require("./versionList");
/**
 * Helper to handle network requests.
 * @param inputObj
 */
exports.makeNetworkRequest = function (inputObj) { return __awaiter(void 0, void 0, void 0, function () {
    var restHdr, url, options, respObj, res, responseJson;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                restHdr = (!inputObj.header ? {} : inputObj.header);
                // Always set the content-type in the header
                restHdr['Content-Type'] = 'application/json';
                url = inputObj.baseUrl + inputObj.endPoint;
                options = {
                    method: inputObj.method,
                    body: JSON.stringify(inputObj.data),
                    headers: __assign(__assign({}, restHdr), { version: restHdr.version ? restHdr.version : versionList_1.versionList[versionList_1.versionList.length - 1] // The api version to hit the UnumID SaaS with in the this version of the SDK
                     })
                };
                respObj = {};
                logger_1.default.debug("Making " + inputObj.method + " request to url: " + url);
                return [4 /*yield*/, node_fetch_1.default(url, options)];
            case 1:
                res = _a.sent();
                return [4 /*yield*/, res.json()];
            case 2:
                responseJson = _a.sent();
                // res.ok will be true for success scenario, otherwise, it will be false.
                if (res.ok) {
                    logger_1.default.debug("Successful call to " + url + ".");
                    // Response object will have both header and body for success scenario
                    respObj.headers = res.headers.raw();
                    respObj.body = responseJson;
                    return [2 /*return*/, (respObj)];
                }
                else {
                    logger_1.default.error("Error in call to " + url + ". Error: " + responseJson.code + " " + responseJson.message);
                    throw new error_1.CustError(responseJson.code, responseJson.message);
                }
                return [2 /*return*/];
        }
    });
}); };
/**
 * Helper to handle safe auth token handling in responses from UnumID's Saas via makeNetworkRequest
 * @param response JSONObj
 */
exports.handleAuthTokenHeader = function (response, existingAuthToken) {
    var authTokenResp = response && response.headers && response.headers['x-auth-token'] ? response.headers['x-auth-token'] : '';
    // Ensuring that the authToken attribute is presented as a string or undefined. The header values can be a string | string[] so hence the complex ternary.
    var authToken = (helpers_1.isArrayEmpty(authTokenResp) && authTokenResp ? authTokenResp : (helpers_1.isArrayNotEmpty(authTokenResp) ? authTokenResp[0] : undefined));
    // If authToken is undefined see if the input existing auth token is a valid Bearer token (not an admin key), if an admin key just return undefined, otherwise return a properly formatted Bearer token for use in subsequent requests or the existing, inputting token.
    var result = authToken ? (authToken.startsWith('Bearer ') ? authToken : "Bearer " + authToken) : ((existingAuthToken === null || existingAuthToken === void 0 ? void 0 : existingAuthToken.startsWith('Bearer ')) ? existingAuthToken : authToken);
    return result;
};
//# sourceMappingURL=networkRequestHelper.js.map