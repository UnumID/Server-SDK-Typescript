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
exports.sendRequest = exports.constructSignedPresentationRequest = exports.constructUnsignedPresentationRequest = void 0;
var config_1 = require("../config");
var requireAuth_1 = require("../requireAuth");
var library_issuer_verifier_utility_1 = require("@unumid/library-issuer-verifier-utility");
var library_crypto_1 = require("@unumid/library-crypto");
var logger_1 = __importDefault(require("../logger"));
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
    try {
        var proof = library_issuer_verifier_utility_1.createProof(unsignedPresentationRequest, privateKey, unsignedPresentationRequest.verifier, 'pem');
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
                throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid credentialRequest: issuers array element must be a string.');
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
exports.sendRequest = function (authorization, verifier, credentialRequests, eccPrivateKey, holderAppUuid, expirationDate, metadata) { return __awaiter(void 0, void 0, void 0, function () {
    var body, unsignedPresentationRequest, signedPR, restData, restResp, authToken, presentationRequestResponse, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                requireAuth_1.requireAuth(authorization);
                body = { verifier: verifier, credentialRequests: credentialRequests, eccPrivateKey: eccPrivateKey, holderAppUuid: holderAppUuid, expiresAt: expirationDate, metadata: metadata };
                // Validate inputs
                validateSendRequestBody(body);
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
                authToken = library_issuer_verifier_utility_1.handleAuthToken(restResp);
                presentationRequestResponse = { body: __assign({}, restResp.body), authToken: authToken };
                return [2 /*return*/, presentationRequestResponse];
            case 2:
                error_1 = _a.sent();
                logger_1.default.error("Error sending request to use UnumID Saas. " + error_1);
                throw error_1;
            case 3: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VuZFJlcXVlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdmVyaWZpZXIvc2VuZFJlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxvQ0FBdUM7QUFDdkMsOENBQTZDO0FBQzdDLDJGQUF5STtBQUN6SSx5REFBcUQ7QUFVckQscURBQStCO0FBSS9COzs7R0FHRztBQUNVLFFBQUEsb0NBQW9DLEdBQUcsVUFBQyxPQUEyQjtJQUU1RSxJQUFBLFFBQVEsR0FPTixPQUFPLFNBUEQsRUFDUixhQUFhLEdBTVgsT0FBTyxjQU5JLEVBQ2Isa0JBQWtCLEdBS2hCLE9BQU8sbUJBTFMsRUFDbEIsUUFBUSxHQUlOLE9BQU8sU0FKRCxFQUNSLFNBQVMsR0FHUCxPQUFPLFVBSEEsRUFDVCxTQUFTLEdBRVAsT0FBTyxVQUZBLEVBQ1QsU0FBUyxHQUNQLE9BQU8sVUFEQSxDQUNDO0lBRVosSUFBTSxJQUFJLEdBQUcseUNBQU8sRUFBRSxDQUFDO0lBRXZCLDZGQUE2RjtJQUM3RixJQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3ZCLElBQU0saUJBQWlCLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDbkUsSUFBTSxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7SUFDN0IsSUFBTSxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7SUFDN0IsSUFBTSxnQkFBZ0IsR0FBRyxpQkFBaUIsQ0FBQztJQUMzQyxJQUFNLDhCQUE4QixHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxVQUFBLEVBQUU7UUFDOUQsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyx1QkFBTSxFQUFFLEtBQUUsUUFBUSxF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QkFBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUVyQixJQUFJLEdBQXVCLEVBQUUsUUFBUSxVQUFBLEVBQUUsa0JBQWtCLG9CQUFBLEVBQUUsYUFBYSxlQUFBLEVBQUUsYUFBYSxlQUFBLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxRQUFRLFVBQUEsRUFBRSxDQUFDO2dCQUVySSxrQkFBa0I7Z0JBQ2xCLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUV4QiwyQkFBMkIsR0FBRyw0Q0FBb0MsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFHekUsUUFBUSxHQUFHLDBDQUFrQyxDQUFDLDJCQUEyQixFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUUxRixRQUFRLEdBQWE7b0JBQ3pCLE1BQU0sRUFBRSxNQUFNO29CQUNkLE9BQU8sRUFBRSxtQkFBVSxDQUFDLE9BQU87b0JBQzNCLFFBQVEsRUFBRSxxQkFBcUI7b0JBQy9CLE1BQU0sRUFBRSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUU7b0JBQ3hDLElBQUksRUFBRSxRQUFRO2lCQUNmLENBQUM7Z0JBRWUscUJBQU0sb0RBQWtCLENBQThCLFFBQVEsQ0FBQyxFQUFBOztnQkFBMUUsUUFBUSxHQUFHLFNBQStEO2dCQUUxRSxTQUFTLEdBQVcsaURBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFOUMsMkJBQTJCLEdBQXlDLEVBQUUsSUFBSSxlQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUUsRUFBRSxTQUFTLFdBQUEsRUFBRSxDQUFDO2dCQUVwSCxzQkFBTywyQkFBMkIsRUFBQzs7O2dCQUVuQyxnQkFBTSxDQUFDLEtBQUssQ0FBQywrQ0FBNkMsT0FBTyxDQUFDLENBQUM7Z0JBQ25FLE1BQU0sT0FBSyxDQUFDOzs7O0tBRWYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyBjb25maWdEYXRhIH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7IHJlcXVpcmVBdXRoIH0gZnJvbSAnLi4vcmVxdWlyZUF1dGgnO1xuaW1wb3J0IHsgZ2V0VVVJRCwgY3JlYXRlUHJvb2YsIEN1c3RFcnJvciwgUkVTVERhdGEsIG1ha2VOZXR3b3JrUmVxdWVzdCwgaGFuZGxlQXV0aFRva2VuIH0gZnJvbSAnQHVudW1pZC9saWJyYXJ5LWlzc3Vlci12ZXJpZmllci11dGlsaXR5JztcbmltcG9ydCB7IENyeXB0b0Vycm9yIH0gZnJvbSAnQHVudW1pZC9saWJyYXJ5LWNyeXB0byc7XG5cbmltcG9ydCB7XG4gIENyZWRlbnRpYWxSZXF1ZXN0LFxuICBQcmVzZW50YXRpb25SZXF1ZXN0UmVzcG9uc2UsXG4gIFNlbmRSZXF1ZXN0UmVxQm9keSxcbiAgU2lnbmVkUHJlc2VudGF0aW9uUmVxdWVzdCxcbiAgVW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0LFxuICBVbnVtRHRvXG59IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi4vbG9nZ2VyJztcblxudHlwZSBTZW5kUmVxdWVzdFJlcVR5cGUgPSBleHByZXNzLlJlcXVlc3Q8UmVjb3JkPHN0cmluZywgdW5rbm93bj4sIFByZXNlbnRhdGlvblJlcXVlc3RSZXNwb25zZSwgU2VuZFJlcXVlc3RSZXFCb2R5PlxuXG4vKipcbiAqIENvbnN0cnVjdHMgYW4gdW5zaWduZWQgUHJlc2VudGF0aW9uUmVxdWVzdCBmcm9tIHRoZSBpbmNvbWluZyByZXF1ZXN0IGJvZHkuXG4gKiBAcGFyYW0gcmVxQm9keSBTZW5kUmVxdWVzdFJlcUJvZHlcbiAqL1xuZXhwb3J0IGNvbnN0IGNvbnN0cnVjdFVuc2lnbmVkUHJlc2VudGF0aW9uUmVxdWVzdCA9IChyZXFCb2R5OiBTZW5kUmVxdWVzdFJlcUJvZHkpOiBVbnNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3QgPT4ge1xuICBjb25zdCB7XG4gICAgdmVyaWZpZXIsXG4gICAgaG9sZGVyQXBwVXVpZCxcbiAgICBjcmVkZW50aWFsUmVxdWVzdHMsXG4gICAgbWV0YWRhdGEsXG4gICAgZXhwaXJlc0F0LFxuICAgIGNyZWF0ZWRBdCxcbiAgICB1cGRhdGVkQXRcbiAgfSA9IHJlcUJvZHk7XG5cbiAgY29uc3QgdXVpZCA9IGdldFVVSUQoKTtcblxuICAvLyBhbnkvYWxsIGRlZmF1bHQgdmFsdWVzIG11c3QgYmUgc2V0IGJlZm9yZSBzaWduaW5nLCBvciBzaWduYXR1cmUgd2lsbCBhbHdheXMgZmFpbCB0byB2ZXJpZnlcbiAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgY29uc3QgdGVuTWludXRlc0Zyb21Ob3cgPSBuZXcgRGF0ZShub3cuZ2V0VGltZSgpICsgMTAgKiA2MCAqIDEwMDApO1xuICBjb25zdCBkZWZhdWx0Q3JlYXRlZEF0ID0gbm93O1xuICBjb25zdCBkZWZhdWx0VXBkYXRlZEF0ID0gbm93O1xuICBjb25zdCBkZWZhdWx0RXhwaXJlc0F0ID0gdGVuTWludXRlc0Zyb21Ob3c7XG4gIGNvbnN0IGNyZWRlbnRpYWxSZXF1ZXN0c1dpdGhEZWZhdWx0cyA9IGNyZWRlbnRpYWxSZXF1ZXN0cy5tYXAoY3IgPT4ge1xuICAgIHJldHVybiBjci5yZXF1aXJlZCA/IGNyIDogeyAuLi5jciwgcmVxdWlyZWQ6IGZhbHNlIH07XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgY3JlZGVudGlhbFJlcXVlc3RzOiBjcmVkZW50aWFsUmVxdWVzdHNXaXRoRGVmYXVsdHMsXG4gICAgY3JlYXRlZEF0OiBjcmVhdGVkQXQgfHwgZGVmYXVsdENyZWF0ZWRBdCxcbiAgICB1cGRhdGVkQXQ6IHVwZGF0ZWRBdCB8fCBkZWZhdWx0VXBkYXRlZEF0LFxuICAgIGV4cGlyZXNBdDogZXhwaXJlc0F0IHx8IGRlZmF1bHRFeHBpcmVzQXQsXG4gICAgaG9sZGVyQXBwVXVpZCxcbiAgICBtZXRhZGF0YTogbWV0YWRhdGEgfHwge30sXG4gICAgdXVpZCxcbiAgICB2ZXJpZmllclxuICB9O1xufTtcblxuLyoqXG4gKiBTaWducyBhbiB1bnNpZ25lZCBQcmVzZW50YXRpb25SZXF1ZXN0IGFuZCBhdHRhY2hlcyB0aGUgcmVzdWx0aW5nIFByb29mXG4gKiBAcGFyYW0gdW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0IFVuc2lnbmVkUHJlc2VudGF0aW9uUmVxdWVzdFxuICogQHBhcmFtIHByaXZhdGVLZXkgU3RyaW5nXG4gKi9cbmV4cG9ydCBjb25zdCBjb25zdHJ1Y3RTaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0ID0gKHVuc2lnbmVkUHJlc2VudGF0aW9uUmVxdWVzdDogVW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0LCBwcml2YXRlS2V5OiBzdHJpbmcpOiBTaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0ID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwcm9vZiA9IGNyZWF0ZVByb29mKFxuICAgICAgdW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0LFxuICAgICAgcHJpdmF0ZUtleSxcbiAgICAgIHVuc2lnbmVkUHJlc2VudGF0aW9uUmVxdWVzdC52ZXJpZmllcixcbiAgICAgICdwZW0nXG4gICAgKTtcblxuICAgIGNvbnN0IHNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3QgPSB7XG4gICAgICAuLi51bnNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3QsXG4gICAgICBwcm9vZjogcHJvb2ZcbiAgICB9O1xuXG4gICAgcmV0dXJuIHNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3Q7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZSBpbnN0YW5jZW9mIENyeXB0b0Vycm9yKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoYElzc3VlIGluIHRoZSBjcnlwdG8gbGliIHdoaWxlIGNyZWF0aW5nIHByZXNlbnRhdGlvbiByZXF1ZXN0ICR7dW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0LnV1aWR9IHByb29mYCwgZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ2dlci5lcnJvcihgSXNzdWUgd2hpbGUgY3JlYXRpbmcgcHJlc2VudGF0aW9uIHJlcXVlc3QgJHt1bnNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3QudXVpZH0gcHJvb2ZgLCBlKTtcbiAgICB9XG5cbiAgICB0aHJvdyBlO1xuICB9XG59O1xuXG4vLyB2YWxpZGF0ZXMgaW5jb21pbmcgcmVxdWVzdCBib2R5XG5jb25zdCB2YWxpZGF0ZVNlbmRSZXF1ZXN0Qm9keSA9IChzZW5kUmVxdWVzdEJvZHk6IFNlbmRSZXF1ZXN0UmVxQm9keSk6IHZvaWQgPT4ge1xuICBjb25zdCB7XG4gICAgdmVyaWZpZXIsXG4gICAgY3JlZGVudGlhbFJlcXVlc3RzLFxuICAgIGVjY1ByaXZhdGVLZXksXG4gICAgaG9sZGVyQXBwVXVpZFxuICB9ID0gc2VuZFJlcXVlc3RCb2R5O1xuXG4gIGlmICghdmVyaWZpZXIpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uUmVxdWVzdCBvcHRpb25zOiB2ZXJpZmllciBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmVyaWZpZXIgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvblJlcXVlc3Qgb3B0aW9uczogdmVyaWZpZXIgbXVzdCBiZSBhIHN0cmluZy4nKTtcbiAgfVxuXG4gIGlmICghaG9sZGVyQXBwVXVpZCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb25SZXF1ZXN0IG9wdGlvbnM6IGhvbGRlckFwcFV1aWQgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAodHlwZW9mIGhvbGRlckFwcFV1aWQgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvblJlcXVlc3Qgb3B0aW9uczogaG9sZGVyQXBwVXVpZCBtdXN0IGJlIGEgc3RyaW5nLicpO1xuICB9XG5cbiAgaWYgKCFjcmVkZW50aWFsUmVxdWVzdHMpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uUmVxdWVzdCBvcHRpb25zOiBjcmVkZW50aWFsUmVxdWVzdHMgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICAvLyBjcmVkZW50aWFsUmVxdWVzdHMgaW5wdXQgZWxlbWVudCBtdXN0IGJlIGFuIGFycmF5XG4gIGlmICghQXJyYXkuaXNBcnJheShjcmVkZW50aWFsUmVxdWVzdHMpKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvblJlcXVlc3Qgb3B0aW9uczogY3JlZGVudGlhbFJlcXVlc3RzIG11c3QgYmUgYW4gYXJyYXkuJyk7XG4gIH1cblxuICBjb25zdCB0b3RDcmVkUmVxcyA9IGNyZWRlbnRpYWxSZXF1ZXN0cy5sZW5ndGg7XG4gIGlmICh0b3RDcmVkUmVxcyA9PT0gMCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb25SZXF1ZXN0IG9wdGlvbnM6IGNyZWRlbnRpYWxSZXF1ZXN0cyBhcnJheSBtdXN0IG5vdCBiZSBlbXB0eS4nKTtcbiAgfVxuXG4gIC8vIGNyZWRlbnRpYWxSZXF1ZXN0cyBpbnB1dCBlbGVtZW50IHNob3VsZCBoYXZlIHR5cGUgYW5kIGlzc3VlciBlbGVtZW50c1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHRvdENyZWRSZXFzOyBpKyspIHtcbiAgICBjb25zdCBjcmVkZW50aWFsUmVxdWVzdCA9IGNyZWRlbnRpYWxSZXF1ZXN0c1tpXTtcblxuICAgIGlmICghY3JlZGVudGlhbFJlcXVlc3QudHlwZSkge1xuICAgICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIGNyZWRlbnRpYWxSZXF1ZXN0OiB0eXBlIGlzIHJlcXVpcmVkLicpO1xuICAgIH1cblxuICAgIGlmICghY3JlZGVudGlhbFJlcXVlc3QuaXNzdWVycykge1xuICAgICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIGNyZWRlbnRpYWxSZXF1ZXN0OiBpc3N1ZXJzIGlzIHJlcXVpcmVkLicpO1xuICAgIH1cblxuICAgIC8vIGNyZWRlbnRpYWxSZXF1ZXN0cy5pc3N1ZXJzIGlucHV0IGVsZW1lbnQgbXVzdCBiZSBhbiBhcnJheVxuICAgIGlmICghQXJyYXkuaXNBcnJheShjcmVkZW50aWFsUmVxdWVzdC5pc3N1ZXJzKSkge1xuICAgICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIGNyZWRlbnRpYWxSZXF1ZXN0OiBpc3N1ZXJzIG11c3QgYmUgYW4gYXJyYXkuJyk7XG4gICAgfVxuXG4gICAgY29uc3QgdG90SXNzdWVycyA9IGNyZWRlbnRpYWxSZXF1ZXN0Lmlzc3VlcnMubGVuZ3RoO1xuICAgIGlmICh0b3RJc3N1ZXJzID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgY3JlZGVudGlhbFJlcXVlc3Q6IGlzc3VlcnMgYXJyYXkgbXVzdCBub3QgYmUgZW1wdHkuJyk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBpc3N1ZXIgb2YgY3JlZGVudGlhbFJlcXVlc3QuaXNzdWVycykge1xuICAgICAgaWYgKHR5cGVvZiBpc3N1ZXIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBjcmVkZW50aWFsUmVxdWVzdDogaXNzdWVycyBhcnJheSBlbGVtZW50IG11c3QgYmUgYSBzdHJpbmcuJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gRUNDIFByaXZhdGUgS2V5IGlzIG1hbmRhdG9yeSBpbnB1dCBwYXJhbWV0ZXJcbiAgaWYgKCFlY2NQcml2YXRlS2V5KSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvblJlcXVlc3Qgb3B0aW9uczogZWNjUHJpdmF0ZUtleSBpcyByZXF1aXJlZC4nKTtcbiAgfVxufTtcblxuLyoqXG4gKiBIYW5kbGVyIGZvciBzZW5kaW5nIGEgUHJlc2VudGF0aW9uUmVxdWVzdCB0byBVbnVtSUQncyBTYWFTLlxuICogQHBhcmFtIGF1dGhvcml6YXRpb25cbiAqIEBwYXJhbSB2ZXJpZmllclxuICogQHBhcmFtIGNyZWRlbnRpYWxSZXF1ZXN0c1xuICogQHBhcmFtIGVjY1ByaXZhdGVLZXlcbiAqIEBwYXJhbSBob2xkZXJBcHBVdWlkXG4gKi9cbmV4cG9ydCBjb25zdCBzZW5kUmVxdWVzdCA9IGFzeW5jIChhdXRob3JpemF0aW9uOnN0cmluZywgdmVyaWZpZXI6IHN0cmluZywgY3JlZGVudGlhbFJlcXVlc3RzOiBDcmVkZW50aWFsUmVxdWVzdFtdLCBlY2NQcml2YXRlS2V5OiBzdHJpbmcsIGhvbGRlckFwcFV1aWQ6IHN0cmluZywgZXhwaXJhdGlvbkRhdGU/OiBEYXRlLCBtZXRhZGF0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUHJvbWlzZTxVbnVtRHRvPFByZXNlbnRhdGlvblJlcXVlc3RSZXNwb25zZT4+ID0+IHtcbiAgdHJ5IHtcbiAgICByZXF1aXJlQXV0aChhdXRob3JpemF0aW9uKTtcblxuICAgIGNvbnN0IGJvZHk6IFNlbmRSZXF1ZXN0UmVxQm9keSA9IHsgdmVyaWZpZXIsIGNyZWRlbnRpYWxSZXF1ZXN0cywgZWNjUHJpdmF0ZUtleSwgaG9sZGVyQXBwVXVpZCwgZXhwaXJlc0F0OiBleHBpcmF0aW9uRGF0ZSwgbWV0YWRhdGEgfTtcblxuICAgIC8vIFZhbGlkYXRlIGlucHV0c1xuICAgIHZhbGlkYXRlU2VuZFJlcXVlc3RCb2R5KGJvZHkpO1xuXG4gICAgY29uc3QgdW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0ID0gY29uc3RydWN0VW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0KGJvZHkpO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBzaWduZWQgcHJlc2VudGF0aW9uIG9iamVjdCBmcm9tIHRoZSB1bnNpZ25lZFByZXNlbnRhdGlvbiBvYmplY3RcbiAgICBjb25zdCBzaWduZWRQUiA9IGNvbnN0cnVjdFNpZ25lZFByZXNlbnRhdGlvblJlcXVlc3QodW5zaWduZWRQcmVzZW50YXRpb25SZXF1ZXN0LCBlY2NQcml2YXRlS2V5KTtcblxuICAgIGNvbnN0IHJlc3REYXRhOiBSRVNURGF0YSA9IHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgYmFzZVVybDogY29uZmlnRGF0YS5TYWFTVXJsLFxuICAgICAgZW5kUG9pbnQ6ICdwcmVzZW50YXRpb25SZXF1ZXN0JyxcbiAgICAgIGhlYWRlcjogeyBBdXRob3JpemF0aW9uOiBhdXRob3JpemF0aW9uIH0sXG4gICAgICBkYXRhOiBzaWduZWRQUlxuICAgIH07XG5cbiAgICBjb25zdCByZXN0UmVzcCA9IGF3YWl0IG1ha2VOZXR3b3JrUmVxdWVzdDxQcmVzZW50YXRpb25SZXF1ZXN0UmVzcG9uc2U+KHJlc3REYXRhKTtcblxuICAgIGNvbnN0IGF1dGhUb2tlbjogc3RyaW5nID0gaGFuZGxlQXV0aFRva2VuKHJlc3RSZXNwKTtcblxuICAgIGNvbnN0IHByZXNlbnRhdGlvblJlcXVlc3RSZXNwb25zZTogVW51bUR0bzxQcmVzZW50YXRpb25SZXF1ZXN0UmVzcG9uc2U+ID0geyBib2R5OiB7IC4uLnJlc3RSZXNwLmJvZHkgfSwgYXV0aFRva2VuIH07XG5cbiAgICByZXR1cm4gcHJlc2VudGF0aW9uUmVxdWVzdFJlc3BvbnNlO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcihgRXJyb3Igc2VuZGluZyByZXF1ZXN0IHRvIHVzZSBVbnVtSUQgU2Fhcy4gJHtlcnJvcn1gKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcbiJdfQ==