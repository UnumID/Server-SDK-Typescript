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
exports.sendRequestV3 = exports.sendRequest = exports.constructSignedPresentationRequest = exports.constructSignedPresentationRequestDeprecatedV2 = exports.constructUnsignedPresentationRequest = void 0;
var config_1 = require("../config");
var requireAuth_1 = require("../requireAuth");
var library_crypto_1 = require("@unumid/library-crypto");
var types_1 = require("@unumid/types");
var logger_1 = __importDefault(require("../logger"));
var createProof_1 = require("../utils/createProof");
var helpers_1 = require("../utils/helpers");
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
var error_1 = require("../utils/error");
/**
 * Constructs an unsigned PresentationRequest from the incoming request body.
 * @param reqBody SendRequestReqBody
 */
exports.constructUnsignedPresentationRequest = function (reqBody, version) {
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
        metadata: metadata ? JSON.stringify(metadata) : '{}',
        // metadata: metadata ? JSON.stringify(metadata) : {} as JSONObj,
        // metadata: JSON.stringify(metadata),
        uuid: uuid,
        id: id,
        verifier: verifier,
        version: version
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
        var proof = createProof_1.createProofPb(bytes, privateKey, unsignedPresentationRequest.verifier);
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
    // // Ensure that metadata object is keyed on fields for Struct protobuf definition
    // if (!metadata) {
    //   sendRequestBody.metadata = {
    //     fields: {}
    //   };
    // } else if (metadata && !metadata.fields) {
    //   logger.debug('Adding the root \'fields\' key to the presentation request metadata.');
    //   sendRequestBody.metadata = {
    //     fields: sendRequestBody.metadata
    //   };
    // }
    if (!id) {
        throw new error_1.CustError(400, 'Invalid PresentationRequest options: id is required.');
    }
    return sendRequestBody;
};
// validates incoming request body
var validateSendRequestBodyDeprecated = function (sendRequestBody) {
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
    // // Ensure that metadata object is keyed on fields for Struct protobuf definition
    // if (!metadata) {
    //   sendRequestBody.metadata = {
    //     fields: {}
    //   };
    // }
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
exports.sendRequest = function (authorization, verifier, credentialRequests, eccPrivateKey, holderAppUuid, // defaults to the Unum ID Wallet Holder if no value is present
expirationDate, metadata) {
    if (holderAppUuid === void 0) { holderAppUuid = config_1.configData.unumWalletHolderApp; }
    return __awaiter(void 0, void 0, void 0, function () {
        var id, response;
        return __generator(this, function (_a) {
            id = helpers_1.getUUID();
            response = exports.sendRequestV3(authorization, verifier, credentialRequests, eccPrivateKey, holderAppUuid, id, expirationDate, metadata);
            return [2 /*return*/, response];
        });
    });
};
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
                unsignedPresentationRequest = exports.constructUnsignedPresentationRequest(body, '3.0.0');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VuZFJlcXVlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdmVyaWZpZXIvc2VuZFJlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvQ0FBdUM7QUFDdkMsOENBQTZDO0FBQzdDLHlEQUFxRDtBQUVyRCx1Q0FBOE47QUFHOU4scURBQStCO0FBQy9CLG9EQUFrRTtBQUNsRSw0Q0FBMkM7QUFDM0Msc0VBQTBGO0FBQzFGLHdDQUEyQztBQUUzQzs7O0dBR0c7QUFDVSxRQUFBLG9DQUFvQyxHQUFHLFVBQUMsT0FBMkIsRUFBRSxPQUFlO0lBRTdGLElBQUEsUUFBUSxHQVFOLE9BQU8sU0FSRCxFQUNSLGFBQWEsR0FPWCxPQUFPLGNBUEksRUFDYixrQkFBa0IsR0FNaEIsT0FBTyxtQkFOUyxFQUNsQixRQUFRLEdBS04sT0FBTyxTQUxELEVBQ1IsU0FBUyxHQUlQLE9BQU8sVUFKQSxFQUNULFNBQVMsR0FHUCxPQUFPLFVBSEEsRUFDVCxTQUFTLEdBRVAsT0FBTyxVQUZBLEVBQ1QsRUFBRSxHQUNBLE9BQU8sR0FEUCxDQUNRO0lBRVosSUFBTSxJQUFJLEdBQUcsaUJBQU8sRUFBRSxDQUFDO0lBRXZCLDZGQUE2RjtJQUM3RixJQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3ZCLElBQU0saUJBQWlCLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDbkUsSUFBTSxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7SUFDN0IsSUFBTSxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7SUFDN0IsSUFBTSxnQkFBZ0IsR0FBRyxpQkFBaUIsQ0FBQztJQUMzQyxJQUFNLDhCQUE4QixHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxV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QUFBLEVBQUUsRUFBRSxJQUFBLEVBQUUsQ0FBQztnQkFFdkksa0JBQWtCO2dCQUNsQixJQUFJLEdBQUcsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRy9CLDJCQUEyQixHQUFHLDRDQUFvQyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFHbEYsUUFBUSxHQUEwQiwwQ0FBa0MsQ0FBQywyQkFBMkIsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFFakgsUUFBUSxHQUFhO29CQUN6QixNQUFNLEVBQUUsTUFBTTtvQkFDZCxPQUFPLEVBQUUsbUJBQVUsQ0FBQyxPQUFPO29CQUMzQixRQUFRLEVBQUUscUJBQXFCO29CQUMvQixNQUFNLEVBQUUsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUU7b0JBQzFELElBQUksRUFBRSxRQUFRO2lCQUNmLENBQUM7Z0JBRWUscUJBQU0seUNBQWtCLENBQXlCLFFBQVEsQ0FBQyxFQUFBOztnQkFBckUsUUFBUSxHQUFHLFNBQTBEO2dCQUVyRSxTQUFTLEdBQVcsNENBQXFCLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUVuRSwyQkFBMkIsR0FBb0MsRUFBRSxJQUFJLGVBQU8sUUFBUSxDQUFDLElBQUksQ0FBRSxFQUFFLFNBQVMsV0FBQSxFQUFFLENBQUM7Z0JBRS9HLHNCQUFPLDJCQUEyQixFQUFDOzs7Z0JBRW5DLGdCQUFNLENBQUMsS0FBSyxDQUFDLCtDQUE2QyxPQUFPLENBQUMsQ0FBQztnQkFDbkUsTUFBTSxPQUFLLENBQUM7Ozs7S0FFZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY29uZmlnRGF0YSB9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQgeyByZXF1aXJlQXV0aCB9IGZyb20gJy4uL3JlcXVpcmVBdXRoJztcbmltcG9ydCB7IENyeXB0b0Vycm9yIH0gZnJvbSAnQHVudW1pZC9saWJyYXJ5LWNyeXB0byc7XG5pbXBvcnQgeyBQcmVzZW50YXRpb25SZXF1ZXN0UG9zdER0byBhcyBQcmVzZW50YXRpb25SZXF1ZXN0UG9zdER0b0RlcHJlY2F0ZWRWMiwgVW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0IGFzIFVuc2lnbmVkUHJlc2VudGF0aW9uUmVxdWVzdERlcHJlY2F0ZWRWMiwgU2lnbmVkUHJlc2VudGF0aW9uUmVxdWVzdCBhcyBTaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0RGVwcmVjYXRlZFYyLCBQcm9vZiB9IGZyb20gJ0B1bnVtaWQvdHlwZXMtdjInO1xuaW1wb3J0IHsgQ3JlZGVudGlhbFJlcXVlc3QsIFByZXNlbnRhdGlvblJlcXVlc3RQb3N0RHRvLCBVbnNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3RQYiwgUHJlc2VudGF0aW9uUmVxdWVzdFBiLCBQcm9vZlBiLCBTaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0LCBDcmVkZW50aWFsUmVxdWVzdFBiLCBKU09OT2JqLCBQcmVzZW50YXRpb25SZXF1ZXN0RHRvIH0gZnJvbSAnQHVudW1pZC90eXBlcyc7XG5cbmltcG9ydCB7IFJFU1REYXRhLCBTZW5kUmVxdWVzdFJlcUJvZHksIFVudW1EdG8gfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBjcmVhdGVQcm9vZiwgY3JlYXRlUHJvb2ZQYiB9IGZyb20gJy4uL3V0aWxzL2NyZWF0ZVByb29mJztcbmltcG9ydCB7IGdldFVVSUQgfSBmcm9tICcuLi91dGlscy9oZWxwZXJzJztcbmltcG9ydCB7IG1ha2VOZXR3b3JrUmVxdWVzdCwgaGFuZGxlQXV0aFRva2VuSGVhZGVyIH0gZnJvbSAnLi4vdXRpbHMvbmV0d29ya1JlcXVlc3RIZWxwZXInO1xuaW1wb3J0IHsgQ3VzdEVycm9yIH0gZnJvbSAnLi4vdXRpbHMvZXJyb3InO1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYW4gdW5zaWduZWQgUHJlc2VudGF0aW9uUmVxdWVzdCBmcm9tIHRoZSBpbmNvbWluZyByZXF1ZXN0IGJvZHkuXG4gKiBAcGFyYW0gcmVxQm9keSBTZW5kUmVxdWVzdFJlcUJvZHlcbiAqL1xuZXhwb3J0IGNvbnN0IGNvbnN0cnVjdFVuc2lnbmVkUHJlc2VudGF0aW9uUmVxdWVzdCA9IChyZXFCb2R5OiBTZW5kUmVxdWVzdFJlcUJvZHksIHZlcnNpb246IHN0cmluZyk6IFVuc2lnbmVkUHJlc2VudGF0aW9uUmVxdWVzdFBiID0+IHtcbiAgY29uc3Qge1xuICAgIHZlcmlmaWVyLFxuICAgIGhvbGRlckFwcFV1aWQsXG4gICAgY3JlZGVudGlhbFJlcXVlc3RzLFxuICAgIG1ldGFkYXRhLFxuICAgIGV4cGlyZXNBdCxcbiAgICBjcmVhdGVkQXQsXG4gICAgdXBkYXRlZEF0LFxuICAgIGlkXG4gIH0gPSByZXFCb2R5O1xuXG4gIGNvbnN0IHV1aWQgPSBnZXRVVUlEKCk7XG5cbiAgLy8gYW55L2FsbCBkZWZhdWx0IHZhbHVlcyBtdXN0IGJlIHNldCBiZWZvcmUgc2lnbmluZywgb3Igc2lnbmF0dXJlIHdpbGwgYWx3YXlzIGZhaWwgdG8gdmVyaWZ5XG4gIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gIGNvbnN0IHRlbk1pbnV0ZXNGcm9tTm93ID0gbmV3IERhdGUobm93LmdldFRpbWUoKSArIDEwICogNjAgKiAxMDAwKTtcbiAgY29uc3QgZGVmYXVsdENyZWF0ZWRBdCA9IG5vdztcbiAgY29uc3QgZGVmYXVsdFVwZGF0ZWRBdCA9IG5vdztcbiAgY29uc3QgZGVmYXVsdEV4cGlyZXNBdCA9IHRlbk1pbnV0ZXNGcm9tTm93O1xuICBjb25zdCBjcmVkZW50aWFsUmVxdWVzdHNXaXRoRGVmYXVsdHMgPSBjcmVkZW50aWFsUmVxdWVzdHMubWFwKGNyID0+IHtcbiAgICByZXR1cm4gY3IucmVxdWlyZWQgPyBjciA6IHsgLi4uY3IsIHJlcXVpcmVkOiBmYWxzZSB9O1xuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGNyZWRlbnRpYWxSZXF1ZXN0czogY3JlZGVudGlhbFJlcXVlc3RzV2l0aERlZmF1bHRzLFxuICAgIGNyZWF0ZWRBdDogY3JlYXRlZEF0IHx8IGRlZmF1bHRDcmVhdGVkQXQsXG4gICAgdXBkYXRlZEF0OiB1cGRhdGVkQXQgfHwgZGVmYXVsdFVwZGF0ZWRBdCxcbiAgICBleHBpcmVzQXQ6IGV4cGlyZXNBdCB8fCBkZWZhdWx0RXhwaXJlc0F0LFxuICAgIGhvbGRlckFwcFV1aWQsXG4gICAgbWV0YWRhdGE6IG1ldGFkYXRhID8gSlNPTi5zdHJpbmdpZnkobWV0YWRhdGEpIDogJ3t9JyxcbiAgICAvLyBtZXRhZGF0YTogbWV0YWRhdGEgPyBKU09OLnN0cmluZ2lmeShtZXRhZGF0YSkgOiB7fSBhcyBKU09OT2JqLFxuICAgIC8vIG1ldGFkYXRhOiBKU09OLnN0cmluZ2lmeShtZXRhZGF0YSksXG4gICAgdXVpZCxcbiAgICBpZCxcbiAgICB2ZXJpZmllcixcbiAgICB2ZXJzaW9uXG4gIH07XG59O1xuXG4vKipcbiAqIFNpZ25zIGFuIHVuc2lnbmVkIFByZXNlbnRhdGlvblJlcXVlc3QgYW5kIGF0dGFjaGVzIHRoZSByZXN1bHRpbmcgUHJvb2ZcbiAqIEBwYXJhbSB1bnNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3QgVW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0XG4gKiBAcGFyYW0gcHJpdmF0ZUtleSBTdHJpbmdcbiAqL1xuZXhwb3J0IGNvbnN0IGNvbnN0cnVjdFNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3REZXByZWNhdGVkVjIgPSAodW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0OiBVbnNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3REZXByZWNhdGVkVjIsIHByaXZhdGVLZXk6IHN0cmluZyk6IFNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3REZXByZWNhdGVkVjIgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHByb29mOiBQcm9vZiA9IGNyZWF0ZVByb29mKFxuICAgICAgdW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0LFxuICAgICAgcHJpdmF0ZUtleSxcbiAgICAgIHVuc2lnbmVkUHJlc2VudGF0aW9uUmVxdWVzdC52ZXJpZmllcixcbiAgICAgICdwZW0nXG4gICAgKTtcblxuICAgIGNvbnN0IHNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3Q6IFNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3REZXByZWNhdGVkVjIgPSB7XG4gICAgICAuLi51bnNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3QsXG4gICAgICBwcm9vZjogcHJvb2ZcbiAgICB9O1xuXG4gICAgcmV0dXJuIHNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3Q7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZSBpbnN0YW5jZW9mIENyeXB0b0Vycm9yKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoYElzc3VlIGluIHRoZSBjcnlwdG8gbGliIHdoaWxlIGNyZWF0aW5nIHByZXNlbnRhdGlvbiByZXF1ZXN0ICR7dW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0LnV1aWR9IHByb29mYCwgZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ2dlci5lcnJvcihgSXNzdWUgd2hpbGUgY3JlYXRpbmcgcHJlc2VudGF0aW9uIHJlcXVlc3QgJHt1bnNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3QudXVpZH0gcHJvb2ZgLCBlKTtcbiAgICB9XG5cbiAgICB0aHJvdyBlO1xuICB9XG59O1xuXG4vKipcbiAqIFNpZ25zIGFuIHVuc2lnbmVkIFByZXNlbnRhdGlvblJlcXVlc3QgYW5kIGF0dGFjaGVzIHRoZSByZXN1bHRpbmcgUHJvb2ZcbiAqIEBwYXJhbSB1bnNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3QgVW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0XG4gKiBAcGFyYW0gcHJpdmF0ZUtleSBTdHJpbmdcbiAqL1xuZXhwb3J0IGNvbnN0IGNvbnN0cnVjdFNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3QgPSAodW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0OiBVbnNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3RQYiwgcHJpdmF0ZUtleTogc3RyaW5nKTogUHJlc2VudGF0aW9uUmVxdWVzdFBiID0+IHtcbiAgdHJ5IHtcbiAgICAvLyBjb252ZXJ0IHRoZSBwcm90b2J1ZiB0byBhIGJ5dGUgYXJyYXlcbiAgICBjb25zdCBieXRlczogVWludDhBcnJheSA9IFVuc2lnbmVkUHJlc2VudGF0aW9uUmVxdWVzdFBiLmVuY29kZSh1bnNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3QpLmZpbmlzaCgpO1xuXG4gICAgY29uc3QgcHJvb2Y6IFByb29mUGIgPSBjcmVhdGVQcm9vZlBiKFxuICAgICAgYnl0ZXMsXG4gICAgICBwcml2YXRlS2V5LFxuICAgICAgdW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0LnZlcmlmaWVyXG4gICAgKTtcblxuICAgIGNvbnN0IHNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3Q6IFByZXNlbnRhdGlvblJlcXVlc3RQYiA9IHtcbiAgICAgIC4uLnVuc2lnbmVkUHJlc2VudGF0aW9uUmVxdWVzdCxcbiAgICAgIHByb29mOiBwcm9vZlxuICAgIH07XG5cbiAgICByZXR1cm4gc2lnbmVkUHJlc2VudGF0aW9uUmVxdWVzdDtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChlIGluc3RhbmNlb2YgQ3J5cHRvRXJyb3IpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihgSXNzdWUgaW4gdGhlIGNyeXB0byBsaWIgd2hpbGUgY3JlYXRpbmcgcHJlc2VudGF0aW9uIHJlcXVlc3QgJHt1bnNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3QudXVpZH0gcHJvb2ZgLCBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nZ2VyLmVycm9yKGBJc3N1ZSB3aGlsZSBjcmVhdGluZyBwcmVzZW50YXRpb24gcmVxdWVzdCAke3Vuc2lnbmVkUHJlc2VudGF0aW9uUmVxdWVzdC51dWlkfSBwcm9vZmAsIGUpO1xuICAgIH1cblxuICAgIHRocm93IGU7XG4gIH1cbn07XG5cbi8vIHZhbGlkYXRlcyBpbmNvbWluZyByZXF1ZXN0IGJvZHlcbmNvbnN0IHZhbGlkYXRlU2VuZFJlcXVlc3RCb2R5ID0gKHNlbmRSZXF1ZXN0Qm9keTogU2VuZFJlcXVlc3RSZXFCb2R5KTogU2VuZFJlcXVlc3RSZXFCb2R5ID0+IHtcbiAgY29uc3Qge1xuICAgIHZlcmlmaWVyLFxuICAgIGNyZWRlbnRpYWxSZXF1ZXN0cyxcbiAgICBlY2NQcml2YXRlS2V5LFxuICAgIGhvbGRlckFwcFV1aWQsXG4gICAgbWV0YWRhdGEsXG4gICAgaWRcbiAgfSA9IHNlbmRSZXF1ZXN0Qm9keTtcblxuICBpZiAoIXZlcmlmaWVyKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvblJlcXVlc3Qgb3B0aW9uczogdmVyaWZpZXIgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAodHlwZW9mIHZlcmlmaWVyICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb25SZXF1ZXN0IG9wdGlvbnM6IHZlcmlmaWVyIG11c3QgYmUgYSBzdHJpbmcuJyk7XG4gIH1cblxuICBpZiAoIWhvbGRlckFwcFV1aWQpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uUmVxdWVzdCBvcHRpb25zOiBob2xkZXJBcHBVdWlkIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBob2xkZXJBcHBVdWlkICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb25SZXF1ZXN0IG9wdGlvbnM6IGhvbGRlckFwcFV1aWQgbXVzdCBiZSBhIHN0cmluZy4nKTtcbiAgfVxuXG4gIGlmICghY3JlZGVudGlhbFJlcXVlc3RzKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvblJlcXVlc3Qgb3B0aW9uczogY3JlZGVudGlhbFJlcXVlc3RzIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgLy8gY3JlZGVudGlhbFJlcXVlc3RzIGlucHV0IGVsZW1lbnQgbXVzdCBiZSBhbiBhcnJheVxuICBpZiAoIUFycmF5LmlzQXJyYXkoY3JlZGVudGlhbFJlcXVlc3RzKSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb25SZXF1ZXN0IG9wdGlvbnM6IGNyZWRlbnRpYWxSZXF1ZXN0cyBtdXN0IGJlIGFuIGFycmF5LicpO1xuICB9XG5cbiAgY29uc3QgdG90Q3JlZFJlcXMgPSBjcmVkZW50aWFsUmVxdWVzdHMubGVuZ3RoO1xuICBpZiAodG90Q3JlZFJlcXMgPT09IDApIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uUmVxdWVzdCBvcHRpb25zOiBjcmVkZW50aWFsUmVxdWVzdHMgYXJyYXkgbXVzdCBub3QgYmUgZW1wdHkuJyk7XG4gIH1cblxuICAvLyBjcmVkZW50aWFsUmVxdWVzdHMgaW5wdXQgZWxlbWVudCBzaG91bGQgaGF2ZSB0eXBlIGFuZCBpc3N1ZXIgZWxlbWVudHNcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b3RDcmVkUmVxczsgaSsrKSB7XG4gICAgY29uc3QgY3JlZGVudGlhbFJlcXVlc3QgPSBjcmVkZW50aWFsUmVxdWVzdHNbaV07XG5cbiAgICBpZiAoIWNyZWRlbnRpYWxSZXF1ZXN0LnR5cGUpIHtcbiAgICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBjcmVkZW50aWFsUmVxdWVzdDogdHlwZSBpcyByZXF1aXJlZC4nKTtcbiAgICB9XG5cbiAgICBpZiAoIWNyZWRlbnRpYWxSZXF1ZXN0Lmlzc3VlcnMpIHtcbiAgICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBjcmVkZW50aWFsUmVxdWVzdDogaXNzdWVycyBpcyByZXF1aXJlZC4nKTtcbiAgICB9XG5cbiAgICAvLyBjcmVkZW50aWFsUmVxdWVzdHMuaXNzdWVycyBpbnB1dCBlbGVtZW50IG11c3QgYmUgYW4gYXJyYXlcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoY3JlZGVudGlhbFJlcXVlc3QuaXNzdWVycykpIHtcbiAgICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBjcmVkZW50aWFsUmVxdWVzdDogaXNzdWVycyBtdXN0IGJlIGFuIGFycmF5LicpO1xuICAgIH1cblxuICAgIGNvbnN0IHRvdElzc3VlcnMgPSBjcmVkZW50aWFsUmVxdWVzdC5pc3N1ZXJzLmxlbmd0aDtcbiAgICBpZiAodG90SXNzdWVycyA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIGNyZWRlbnRpYWxSZXF1ZXN0OiBpc3N1ZXJzIGFycmF5IG11c3Qgbm90IGJlIGVtcHR5LicpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgaXNzdWVyIG9mIGNyZWRlbnRpYWxSZXF1ZXN0Lmlzc3VlcnMpIHtcbiAgICAgIGlmICh0eXBlb2YgaXNzdWVyICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgY3JlZGVudGlhbFJlcXVlc3Q6IGlzc3VlcnMgYXJyYXkgZWxlbWVudCBtdXN0IGJlIGEgc3RyaW5nLicpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEVDQyBQcml2YXRlIEtleSBpcyBtYW5kYXRvcnkgaW5wdXQgcGFyYW1ldGVyXG4gIGlmICghZWNjUHJpdmF0ZUtleSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb25SZXF1ZXN0IG9wdGlvbnM6IHNpZ25pbmdQcml2YXRlS2V5IGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgLy8gLy8gRW5zdXJlIHRoYXQgbWV0YWRhdGEgb2JqZWN0IGlzIGtleWVkIG9uIGZpZWxkcyBmb3IgU3RydWN0IHByb3RvYnVmIGRlZmluaXRpb25cbiAgLy8gaWYgKCFtZXRhZGF0YSkge1xuICAvLyAgIHNlbmRSZXF1ZXN0Qm9keS5tZXRhZGF0YSA9IHtcbiAgLy8gICAgIGZpZWxkczoge31cbiAgLy8gICB9O1xuICAvLyB9IGVsc2UgaWYgKG1ldGFkYXRhICYmICFtZXRhZGF0YS5maWVsZHMpIHtcbiAgLy8gICBsb2dnZXIuZGVidWcoJ0FkZGluZyB0aGUgcm9vdCBcXCdmaWVsZHNcXCcga2V5IHRvIHRoZSBwcmVzZW50YXRpb24gcmVxdWVzdCBtZXRhZGF0YS4nKTtcbiAgLy8gICBzZW5kUmVxdWVzdEJvZHkubWV0YWRhdGEgPSB7XG4gIC8vICAgICBmaWVsZHM6IHNlbmRSZXF1ZXN0Qm9keS5tZXRhZGF0YVxuICAvLyAgIH07XG4gIC8vIH1cblxuICBpZiAoIWlkKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvblJlcXVlc3Qgb3B0aW9uczogaWQgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICByZXR1cm4gc2VuZFJlcXVlc3RCb2R5O1xufTtcblxuLy8gdmFsaWRhdGVzIGluY29taW5nIHJlcXVlc3QgYm9keVxuY29uc3QgdmFsaWRhdGVTZW5kUmVxdWVzdEJvZHlEZXByZWNhdGVkID0gKHNlbmRSZXF1ZXN0Qm9keTogU2VuZFJlcXVlc3RSZXFCb2R5KTogU2VuZFJlcXVlc3RSZXFCb2R5ID0+IHtcbiAgY29uc3Qge1xuICAgIHZlcmlmaWVyLFxuICAgIGNyZWRlbnRpYWxSZXF1ZXN0cyxcbiAgICBlY2NQcml2YXRlS2V5LFxuICAgIGhvbGRlckFwcFV1aWQsXG4gICAgbWV0YWRhdGEsXG4gICAgaWRcbiAgfSA9IHNlbmRSZXF1ZXN0Qm9keTtcblxuICBpZiAoIXZlcmlmaWVyKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvblJlcXVlc3Qgb3B0aW9uczogdmVyaWZpZXIgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAodHlwZW9mIHZlcmlmaWVyICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb25SZXF1ZXN0IG9wdGlvbnM6IHZlcmlmaWVyIG11c3QgYmUgYSBzdHJpbmcuJyk7XG4gIH1cblxuICBpZiAoIWhvbGRlckFwcFV1aWQpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uUmVxdWVzdCBvcHRpb25zOiBob2xkZXJBcHBVdWlkIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBob2xkZXJBcHBVdWlkICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb25SZXF1ZXN0IG9wdGlvbnM6IGhvbGRlckFwcFV1aWQgbXVzdCBiZSBhIHN0cmluZy4nKTtcbiAgfVxuXG4gIGlmICghY3JlZGVudGlhbFJlcXVlc3RzKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvblJlcXVlc3Qgb3B0aW9uczogY3JlZGVudGlhbFJlcXVlc3RzIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgLy8gY3JlZGVudGlhbFJlcXVlc3RzIGlucHV0IGVsZW1lbnQgbXVzdCBiZSBhbiBhcnJheVxuICBpZiAoIUFycmF5LmlzQXJyYXkoY3JlZGVudGlhbFJlcXVlc3RzKSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb25SZXF1ZXN0IG9wdGlvbnM6IGNyZWRlbnRpYWxSZXF1ZXN0cyBtdXN0IGJlIGFuIGFycmF5LicpO1xuICB9XG5cbiAgY29uc3QgdG90Q3JlZFJlcXMgPSBjcmVkZW50aWFsUmVxdWVzdHMubGVuZ3RoO1xuICBpZiAodG90Q3JlZFJlcXMgPT09IDApIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uUmVxdWVzdCBvcHRpb25zOiBjcmVkZW50aWFsUmVxdWVzdHMgYXJyYXkgbXVzdCBub3QgYmUgZW1wdHkuJyk7XG4gIH1cblxuICAvLyBjcmVkZW50aWFsUmVxdWVzdHMgaW5wdXQgZWxlbWVudCBzaG91bGQgaGF2ZSB0eXBlIGFuZCBpc3N1ZXIgZWxlbWVudHNcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b3RDcmVkUmVxczsgaSsrKSB7XG4gICAgY29uc3QgY3JlZGVudGlhbFJlcXVlc3QgPSBjcmVkZW50aWFsUmVxdWVzdHNbaV07XG5cbiAgICBpZiAoIWNyZWRlbnRpYWxSZXF1ZXN0LnR5cGUpIHtcbiAgICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBjcmVkZW50aWFsUmVxdWVzdDogdHlwZSBpcyByZXF1aXJlZC4nKTtcbiAgICB9XG5cbiAgICBpZiAoIWNyZWRlbnRpYWxSZXF1ZXN0Lmlzc3VlcnMpIHtcbiAgICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBjcmVkZW50aWFsUmVxdWVzdDogaXNzdWVycyBpcyByZXF1aXJlZC4nKTtcbiAgICB9XG5cbiAgICAvLyBjcmVkZW50aWFsUmVxdWVzdHMuaXNzdWVycyBpbnB1dCBlbGVtZW50IG11c3QgYmUgYW4gYXJyYXlcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoY3JlZGVudGlhbFJlcXVlc3QuaXNzdWVycykpIHtcbiAgICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBjcmVkZW50aWFsUmVxdWVzdDogaXNzdWVycyBtdXN0IGJlIGFuIGFycmF5LicpO1xuICAgIH1cblxuICAgIGNvbnN0IHRvdElzc3VlcnMgPSBjcmVkZW50aWFsUmVxdWVzdC5pc3N1ZXJzLmxlbmd0aDtcbiAgICBpZiAodG90SXNzdWVycyA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIGNyZWRlbnRpYWxSZXF1ZXN0OiBpc3N1ZXJzIGFycmF5IG11c3Qgbm90IGJlIGVtcHR5LicpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgaXNzdWVyIG9mIGNyZWRlbnRpYWxSZXF1ZXN0Lmlzc3VlcnMpIHtcbiAgICAgIGlmICh0eXBlb2YgaXNzdWVyICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgY3JlZGVudGlhbFJlcXVlc3Q6IGlzc3VlcnMgYXJyYXkgZWxlbWVudCBtdXN0IGJlIGEgc3RyaW5nLicpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEVDQyBQcml2YXRlIEtleSBpcyBtYW5kYXRvcnkgaW5wdXQgcGFyYW1ldGVyXG4gIGlmICghZWNjUHJpdmF0ZUtleSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb25SZXF1ZXN0IG9wdGlvbnM6IHNpZ25pbmdQcml2YXRlS2V5IGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgLy8gLy8gRW5zdXJlIHRoYXQgbWV0YWRhdGEgb2JqZWN0IGlzIGtleWVkIG9uIGZpZWxkcyBmb3IgU3RydWN0IHByb3RvYnVmIGRlZmluaXRpb25cbiAgLy8gaWYgKCFtZXRhZGF0YSkge1xuICAvLyAgIHNlbmRSZXF1ZXN0Qm9keS5tZXRhZGF0YSA9IHtcbiAgLy8gICAgIGZpZWxkczoge31cbiAgLy8gICB9O1xuICAvLyB9XG5cbiAgaWYgKCFpZCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb25SZXF1ZXN0IG9wdGlvbnM6IGlkIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgcmV0dXJuIHNlbmRSZXF1ZXN0Qm9keTtcbn07XG5cbi8qKlxuICogSGFuZGxlciBmb3Igc2VuZGluZyBhIFByZXNlbnRhdGlvblJlcXVlc3QgdG8gVW51bUlEJ3MgU2FhUy5cbiAqIE1pZGRsZXdhcmUgZnVuY3Rpb24gd2hlcmUgb25lIGNhbiBhZGQgcmVxdWVzdHMgb2YgbXVsdGlwbGUgdmVyc2lvbnMgdG8gYmUgZW5jcnlwdGVkIGFuZCBzdG9yZWQgaW4gdGhlIFNhYVMgZGIgZm9yIHZlcnNpb25pbmcgbmVlZHMuXG4gKiBAcGFyYW0gYXV0aG9yaXphdGlvblxuICogQHBhcmFtIHZlcmlmaWVyXG4gKiBAcGFyYW0gY3JlZGVudGlhbFJlcXVlc3RzXG4gKiBAcGFyYW0gZWNjUHJpdmF0ZUtleVxuICogQHBhcmFtIGhvbGRlckFwcFV1aWRcbiAqL1xuZXhwb3J0IGNvbnN0IHNlbmRSZXF1ZXN0ID0gYXN5bmMgKFxuICBhdXRob3JpemF0aW9uOnN0cmluZyxcbiAgdmVyaWZpZXI6IHN0cmluZyxcbiAgY3JlZGVudGlhbFJlcXVlc3RzOiBDcmVkZW50aWFsUmVxdWVzdFBiW10gfCBDcmVkZW50aWFsUmVxdWVzdFtdLFxuICBlY2NQcml2YXRlS2V5OiBzdHJpbmcsXG4gIGhvbGRlckFwcFV1aWQ6IHN0cmluZyA9IGNvbmZpZ0RhdGEudW51bVdhbGxldEhvbGRlckFwcCwgLy8gZGVmYXVsdHMgdG8gdGhlIFVudW0gSUQgV2FsbGV0IEhvbGRlciBpZiBubyB2YWx1ZSBpcyBwcmVzZW50XG4gIGV4cGlyYXRpb25EYXRlPzogRGF0ZSxcbiAgbWV0YWRhdGE/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuKTogUHJvbWlzZTxVbnVtRHRvPFByZXNlbnRhdGlvblJlcXVlc3REdG8+PiA9PiB7XG4gIC8vIGNyZWF0ZSBhbiBpbmRlbnRpZmllciB0aGF0IHRpZXMgdG9nZXRoZXIgdGhlc2UgcmVsYXRlZCByZXF1ZXN0cyBvZiBkaWZmZXJlbnQgdmVyc2lvbnMuXG4gIGNvbnN0IGlkID0gZ2V0VVVJRCgpO1xuXG4gIGNvbnN0IHJlc3BvbnNlID0gc2VuZFJlcXVlc3RWMyhhdXRob3JpemF0aW9uLCB2ZXJpZmllciwgY3JlZGVudGlhbFJlcXVlc3RzLCBlY2NQcml2YXRlS2V5LCBob2xkZXJBcHBVdWlkLCBpZCwgZXhwaXJhdGlvbkRhdGUsIG1ldGFkYXRhKTtcbiAgcmV0dXJuIHJlc3BvbnNlO1xufTtcblxuLyoqXG4gKiBIYW5kbGVyIGZvciBzZW5kaW5nIGEgUHJlc2VudGF0aW9uUmVxdWVzdCB0byBVbnVtSUQncyBTYWFTLlxuICogQHBhcmFtIGF1dGhvcml6YXRpb25cbiAqIEBwYXJhbSB2ZXJpZmllclxuICogQHBhcmFtIGNyZWRlbnRpYWxSZXF1ZXN0c1xuICogQHBhcmFtIGVjY1ByaXZhdGVLZXlcbiAqIEBwYXJhbSBob2xkZXJBcHBVdWlkXG4gKi9cbmV4cG9ydCBjb25zdCBzZW5kUmVxdWVzdFYzID0gYXN5bmMgKFxuICBhdXRob3JpemF0aW9uOnN0cmluZyxcbiAgdmVyaWZpZXI6IHN0cmluZyxcbiAgY3JlZGVudGlhbFJlcXVlc3RzOiBDcmVkZW50aWFsUmVxdWVzdFBiW10sXG4gIGVjY1ByaXZhdGVLZXk6IHN0cmluZyxcbiAgaG9sZGVyQXBwVXVpZDogc3RyaW5nLFxuICBpZDogc3RyaW5nLFxuICBleHBpcmF0aW9uRGF0ZT86IERhdGUsXG4gIG1ldGFkYXRhPzogYW55XG4pOiBQcm9taXNlPFVudW1EdG88UHJlc2VudGF0aW9uUmVxdWVzdER0bz4+ID0+IHtcbiAgdHJ5IHtcbiAgICByZXF1aXJlQXV0aChhdXRob3JpemF0aW9uKTtcblxuICAgIGxldCBib2R5OiBTZW5kUmVxdWVzdFJlcUJvZHkgPSB7IHZlcmlmaWVyLCBjcmVkZW50aWFsUmVxdWVzdHMsIGVjY1ByaXZhdGVLZXksIGhvbGRlckFwcFV1aWQsIGV4cGlyZXNBdDogZXhwaXJhdGlvbkRhdGUsIG1ldGFkYXRhLCBpZCB9O1xuXG4gICAgLy8gVmFsaWRhdGUgaW5wdXRzXG4gICAgYm9keSA9IHZhbGlkYXRlU2VuZFJlcXVlc3RCb2R5KGJvZHkpO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSB1bnNpZ25lZCBwcmVzZW50YXRpb24gcmVxdWVzdCBvYmplY3QgZnJvbSB0aGUgdW5zaWduZWRQcmVzZW50YXRpb24gb2JqZWN0XG4gICAgY29uc3QgdW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0ID0gY29uc3RydWN0VW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0KGJvZHksICczLjAuMCcpO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBzaWduZWQgcHJlc2VudGF0aW9uIHJlcXVlc3Qgb2JqZWN0IGZyb20gdGhlIHVuc2lnbmVkUHJlc2VudGF0aW9uIG9iamVjdFxuICAgIGNvbnN0IHNpZ25lZFBSOiBQcmVzZW50YXRpb25SZXF1ZXN0UGIgPSBjb25zdHJ1Y3RTaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0KHVuc2lnbmVkUHJlc2VudGF0aW9uUmVxdWVzdCwgZWNjUHJpdmF0ZUtleSk7XG5cbiAgICBjb25zdCByZXN0RGF0YTogUkVTVERhdGEgPSB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGJhc2VVcmw6IGNvbmZpZ0RhdGEuU2FhU1VybCxcbiAgICAgIGVuZFBvaW50OiAncHJlc2VudGF0aW9uUmVxdWVzdCcsXG4gICAgICBoZWFkZXI6IHsgQXV0aG9yaXphdGlvbjogYXV0aG9yaXphdGlvbiwgdmVyc2lvbjogJzMuMC4wJyB9LFxuICAgICAgZGF0YTogc2lnbmVkUFJcbiAgICB9O1xuXG4gICAgY29uc3QgcmVzdFJlc3AgPSBhd2FpdCBtYWtlTmV0d29ya1JlcXVlc3Q8UHJlc2VudGF0aW9uUmVxdWVzdER0bz4ocmVzdERhdGEpO1xuXG4gICAgY29uc3QgYXV0aFRva2VuOiBzdHJpbmcgPSBoYW5kbGVBdXRoVG9rZW5IZWFkZXIocmVzdFJlc3AsIGF1dGhvcml6YXRpb24pO1xuXG4gICAgY29uc3QgcHJlc2VudGF0aW9uUmVxdWVzdFJlc3BvbnNlOiBVbnVtRHRvPFByZXNlbnRhdGlvblJlcXVlc3REdG8+ID0geyBib2R5OiB7IC4uLnJlc3RSZXNwLmJvZHkgfSwgYXV0aFRva2VuIH07XG5cbiAgICByZXR1cm4gcHJlc2VudGF0aW9uUmVxdWVzdFJlc3BvbnNlO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcihgRXJyb3Igc2VuZGluZyByZXF1ZXN0IHRvIHVzZSBVbnVtSUQgU2Fhcy4gJHtlcnJvcn1gKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcbiJdfQ==