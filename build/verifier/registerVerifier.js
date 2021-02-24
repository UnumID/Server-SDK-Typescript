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
exports.registerVerifier = void 0;
var config_1 = require("../config");
var library_issuer_verifier_utility_1 = require("@unumid/library-issuer-verifier-utility");
var logger_1 = __importDefault(require("../logger"));
/**
 * Creates an object to encapsulate key information.
 * @param kp KeyPair
 * @param type DidKeyType
 */
var constructKeyObj = function (kp, type) {
    return {
        id: library_issuer_verifier_utility_1.getUUID(),
        encoding: 'pem',
        type: type,
        status: 'valid',
        publicKey: kp.publicKey
    };
};
/**
 * Currently creates a key pair set. One for signing and the other for encryption.
 * Flexible in supporting future keys for other purposes.
 * @param kpSet KeyPairSet
 */
var constructKeyObjs = function (kpSet) {
    var signKey = constructKeyObj(kpSet.signing, 'secp256r1');
    var encKey = constructKeyObj(kpSet.encryption, 'RSA');
    return [signKey, encKey];
};
/**
 * Validates request input parameters.
 * @param req Request
 */
var validateInParams = function (name, customerUuid, url, apiKey) {
    if (!name) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Verifier Options: name is required.');
    }
    if (!customerUuid) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Verifier Options: customerUuid is required.');
    }
    if (!url) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Verifier Options: url is required.');
    }
    if (!apiKey) {
        throw new library_issuer_verifier_utility_1.CustError(401, 'Not authenticated: apiKey is required.');
    }
};
/**
 * Handler for registering a Verifier with UnumID's SaaS.
 * @param name
 * @param customerUuid
 * @param url
 * @param apiKey
 */
exports.registerVerifier = function (name, customerUuid, url, apiKey) { return __awaiter(void 0, void 0, void 0, function () {
    var kpSet, verifierOpt, restData, restResp, authToken, verifierResp, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                validateInParams(name, customerUuid, url, apiKey);
                return [4 /*yield*/, library_issuer_verifier_utility_1.createKeyPairSet()];
            case 1:
                kpSet = _a.sent();
                verifierOpt = { name: name, customerUuid: customerUuid, url: url, publicKeyInfo: constructKeyObjs(kpSet) };
                restData = {
                    method: 'POST',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'verifier',
                    header: { Authorization: 'Bearer ' + apiKey },
                    data: verifierOpt
                };
                return [4 /*yield*/, library_issuer_verifier_utility_1.makeNetworkRequest(restData)];
            case 2:
                restResp = _a.sent();
                authToken = library_issuer_verifier_utility_1.handleAuthToken(restResp);
                verifierResp = {
                    authToken: authToken,
                    body: {
                        uuid: restResp.body.uuid,
                        customerUuid: restResp.body.customerUuid,
                        did: restResp.body.did,
                        name: restResp.body.name,
                        createdAt: restResp.body.createdAt,
                        updatedAt: restResp.body.updatedAt,
                        isAuthorized: restResp.body.isAuthorized,
                        keys: kpSet,
                        url: url
                    }
                };
                return [2 /*return*/, verifierResp];
            case 3:
                error_1 = _a.sent();
                logger_1.default.error("Error registering verifier " + name + ". " + error_1);
                throw error_1;
            case 4: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=registerVerifier.js.map