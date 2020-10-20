"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRequest = void 0;
var hlpr = __importStar(require("library-issuer-verifier-utility"));
var config_1 = require("./config");
var requireAuth_1 = require("./requireAuth");
var validateInParams = function (req) {
    var _a = req.body, verifier = _a.verifier, credentialRequests = _a.credentialRequests, metadata = _a.metadata, expiresAt = _a.expiresAt, eccPrivateKey = _a.eccPrivateKey, holderAppUuid = _a.holderAppUuid;
    if (!verifier) {
        throw new hlpr.CustError(400, 'Invalid PresentationRequest options: verifier is required.');
    }
    if (typeof verifier !== 'string') {
        throw new hlpr.CustError(400, 'Invalid PresentationRequest options: verifier must be a string.');
    }
    if (!holderAppUuid) {
        throw new hlpr.CustError(400, 'Invalid PresentationRequest options: holderAppUuid is required.');
    }
    if (typeof holderAppUuid !== 'string') {
        throw new hlpr.CustError(400, 'Invalid PresentationRequest options: holderAppUuid must be a string.');
    }
    if (!credentialRequests) {
        throw new hlpr.CustError(400, 'Invalid PresentationRequest options: credentialRequests is required.');
    }
    // credentialRequests input element must be an array
    if (!Array.isArray(credentialRequests)) {
        throw new hlpr.CustError(400, 'Invalid PresentationRequest options: credentialRequests must be an array.');
    }
    var totCredReqs = credentialRequests.length;
    if (totCredReqs === 0) {
        throw new hlpr.CustError(400, 'Invalid PresentationRequest options: credentialRequests array must not be empty.');
    }
    // credentialRequests input element should have type and issuer elements
    for (var i = 0; i < totCredReqs; i++) {
        var credentialRequest = credentialRequests[i];
        if (!credentialRequest.type) {
            throw new hlpr.CustError(400, 'Invalid credentialRequest: type is required.');
        }
        if (!credentialRequest.issuers) {
            throw new hlpr.CustError(400, 'Invalid credentialRequest: issuers is required.');
        }
        // credentialRequests.issuers input element must be an array
        if (!Array.isArray(credentialRequest.issuers)) {
            throw new hlpr.CustError(400, 'Invalid credentialRequest: issuers must be an array.');
        }
        var totIssuers = credentialRequest.issuers.length;
        if (totIssuers === 0) {
            throw new hlpr.CustError(400, 'Invalid credentialRequest: issuers array must not be empty.');
        }
        for (var _i = 0, _b = credentialRequest.issuers; _i < _b.length; _i++) {
            var issuer = _b[_i];
            if (typeof issuer !== 'string') {
                throw new hlpr.CustError(400, 'Invalid issuer: must be a string.');
            }
        }
    }
    // ECC Private Key is mandatory input parameter
    if (!eccPrivateKey) {
        throw new hlpr.CustError(400, 'Invalid PresentationRequest options: eccPrivateKey is required.');
    }
    var unsignedPR = {
        verifier: verifier,
        credentialRequests: credentialRequests,
        metadata: metadata,
        expiresAt: expiresAt,
        holderAppUuid: holderAppUuid
    };
    return (unsignedPR);
};
var constructSignedPresentation = function (unsignedPR, privateKey) {
    var proof = hlpr.createProof(unsignedPR, privateKey, unsignedPR.verifier, 'pem');
    var signedPR = {
        verifier: unsignedPR.verifier,
        credentialRequests: unsignedPR.credentialRequests,
        metadata: unsignedPR.metadata,
        expiresAt: unsignedPR.expiresAt,
        holderAppUuid: unsignedPR.holderAppUuid,
        proof: proof
    };
    return (signedPR);
};
exports.sendRequest = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var authorization, unsignedPR, signedPR, restData, restResp, presentationRequestResponse, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                authorization = req.headers.authorization;
                requireAuth_1.requireAuth(authorization);
                unsignedPR = validateInParams(req);
                signedPR = constructSignedPresentation(unsignedPR, req.body.eccPrivateKey);
                restData = {
                    method: 'POST',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'presentationRequest',
                    header: { Authorization: authorization },
                    data: signedPR
                };
                return [4 /*yield*/, hlpr.makeRESTCall(restData)];
            case 1:
                restResp = _a.sent();
                presentationRequestResponse = restResp.body;
                // Set the X-Auth-Token header alone
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('x-auth-token', restResp.headers['x-auth-token']);
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
