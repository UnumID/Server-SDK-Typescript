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
exports.registerIssuer = void 0;
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
 * Creates a key pair set. One for signing and the other for encryption.
 * @param kpSet KeyPairSet
 */
var constructKeyObjs = function (kpSet) {
    var signKey = constructKeyObj(kpSet.signing, 'secp256r1');
    var encKey = constructKeyObj(kpSet.encryption, 'RSA');
    return [signKey, encKey];
};
/**
 * Validates request input parameters.
 * @param name: string
 * @param customerUuid string
 * @param apiKey string
 */
var validateInParams = function (name, customerUuid, apiKey) {
    if (!name) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Issuer: name is required.');
    }
    if (!customerUuid) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Issuer: customerUuid is required.');
    }
    if (!apiKey) {
        throw new library_issuer_verifier_utility_1.CustError(401, 'Not authenticated: apiKey is required');
    }
};
/**
 * Handles registering an Issuer with UnumID's SaaS.
 * @param name string
 * @param customerUuid string
 * @param apiKey string
 */
exports.registerIssuer = function (name, customerUuid, apiKey) { return __awaiter(void 0, void 0, void 0, function () {
    var kpSet, issuerOpt, restData, restResp, authToken, issuerResp, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                validateInParams(name, customerUuid, apiKey);
                return [4 /*yield*/, library_issuer_verifier_utility_1.createKeyPairSet()];
            case 1:
                kpSet = _a.sent();
                issuerOpt = {
                    name: name,
                    customerUuid: customerUuid,
                    publicKeyInfo: constructKeyObjs(kpSet)
                };
                restData = {
                    method: 'POST',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'issuer',
                    header: { Authorization: 'Bearer ' + apiKey },
                    data: issuerOpt
                };
                return [4 /*yield*/, library_issuer_verifier_utility_1.makeNetworkRequest(restData)];
            case 2:
                restResp = _a.sent();
                authToken = library_issuer_verifier_utility_1.handleAuthToken(restResp);
                issuerResp = {
                    authToken: authToken,
                    body: {
                        uuid: restResp.body.uuid,
                        customerUuid: restResp.body.customerUuid,
                        did: restResp.body.did,
                        name: restResp.body.name,
                        createdAt: restResp.body.createdAt,
                        updatedAt: restResp.body.updatedAt,
                        isAuthorized: restResp.body.isAuthorized,
                        keys: kpSet
                    }
                };
                return [2 /*return*/, issuerResp];
            case 3:
                error_1 = _a.sent();
                logger_1.default.error("Error registering an Issuer with UnumID SaaS. " + error_1);
                throw error_1;
            case 4: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXJJc3N1ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaXNzdWVyL3JlZ2lzdGVySXNzdWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG9DQUF1QztBQUd2QywyRkFBdU07QUFDdk0scURBQStCO0FBRS9COzs7O0dBSUc7QUFDSCxJQUFNLGVBQWUsR0FBRyxVQUFDLEVBQVcsRUFBRSxJQUFnQjtJQUNwRCxPQUFPO1FBQ0wsRUFBRSxFQUFFLHlDQUFPLEVBQUU7UUFDYixRQUFRLEVBQUUsS0FBSztRQUNmLElBQUksRUFBRSxJQUFJO1FBQ1YsTUFBTSxFQUFFLE9BQU87UUFDZixTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVM7S0FDeEIsQ0FBQztBQUNKLENBQUMsQ0FBQztBQUVGOzs7R0FHRztBQUNILElBQU0sZ0JBQWdCLEdBQUcsVUFBQyxLQUFpQjtJQUN6QyxJQUFNLE9BQU8sR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUM1RCxJQUFNLE1BQU0sR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUV4RCxPQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzNCLENBQUMsQ0FBQztBQUVGOzs7OztHQUtHO0FBQ0gsSUFBTSxnQkFBZ0IsR0FBRyxVQUFDLElBQVksRUFBRSxZQUFvQixFQUFFLE1BQWM7SUFDMUUsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNULE1BQU0sSUFBSSwyQ0FBUyxDQUFDLEdBQUcsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDO0tBQy9EO0lBRUQsSUFBSSxDQUFDLFlBQVksRUFBRTtRQUNqQixNQUFNLElBQUksMkNBQVMsQ0FBQyxHQUFHLEVBQUUsMkNBQTJDLENBQUMsQ0FBQztLQUN2RTtJQUVELElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDWCxNQUFNLElBQUksMkNBQVMsQ0FBQyxHQUFHLEVBQUUsdUNBQXVDLENBQUMsQ0FBQztLQUNuRTtBQUNILENBQUMsQ0FBQztBQUVGOzs7OztHQUtHO0FBQ1UsUUFBQSxjQUFjLEdBQUcsVUFBTyxJQUFZLEVBQUUsWUFBb0IsRUFBRSxNQUFjOzs7Ozs7Z0JBRW5GLGdCQUFnQixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBRW5CLHFCQUFNLGtEQUFnQixFQUFFLEVBQUE7O2dCQUE1QyxLQUFLLEdBQWUsU0FBd0I7Z0JBQzVDLFNBQVMsR0FBa0I7b0JBQy9CLElBQUksTUFBQTtvQkFDSixZQUFZLGNBQUE7b0JBQ1osYUFBYSxFQUFFLGdCQUFnQixDQUFDLEtBQUssQ0FBQztpQkFDdkMsQ0FBQztnQkFDSSxRQUFRLEdBQWE7b0JBQ3pCLE1BQU0sRUFBRSxNQUFNO29CQUNkLE9BQU8sRUFBRSxtQkFBVSxDQUFDLE9BQU87b0JBQzNCLFFBQVEsRUFBRSxRQUFRO29CQUNsQixNQUFNLEVBQUUsRUFBRSxhQUFhLEVBQUUsU0FBUyxHQUFHLE1BQU0sRUFBRTtvQkFDN0MsSUFBSSxFQUFFLFNBQVM7aUJBQ2hCLENBQUM7Z0JBRXdCLHFCQUFNLG9EQUFrQixDQUFDLFFBQVEsQ0FBQyxFQUFBOztnQkFBdEQsUUFBUSxHQUFZLFNBQWtDO2dCQUV0RCxTQUFTLEdBQVcsaURBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFOUMsVUFBVSxHQUE4QjtvQkFDNUMsU0FBUyxXQUFBO29CQUNULElBQUksRUFBRTt3QkFDSixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJO3dCQUN4QixZQUFZLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZO3dCQUN4QyxHQUFHLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHO3dCQUN0QixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJO3dCQUN4QixTQUFTLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTO3dCQUNsQyxTQUFTLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTO3dCQUNsQyxZQUFZLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZO3dCQUN4QyxJQUFJLEVBQUUsS0FBSztxQkFDWjtpQkFDRixDQUFDO2dCQUVGLHNCQUFPLFVBQVUsRUFBQzs7O2dCQUVsQixnQkFBTSxDQUFDLEtBQUssQ0FBQyxtREFBaUQsT0FBTyxDQUFDLENBQUM7Z0JBQ3ZFLE1BQU0sT0FBSyxDQUFDOzs7O0tBRWYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNvbmZpZ0RhdGEgfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgSXNzdWVyT3B0aW9ucywgUmVnaXN0ZXJlZElzc3VlciwgVW51bUR0byB9IGZyb20gJy4uL3R5cGVzJztcblxuaW1wb3J0IHsgS2V5UGFpciwgUHVibGljS2V5SW5mbywgZ2V0VVVJRCwgS2V5UGFpclNldCwgQ3VzdEVycm9yLCBjcmVhdGVLZXlQYWlyU2V0LCBSRVNURGF0YSwgSlNPTk9iaiwgbWFrZU5ldHdvcmtSZXF1ZXN0LCBEaWRLZXlUeXBlLCBoYW5kbGVBdXRoVG9rZW4gfSBmcm9tICdAdW51bWlkL2xpYnJhcnktaXNzdWVyLXZlcmlmaWVyLXV0aWxpdHknO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuLi9sb2dnZXInO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gb2JqZWN0IHRvIGVuY2Fwc3VsYXRlIGtleSBpbmZvcm1hdGlvbi5cbiAqIEBwYXJhbSBrcCBLZXlQYWlyXG4gKiBAcGFyYW0gdHlwZSBEaWRLZXlUeXBlXG4gKi9cbmNvbnN0IGNvbnN0cnVjdEtleU9iaiA9IChrcDogS2V5UGFpciwgdHlwZTogRGlkS2V5VHlwZSk6IFB1YmxpY0tleUluZm8gPT4ge1xuICByZXR1cm4ge1xuICAgIGlkOiBnZXRVVUlEKCksXG4gICAgZW5jb2Rpbmc6ICdwZW0nLFxuICAgIHR5cGU6IHR5cGUsXG4gICAgc3RhdHVzOiAndmFsaWQnLFxuICAgIHB1YmxpY0tleToga3AucHVibGljS2V5XG4gIH07XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBrZXkgcGFpciBzZXQuIE9uZSBmb3Igc2lnbmluZyBhbmQgdGhlIG90aGVyIGZvciBlbmNyeXB0aW9uLlxuICogQHBhcmFtIGtwU2V0IEtleVBhaXJTZXRcbiAqL1xuY29uc3QgY29uc3RydWN0S2V5T2JqcyA9IChrcFNldDogS2V5UGFpclNldCk6IEFycmF5PFB1YmxpY0tleUluZm8+ID0+IHtcbiAgY29uc3Qgc2lnbktleSA9IGNvbnN0cnVjdEtleU9iaihrcFNldC5zaWduaW5nLCAnc2VjcDI1NnIxJyk7XG4gIGNvbnN0IGVuY0tleSA9IGNvbnN0cnVjdEtleU9iaihrcFNldC5lbmNyeXB0aW9uLCAnUlNBJyk7XG5cbiAgcmV0dXJuIFtzaWduS2V5LCBlbmNLZXldO1xufTtcblxuLyoqXG4gKiBWYWxpZGF0ZXMgcmVxdWVzdCBpbnB1dCBwYXJhbWV0ZXJzLlxuICogQHBhcmFtIG5hbWU6IHN0cmluZ1xuICogQHBhcmFtIGN1c3RvbWVyVXVpZCBzdHJpbmdcbiAqIEBwYXJhbSBhcGlLZXkgc3RyaW5nXG4gKi9cbmNvbnN0IHZhbGlkYXRlSW5QYXJhbXMgPSAobmFtZTogc3RyaW5nLCBjdXN0b21lclV1aWQ6IHN0cmluZywgYXBpS2V5OiBzdHJpbmcpID0+IHtcbiAgaWYgKCFuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIElzc3VlcjogbmFtZSBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICghY3VzdG9tZXJVdWlkKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIElzc3VlcjogY3VzdG9tZXJVdWlkIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKCFhcGlLZXkpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMSwgJ05vdCBhdXRoZW50aWNhdGVkOiBhcGlLZXkgaXMgcmVxdWlyZWQnKTtcbiAgfVxufTtcblxuLyoqXG4gKiBIYW5kbGVzIHJlZ2lzdGVyaW5nIGFuIElzc3VlciB3aXRoIFVudW1JRCdzIFNhYVMuXG4gKiBAcGFyYW0gbmFtZSBzdHJpbmdcbiAqIEBwYXJhbSBjdXN0b21lclV1aWQgc3RyaW5nXG4gKiBAcGFyYW0gYXBpS2V5IHN0cmluZ1xuICovXG5leHBvcnQgY29uc3QgcmVnaXN0ZXJJc3N1ZXIgPSBhc3luYyAobmFtZTogc3RyaW5nLCBjdXN0b21lclV1aWQ6IHN0cmluZywgYXBpS2V5OiBzdHJpbmcpOiBQcm9taXNlPFVudW1EdG88UmVnaXN0ZXJlZElzc3Vlcj4+ID0+IHtcbiAgdHJ5IHtcbiAgICB2YWxpZGF0ZUluUGFyYW1zKG5hbWUsIGN1c3RvbWVyVXVpZCwgYXBpS2V5KTtcblxuICAgIGNvbnN0IGtwU2V0OiBLZXlQYWlyU2V0ID0gYXdhaXQgY3JlYXRlS2V5UGFpclNldCgpO1xuICAgIGNvbnN0IGlzc3Vlck9wdDogSXNzdWVyT3B0aW9ucyA9IHtcbiAgICAgIG5hbWUsXG4gICAgICBjdXN0b21lclV1aWQsXG4gICAgICBwdWJsaWNLZXlJbmZvOiBjb25zdHJ1Y3RLZXlPYmpzKGtwU2V0KVxuICAgIH07XG4gICAgY29uc3QgcmVzdERhdGE6IFJFU1REYXRhID0ge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBiYXNlVXJsOiBjb25maWdEYXRhLlNhYVNVcmwsXG4gICAgICBlbmRQb2ludDogJ2lzc3VlcicsXG4gICAgICBoZWFkZXI6IHsgQXV0aG9yaXphdGlvbjogJ0JlYXJlciAnICsgYXBpS2V5IH0sXG4gICAgICBkYXRhOiBpc3N1ZXJPcHRcbiAgICB9O1xuXG4gICAgY29uc3QgcmVzdFJlc3A6IEpTT05PYmogPSBhd2FpdCBtYWtlTmV0d29ya1JlcXVlc3QocmVzdERhdGEpO1xuXG4gICAgY29uc3QgYXV0aFRva2VuOiBzdHJpbmcgPSBoYW5kbGVBdXRoVG9rZW4ocmVzdFJlc3ApO1xuXG4gICAgY29uc3QgaXNzdWVyUmVzcDogVW51bUR0bzxSZWdpc3RlcmVkSXNzdWVyPiA9IHtcbiAgICAgIGF1dGhUb2tlbixcbiAgICAgIGJvZHk6IHtcbiAgICAgICAgdXVpZDogcmVzdFJlc3AuYm9keS51dWlkLFxuICAgICAgICBjdXN0b21lclV1aWQ6IHJlc3RSZXNwLmJvZHkuY3VzdG9tZXJVdWlkLFxuICAgICAgICBkaWQ6IHJlc3RSZXNwLmJvZHkuZGlkLFxuICAgICAgICBuYW1lOiByZXN0UmVzcC5ib2R5Lm5hbWUsXG4gICAgICAgIGNyZWF0ZWRBdDogcmVzdFJlc3AuYm9keS5jcmVhdGVkQXQsXG4gICAgICAgIHVwZGF0ZWRBdDogcmVzdFJlc3AuYm9keS51cGRhdGVkQXQsXG4gICAgICAgIGlzQXV0aG9yaXplZDogcmVzdFJlc3AuYm9keS5pc0F1dGhvcml6ZWQsXG4gICAgICAgIGtleXM6IGtwU2V0XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBpc3N1ZXJSZXNwO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcihgRXJyb3IgcmVnaXN0ZXJpbmcgYW4gSXNzdWVyIHdpdGggVW51bUlEIFNhYVMuICR7ZXJyb3J9YCk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG4iXX0=