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
exports.getDidDocPublicKeys = exports.getKeysFromDIDDoc = exports.getDIDDoc = void 0;
var error_1 = require("./error");
var logger_1 = __importDefault(require("../logger"));
var networkRequestHelper_1 = require("./networkRequestHelper");
var config_1 = require("../config");
/**
 * Get a Did document from the did and url provided.
 * @param baseUrl
 * @param authorization
 * @param did
 */
exports.getDIDDoc = function (baseUrl, authorization, did) { return __awaiter(void 0, void 0, void 0, function () {
    var restData, restResp, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                restData = {
                    method: 'GET',
                    baseUrl: baseUrl,
                    endPoint: 'didDocument/' + did,
                    header: { Authorization: authorization }
                };
                return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(restData)];
            case 1:
                restResp = _a.sent();
                logger_1.default.debug('Successfully retrieved did document', restResp.body);
                return [2 /*return*/, (restResp)];
            case 2:
                error_2 = _a.sent();
                logger_1.default.error("Error getting did document " + did + " from " + baseUrl, error_2);
                throw error_2;
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Helper to return the keys in the DID document which corresponds to the type specified.
 * Note: the can be multiple keys of same type on the same DID document.
 * @param didDocument DiDDocument
 * @param type DidKeyType
 */
exports.getKeysFromDIDDoc = function (didDocument, type) {
    var publicKeyInfos = didDocument.publicKey.filter(function (publicKeyInfo) { return publicKeyInfo.type === type; });
    if (publicKeyInfos.length === 0) {
        logger_1.default.error("DidDoc " + didDocument.id + " has no " + type + " public keys");
        throw new error_1.CustError(500, "DidDoc " + didDocument.id + " has no " + type + " public keys");
    }
    return publicKeyInfos;
};
exports.getDidDocPublicKeys = function (authorization, subjectDid, type) { return __awaiter(void 0, void 0, void 0, function () {
    var didDocResponse, didKeyId, publicKeyInfoList, didDoc, authToken;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getDIDDoc(config_1.configData.SaaSUrl, authorization, subjectDid)];
            case 1:
                didDocResponse = _a.sent();
                logger_1.default.debug("DidDoc repsonse: " + didDocResponse);
                if (didDocResponse instanceof Error) {
                    throw didDocResponse;
                }
                didKeyId = subjectDid.split('#')[1];
                if (!didKeyId) return [3 /*break*/, 3];
                return [4 /*yield*/, didDocResponse.body];
            case 2:
                /**
                   * If making a request to the Did Document service with a did and did fragment, only a single PublicKeyInfo object is returned.
                   * Putting in array for uniform handling with the case no fragment is included, in which case all the matching keys will need to be tried until one works.
                   */
                publicKeyInfoList = [_a.sent()];
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, didDocResponse.body];
            case 4:
                didDoc = _a.sent();
                // get subject's encryption public key info from its DID document
                publicKeyInfoList = exports.getKeysFromDIDDoc(didDoc, type);
                _a.label = 5;
            case 5:
                // // get subject's public key info from its DID document
                // const publicKeyInfos = getKeysFromDIDDoc(didDocResponse.body, 'RSA');
                if (publicKeyInfoList.length === 0) {
                    throw new error_1.CustError(404, type + " public keys not found for the DID " + subjectDid);
                }
                authToken = networkRequestHelper_1.handleAuthTokenHeader(didDocResponse, authorization);
                return [2 /*return*/, {
                        authToken: authToken,
                        body: publicKeyInfoList
                    }];
        }
    });
}); };
//# sourceMappingURL=didHelper.js.map