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
var logger_1 = __importDefault(require("../logger"));
var __1 = require("..");
var createKeyPairs_1 = require("../utils/createKeyPairs");
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
var validateVersionInfo_1 = require("../utils/validateVersionInfo");
/**
 * Creates an object to encapsulate key information after key pair creation.
 * @param kp KeyPair
 * @param type DidKeyType
 */
var constructKeyObj = function (kp, type) {
    var now = new Date();
    return {
        id: kp.id,
        encoding: 'pem',
        type: type,
        status: 'valid',
        publicKey: kp.publicKey,
        createdAt: now,
        updatedAt: now
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
var validateInParams = function (url, apiKey, versionInfo) {
    if (!url) {
        throw new __1.CustError(400, 'Invalid Verifier Options: url is required.');
    }
    if (!apiKey) {
        throw new __1.CustError(401, 'Not authenticated: apiKey is required.');
    }
    validateVersionInfo_1.validateVersionInfo(versionInfo);
};
/**
 * Handler for registering a Verifier with UnumID's SaaS.
 * @param customerUuid
 * @param url
 * @param apiKey
 * @param versionInfo
 */
exports.registerVerifier = function (apiKey, url, versionInfo) {
    if (versionInfo === void 0) { versionInfo = [{ target: { version: '1.0.0' }, sdkVersion: '3.0.0' }]; }
    return __awaiter(void 0, void 0, void 0, function () {
        var kpSet, verifierOpt, restData, restResp, authToken, verifierResp, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    validateInParams(url, apiKey, versionInfo);
                    return [4 /*yield*/, createKeyPairs_1.createKeyPairSet()];
                case 1:
                    kpSet = _a.sent();
                    verifierOpt = { url: url, publicKeyInfo: constructKeyObjs(kpSet), versionInfo: versionInfo };
                    restData = {
                        method: 'POST',
                        baseUrl: config_1.configData.SaaSUrl,
                        endPoint: 'verifier',
                        header: { Authorization: 'Bearer ' + apiKey },
                        data: verifierOpt
                    };
                    return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(restData)];
                case 2:
                    restResp = _a.sent();
                    authToken = networkRequestHelper_1.handleAuthTokenHeader(restResp);
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
                            url: url,
                            versionInfo: versionInfo,
                            apiKey: apiKey
                        }
                    };
                    return [2 /*return*/, verifierResp];
                case 3:
                    error_1 = _a.sent();
                    logger_1.default.error("Error registering verifier " + apiKey + ". " + error_1);
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXJWZXJpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92ZXJpZmllci9yZWdpc3RlclZlcmlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG9DQUF1QztBQUV2QyxxREFBK0I7QUFFL0Isd0JBQStCO0FBQy9CLDBEQUEyRDtBQUUzRCxzRUFBMEY7QUFDMUYsb0VBQW1FO0FBRW5FOzs7O0dBSUc7QUFDSCxJQUFNLGVBQWUsR0FBRyxVQUFDLEVBQVcsRUFBRSxJQUFnQjtJQUNwRCxJQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3ZCLE9BQU87UUFDTCxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLElBQUksRUFBRSxJQUFJO1FBQ1YsTUFBTSxFQUFFLE9BQU87UUFDZixTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVM7UUFDdkIsU0FBUyxFQUFFLEdBQUc7UUFDZCxTQUFTLEVBQUUsR0FBRztLQUNmLENBQUM7QUFDSixDQUFDLENBQUM7QUFFRjs7OztHQUlHO0FBQ0gsSUFBTSxnQkFBZ0IsR0FBRyxVQUFDLEtBQWlCO0lBQ3pDLElBQU0sT0FBTyxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQzVELElBQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRXhELE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDM0IsQ0FBQyxDQUFDO0FBRUY7OztHQUdHO0FBQ0gsSUFBTSxnQkFBZ0IsR0FBRyxVQUFDLEdBQVcsRUFBRSxNQUFjLEVBQUUsV0FBMEI7SUFDL0UsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNSLE1BQU0sSUFBSSxhQUFTLENBQUMsR0FBRyxFQUFFLDRDQUE0QyxDQUFDLENBQUM7S0FDeEU7SUFFRCxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1gsTUFBTSxJQUFJLGFBQVMsQ0FBQyxHQUFHLEVBQUUsd0NBQXdDLENBQUMsQ0FBQztLQUNwRTtJQUVELHlDQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ25DLENBQUMsQ0FBQztBQUVGOzs7Ozs7R0FNRztBQUNVLFFBQUEsZ0JBQWdCLEdBQUcsVUFBTyxNQUFjLEVBQUUsR0FBVyxFQUFFLFdBQW9GO0lBQXBGLDRCQUFBLEVBQUEsZUFBOEIsRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxDQUFDOzs7Ozs7O29CQUVwSixnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO29CQUVqQixxQkFBTSxpQ0FBZ0IsRUFBRSxFQUFBOztvQkFBNUMsS0FBSyxHQUFlLFNBQXdCO29CQUM1QyxXQUFXLEdBQW9CLEVBQUUsR0FBRyxLQUFBLEVBQUUsYUFBYSxFQUFFLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxFQUFFLFdBQVcsYUFBQSxFQUFFLENBQUM7b0JBQzVGLFFBQVEsR0FBYTt3QkFDekIsTUFBTSxFQUFFLE1BQU07d0JBQ2QsT0FBTyxFQUFFLG1CQUFVLENBQUMsT0FBTzt3QkFDM0IsUUFBUSxFQUFFLFVBQVU7d0JBQ3BCLE1BQU0sRUFBRSxFQUFFLGFBQWEsRUFBRSxTQUFTLEdBQUcsTUFBTSxFQUFFO3dCQUM3QyxJQUFJLEVBQUUsV0FBVztxQkFDbEIsQ0FBQztvQkFFd0IscUJBQU0seUNBQWtCLENBQUMsUUFBUSxDQUFDLEVBQUE7O29CQUF0RCxRQUFRLEdBQVksU0FBa0M7b0JBRXRELFNBQVMsR0FBVyw0Q0FBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFFcEQsWUFBWSxHQUFnQzt3QkFDaEQsU0FBUyxXQUFBO3dCQUNULElBQUksRUFBRTs0QkFDSixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJOzRCQUN4QixZQUFZLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZOzRCQUN4QyxHQUFHLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHOzRCQUN0QixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJOzRCQUN4QixTQUFTLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTOzRCQUNsQyxTQUFTLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTOzRCQUNsQyxZQUFZLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZOzRCQUN4QyxJQUFJLEVBQUUsS0FBSzs0QkFDWCxHQUFHLEtBQUE7NEJBQ0gsV0FBVyxhQUFBOzRCQUNYLE1BQU0sUUFBQTt5QkFDUDtxQkFDRixDQUFDO29CQUVGLHNCQUFPLFlBQVksRUFBQzs7O29CQUVwQixnQkFBTSxDQUFDLEtBQUssQ0FBQyxnQ0FBOEIsTUFBTSxVQUFLLE9BQU8sQ0FBQyxDQUFDO29CQUMvRCxNQUFNLE9BQUssQ0FBQzs7Ozs7Q0FFZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY29uZmlnRGF0YSB9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQgeyBLZXlQYWlyU2V0LCBSZWdpc3RlcmVkVmVyaWZpZXIsIFJFU1REYXRhLCBVbnVtRHRvIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IHsgRGlkS2V5VHlwZSwgS2V5UGFpciwgUHVibGljS2V5SW5mbywgVmVyaWZpZXJPcHRpb25zLCBWZXJzaW9uSW5mbywgSlNPTk9iaiB9IGZyb20gJ0B1bnVtaWQvdHlwZXMnO1xuaW1wb3J0IHsgQ3VzdEVycm9yIH0gZnJvbSAnLi4nO1xuaW1wb3J0IHsgY3JlYXRlS2V5UGFpclNldCB9IGZyb20gJy4uL3V0aWxzL2NyZWF0ZUtleVBhaXJzJztcbmltcG9ydCB7IGdldFVVSUQgfSBmcm9tICcuLi91dGlscy9oZWxwZXJzJztcbmltcG9ydCB7IG1ha2VOZXR3b3JrUmVxdWVzdCwgaGFuZGxlQXV0aFRva2VuSGVhZGVyIH0gZnJvbSAnLi4vdXRpbHMvbmV0d29ya1JlcXVlc3RIZWxwZXInO1xuaW1wb3J0IHsgdmFsaWRhdGVWZXJzaW9uSW5mbyB9IGZyb20gJy4uL3V0aWxzL3ZhbGlkYXRlVmVyc2lvbkluZm8nO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gb2JqZWN0IHRvIGVuY2Fwc3VsYXRlIGtleSBpbmZvcm1hdGlvbiBhZnRlciBrZXkgcGFpciBjcmVhdGlvbi5cbiAqIEBwYXJhbSBrcCBLZXlQYWlyXG4gKiBAcGFyYW0gdHlwZSBEaWRLZXlUeXBlXG4gKi9cbmNvbnN0IGNvbnN0cnVjdEtleU9iaiA9IChrcDogS2V5UGFpciwgdHlwZTogRGlkS2V5VHlwZSk6IFB1YmxpY0tleUluZm8gPT4ge1xuICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICByZXR1cm4ge1xuICAgIGlkOiBrcC5pZCxcbiAgICBlbmNvZGluZzogJ3BlbScsXG4gICAgdHlwZTogdHlwZSxcbiAgICBzdGF0dXM6ICd2YWxpZCcsXG4gICAgcHVibGljS2V5OiBrcC5wdWJsaWNLZXksXG4gICAgY3JlYXRlZEF0OiBub3csXG4gICAgdXBkYXRlZEF0OiBub3dcbiAgfTtcbn07XG5cbi8qKlxuICogQ3VycmVudGx5IGNyZWF0ZXMgYSBrZXkgcGFpciBzZXQuIE9uZSBmb3Igc2lnbmluZyBhbmQgdGhlIG90aGVyIGZvciBlbmNyeXB0aW9uLlxuICogRmxleGlibGUgaW4gc3VwcG9ydGluZyBmdXR1cmUga2V5cyBmb3Igb3RoZXIgcHVycG9zZXMuXG4gKiBAcGFyYW0ga3BTZXQgS2V5UGFpclNldFxuICovXG5jb25zdCBjb25zdHJ1Y3RLZXlPYmpzID0gKGtwU2V0OiBLZXlQYWlyU2V0KTogQXJyYXk8UHVibGljS2V5SW5mbz4gPT4ge1xuICBjb25zdCBzaWduS2V5ID0gY29uc3RydWN0S2V5T2JqKGtwU2V0LnNpZ25pbmcsICdzZWNwMjU2cjEnKTtcbiAgY29uc3QgZW5jS2V5ID0gY29uc3RydWN0S2V5T2JqKGtwU2V0LmVuY3J5cHRpb24sICdSU0EnKTtcblxuICByZXR1cm4gW3NpZ25LZXksIGVuY0tleV07XG59O1xuXG4vKipcbiAqIFZhbGlkYXRlcyByZXF1ZXN0IGlucHV0IHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0gcmVxIFJlcXVlc3RcbiAqL1xuY29uc3QgdmFsaWRhdGVJblBhcmFtcyA9ICh1cmw6IHN0cmluZywgYXBpS2V5OiBzdHJpbmcsIHZlcnNpb25JbmZvOiBWZXJzaW9uSW5mb1tdKTogdm9pZCA9PiB7XG4gIGlmICghdXJsKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFZlcmlmaWVyIE9wdGlvbnM6IHVybCBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICghYXBpS2V5KSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDEsICdOb3QgYXV0aGVudGljYXRlZDogYXBpS2V5IGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgdmFsaWRhdGVWZXJzaW9uSW5mbyh2ZXJzaW9uSW5mbyk7XG59O1xuXG4vKipcbiAqIEhhbmRsZXIgZm9yIHJlZ2lzdGVyaW5nIGEgVmVyaWZpZXIgd2l0aCBVbnVtSUQncyBTYWFTLlxuICogQHBhcmFtIGN1c3RvbWVyVXVpZFxuICogQHBhcmFtIHVybFxuICogQHBhcmFtIGFwaUtleVxuICogQHBhcmFtIHZlcnNpb25JbmZvXG4gKi9cbmV4cG9ydCBjb25zdCByZWdpc3RlclZlcmlmaWVyID0gYXN5bmMgKGFwaUtleTogc3RyaW5nLCB1cmw6IHN0cmluZywgdmVyc2lvbkluZm86IFZlcnNpb25JbmZvW10gPSBbeyB0YXJnZXQ6IHsgdmVyc2lvbjogJzEuMC4wJyB9LCBzZGtWZXJzaW9uOiAnMy4wLjAnIH1dKTogUHJvbWlzZTxVbnVtRHRvPFJlZ2lzdGVyZWRWZXJpZmllcj4+ID0+IHtcbiAgdHJ5IHtcbiAgICB2YWxpZGF0ZUluUGFyYW1zKHVybCwgYXBpS2V5LCB2ZXJzaW9uSW5mbyk7XG5cbiAgICBjb25zdCBrcFNldDogS2V5UGFpclNldCA9IGF3YWl0IGNyZWF0ZUtleVBhaXJTZXQoKTtcbiAgICBjb25zdCB2ZXJpZmllck9wdDogVmVyaWZpZXJPcHRpb25zID0geyB1cmwsIHB1YmxpY0tleUluZm86IGNvbnN0cnVjdEtleU9ianMoa3BTZXQpLCB2ZXJzaW9uSW5mbyB9O1xuICAgIGNvbnN0IHJlc3REYXRhOiBSRVNURGF0YSA9IHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgYmFzZVVybDogY29uZmlnRGF0YS5TYWFTVXJsLFxuICAgICAgZW5kUG9pbnQ6ICd2ZXJpZmllcicsXG4gICAgICBoZWFkZXI6IHsgQXV0aG9yaXphdGlvbjogJ0JlYXJlciAnICsgYXBpS2V5IH0sXG4gICAgICBkYXRhOiB2ZXJpZmllck9wdFxuICAgIH07XG5cbiAgICBjb25zdCByZXN0UmVzcDogSlNPTk9iaiA9IGF3YWl0IG1ha2VOZXR3b3JrUmVxdWVzdChyZXN0RGF0YSk7XG5cbiAgICBjb25zdCBhdXRoVG9rZW46IHN0cmluZyA9IGhhbmRsZUF1dGhUb2tlbkhlYWRlcihyZXN0UmVzcCk7XG5cbiAgICBjb25zdCB2ZXJpZmllclJlc3A6IFVudW1EdG88UmVnaXN0ZXJlZFZlcmlmaWVyPiA9IHtcbiAgICAgIGF1dGhUb2tlbixcbiAgICAgIGJvZHk6IHtcbiAgICAgICAgdXVpZDogcmVzdFJlc3AuYm9keS51dWlkLFxuICAgICAgICBjdXN0b21lclV1aWQ6IHJlc3RSZXNwLmJvZHkuY3VzdG9tZXJVdWlkLFxuICAgICAgICBkaWQ6IHJlc3RSZXNwLmJvZHkuZGlkLFxuICAgICAgICBuYW1lOiByZXN0UmVzcC5ib2R5Lm5hbWUsXG4gICAgICAgIGNyZWF0ZWRBdDogcmVzdFJlc3AuYm9keS5jcmVhdGVkQXQsXG4gICAgICAgIHVwZGF0ZWRBdDogcmVzdFJlc3AuYm9keS51cGRhdGVkQXQsXG4gICAgICAgIGlzQXV0aG9yaXplZDogcmVzdFJlc3AuYm9keS5pc0F1dGhvcml6ZWQsXG4gICAgICAgIGtleXM6IGtwU2V0LFxuICAgICAgICB1cmwsXG4gICAgICAgIHZlcnNpb25JbmZvLFxuICAgICAgICBhcGlLZXlcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIHZlcmlmaWVyUmVzcDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoYEVycm9yIHJlZ2lzdGVyaW5nIHZlcmlmaWVyICR7YXBpS2V5fS4gJHtlcnJvcn1gKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcbiJdfQ==