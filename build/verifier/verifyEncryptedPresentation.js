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
exports.verifyEncryptedPresentation = void 0;
var validateProof_1 = require("./validateProof");
var requireAuth_1 = require("../requireAuth");
var library_crypto_1 = require("@unumid/library-crypto");
var library_issuer_verifier_utility_1 = require("@unumid/library-issuer-verifier-utility");
var logger_1 = __importDefault(require("../logger"));
var __1 = require("..");
/**
 * Validates the attributes for a credential request to UnumID's SaaS.
 * @param credentials JSONObj
 */
var validateCredentialInput = function (credentials) {
    var retObj = { valStat: true };
    if (library_issuer_verifier_utility_1.isArrayEmpty(credentials)) {
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
        if (library_issuer_verifier_utility_1.isArrayEmpty(credential['@context'])) {
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
        if (library_issuer_verifier_utility_1.isArrayEmpty(credential.type)) {
            retObj.valStat = false;
            retObj.msg = invalidMsg + " type must be a non-empty array.";
            break;
        }
        // Check that proof object is valid
        validateProof_1.validateProof(credential.proof);
    }
    return (retObj);
};
/**
 * Validates the presentation object has the proper attributes.
 * @param presentation Presentation
 */
var validatePresentation = function (presentation) {
    var context = presentation['@context'];
    var type = presentation.type, verifiableCredential = presentation.verifiableCredential, proof = presentation.proof, presentationRequestUuid = presentation.presentationRequestUuid;
    var retObj = {};
    // validate required fields
    if (!context) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: @context is required.');
    }
    if (!type) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: type is required.');
    }
    if (!verifiableCredential) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: verifiableCredential is required.');
    }
    if (!proof) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: proof is required.');
    }
    if (!presentationRequestUuid) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: presentationRequestUuid is required.');
    }
    if (library_issuer_verifier_utility_1.isArrayEmpty(context)) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: @context must be a non-empty array.');
    }
    if (library_issuer_verifier_utility_1.isArrayEmpty(type)) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: type must be a non-empty array.');
    }
    retObj = validateCredentialInput(verifiableCredential);
    if (!retObj.valStat) {
        throw new library_issuer_verifier_utility_1.CustError(400, retObj.msg);
    }
    // Check proof object is formatted correctly
    validateProof_1.validateProof(proof);
};
function isPresentation(presentation) {
    return presentation.type[0] === 'VerifiablePresentation';
}
/**
 * Handler to send information regarding the user agreeing to share a credential Presentation.
 * @param authorization: string
 * @param encryptedPresentation: EncryptedData
 * @param verifierDid: string
 */
exports.verifyEncryptedPresentation = function (authorization, encryptedPresentation, verifierDid, encryptionPrivateKey) { return __awaiter(void 0, void 0, void 0, function () {
    var presentation, verificationResult_1, result_1, verificationResult, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                requireAuth_1.requireAuth(authorization);
                if (!encryptedPresentation) {
                    throw new library_issuer_verifier_utility_1.CustError(400, 'encryptedPresentation is required.');
                }
                if (!verifierDid) { // verifier did
                    throw new library_issuer_verifier_utility_1.CustError(400, 'verifier is required.');
                }
                if (!encryptionPrivateKey) {
                    throw new library_issuer_verifier_utility_1.CustError(400, 'verifier encryptionPrivateKey is required.');
                }
                presentation = library_crypto_1.decrypt(encryptionPrivateKey, encryptedPresentation);
                if (!!isPresentation(presentation)) return [3 /*break*/, 2];
                return [4 /*yield*/, __1.verifyNoPresentation(authorization, presentation, verifierDid)];
            case 1:
                verificationResult_1 = _a.sent();
                result_1 = {
                    authToken: verificationResult_1.authToken,
                    body: __assign(__assign({}, verificationResult_1.body), { type: 'NoPresentation' })
                };
                return [2 /*return*/, result_1];
            case 2: return [4 /*yield*/, __1.verifyPresentation(authorization, presentation, verifierDid)];
            case 3:
                verificationResult = _a.sent();
                result = {
                    authToken: verificationResult.authToken,
                    body: __assign(__assign({}, verificationResult.body), { type: 'VerifiablePresentation', credentials: verificationResult.body.isVerified ? presentation.verifiableCredential : undefined })
                };
                return [2 /*return*/, result];
            case 4:
                error_1 = _a.sent();
                if (error_1 instanceof library_crypto_1.CryptoError) {
                    logger_1.default.error('Crypto error handling encrypted presentation', error_1);
                }
                else {
                    logger_1.default.error('Error handling encrypted presentation request to UnumID Saas.', error_1);
                }
                throw error_1;
            case 5: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5RW5jcnlwdGVkUHJlc2VudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3ZlcmlmaWVyL3ZlcmlmeUVuY3J5cHRlZFByZXNlbnRhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLGlEQUFnRDtBQUNoRCw4Q0FBNkM7QUFDN0MseURBQThEO0FBQzlELDJGQUEwRztBQUMxRyxxREFBK0I7QUFDL0Isd0JBQThGO0FBRTlGOzs7R0FHRztBQUNILElBQU0sdUJBQXVCLEdBQUcsVUFBQyxXQUFvQjtJQUNuRCxJQUFNLE1BQU0sR0FBWSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUUxQyxJQUFJLDhDQUFZLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDN0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDdkIsTUFBTSxDQUFDLEdBQUcsR0FBRyx1RUFBdUUsQ0FBQztRQUVyRixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDakI7SUFFRCxJQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO0lBQ25DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDaEMsSUFBTSxVQUFVLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDakMsSUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWxDLG9FQUFvRTtRQUNwRSxJQUFNLFVBQVUsR0FBRyxpQ0FBK0IsVUFBVSxNQUFHLENBQUM7UUFDaEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUMzQixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUN2QixNQUFNLENBQUMsR0FBRyxHQUFNLFVB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RUYsc0JBQU8sUUFBTSxFQUFDO29CQUdvQyxxQkFBTSxzQkFBa0IsQ0FBQyxhQUFhLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxFQUFBOztnQkFBaEgsa0JBQWtCLEdBQTRCLFNBQWtFO2dCQUNoSCxNQUFNLEdBQW1DO29CQUM3QyxTQUFTLEVBQUUsa0JBQWtCLENBQUMsU0FBUztvQkFDdkMsSUFBSSx3QkFDQyxrQkFBa0IsQ0FBQyxJQUFJLEtBQzFCLElBQUksRUFBRSx3QkFBd0IsRUFDOUIsV0FBVyxFQUFFLGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUNoRztpQkFDRixDQUFDO2dCQUVGLHNCQUFPLE1BQU0sRUFBQzs7O2dCQUVkLElBQUksT0FBSyxZQUFZLDRCQUFXLEVBQUU7b0JBQ2hDLGdCQUFNLENBQUMsS0FBSyxDQUFDLDhDQUE4QyxFQUFFLE9BQUssQ0FBQyxDQUFDO2lCQUNyRTtxQkFBTTtvQkFDTCxnQkFBTSxDQUFDLEtBQUssQ0FBQywrREFBK0QsRUFBRSxPQUFLLENBQUMsQ0FBQztpQkFDdEY7Z0JBRUQsTUFBTSxPQUFLLENBQUM7Ozs7S0FFZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyBEZWNyeXB0ZWRQcmVzZW50YXRpb24sIFByZXNlbnRhdGlvbiwgUHJlc2VudGF0aW9uT3JOb1ByZXNlbnRhdGlvbiwgVW51bUR0byB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IHZhbGlkYXRlUHJvb2YgfSBmcm9tICcuL3ZhbGlkYXRlUHJvb2YnO1xuaW1wb3J0IHsgcmVxdWlyZUF1dGggfSBmcm9tICcuLi9yZXF1aXJlQXV0aCc7XG5pbXBvcnQgeyBDcnlwdG9FcnJvciwgZGVjcnlwdCB9IGZyb20gJ0B1bnVtaWQvbGlicmFyeS1jcnlwdG8nO1xuaW1wb3J0IHsgSlNPTk9iaiwgQ3VzdEVycm9yLCBpc0FycmF5RW1wdHksIEVuY3J5cHRlZERhdGEgfSBmcm9tICdAdW51bWlkL2xpYnJhcnktaXNzdWVyLXZlcmlmaWVyLXV0aWxpdHknO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IHsgTm9QcmVzZW50YXRpb24sIFZlcmlmaWVkU3RhdHVzLCB2ZXJpZnlOb1ByZXNlbnRhdGlvbiwgdmVyaWZ5UHJlc2VudGF0aW9uIH0gZnJvbSAnLi4nO1xuXG4vKipcbiAqIFZhbGlkYXRlcyB0aGUgYXR0cmlidXRlcyBmb3IgYSBjcmVkZW50aWFsIHJlcXVlc3QgdG8gVW51bUlEJ3MgU2FhUy5cbiAqIEBwYXJhbSBjcmVkZW50aWFscyBKU09OT2JqXG4gKi9cbmNvbnN0IHZhbGlkYXRlQ3JlZGVudGlhbElucHV0ID0gKGNyZWRlbnRpYWxzOiBKU09OT2JqKTogSlNPTk9iaiA9PiB7XG4gIGNvbnN0IHJldE9iajogSlNPTk9iaiA9IHsgdmFsU3RhdDogdHJ1ZSB9O1xuXG4gIGlmIChpc0FycmF5RW1wdHkoY3JlZGVudGlhbHMpKSB7XG4gICAgcmV0T2JqLnZhbFN0YXQgPSBmYWxzZTtcbiAgICByZXRPYmoubXNnID0gJ0ludmFsaWQgUHJlc2VudGF0aW9uOiB2ZXJpZmlhYmxlQ3JlZGVudGlhbCBtdXN0IGJlIGEgbm9uLWVtcHR5IGFycmF5Lic7XG5cbiAgICByZXR1cm4gKHJldE9iaik7XG4gIH1cblxuICBjb25zdCB0b3RDcmVkID0gY3JlZGVudGlhbHMubGVuZ3RoO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHRvdENyZWQ7IGkrKykge1xuICAgIGNvbnN0IGNyZWRQb3NTdHIgPSAnWycgKyBpICsgJ10nO1xuICAgIGNvbnN0IGNyZWRlbnRpYWwgPSBjcmVkZW50aWFsc1tpXTtcblxuICAgIC8vIFZhbGlkYXRlIHRoZSBleGlzdGFuY2Ugb2YgZWxlbWVudHMgaW4gdmVyaWZpYWJsZUNyZWRlbnRpYWwgb2JqZWN0XG4gICAgY29uc3QgaW52YWxpZE1zZyA9IGBJbnZhbGlkIHZlcmlmaWFibGVDcmVkZW50aWFsJHtjcmVkUG9zU3RyfTpgO1xuICAgIGlmICghY3JlZGVudGlhbFsnQGNvbnRleHQnXSkge1xuICAgICAgcmV0T2JqLnZhbFN0YXQgPSBmYWxzZTtcbiAgICAgIHJldE9iai5tc2cgPSBgJHtpbnZhbGlkTXNnfSBAY29udGV4dCBpcyByZXF1aXJlZC5gO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKCFjcmVkZW50aWFsLmNyZWRlbnRpYWxTdGF0dXMpIHtcbiAgICAgIHJldE9iai52YWxTdGF0ID0gZmFsc2U7XG4gICAgICByZXRPYmoubXNnID0gYCR7aW52YWxpZE1zZ30gY3JlZGVudGlhbFN0YXR1cyBpcyByZXF1aXJlZC5gO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKCFjcmVkZW50aWFsLmNyZWRlbnRpYWxTdWJqZWN0KSB7XG4gICAgICByZXRPYmoudmFsU3RhdCA9IGZhbHNlO1xuICAgICAgcmV0T2JqLm1zZyA9IGAke2ludmFsaWRNc2d9IGNyZWRlbnRpYWxTdWJqZWN0IGlzIHJlcXVpcmVkLmA7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoIWNyZWRlbnRpYWwuaXNzdWVyKSB7XG4gICAgICByZXRPYmoudmFsU3RhdCA9IGZhbHNlO1xuICAgICAgcmV0T2JqLm1zZyA9IGAke2ludmFsaWRNc2d9IGlzc3VlciBpcyByZXF1aXJlZC5gO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKCFjcmVkZW50aWFsLnR5cGUpIHtcbiAgICAgIHJldE9iai52YWxTdGF0ID0gZmFsc2U7XG4gICAgICByZXRPYmoubXNnID0gYCR7aW52YWxpZE1zZ30gdHlwZSBpcyByZXF1aXJlZC5gO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKCFjcmVkZW50aWFsLmlkKSB7XG4gICAgICByZXRPYmoudmFsU3RhdCA9IGZhbHNlO1xuICAgICAgcmV0T2JqLm1zZyA9IGAke2ludmFsaWRNc2d9IGlkIGlzIHJlcXVpcmVkLmA7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoIWNyZWRlbnRpYWwuaXNzdWFuY2VEYXRlKSB7XG4gICAgICByZXRPYmoudmFsU3RhdCA9IGZhbHNlO1xuICAgICAgcmV0T2JqLm1zZyA9IGAke2ludmFsaWRNc2d9IGlzc3VhbmNlRGF0ZSBpcyByZXF1aXJlZC5gO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKCFjcmVkZW50aWFsLnByb29mKSB7XG4gICAgICByZXRPYmoudmFsU3RhdCA9IGZhbHNlO1xuICAgICAgcmV0T2JqLm1zZyA9IGAke2ludmFsaWRNc2d9IHByb29mIGlzIHJlcXVpcmVkLmA7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBDaGVjayBAY29udGV4dCBpcyBhbiBhcnJheSBhbmQgbm90IGVtcHR5XG4gICAgaWYgKGlzQXJyYXlFbXB0eShjcmVkZW50aWFsWydAY29udGV4dCddKSkge1xuICAgICAgcmV0T2JqLnZhbFN0YXQgPSBmYWxzZTtcbiAgICAgIHJldE9iai5tc2cgPSBgJHtpbnZhbGlkTXNnfSBAY29udGV4dCBtdXN0IGJlIGEgbm9uLWVtcHR5IGFycmF5LmA7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBDaGVjayBDcmVkZW50aWFsU3RhdHVzIG9iamVjdCBoYXMgaWQgYW5kIHR5cGUgZWxlbWVudHMuXG4gICAgaWYgKCFjcmVkZW50aWFsLmNyZWRlbnRpYWxTdGF0dXMuaWQgfHwgIWNyZWRlbnRpYWwuY3JlZGVudGlhbFN0YXR1cy50eXBlKSB7XG4gICAgICByZXRPYmoudmFsU3RhdCA9IGZhbHNlO1xuICAgICAgcmV0T2JqLm1zZyA9IGAke2ludmFsaWRNc2d9IGNyZWRlbnRpYWxTdGF0dXMgbXVzdCBjb250YWluIGlkIGFuZCB0eXBlIHByb3BlcnRpZXMuYDtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGNyZWRlbnRpYWxTdWJqZWN0IG9iamVjdCBoYXMgaWQgZWxlbWVudC5cbiAgICBpZiAoIWNyZWRlbnRpYWwuY3JlZGVudGlhbFN1YmplY3QuaWQpIHtcbiAgICAgIHJldE9iai52YWxTdGF0ID0gZmFsc2U7XG4gICAgICByZXRPYmoubXNnID0gYCR7aW52YWxpZE1zZ30gY3JlZGVudGlhbFN1YmplY3QgbXVzdCBjb250YWluIGlkIHByb3BlcnR5LmA7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBDaGVjayB0eXBlIGlzIGFuIGFycmF5IGFuZCBub3QgZW1wdHlcbiAgICBpZiAoaXNBcnJheUVtcHR5KGNyZWRlbnRpYWwudHlwZSkpIHtcbiAgICAgIHJldE9iai52YWxTdGF0ID0gZmFsc2U7XG4gICAgICByZXRPYmoubXNnID0gYCR7aW52YWxpZE1zZ30gdHlwZSBtdXN0IGJlIGEgbm9uLWVtcHR5IGFycmF5LmA7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBDaGVjayB0aGF0IHByb29mIG9iamVjdCBpcyB2YWxpZFxuICAgIHZhbGlkYXRlUHJvb2YoY3JlZGVudGlhbC5wcm9vZik7XG4gIH1cblxuICByZXR1cm4gKHJldE9iaik7XG59O1xuXG4vKipcbiAqIFZhbGlkYXRlcyB0aGUgcHJlc2VudGF0aW9uIG9iamVjdCBoYXMgdGhlIHByb3BlciBhdHRyaWJ1dGVzLlxuICogQHBhcmFtIHByZXNlbnRhdGlvbiBQcmVzZW50YXRpb25cbiAqL1xuY29uc3QgdmFsaWRhdGVQcmVzZW50YXRpb24gPSAocHJlc2VudGF0aW9uOiBQcmVzZW50YXRpb24pOiB2b2lkID0+IHtcbiAgY29uc3QgY29udGV4dCA9IHByZXNlbnRhdGlvblsnQGNvbnRleHQnXTtcbiAgY29uc3QgeyB0eXBlLCB2ZXJpZmlhYmxlQ3JlZGVudGlhbCwgcHJvb2YsIHByZXNlbnRhdGlvblJlcXVlc3RVdWlkIH0gPSBwcmVzZW50YXRpb247XG4gIGxldCByZXRPYmo6IEpTT05PYmogPSB7fTtcblxuICAvLyB2YWxpZGF0ZSByZXF1aXJlZCBmaWVsZHNcbiAgaWYgKCFjb250ZXh0KSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvbjogQGNvbnRleHQgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAoIXR5cGUpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uOiB0eXBlIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKCF2ZXJpZmlhYmxlQ3JlZGVudGlhbCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb246IHZlcmlmaWFibGVDcmVkZW50aWFsIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKCFwcm9vZikge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb246IHByb29mIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKCFwcmVzZW50YXRpb25SZXF1ZXN0VXVpZCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb246IHByZXNlbnRhdGlvblJlcXVlc3RVdWlkIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKGlzQXJyYXlFbXB0eShjb250ZXh0KSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb246IEBjb250ZXh0IG11c3QgYmUgYSBub24tZW1wdHkgYXJyYXkuJyk7XG4gIH1cblxuICBpZiAoaXNBcnJheUVtcHR5KHR5cGUpKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvbjogdHlwZSBtdXN0IGJlIGEgbm9uLWVtcHR5IGFycmF5LicpO1xuICB9XG5cbiAgcmV0T2JqID0gdmFsaWRhdGVDcmVkZW50aWFsSW5wdXQodmVyaWZpYWJsZUNyZWRlbnRpYWwpO1xuICBpZiAoIXJldE9iai52YWxTdGF0KSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsIHJldE9iai5tc2cpO1xuICB9XG5cbiAgLy8gQ2hlY2sgcHJvb2Ygb2JqZWN0IGlzIGZvcm1hdHRlZCBjb3JyZWN0bHlcbiAgdmFsaWRhdGVQcm9vZihwcm9vZik7XG59O1xuXG5mdW5jdGlvbiBpc1ByZXNlbnRhdGlvbiAocHJlc2VudGF0aW9uOiBQcmVzZW50YXRpb25Pck5vUHJlc2VudGF0aW9uKTogcHJlc2VudGF0aW9uIGlzIFByZXNlbnRhdGlvbiB7XG4gIHJldHVybiBwcmVzZW50YXRpb24udHlwZVswXSA9PT0gJ1ZlcmlmaWFibGVQcmVzZW50YXRpb24nO1xufVxuXG4vKipcbiAqIEhhbmRsZXIgdG8gc2VuZCBpbmZvcm1hdGlvbiByZWdhcmRpbmcgdGhlIHVzZXIgYWdyZWVpbmcgdG8gc2hhcmUgYSBjcmVkZW50aWFsIFByZXNlbnRhdGlvbi5cbiAqIEBwYXJhbSBhdXRob3JpemF0aW9uOiBzdHJpbmdcbiAqIEBwYXJhbSBlbmNyeXB0ZWRQcmVzZW50YXRpb246IEVuY3J5cHRlZERhdGFcbiAqIEBwYXJhbSB2ZXJpZmllckRpZDogc3RyaW5nXG4gKi9cbmV4cG9ydCBjb25zdCB2ZXJpZnlFbmNyeXB0ZWRQcmVzZW50YXRpb24gPSBhc3luYyAoYXV0aG9yaXphdGlvbjogc3RyaW5nLCBlbmNyeXB0ZWRQcmVzZW50YXRpb246IEVuY3J5cHRlZERhdGEsIHZlcmlmaWVyRGlkOiBzdHJpbmcsIGVuY3J5cHRpb25Qcml2YXRlS2V5OiBzdHJpbmcpOiBQcm9taXNlPFVudW1EdG88RGVjcnlwdGVkUHJlc2VudGF0aW9uPj4gPT4ge1xuICB0cnkge1xuICAgIHJlcXVpcmVBdXRoKGF1dGhvcml6YXRpb24pO1xuXG4gICAgaWYgKCFlbmNyeXB0ZWRQcmVzZW50YXRpb24pIHtcbiAgICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnZW5jcnlwdGVkUHJlc2VudGF0aW9uIGlzIHJlcXVpcmVkLicpO1xuICAgIH1cblxuICAgIGlmICghdmVyaWZpZXJEaWQpIHsgLy8gdmVyaWZpZXIgZGlkXG4gICAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ3ZlcmlmaWVyIGlzIHJlcXVpcmVkLicpO1xuICAgIH1cblxuICAgIGlmICghZW5jcnlwdGlvblByaXZhdGVLZXkpIHtcbiAgICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAndmVyaWZpZXIgZW5jcnlwdGlvblByaXZhdGVLZXkgaXMgcmVxdWlyZWQuJyk7XG4gICAgfVxuXG4gICAgLy8gZGVjcnlwdCB0aGUgcHJlc2VudGF0aW9uXG4gICAgY29uc3QgcHJlc2VudGF0aW9uID0gPFByZXNlbnRhdGlvbnxOb1ByZXNlbnRhdGlvbj4gZGVjcnlwdChlbmNyeXB0aW9uUHJpdmF0ZUtleSwgZW5jcnlwdGVkUHJlc2VudGF0aW9uKTtcblxuICAgIGlmICghaXNQcmVzZW50YXRpb24ocHJlc2VudGF0aW9uKSkge1xuICAgICAgY29uc3QgdmVyaWZpY2F0aW9uUmVzdWx0OiBVbnVtRHRvPFZlcmlmaWVkU3RhdHVzPiA9IGF3YWl0IHZlcmlmeU5vUHJlc2VudGF0aW9uKGF1dGhvcml6YXRpb24sIHByZXNlbnRhdGlvbiwgdmVyaWZpZXJEaWQpO1xuICAgICAgY29uc3QgcmVzdWx0OiBVbnVtRHRvPERlY3J5cHRlZFByZXNlbnRhdGlvbj4gPSB7XG4gICAgICAgIGF1dGhUb2tlbjogdmVyaWZpY2F0aW9uUmVzdWx0LmF1dGhUb2tlbixcbiAgICAgICAgYm9keToge1xuICAgICAgICAgIC4uLnZlcmlmaWNhdGlvblJlc3VsdC5ib2R5LFxuICAgICAgICAgIHR5cGU6ICdOb1ByZXNlbnRhdGlvbidcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBjb25zdCB2ZXJpZmljYXRpb25SZXN1bHQ6IFVudW1EdG88VmVyaWZpZWRTdGF0dXM+ID0gYXdhaXQgdmVyaWZ5UHJlc2VudGF0aW9uKGF1dGhvcml6YXRpb24sIHByZXNlbnRhdGlvbiwgdmVyaWZpZXJEaWQpO1xuICAgIGNvbnN0IHJlc3VsdDogVW51bUR0bzxEZWNyeXB0ZWRQcmVzZW50YXRpb24+ID0ge1xuICAgICAgYXV0aFRva2VuOiB2ZXJpZmljYXRpb25SZXN1bHQuYXV0aFRva2VuLFxuICAgICAgYm9keToge1xuICAgICAgICAuLi52ZXJpZmljYXRpb25SZXN1bHQuYm9keSxcbiAgICAgICAgdHlwZTogJ1ZlcmlmaWFibGVQcmVzZW50YXRpb24nLFxuICAgICAgICBjcmVkZW50aWFsczogdmVyaWZpY2F0aW9uUmVzdWx0LmJvZHkuaXNWZXJpZmllZCA/IHByZXNlbnRhdGlvbi52ZXJpZmlhYmxlQ3JlZGVudGlhbCA6IHVuZGVmaW5lZFxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIENyeXB0b0Vycm9yKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0NyeXB0byBlcnJvciBoYW5kbGluZyBlbmNyeXB0ZWQgcHJlc2VudGF0aW9uJywgZXJyb3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGhhbmRsaW5nIGVuY3J5cHRlZCBwcmVzZW50YXRpb24gcmVxdWVzdCB0byBVbnVtSUQgU2Fhcy4nLCBlcnJvcik7XG4gICAgfVxuXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG4iXX0=