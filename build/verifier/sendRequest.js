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
exports.sendRequestDeprecated = exports.sendRequestV3 = exports.sendRequest = exports.constructSignedPresentationRequest = exports.constructSignedPresentationRequestDeprecatedV2 = exports.constructUnsignedPresentationRequest = void 0;
var config_1 = require("../config");
var requireAuth_1 = require("../requireAuth");
var library_crypto_1 = require("@unumid/library-crypto");
var types_1 = require("@unumid/types");
var logger_1 = __importDefault(require("../logger"));
var createProof_1 = require("../utils/createProof");
var helpers_1 = require("../utils/helpers");
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
var error_1 = require("../utils/error");
// /**
//  * Constructs an unsigned PresentationRequest from the incoming request body.
//  * @param reqBody SendRequestReqBody
//  */
// export const constructUnsignedPresentationRequest = (reqBody: SendRequestReqBody): UnsignedPresentationRequest => {
//   const {
//     verifier,
//     holderAppUuid,
//     credentialRequests,
//     metadata,
//     expiresAt,
//     createdAt,
//     updatedAt
//   } = reqBody;
//   const uuid = getUUID();
//   // any/all default values must be set before signing, or signature will always fail to verify
//   const now = new Date();
//   const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
//   const defaultCreatedAt = now;
//   const defaultUpdatedAt = now;
//   const defaultExpiresAt = tenMinutesFromNow;
//   const credentialRequestsWithDefaults = credentialRequests.map(cr => {
//     return cr.required ? cr : { ...cr, required: false };
//   });
//   return {
//     credentialRequests: credentialRequestsWithDefaults,
//     createdAt: createdAt || defaultCreatedAt,
//     updatedAt: updatedAt || defaultUpdatedAt,
//     expiresAt: expiresAt || defaultExpiresAt,
//     holderAppUuid,
//     metadata: metadata || {},
//     uuid,
//     verifier
//   };
// };
/**
 * Constructs an unsigned PresentationRequest from the incoming request body.
 * @param reqBody SendRequestReqBody
 */
exports.constructUnsignedPresentationRequest = function (reqBody) {
    var verifier = reqBody.verifier, holderAppUuid = reqBody.holderAppUuid, credentialRequests = reqBody.credentialRequests, metadata = reqBody.metadata, expiresAt = reqBody.expiresAt, createdAt = reqBody.createdAt, updatedAt = reqBody.updatedAt, id = reqBody.id;
    var uuid = helpers_1.getUUID();
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
        metadata: metadata || { fields: {} },
        uuid: uuid,
        id: id,
        verifier: verifier
    };
};
/**
 * Signs an unsigned PresentationRequest and attaches the resulting Proof
 * @param unsignedPresentationRequest UnsignedPresentationRequest
 * @param privateKey String
 */
exports.constructSignedPresentationRequestDeprecatedV2 = function (unsignedPresentationRequest, privateKey) {
    try {
        var proof = createProof_1.createProof(unsignedPresentationRequest, privateKey, unsignedPresentationRequest.verifier, 'pem');
        var signedPresentationRequest = __assign(__assign({}, unsignedPresentationRequest), { proof: proof });
        return signedPresentationRequest;
    }
    catch (e) {
        if (e instanceof library_crypto_1.CryptoError) {
            logger_1.default.error("Issue in the crypto lib while creating presentation request " + unsignedPresentationRequest.uuid + " proof", e);
        }
        else {
            logger_1.default.error("Issue while creating presentation request " + unsignedPresentationRequest.uuid + " proof", e);
        }
        throw e;
    }
};
/**
 * Signs an unsigned PresentationRequest and attaches the resulting Proof
 * @param unsignedPresentationRequest UnsignedPresentationRequest
 * @param privateKey String
 */
exports.constructSignedPresentationRequest = function (unsignedPresentationRequest, privateKey) {
    try {
        // convert the protobuf to a byte array
        var bytes = types_1.UnsignedPresentationRequestPb.encode(unsignedPresentationRequest).finish();
        var proof = createProof_1.createProofPb(bytes, privateKey, unsignedPresentationRequest.verifier, 'pem');
        var signedPresentationRequest = __assign(__assign({}, unsignedPresentationRequest), { proof: proof });
        return signedPresentationRequest;
    }
    catch (e) {
        if (e instanceof library_crypto_1.CryptoError) {
            logger_1.default.error("Issue in the crypto lib while creating presentation request " + unsignedPresentationRequest.uuid + " proof", e);
        }
        else {
            logger_1.default.error("Issue while creating presentation request " + unsignedPresentationRequest.uuid + " proof", e);
        }
        throw e;
    }
};
// validates incoming request body
var validateSendRequestBody = function (sendRequestBody) {
    var verifier = sendRequestBody.verifier, credentialRequests = sendRequestBody.credentialRequests, eccPrivateKey = sendRequestBody.eccPrivateKey, holderAppUuid = sendRequestBody.holderAppUuid, metadata = sendRequestBody.metadata, id = sendRequestBody.id;
    if (!verifier) {
        throw new error_1.CustError(400, 'Invalid PresentationRequest options: verifier is required.');
    }
    if (typeof verifier !== 'string') {
        throw new error_1.CustError(400, 'Invalid PresentationRequest options: verifier must be a string.');
    }
    if (!holderAppUuid) {
        throw new error_1.CustError(400, 'Invalid PresentationRequest options: holderAppUuid is required.');
    }
    if (typeof holderAppUuid !== 'string') {
        throw new error_1.CustError(400, 'Invalid PresentationRequest options: holderAppUuid must be a string.');
    }
    if (!credentialRequests) {
        throw new error_1.CustError(400, 'Invalid PresentationRequest options: credentialRequests is required.');
    }
    // credentialRequests input element must be an array
    if (!Array.isArray(credentialRequests)) {
        throw new error_1.CustError(400, 'Invalid PresentationRequest options: credentialRequests must be an array.');
    }
    var totCredReqs = credentialRequests.length;
    if (totCredReqs === 0) {
        throw new error_1.CustError(400, 'Invalid PresentationRequest options: credentialRequests array must not be empty.');
    }
    // credentialRequests input element should have type and issuer elements
    for (var i = 0; i < totCredReqs; i++) {
        var credentialRequest = credentialRequests[i];
        if (!credentialRequest.type) {
            throw new error_1.CustError(400, 'Invalid credentialRequest: type is required.');
        }
        if (!credentialRequest.issuers) {
            throw new error_1.CustError(400, 'Invalid credentialRequest: issuers is required.');
        }
        // credentialRequests.issuers input element must be an array
        if (!Array.isArray(credentialRequest.issuers)) {
            throw new error_1.CustError(400, 'Invalid credentialRequest: issuers must be an array.');
        }
        var totIssuers = credentialRequest.issuers.length;
        if (totIssuers === 0) {
            throw new error_1.CustError(400, 'Invalid credentialRequest: issuers array must not be empty.');
        }
        for (var _i = 0, _a = credentialRequest.issuers; _i < _a.length; _i++) {
            var issuer = _a[_i];
            if (typeof issuer !== 'string') {
                throw new error_1.CustError(400, 'Invalid credentialRequest: issuers array element must be a string.');
            }
        }
    }
    // ECC Private Key is mandatory input parameter
    if (!eccPrivateKey) {
        throw new error_1.CustError(400, 'Invalid PresentationRequest options: signingPrivateKey is required.');
    }
    // Ensure that metadata object is keyed on fields for Struct protobuf definition
    if (!metadata) {
        sendRequestBody.metadata = {
            fields: {}
        };
    }
    else if (metadata && !metadata.fields) {
        logger_1.default.debug('Adding the root \'fields\' key to the presentation request metadata.');
        sendRequestBody.metadata = {
            fields: sendRequestBody.metadata
        };
    }
    if (!id) {
        throw new error_1.CustError(400, 'Invalid PresentationRequest options: id is required.');
    }
    return sendRequestBody;
};
/**
 * Handler for sending a PresentationRequest to UnumID's SaaS.
 * Middleware function where one can add requests of multiple versions to be encrypted and stored in the SaaS db for versioning needs.
 * @param authorization
 * @param verifier
 * @param credentialRequests
 * @param eccPrivateKey
 * @param holderAppUuid
 */
exports.sendRequest = function (authorization, verifier, credentialRequests, eccPrivateKey, holderAppUuid, expirationDate, metadata) { return __awaiter(void 0, void 0, void 0, function () {
    var id, responseV2, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = helpers_1.getUUID();
                return [4 /*yield*/, exports.sendRequestDeprecated(authorization, verifier, credentialRequests, eccPrivateKey, holderAppUuid, id, expirationDate, metadata)];
            case 1:
                responseV2 = _a.sent();
                authorization = responseV2.authToken ? responseV2.authToken : authorization;
                response = exports.sendRequestV3(authorization, verifier, credentialRequests, eccPrivateKey, holderAppUuid, id, expirationDate, metadata);
                return [2 /*return*/, response];
        }
    });
}); };
/**
 * Handler for sending a PresentationRequest to UnumID's SaaS.
 * @param authorization
 * @param verifier
 * @param credentialRequests
 * @param eccPrivateKey
 * @param holderAppUuid
 */
exports.sendRequestV3 = function (authorization, verifier, credentialRequests, eccPrivateKey, holderAppUuid, id, expirationDate, metadata) { return __awaiter(void 0, void 0, void 0, function () {
    var body, unsignedPresentationRequest, signedPR, restData, restResp, authToken, presentationRequestResponse, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                requireAuth_1.requireAuth(authorization);
                body = { verifier: verifier, credentialRequests: credentialRequests, eccPrivateKey: eccPrivateKey, holderAppUuid: holderAppUuid, expiresAt: expirationDate, metadata: metadata, id: id };
                // Validate inputs
                body = validateSendRequestBody(body);
                unsignedPresentationRequest = exports.constructUnsignedPresentationRequest(body);
                signedPR = exports.constructSignedPresentationRequest(unsignedPresentationRequest, eccPrivateKey);
                restData = {
                    method: 'POST',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'presentationRequest',
                    header: { Authorization: authorization, version: '3.0.0' },
                    data: signedPR
                };
                return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(restData)];
            case 1:
                restResp = _a.sent();
                authToken = networkRequestHelper_1.handleAuthTokenHeader(restResp, authorization);
                presentationRequestResponse = { body: __assign({}, restResp.body), authToken: authToken };
                return [2 /*return*/, presentationRequestResponse];
            case 2:
                error_2 = _a.sent();
                logger_1.default.error("Error sending request to use UnumID Saas. " + error_2);
                throw error_2;
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Handler for sending a PresentationRequest to UnumID's SaaS.
 * @param authorization
 * @param verifier
 * @param credentialRequests
 * @param eccPrivateKey
 * @param holderAppUuid
 */
exports.sendRequestDeprecated = function (authorization, verifier, credentialRequests, eccPrivateKey, holderAppUuid, id, expirationDate, metadata) { return __awaiter(void 0, void 0, void 0, function () {
    var body, unsignedPresentationRequest, signedPR, restData, restResp, authToken, presentationRequestResponse, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                requireAuth_1.requireAuth(authorization);
                body = { verifier: verifier, credentialRequests: credentialRequests, eccPrivateKey: eccPrivateKey, holderAppUuid: holderAppUuid, expiresAt: expirationDate, metadata: metadata, id: id };
                // Validate inputs
                validateSendRequestBody(body);
                unsignedPresentationRequest = exports.constructUnsignedPresentationRequest(body);
                signedPR = exports.constructSignedPresentationRequestDeprecatedV2(unsignedPresentationRequest, eccPrivateKey);
                restData = {
                    method: 'POST',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'presentationRequest',
                    header: { Authorization: authorization, version: '2.0.0' },
                    data: signedPR
                };
                return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(restData)];
            case 1:
                restResp = _a.sent();
                authToken = networkRequestHelper_1.handleAuthTokenHeader(restResp, authorization);
                presentationRequestResponse = { body: __assign({}, restResp.body), authToken: authToken };
                return [2 /*return*/, presentationRequestResponse];
            case 2:
                error_3 = _a.sent();
                logger_1.default.error("Error sending request to use UnumID Saas. " + error_3);
                throw error_3;
            case 3: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=sendRequest.js.map