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
exports.sendRequest = exports.sendRequestRequest = exports.constructSignedPresentationRequest = exports.constructUnsignedPresentationRequest = void 0;
var config_1 = require("./config");
var requireAuth_1 = require("./requireAuth");
var library_issuer_verifier_utility_1 = require("library-issuer-verifier-utility");
var logger_1 = __importDefault(require("./logger"));
/**
 * Constructs an unsigned PresentationRequest from the incoming request body.
 * @param reqBody SendRequestReqBody
 */
exports.constructUnsignedPresentationRequest = function (reqBody) {
    var verifier = reqBody.verifier, holderAppUuid = reqBody.holderAppUuid, credentialRequests = reqBody.credentialRequests, metadata = reqBody.metadata, expiresAt = reqBody.expiresAt, createdAt = reqBody.createdAt, updatedAt = reqBody.updatedAt;
    var uuid = library_issuer_verifier_utility_1.getUUID();
    // any/all default values must be set before signing, or signature will always fail to verify
    var now = new Date();
    var tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
    var defaultCreatedAt = now;
    var defaultUpdatedAt = now;
    var defaultExpiresAt = tenMinutesFromNow;
    var credentialRequestsWithDefaults = credentialRequests.map(function (cr) {
        return cr.required ? cr : __assign(__assign({}, cr), { required: false });
    });
    return {
        credentialRequests: credentialRequestsWithDefaults,
        createdAt: createdAt || defaultCreatedAt,
        updatedAt: updatedAt || defaultUpdatedAt,
        expiresAt: expiresAt || defaultExpiresAt,
        holderAppUuid: holderAppUuid,
        metadata: metadata || {},
        uuid: uuid,
        verifier: verifier
    };
};
/**
 * Signs an unsigned PresentationRequest and attaches the resulting Proof
 * @param unsignedPresentationRequest UnsignedPresentationRequest
 * @param privateKey String
 */
exports.constructSignedPresentationRequest = function (unsignedPresentationRequest, privateKey) {
    var proof = library_issuer_verifier_utility_1.createProof(unsignedPresentationRequest, privateKey, unsignedPresentationRequest.verifier, 'pem');
    var signedPresentationRequest = __assign(__assign({}, unsignedPresentationRequest), { proof: proof });
    return signedPresentationRequest;
};
// validates incoming request body
var validateSendRequestBodyRequest = function (sendRequestBody) {
    var verifier = sendRequestBody.verifier, credentialRequests = sendRequestBody.credentialRequests, eccPrivateKey = sendRequestBody.eccPrivateKey, holderAppUuid = sendRequestBody.holderAppUuid;
    if (!verifier) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid PresentationRequest options: verifier is required.');
    }
    if (typeof verifier !== 'string') {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid PresentationRequest options: verifier must be a string.');
    }
    if (!holderAppUuid) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid PresentationRequest options: holderAppUuid is required.');
    }
    if (typeof holderAppUuid !== 'string') {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid PresentationRequest options: holderAppUuid must be a string.');
    }
    if (!credentialRequests) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid PresentationRequest options: credentialRequests is required.');
    }
    // credentialRequests input element must be an array
    if (!Array.isArray(credentialRequests)) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid PresentationRequest options: credentialRequests must be an array.');
    }
    var totCredReqs = credentialRequests.length;
    if (totCredReqs === 0) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid PresentationRequest options: credentialRequests array must not be empty.');
    }
    // credentialRequests input element should have type and issuer elements
    for (var i = 0; i < totCredReqs; i++) {
        var credentialRequest = credentialRequests[i];
        if (!credentialRequest.type) {
            throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid credentialRequest: type is required.');
        }
        if (!credentialRequest.issuers) {
            throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid credentialRequest: issuers is required.');
        }
        // credentialRequests.issuers input element must be an array
        if (!Array.isArray(credentialRequest.issuers)) {
            throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid credentialRequest: issuers must be an array.');
        }
        var totIssuers = credentialRequest.issuers.length;
        if (totIssuers === 0) {
            throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid credentialRequest: issuers array must not be empty.');
        }
        for (var _i = 0, _a = credentialRequest.issuers; _i < _a.length; _i++) {
            var issuer = _a[_i];
            if (typeof issuer !== 'string') {
                throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid issuer: must be a string.');
            }
        }
    }
    // ECC Private Key is mandatory input parameter
    if (!eccPrivateKey) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid PresentationRequest options: eccPrivateKey is required.');
    }
};
/**
 * Request middleware for sending a PresentationRequest to UnumID's SaaS.
 *
 * Note: handler for /api/sendRequest route
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
exports.sendRequestRequest = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var body, authorization, unsignedPresentationRequest, signedPR, restData, restResp, presentationRequestResponse, authToken, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                body = req.body, authorization = req.headers.authorization;
                requireAuth_1.requireAuth(authorization);
                // Validate inputs
                validateSendRequestBodyRequest(body);
                unsignedPresentationRequest = exports.constructUnsignedPresentationRequest(body);
                signedPR = exports.constructSignedPresentationRequest(unsignedPresentationRequest, req.body.eccPrivateKey);
                restData = {
                    method: 'POST',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'presentationRequest',
                    header: { Authorization: authorization },
                    data: signedPR
                };
                return [4 /*yield*/, library_issuer_verifier_utility_1.makeNetworkRequest(restData)];
            case 1:
                restResp = _a.sent();
                presentationRequestResponse = restResp.body;
                // Set the X-Auth-Token header alone
                res.setHeader('Content-Type', 'application/json');
                authToken = restResp.headers['x-auth-token'];
                if (authToken) {
                    res.setHeader('x-auth-token', restResp.headers['x-auth-token']);
                }
                res.send(presentationRequestResponse);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                next(error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// validates incoming request body
var validateSendRequestBody = function (verifier, credentialRequests, eccPrivateKey, holderAppUuid) {
    if (!verifier) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid PresentationRequest options: verifier is required.');
    }
    if (typeof verifier !== 'string') {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid PresentationRequest options: verifier must be a string.');
    }
    if (!holderAppUuid) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid PresentationRequest options: holderAppUuid is required.');
    }
    if (typeof holderAppUuid !== 'string') {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid PresentationRequest options: holderAppUuid must be a string.');
    }
    if (!credentialRequests) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid PresentationRequest options: credentialRequests is required.');
    }
    // credentialRequests input element must be an array
    if (!Array.isArray(credentialRequests)) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid PresentationRequest options: credentialRequests must be an array.');
    }
    if (library_issuer_verifier_utility_1.isArrayEmpty(credentialRequests)) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid PresentationRequest options: credentialRequests array must not be empty.');
    }
    // credentialRequests input element should have type and issuer elements
    for (var _i = 0, credentialRequests_1 = credentialRequests; _i < credentialRequests_1.length; _i++) {
        var credentialRequest = credentialRequests_1[_i];
        if (!credentialRequest.type) {
            throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid credentialRequest: type is required.');
        }
        if (!credentialRequest.issuers) {
            throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid credentialRequest: issuers is required.');
        }
        // credentialRequests.issuers input element must be an array
        if (!Array.isArray(credentialRequest.issuers)) {
            throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid credentialRequest: issuers must be an array.');
        }
        var totIssuers = credentialRequest.issuers.length;
        if (totIssuers === 0) {
            throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid credentialRequest: issuers array must not be empty.');
        }
        for (var _a = 0, _b = credentialRequest.issuers; _a < _b.length; _a++) {
            var issuer = _b[_a];
            if (typeof issuer !== 'string') {
                throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid issuer: must be a string.');
            }
        }
    }
    // ECC Private Key is mandatory input parameter
    if (!eccPrivateKey) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid PresentationRequest options: eccPrivateKey is required.');
    }
};
/**
 * Handler for sending a PresentationRequest to UnumID's SaaS.
 * @param authorization
 * @param verifier
 * @param credentialRequests
 * @param eccPrivateKey
 * @param holderAppUuid
 */
exports.sendRequest = function (authorization, verifier, credentialRequests, eccPrivateKey, holderAppUuid) { return __awaiter(void 0, void 0, void 0, function () {
    var body, unsignedPresentationRequest, signedPR, restData, restResp, authToken, presentationRequestResponse, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                requireAuth_1.requireAuth(authorization);
                body = { verifier: verifier, credentialRequests: credentialRequests, eccPrivateKey: eccPrivateKey, holderAppUuid: holderAppUuid };
                // Validate inputs
                validateSendRequestBody(verifier, credentialRequests, eccPrivateKey, holderAppUuid);
                unsignedPresentationRequest = exports.constructUnsignedPresentationRequest(body);
                signedPR = exports.constructSignedPresentationRequest(unsignedPresentationRequest, eccPrivateKey);
                restData = {
                    method: 'POST',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'presentationRequest',
                    header: { Authorization: authorization },
                    data: signedPR
                };
                return [4 /*yield*/, library_issuer_verifier_utility_1.makeNetworkRequest(restData)];
            case 1:
                restResp = _a.sent();
                authToken = restResp.headers['x-auth-token'];
                presentationRequestResponse = __assign(__assign({}, restResp.body), { authToken: authToken });
                return [2 /*return*/, presentationRequestResponse];
            case 2:
                error_2 = _a.sent();
                logger_1.default.error("Error sending request to use UnumID Saas. Error " + error_2);
                throw error_2;
            case 3: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=sendRequest.js.map