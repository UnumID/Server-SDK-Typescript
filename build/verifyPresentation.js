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
exports.verifyPresentation = void 0;
var hlpr = __importStar(require("library-issuer-verifier-utility"));
var config_1 = require("./config");
var validateProof_1 = require("./validateProof");
var isNotAnEmptyArray = function (paramValue) {
    if (!Array.isArray(paramValue)) {
        return (false);
    }
    var arrLen = paramValue.length;
    if (arrLen === 0) {
        return (false);
    }
    return (true);
};
var validateCredentialInput = function (credentials) {
    var retObj = { valStat: true };
    if (!isNotAnEmptyArray(credentials)) {
        retObj.valStat = false;
        retObj.msg = 'Invalid Presentation: verifiableCredential must be a non-empty array.';
        return (retObj);
    }
    var totCred = credentials.length;
    for (var i = 0; i < totCred; i++) {
        var credPosStr = '[' + i + ']';
        var credential = credentials[i];
        // Validate the existance of elements in verifiableCredential object
        var invalidMsg = "Invalid verifiableCredential" + credPosStr + ":";
        if (!credential['@context']) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " @context is required.";
            break;
        }
        if (!credential.credentialStatus) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " credentialStatus is required.";
            break;
        }
        if (!credential.credentialSubject) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " credentialSubject is required.";
            break;
        }
        if (!credential.issuer) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " issuer is required.";
            break;
        }
        if (!credential.type) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " type is required.";
            break;
        }
        if (!credential.id) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " id is required.";
            break;
        }
        if (!credential.issuanceDate) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " issuanceDate is required.";
            break;
        }
        if (!credential.proof) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " proof is required.";
            break;
        }
        // Check @context is an array and not empty
        if (!isNotAnEmptyArray(credential['@context'])) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " @context must be a non-empty array.";
            break;
        }
        // Check CredentialStatus object has id and type elements.
        if (!credential.credentialStatus.id || !credential.credentialStatus.type) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " credentialStatus must contain id and type properties.";
            break;
        }
        // Check credentialSubject object has id element.
        if (!credential.credentialSubject.id) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " credentialSubject must contain id property.";
            break;
        }
        // Check type is an array and not empty
        if (!isNotAnEmptyArray(credential.type)) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " type must be a non-empty array.";
            break;
        }
        // Check that proof object is valid
        if (!validateProof_1.validateProof(credential.proof)) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " proof is not correctly formatted.";
            break;
        }
    }
    return (retObj);
};
var validateInParams = function (req, authToken) {
    var context = req.body['@context'];
    var _a = req.body, type = _a.type, verifiableCredential = _a.verifiableCredential, proof = _a.proof, presentationRequestUuid = _a.presentationRequestUuid;
    var retObj = {};
    // validate required fields
    if (!context) {
        throw new hlpr.CustError(400, 'Invalid Presentation: @context is required.');
    }
    if (!type) {
        throw new hlpr.CustError(400, 'Invalid Presentation: type is required.');
    }
    if (!verifiableCredential) {
        throw new hlpr.CustError(400, 'Invalid Presentation: verifiableCredential is required.');
    }
    if (!proof) {
        throw new hlpr.CustError(400, 'Invalid Presentation: proof is required.');
    }
    if (!presentationRequestUuid) {
        throw new hlpr.CustError(400, 'Invalid Presentation: presentationRequestUuid is required.');
    }
    if (!isNotAnEmptyArray(context)) {
        throw new hlpr.CustError(400, 'Invalid Presentation: @context must be a non-empty array.');
    }
    if (!isNotAnEmptyArray(type)) {
        throw new hlpr.CustError(400, 'Invalid Presentation: type must be a non-empty array.');
    }
    retObj = validateCredentialInput(verifiableCredential);
    if (!retObj.valStat) {
        throw new hlpr.CustError(400, retObj.msg);
    }
    // Check proof object is formatted correctly
    if (!validateProof_1.validateProof(proof)) {
        throw new hlpr.CustError(400, 'Invalid Presentation: proof is not correctly formatted.');
    }
    // x-auth-token is mandatory
    if (!authToken) {
        throw new hlpr.CustError(401, 'Not authenticated');
    }
    return ({
        '@context': context,
        type: type,
        verifiableCredential: verifiableCredential,
        presentationRequestUuid: presentationRequestUuid
    });
};
exports.verifyPresentation = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var authToken, data, proof, pubKeyObj, verifiedStatus, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                authToken = req.headers['x-auth-token'];
                data = validateInParams(req, authToken);
                proof = req.body.proof;
                return [4 /*yield*/, hlpr.getKeyFromDIDDoc(config_1.configData.SaaSUrl, authToken, proof.verificationMethod, 'secp256r1')];
            case 1:
                pubKeyObj = _a.sent();
                if (pubKeyObj.length === 0) {
                    throw new hlpr.CustError(401, 'Public key not found for the DID');
                }
                verifiedStatus = hlpr.doVerify(proof.signatureValue, data, pubKeyObj[0].publicKey, pubKeyObj[0].encoding);
                // Set the X-Auth-Token header alone
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('x-auth-token', authToken);
                res.send({ verifiedStatus: verifiedStatus });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                next(error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
