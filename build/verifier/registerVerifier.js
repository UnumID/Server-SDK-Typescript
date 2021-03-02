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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXJWZXJpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92ZXJpZmllci9yZWdpc3RlclZlcmlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG9DQUF1QztBQUV2QywyRkFBc087QUFDdE8scURBQStCO0FBRS9COzs7O0dBSUc7QUFDSCxJQUFNLGVBQWUsR0FBRyxVQUFDLEVBQVcsRUFBRSxJQUFnQjtJQUNwRCxPQUFPO1FBQ0wsRUFBRSxFQUFFLHlDQUFPLEVBQUU7UUFDYixRQUFRLEVBQUUsS0FBSztRQUNmLElBQUksRUFBRSxJQUFJO1FBQ1YsTUFBTSxFQUFFLE9BQU87UUFDZixTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVM7S0FDeEIsQ0FBQztBQUNKLENBQUMsQ0FBQztBQUVGOzs7O0dBSUc7QUFDSCxJQUFNLGdCQUFnQixHQUFHLFVBQUMsS0FBaUI7SUFDekMsSUFBTSxPQUFPLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDNUQsSUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFeEQsT0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMzQixDQUFDLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxJQUFNLGdCQUFnQixHQUFHLFVBQUMsSUFBWSxFQUFFLFlBQW9CLEVBQUUsR0FBVyxFQUFFLE1BQWM7SUFDdkYsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNULE1BQU0sSUFBSSwyQ0FBUyxDQUFDLEdBQUcsRUFBRSw2Q0FBNkMsQ0FBQyxDQUFDO0tBQ3pFO0lBRUQsSUFBSSxDQUFDLFlBQVksRUFBRTtRQUNqQixNQUFNLElBQUksMkNBQVMsQ0FBQyxHQUFHLEVBQUUscURBQXFELENBQUMsQ0FBQztLQUNqRjtJQUVELElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDUixNQUFNLElBQUksMkNBQVMsQ0FBQyxHQUFHLEVBQUUsNENBQTRDLENBQUMsQ0FBQztLQUN4RTtJQUVELElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDWCxNQUFNLElBQUksMkNBQVMsQ0FBQyxHQUFHLEVBQUUsd0NBQXdDLENBQUMsQ0FBQztLQUNwRTtBQUNILENBQUMsQ0FBQztBQUVGOzs7Ozs7R0FNRztBQUNVLFFBQUEsZ0JBQWdCLEdBQUcsVUFBTyxJQUFZLEVBQUUsWUFBb0IsRUFBRSxHQUFXLEVBQUUsTUFBYzs7Ozs7O2dCQUVsRyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFFeEIscUJBQU0sa0RBQWdCLEVBQUUsRUFBQTs7Z0JBQTVDLEtBQUssR0FBZSxTQUF3QjtnQkFDNUMsV0FBVyxHQUFvQixFQUFFLElBQUksTUFBQSxFQUFFLFlBQVksY0FBQSxFQUFFLEdBQUcsS0FBQSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUNuRyxRQUFRLEdBQWE7b0JBQ3pCLE1BQU0sRUFBRSxNQUFNO29CQUNkLE9BQU8sRUFBRSxtQkFBVSxDQUFDLE9BQU87b0JBQzNCLFFBQVEsRUFBRSxVQUFVO29CQUNwQixNQUFNLEVBQUUsRUFBRSxhQUFhLEVBQUUsU0FBUyxHQUFHLE1BQU0sRUFBRTtvQkFDN0MsSUFBSSxFQUFFLFdBQVc7aUJBQ2xCLENBQUM7Z0JBRXdCLHFCQUFNLG9EQUFrQixDQUFDLFFBQVEsQ0FBQyxFQUFBOztnQkFBdEQsUUFBUSxHQUFZLFNBQWtDO2dCQUV0RCxTQUFTLEdBQVcsaURBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFOUMsWUFBWSxHQUFnQztvQkFDaEQsU0FBUyxXQUFBO29CQUNULElBQUksRUFBRTt3QkFDSixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJO3dCQUN4QixZQUFZLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZO3dCQUN4QyxHQUFHLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHO3dCQUN0QixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJO3dCQUN4QixTQUFTLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTO3dCQUNsQyxTQUFTLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTO3dCQUNsQyxZQUFZLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZO3dCQUN4QyxJQUFJLEVBQUUsS0FBSzt3QkFDWCxHQUFHLEtBQUE7cUJBQ0o7aUJBQ0YsQ0FBQztnQkFFRixzQkFBTyxZQUFZLEVBQUM7OztnQkFFcEIsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsZ0NBQThCLElBQUksVUFBSyxPQUFPLENBQUMsQ0FBQztnQkFDN0QsTUFBTSxPQUFLLENBQUM7Ozs7S0FFZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY29uZmlnRGF0YSB9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQgeyBSZWdpc3RlcmVkVmVyaWZpZXIsIFVudW1EdG8sIFZlcmlmaWVyT3B0aW9ucyB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IEtleVBhaXIsIFB1YmxpY0tleUluZm8sIGdldFVVSUQsIEtleVBhaXJTZXQsIEN1c3RFcnJvciwgY3JlYXRlS2V5UGFpclNldCwgUkVTVERhdGEsIEpTT05PYmosIG1ha2VOZXR3b3JrUmVxdWVzdCwgRGlkS2V5VHlwZSwgaXNBcnJheUVtcHR5LCBpc0FycmF5Tm90RW1wdHksIGhhbmRsZUF1dGhUb2tlbiB9IGZyb20gJ0B1bnVtaWQvbGlicmFyeS1pc3N1ZXItdmVyaWZpZXItdXRpbGl0eSc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4uL2xvZ2dlcic7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBvYmplY3QgdG8gZW5jYXBzdWxhdGUga2V5IGluZm9ybWF0aW9uLlxuICogQHBhcmFtIGtwIEtleVBhaXJcbiAqIEBwYXJhbSB0eXBlIERpZEtleVR5cGVcbiAqL1xuY29uc3QgY29uc3RydWN0S2V5T2JqID0gKGtwOiBLZXlQYWlyLCB0eXBlOiBEaWRLZXlUeXBlKTogUHVibGljS2V5SW5mbyA9PiB7XG4gIHJldHVybiB7XG4gICAgaWQ6IGdldFVVSUQoKSxcbiAgICBlbmNvZGluZzogJ3BlbScsXG4gICAgdHlwZTogdHlwZSxcbiAgICBzdGF0dXM6ICd2YWxpZCcsXG4gICAgcHVibGljS2V5OiBrcC5wdWJsaWNLZXlcbiAgfTtcbn07XG5cbi8qKlxuICogQ3VycmVudGx5IGNyZWF0ZXMgYSBrZXkgcGFpciBzZXQuIE9uZSBmb3Igc2lnbmluZyBhbmQgdGhlIG90aGVyIGZvciBlbmNyeXB0aW9uLlxuICogRmxleGlibGUgaW4gc3VwcG9ydGluZyBmdXR1cmUga2V5cyBmb3Igb3RoZXIgcHVycG9zZXMuXG4gKiBAcGFyYW0ga3BTZXQgS2V5UGFpclNldFxuICovXG5jb25zdCBjb25zdHJ1Y3RLZXlPYmpzID0gKGtwU2V0OiBLZXlQYWlyU2V0KTogQXJyYXk8UHVibGljS2V5SW5mbz4gPT4ge1xuICBjb25zdCBzaWduS2V5ID0gY29uc3RydWN0S2V5T2JqKGtwU2V0LnNpZ25pbmcsICdzZWNwMjU2cjEnKTtcbiAgY29uc3QgZW5jS2V5ID0gY29uc3RydWN0S2V5T2JqKGtwU2V0LmVuY3J5cHRpb24sICdSU0EnKTtcblxuICByZXR1cm4gW3NpZ25LZXksIGVuY0tleV07XG59O1xuXG4vKipcbiAqIFZhbGlkYXRlcyByZXF1ZXN0IGlucHV0IHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0gcmVxIFJlcXVlc3RcbiAqL1xuY29uc3QgdmFsaWRhdGVJblBhcmFtcyA9IChuYW1lOiBzdHJpbmcsIGN1c3RvbWVyVXVpZDogc3RyaW5nLCB1cmw6IHN0cmluZywgYXBpS2V5OiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgaWYgKCFuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFZlcmlmaWVyIE9wdGlvbnM6IG5hbWUgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAoIWN1c3RvbWVyVXVpZCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBWZXJpZmllciBPcHRpb25zOiBjdXN0b21lclV1aWQgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAoIXVybCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBWZXJpZmllciBPcHRpb25zOiB1cmwgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAoIWFwaUtleSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAxLCAnTm90IGF1dGhlbnRpY2F0ZWQ6IGFwaUtleSBpcyByZXF1aXJlZC4nKTtcbiAgfVxufTtcblxuLyoqXG4gKiBIYW5kbGVyIGZvciByZWdpc3RlcmluZyBhIFZlcmlmaWVyIHdpdGggVW51bUlEJ3MgU2FhUy5cbiAqIEBwYXJhbSBuYW1lXG4gKiBAcGFyYW0gY3VzdG9tZXJVdWlkXG4gKiBAcGFyYW0gdXJsXG4gKiBAcGFyYW0gYXBpS2V5XG4gKi9cbmV4cG9ydCBjb25zdCByZWdpc3RlclZlcmlmaWVyID0gYXN5bmMgKG5hbWU6IHN0cmluZywgY3VzdG9tZXJVdWlkOiBzdHJpbmcsIHVybDogc3RyaW5nLCBhcGlLZXk6IHN0cmluZyk6IFByb21pc2U8VW51bUR0bzxSZWdpc3RlcmVkVmVyaWZpZXI+PiA9PiB7XG4gIHRyeSB7XG4gICAgdmFsaWRhdGVJblBhcmFtcyhuYW1lLCBjdXN0b21lclV1aWQsIHVybCwgYXBpS2V5KTtcblxuICAgIGNvbnN0IGtwU2V0OiBLZXlQYWlyU2V0ID0gYXdhaXQgY3JlYXRlS2V5UGFpclNldCgpO1xuICAgIGNvbnN0IHZlcmlmaWVyT3B0OiBWZXJpZmllck9wdGlvbnMgPSB7IG5hbWUsIGN1c3RvbWVyVXVpZCwgdXJsLCBwdWJsaWNLZXlJbmZvOiBjb25zdHJ1Y3RLZXlPYmpzKGtwU2V0KSB9O1xuICAgIGNvbnN0IHJlc3REYXRhOiBSRVNURGF0YSA9IHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgYmFzZVVybDogY29uZmlnRGF0YS5TYWFTVXJsLFxuICAgICAgZW5kUG9pbnQ6ICd2ZXJpZmllcicsXG4gICAgICBoZWFkZXI6IHsgQXV0aG9yaXphdGlvbjogJ0JlYXJlciAnICsgYXBpS2V5IH0sXG4gICAgICBkYXRhOiB2ZXJpZmllck9wdFxuICAgIH07XG5cbiAgICBjb25zdCByZXN0UmVzcDogSlNPTk9iaiA9IGF3YWl0IG1ha2VOZXR3b3JrUmVxdWVzdChyZXN0RGF0YSk7XG5cbiAgICBjb25zdCBhdXRoVG9rZW46IHN0cmluZyA9IGhhbmRsZUF1dGhUb2tlbihyZXN0UmVzcCk7XG5cbiAgICBjb25zdCB2ZXJpZmllclJlc3A6IFVudW1EdG88UmVnaXN0ZXJlZFZlcmlmaWVyPiA9IHtcbiAgICAgIGF1dGhUb2tlbixcbiAgICAgIGJvZHk6IHtcbiAgICAgICAgdXVpZDogcmVzdFJlc3AuYm9keS51dWlkLFxuICAgICAgICBjdXN0b21lclV1aWQ6IHJlc3RSZXNwLmJvZHkuY3VzdG9tZXJVdWlkLFxuICAgICAgICBkaWQ6IHJlc3RSZXNwLmJvZHkuZGlkLFxuICAgICAgICBuYW1lOiByZXN0UmVzcC5ib2R5Lm5hbWUsXG4gICAgICAgIGNyZWF0ZWRBdDogcmVzdFJlc3AuYm9keS5jcmVhdGVkQXQsXG4gICAgICAgIHVwZGF0ZWRBdDogcmVzdFJlc3AuYm9keS51cGRhdGVkQXQsXG4gICAgICAgIGlzQXV0aG9yaXplZDogcmVzdFJlc3AuYm9keS5pc0F1dGhvcml6ZWQsXG4gICAgICAgIGtleXM6IGtwU2V0LFxuICAgICAgICB1cmxcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIHZlcmlmaWVyUmVzcDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoYEVycm9yIHJlZ2lzdGVyaW5nIHZlcmlmaWVyICR7bmFtZX0uICR7ZXJyb3J9YCk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG4iXX0=