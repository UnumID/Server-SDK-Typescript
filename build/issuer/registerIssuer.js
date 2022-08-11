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
var logger_1 = __importDefault(require("../logger"));
var error_1 = require("../utils/error");
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
 * @param customerUuid string
 * @param apiKey string
 */
var validateInParams = function (apiKey, url, versionInfo) {
    if (!apiKey) {
        throw new error_1.CustError(401, 'Not authenticated: apiKey is required');
    }
    if (!url) {
        throw new error_1.CustError(400, 'Invalid Issuer: url is required.');
    }
    validateVersionInfo_1.validateVersionInfo(versionInfo);
};
/**
 * Handles registering an Issuer with UnumID's SaaS.
 * @param customerUuid
 * @param apiKey
 */
exports.registerIssuer = function (apiKey, url, versionInfo) {
    if (versionInfo === void 0) { versionInfo = [{ target: { version: '1.0.0' }, sdkVersion: '3.0.0' }]; }
    return __awaiter(void 0, void 0, void 0, function () {
        var kpSet, issuerOpt, restData, restResp, authToken, issuerResp, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    validateInParams(apiKey, url, versionInfo);
                    return [4 /*yield*/, createKeyPairs_1.createKeyPairSet()];
                case 1:
                    kpSet = _a.sent();
                    issuerOpt = {
                        publicKeyInfo: constructKeyObjs(kpSet),
                        url: url,
                        versionInfo: versionInfo
                    };
                    restData = {
                        method: 'POST',
                        baseUrl: config_1.configData.SaaSUrl,
                        endPoint: 'issuer',
                        header: { Authorization: 'Bearer ' + apiKey },
                        data: issuerOpt
                    };
                    return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(restData)];
                case 2:
                    restResp = _a.sent();
                    authToken = networkRequestHelper_1.handleAuthTokenHeader(restResp);
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
                            keys: kpSet,
                            apiKey: apiKey,
                            url: restResp.body.url,
                            versionInfo: restResp.body.versionInfo
                        }
                    };
                    return [2 /*return*/, issuerResp];
                case 3:
                    error_2 = _a.sent();
                    logger_1.default.error("Error registering an Issuer with UnumID SaaS. " + error_2);
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXJJc3N1ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaXNzdWVyL3JlZ2lzdGVySXNzdWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG9DQUF1QztBQUd2QyxxREFBK0I7QUFHL0Isd0NBQTJDO0FBQzNDLDBEQUEyRDtBQUMzRCxzRUFBMEY7QUFDMUYsb0VBQW1FO0FBRW5FOzs7O0dBSUc7QUFDSCxJQUFNLGVBQWUsR0FBRyxVQUFDLEVBQVcsRUFBRSxJQUFnQjtJQUNwRCxJQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3ZCLE9BQU87UUFDTCxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLElBQUksRUFBRSxJQUFJO1FBQ1YsTUFBTSxFQUFFLE9BQU87UUFDZixTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVM7UUFDdkIsU0FBUyxFQUFFLEdBQUc7UUFDZCxTQUFTLEVBQUUsR0FBRztLQUNmLENBQUM7QUFDSixDQUFDLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxJQUFNLGdCQUFnQixHQUFHLFVBQUMsS0FBaUI7SUFDekMsSUFBTSxPQUFPLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDNUQsSUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFeEQsT0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMzQixDQUFDLENBQUM7QUFFRjs7OztHQUlHO0FBQ0gsSUFBTSxnQkFBZ0IsR0FBRyxVQUFDLE1BQWMsRUFBRSxHQUFXLEVBQUUsV0FBMEI7SUFDL0UsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNYLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDO0tBQ25FO0lBRUQsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNSLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO0tBQzlEO0lBRUQseUNBQW1CLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbkMsQ0FBQyxDQUFDO0FBRUY7Ozs7R0FJRztBQUNVLFFBQUEsY0FBYyxHQUFHLFVBQU8sTUFBYyxFQUFFLEdBQVUsRUFBRSxXQUFvRjtJQUFwRiw0QkFBQSxFQUFBLGVBQThCLEVBQUUsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsQ0FBQzs7Ozs7OztvQkFFakosZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztvQkFFakIscUJBQU0saUNBQWdCLEVBQUUsRUFBQTs7b0JBQTVDLEtBQUssR0FBZSxTQUF3QjtvQkFDNUMsU0FBUyxHQUFrQjt3QkFDL0IsYUFBYSxFQUFFLGdCQUFnQixDQUFDLEtBQUssQ0FBQzt3QkFDdEMsR0FBRyxLQUFBO3dCQUNILFdBQVcsYUFBQTtxQkFDWixDQUFDO29CQUVJLFFBQVEsR0FBYTt3QkFDekIsTUFBTSxFQUFFLE1BQU07d0JBQ2QsT0FBTyxFQUFFLG1CQUFVLENBQUMsT0FBTzt3QkFDM0IsUUFBUSxFQUFFLFFBQVE7d0JBQ2xCLE1BQU0sRUFBRSxFQUFFLGFBQWEsRUFBRSxTQUFTLEdBQUcsTUFBTSxFQUFFO3dCQUM3QyxJQUFJLEVBQUUsU0FBUztxQkFDaEIsQ0FBQztvQkFFd0IscUJBQU0seUNBQWtCLENBQUMsUUFBUSxDQUFDLEVBQUE7O29CQUF0RCxRQUFRLEdBQVksU0FBa0M7b0JBRXRELFNBQVMsR0FBVyw0Q0FBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFFcEQsVUFBVSxHQUE4Qjt3QkFDNUMsU0FBUyxXQUFBO3dCQUNULElBQUksRUFBRTs0QkFDSixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJOzRCQUN4QixZQUFZLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZOzRCQUN4QyxHQUFHLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHOzRCQUN0QixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJOzRCQUN4QixTQUFTLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTOzRCQUNsQyxTQUFTLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTOzRCQUNsQyxZQUFZLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZOzRCQUN4QyxJQUFJLEVBQUUsS0FBSzs0QkFDWCxNQUFNLFFBQUE7NEJBQ04sR0FBRyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRzs0QkFDdEIsV0FBVyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVzt5QkFDdkM7cUJBQ0YsQ0FBQztvQkFFRixzQkFBTyxVQUFVLEVBQUM7OztvQkFFbEIsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsbURBQWlELE9BQU8sQ0FBQyxDQUFDO29CQUN2RSxNQUFNLE9BQUssQ0FBQzs7Ozs7Q0FFZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY29uZmlnRGF0YSB9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQgeyBLZXlQYWlyU2V0LCBSZWdpc3RlcmVkSXNzdWVyLCBSRVNURGF0YSwgVW51bUR0byB9IGZyb20gJy4uL3R5cGVzJztcblxuaW1wb3J0IGxvZ2dlciBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IHsgRGlkS2V5VHlwZSwgSXNzdWVyT3B0aW9ucywgSlNPTk9iaiwgS2V5UGFpciwgUHVibGljS2V5SW5mbywgVmVyc2lvbkluZm8gfSBmcm9tICdAdW51bWlkL3R5cGVzJztcbmltcG9ydCB7IGdldFVVSUQgfSBmcm9tICcuLi91dGlscy9oZWxwZXJzJztcbmltcG9ydCB7IEN1c3RFcnJvciB9IGZyb20gJy4uL3V0aWxzL2Vycm9yJztcbmltcG9ydCB7IGNyZWF0ZUtleVBhaXJTZXQgfSBmcm9tICcuLi91dGlscy9jcmVhdGVLZXlQYWlycyc7XG5pbXBvcnQgeyBoYW5kbGVBdXRoVG9rZW5IZWFkZXIsIG1ha2VOZXR3b3JrUmVxdWVzdCB9IGZyb20gJy4uL3V0aWxzL25ldHdvcmtSZXF1ZXN0SGVscGVyJztcbmltcG9ydCB7IHZhbGlkYXRlVmVyc2lvbkluZm8gfSBmcm9tICcuLi91dGlscy92YWxpZGF0ZVZlcnNpb25JbmZvJztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIG9iamVjdCB0byBlbmNhcHN1bGF0ZSBrZXkgaW5mb3JtYXRpb24gYWZ0ZXIga2V5IHBhaXIgY3JlYXRpb24uXG4gKiBAcGFyYW0ga3AgS2V5UGFpclxuICogQHBhcmFtIHR5cGUgRGlkS2V5VHlwZVxuICovXG5jb25zdCBjb25zdHJ1Y3RLZXlPYmogPSAoa3A6IEtleVBhaXIsIHR5cGU6IERpZEtleVR5cGUpOiBQdWJsaWNLZXlJbmZvID0+IHtcbiAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgcmV0dXJuIHtcbiAgICBpZDoga3AuaWQsXG4gICAgZW5jb2Rpbmc6ICdwZW0nLFxuICAgIHR5cGU6IHR5cGUsXG4gICAgc3RhdHVzOiAndmFsaWQnLFxuICAgIHB1YmxpY0tleToga3AucHVibGljS2V5LFxuICAgIGNyZWF0ZWRBdDogbm93LFxuICAgIHVwZGF0ZWRBdDogbm93XG4gIH07XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBrZXkgcGFpciBzZXQuIE9uZSBmb3Igc2lnbmluZyBhbmQgdGhlIG90aGVyIGZvciBlbmNyeXB0aW9uLlxuICogQHBhcmFtIGtwU2V0IEtleVBhaXJTZXRcbiAqL1xuY29uc3QgY29uc3RydWN0S2V5T2JqcyA9IChrcFNldDogS2V5UGFpclNldCk6IEFycmF5PFB1YmxpY0tleUluZm8+ID0+IHtcbiAgY29uc3Qgc2lnbktleSA9IGNvbnN0cnVjdEtleU9iaihrcFNldC5zaWduaW5nLCAnc2VjcDI1NnIxJyk7XG4gIGNvbnN0IGVuY0tleSA9IGNvbnN0cnVjdEtleU9iaihrcFNldC5lbmNyeXB0aW9uLCAnUlNBJyk7XG5cbiAgcmV0dXJuIFtzaWduS2V5LCBlbmNLZXldO1xufTtcblxuLyoqXG4gKiBWYWxpZGF0ZXMgcmVxdWVzdCBpbnB1dCBwYXJhbWV0ZXJzLlxuICogQHBhcmFtIGN1c3RvbWVyVXVpZCBzdHJpbmdcbiAqIEBwYXJhbSBhcGlLZXkgc3RyaW5nXG4gKi9cbmNvbnN0IHZhbGlkYXRlSW5QYXJhbXMgPSAoYXBpS2V5OiBzdHJpbmcsIHVybDogc3RyaW5nLCB2ZXJzaW9uSW5mbzogVmVyc2lvbkluZm9bXSkgPT4ge1xuICBpZiAoIWFwaUtleSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAxLCAnTm90IGF1dGhlbnRpY2F0ZWQ6IGFwaUtleSBpcyByZXF1aXJlZCcpO1xuICB9XG5cbiAgaWYgKCF1cmwpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgSXNzdWVyOiB1cmwgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICB2YWxpZGF0ZVZlcnNpb25JbmZvKHZlcnNpb25JbmZvKTtcbn07XG5cbi8qKlxuICogSGFuZGxlcyByZWdpc3RlcmluZyBhbiBJc3N1ZXIgd2l0aCBVbnVtSUQncyBTYWFTLlxuICogQHBhcmFtIGN1c3RvbWVyVXVpZFxuICogQHBhcmFtIGFwaUtleVxuICovXG5leHBvcnQgY29uc3QgcmVnaXN0ZXJJc3N1ZXIgPSBhc3luYyAoYXBpS2V5OiBzdHJpbmcsIHVybDpzdHJpbmcsIHZlcnNpb25JbmZvOiBWZXJzaW9uSW5mb1tdID0gW3sgdGFyZ2V0OiB7IHZlcnNpb246ICcxLjAuMCcgfSwgc2RrVmVyc2lvbjogJzMuMC4wJyB9XSk6IFByb21pc2U8VW51bUR0bzxSZWdpc3RlcmVkSXNzdWVyPj4gPT4ge1xuICB0cnkge1xuICAgIHZhbGlkYXRlSW5QYXJhbXMoYXBpS2V5LCB1cmwsIHZlcnNpb25JbmZvKTtcblxuICAgIGNvbnN0IGtwU2V0OiBLZXlQYWlyU2V0ID0gYXdhaXQgY3JlYXRlS2V5UGFpclNldCgpO1xuICAgIGNvbnN0IGlzc3Vlck9wdDogSXNzdWVyT3B0aW9ucyA9IHtcbiAgICAgIHB1YmxpY0tleUluZm86IGNvbnN0cnVjdEtleU9ianMoa3BTZXQpLFxuICAgICAgdXJsLFxuICAgICAgdmVyc2lvbkluZm9cbiAgICB9O1xuXG4gICAgY29uc3QgcmVzdERhdGE6IFJFU1REYXRhID0ge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBiYXNlVXJsOiBjb25maWdEYXRhLlNhYVNVcmwsXG4gICAgICBlbmRQb2ludDogJ2lzc3VlcicsXG4gICAgICBoZWFkZXI6IHsgQXV0aG9yaXphdGlvbjogJ0JlYXJlciAnICsgYXBpS2V5IH0sXG4gICAgICBkYXRhOiBpc3N1ZXJPcHRcbiAgICB9O1xuXG4gICAgY29uc3QgcmVzdFJlc3A6IEpTT05PYmogPSBhd2FpdCBtYWtlTmV0d29ya1JlcXVlc3QocmVzdERhdGEpO1xuXG4gICAgY29uc3QgYXV0aFRva2VuOiBzdHJpbmcgPSBoYW5kbGVBdXRoVG9rZW5IZWFkZXIocmVzdFJlc3ApO1xuXG4gICAgY29uc3QgaXNzdWVyUmVzcDogVW51bUR0bzxSZWdpc3RlcmVkSXNzdWVyPiA9IHtcbiAgICAgIGF1dGhUb2tlbixcbiAgICAgIGJvZHk6IHtcbiAgICAgICAgdXVpZDogcmVzdFJlc3AuYm9keS51dWlkLFxuICAgICAgICBjdXN0b21lclV1aWQ6IHJlc3RSZXNwLmJvZHkuY3VzdG9tZXJVdWlkLFxuICAgICAgICBkaWQ6IHJlc3RSZXNwLmJvZHkuZGlkLFxuICAgICAgICBuYW1lOiByZXN0UmVzcC5ib2R5Lm5hbWUsXG4gICAgICAgIGNyZWF0ZWRBdDogcmVzdFJlc3AuYm9keS5jcmVhdGVkQXQsXG4gICAgICAgIHVwZGF0ZWRBdDogcmVzdFJlc3AuYm9keS51cGRhdGVkQXQsXG4gICAgICAgIGlzQXV0aG9yaXplZDogcmVzdFJlc3AuYm9keS5pc0F1dGhvcml6ZWQsXG4gICAgICAgIGtleXM6IGtwU2V0LFxuICAgICAgICBhcGlLZXksXG4gICAgICAgIHVybDogcmVzdFJlc3AuYm9keS51cmwsXG4gICAgICAgIHZlcnNpb25JbmZvOiByZXN0UmVzcC5ib2R5LnZlcnNpb25JbmZvXG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBpc3N1ZXJSZXNwO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcihgRXJyb3IgcmVnaXN0ZXJpbmcgYW4gSXNzdWVyIHdpdGggVW51bUlEIFNhYVMuICR7ZXJyb3J9YCk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG4iXX0=