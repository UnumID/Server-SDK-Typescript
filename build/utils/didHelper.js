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
exports.getDidDocPublicKeys = exports.getKeysFromDIDDoc = exports.getDIDDoc = void 0;
var error_1 = require("./error");
var logger_1 = __importDefault(require("../logger"));
var networkRequestHelper_1 = require("./networkRequestHelper");
var config_1 = require("../config");
/**
 * Get a Did document from the did and url provided.
 * @param baseUrl
 * @param authorization
 * @param did
 */
exports.getDIDDoc = function (baseUrl, authorization, did) { return __awaiter(void 0, void 0, void 0, function () {
    var restData, restResp, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                restData = {
                    method: 'GET',
                    baseUrl: baseUrl,
                    endPoint: 'didDocument/' + encodeURIComponent(did),
                    header: { Authorization: authorization }
                };
                return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(restData)];
            case 1:
                restResp = _a.sent();
                logger_1.default.debug('Successfully retrieved did document', restResp.body);
                return [2 /*return*/, (restResp)];
            case 2:
                error_2 = _a.sent();
                logger_1.default.error("Error getting did document " + did + " from " + baseUrl, error_2);
                throw error_2;
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Helper to return the keys in the DID document which corresponds to the type specified.
 * Note: the can be multiple keys of same type on the same DID document.
 * @param didDocument DiDDocument
 * @param type DidKeyType
 */
exports.getKeysFromDIDDoc = function (didDocument, type) {
    var publicKeyInfos = didDocument.publicKey.filter(function (publicKeyInfo) { return publicKeyInfo.type === type; });
    if (publicKeyInfos.length === 0) {
        logger_1.default.error("DidDoc " + didDocument.id + " has no " + type + " public keys");
        throw new error_1.CustError(500, "DidDoc " + didDocument.id + " has no " + type + " public keys");
    }
    return publicKeyInfos;
};
exports.getDidDocPublicKeys = function (authorization, subjectDid, type) { return __awaiter(void 0, void 0, void 0, function () {
    var didDocResponse, didKeyId, publicKeyInfoList, didDoc, authToken;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getDIDDoc(config_1.configData.SaaSUrl, authorization, subjectDid)];
            case 1:
                didDocResponse = _a.sent();
                logger_1.default.debug("DidDoc repsonse: " + JSON.stringify(didDocResponse));
                if (didDocResponse instanceof Error) {
                    throw didDocResponse;
                }
                didKeyId = subjectDid.split('#')[1];
                if (!didKeyId) return [3 /*break*/, 3];
                return [4 /*yield*/, didDocResponse.body];
            case 2:
                /**
                   * If making a request to the Did Document service with a did and did fragment, only a single PublicKeyInfo object is returned.
                   * Putting in array for uniform handling with the case no fragment is included, in which case all the matching keys will need to be tried until one works.
                   */
                publicKeyInfoList = [_a.sent()];
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, didDocResponse.body];
            case 4:
                didDoc = _a.sent();
                // get subject's encryption public key info from its DID document
                publicKeyInfoList = exports.getKeysFromDIDDoc(didDoc, type);
                _a.label = 5;
            case 5:
                // // get subject's public key info from its DID document
                // const publicKeyInfos = getKeysFromDIDDoc(didDocResponse.body, 'RSA');
                if (publicKeyInfoList.length === 0) {
                    throw new error_1.CustError(404, type + " public keys not found for the DID " + subjectDid);
                }
                authToken = networkRequestHelper_1.handleAuthTokenHeader(didDocResponse, authorization);
                return [2 /*return*/, {
                        authToken: authToken,
                        body: publicKeyInfoList
                    }];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlkSGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2RpZEhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxpQ0FBb0M7QUFDcEMscURBQStCO0FBQy9CLCtEQUFtRjtBQUduRixvQ0FBdUM7QUFFdkM7Ozs7O0dBS0c7QUFDVSxRQUFBLFNBQVMsR0FBRyxVQUFPLE9BQWUsRUFBRSxhQUFxQixFQUFFLEdBQVc7Ozs7OztnQkFFekUsUUFBUSxHQUFhO29CQUN6QixNQUFNLEVBQUUsS0FBSztvQkFDYixPQUFPLEVBQUUsT0FBTztvQkFDaEIsUUFBUSxFQUFFLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUM7b0JBQ2xELE1BQU0sRUFBRSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUU7aUJBQ3pDLENBQUM7Z0JBRWUscUJBQU0seUNBQWtCLENBQWMsUUFBUSxDQUFDLEVBQUE7O2dCQUExRCxRQUFRLEdBQUcsU0FBK0M7Z0JBQ2hFLGdCQUFNLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFbkUsc0JBQU8sQ0FBQyxRQUFRLENBQUMsRUFBQzs7O2dCQUVsQixnQkFBTSxDQUFDLEtBQUssQ0FBQyxnQ0FBOEIsR0FBRyxjQUFTLE9BQVMsRUFBRSxPQUFLLENBQUMsQ0FBQztnQkFDekUsTUFBTSxPQUFLLENBQUM7Ozs7S0FFZixDQUFDO0FBRUY7Ozs7O0dBS0c7QUFDVSxRQUFBLGlCQUFpQixHQUFHLFVBQUMsV0FBd0IsRUFBRSxJQUFnQjtJQUMxRSxJQUFNLGNBQWMsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFBLGFBQWEsSUFBSSxPQUFBLGFBQWEsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUEzQixDQUEyQixDQUFDLENBQUM7SUFFbEcsSUFBSSxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUMvQixnQkFBTSxDQUFDLEtBQUssQ0FBQyxZQUFVLFdBQVcsQ0FBQyxFQUFFLGdCQUFXLElBQUksaUJBQWMsQ0FBQyxDQUFDO1FBQ3BFLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSxZQUFVLFdBQVcsQ0FBQyxFQUFFLGdCQUFXLElBQUksaUJBQWMsQ0FBQyxDQUFDO0tBQ2pGO0lBRUQsT0FBTyxjQUFjLENBQUM7QUFDeEIsQ0FBQyxDQUFDO0FBRVcsUUFBQSxtQkFBbUIsR0FBRyxVQUFPLGFBQXFCLEVBQUUsVUFBa0IsRUFBRSxJQUFnQjs7OztvQkFFNUUscUJBQU0saUJBQVMsQ0FBQyxtQkFBVSxDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsVUFBVSxDQUFDLEVBQUE7O2dCQUEvRSxjQUFjLEdBQUcsU0FBOEQ7Z0JBRXJGLGdCQUFNLENBQUMsS0FBSyxDQUFDLHNCQUFvQixJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBRyxDQUFDLENBQUM7Z0JBRW5FLElBQUksY0FBYyxZQUFZLEtBQUssRUFBRTtvQkFDbkMsTUFBTSxjQUFjLENBQUM7aUJBQ3RCO2dCQUdLLFFBQVEsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUl0QyxRQUFRLEVBQVIsd0JBQVE7Z0JBS1cscUJBQU0sY0FBYyxDQUFDLElBQUksRUFBQTs7Z0JBSjlDOzs7cUJBR0s7Z0JBQ0wsaUJBQWlCLElBQUksU0FBMEMsQ0FBQyxDQUFDOztvQkFFbEQscUJBQU0sY0FBYyxDQUFDLElBQUksRUFBQTs7Z0JBQWxDLE1BQU0sR0FBRyxTQUF3QztnQkFDdkQsaUVBQWlFO2dCQUNqRSxpQkFBaUIsR0FBRyx5QkFBaUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7OztnQkFHdEQseURBQXlEO2dCQUN6RCx3RUFBd0U7Z0JBRXhFLElBQUksaUJBQWlCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDbEMsTUFBTSxJQUFJLGlCQUFTLENBQUMsR0FBRyxFQUFLLElBQUksMkNBQXNDLFVBQVksQ0FBQyxDQUFDO2lCQUNyRjtnQkFFSyxTQUFTLEdBQVcsNENBQXFCLENBQUMsY0FBYyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUUvRSxzQkFBTzt3QkFDTCxTQUFTLFdBQUE7d0JBQ1QsSUFBSSxFQUFFLGlCQUFpQjtxQkFDeEIsRUFBQzs7O0tBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENyZWRlbnRpYWxTdWJqZWN0LCBEaWREb2N1bWVudCwgRGlkS2V5VHlwZSwgUHVibGljS2V5SW5mbywgQ3JlZGVudGlhbCwgQ3JlZGVudGlhbFBiIH0gZnJvbSAnQHVudW1pZC90eXBlcyc7XG5cbmltcG9ydCB7IEN1c3RFcnJvciB9IGZyb20gJy4vZXJyb3InO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IHsgaGFuZGxlQXV0aFRva2VuSGVhZGVyLCBtYWtlTmV0d29ya1JlcXVlc3QgfSBmcm9tICcuL25ldHdvcmtSZXF1ZXN0SGVscGVyJztcbmltcG9ydCB7IFJFU1REYXRhLCBSRVNUUmVzcG9uc2UsIFVudW1EdG8gfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBjb252ZXJ0Q3JlZGVudGlhbFN1YmplY3QgfSBmcm9tICcuL2NvbnZlcnRDcmVkZW50aWFsU3ViamVjdCc7XG5pbXBvcnQgeyBjb25maWdEYXRhIH0gZnJvbSAnLi4vY29uZmlnJztcblxuLyoqXG4gKiBHZXQgYSBEaWQgZG9jdW1lbnQgZnJvbSB0aGUgZGlkIGFuZCB1cmwgcHJvdmlkZWQuXG4gKiBAcGFyYW0gYmFzZVVybFxuICogQHBhcmFtIGF1dGhvcml6YXRpb25cbiAqIEBwYXJhbSBkaWRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldERJRERvYyA9IGFzeW5jIChiYXNlVXJsOiBzdHJpbmcsIGF1dGhvcml6YXRpb246IHN0cmluZywgZGlkOiBzdHJpbmcpOiBQcm9taXNlPFJFU1RSZXNwb25zZTxEaWREb2N1bWVudCB8IFB1YmxpY0tleUluZm8+IHwgQ3VzdEVycm9yPiA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzdERhdGE6IFJFU1REYXRhID0ge1xuICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIGJhc2VVcmw6IGJhc2VVcmwsXG4gICAgICBlbmRQb2ludDogJ2RpZERvY3VtZW50LycgKyBlbmNvZGVVUklDb21wb25lbnQoZGlkKSxcbiAgICAgIGhlYWRlcjogeyBBdXRob3JpemF0aW9uOiBhdXRob3JpemF0aW9uIH1cbiAgICB9O1xuXG4gICAgY29uc3QgcmVzdFJlc3AgPSBhd2FpdCBtYWtlTmV0d29ya1JlcXVlc3Q8RGlkRG9jdW1lbnQ+KHJlc3REYXRhKTtcbiAgICBsb2dnZXIuZGVidWcoJ1N1Y2Nlc3NmdWxseSByZXRyaWV2ZWQgZGlkIGRvY3VtZW50JywgcmVzdFJlc3AuYm9keSk7XG5cbiAgICByZXR1cm4gKHJlc3RSZXNwKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoYEVycm9yIGdldHRpbmcgZGlkIGRvY3VtZW50ICR7ZGlkfSBmcm9tICR7YmFzZVVybH1gLCBlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbi8qKlxuICogSGVscGVyIHRvIHJldHVybiB0aGUga2V5cyBpbiB0aGUgRElEIGRvY3VtZW50IHdoaWNoIGNvcnJlc3BvbmRzIHRvIHRoZSB0eXBlIHNwZWNpZmllZC5cbiAqIE5vdGU6IHRoZSBjYW4gYmUgbXVsdGlwbGUga2V5cyBvZiBzYW1lIHR5cGUgb24gdGhlIHNhbWUgRElEIGRvY3VtZW50LlxuICogQHBhcmFtIGRpZERvY3VtZW50IERpRERvY3VtZW50XG4gKiBAcGFyYW0gdHlwZSBEaWRLZXlUeXBlXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRLZXlzRnJvbURJRERvYyA9IChkaWREb2N1bWVudDogRGlkRG9jdW1lbnQsIHR5cGU6IERpZEtleVR5cGUpOiBQdWJsaWNLZXlJbmZvW10gPT4ge1xuICBjb25zdCBwdWJsaWNLZXlJbmZvcyA9IGRpZERvY3VtZW50LnB1YmxpY0tleS5maWx0ZXIocHVibGljS2V5SW5mbyA9PiBwdWJsaWNLZXlJbmZvLnR5cGUgPT09IHR5cGUpO1xuXG4gIGlmIChwdWJsaWNLZXlJbmZvcy5sZW5ndGggPT09IDApIHtcbiAgICBsb2dnZXIuZXJyb3IoYERpZERvYyAke2RpZERvY3VtZW50LmlkfSBoYXMgbm8gJHt0eXBlfSBwdWJsaWMga2V5c2ApO1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNTAwLCBgRGlkRG9jICR7ZGlkRG9jdW1lbnQuaWR9IGhhcyBubyAke3R5cGV9IHB1YmxpYyBrZXlzYCk7XG4gIH1cblxuICByZXR1cm4gcHVibGljS2V5SW5mb3M7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0RGlkRG9jUHVibGljS2V5cyA9IGFzeW5jIChhdXRob3JpemF0aW9uOiBzdHJpbmcsIHN1YmplY3REaWQ6IHN0cmluZywgdHlwZTogRGlkS2V5VHlwZSk6IFByb21pc2U8VW51bUR0bzxQdWJsaWNLZXlJbmZvW10+PiA9PiB7XG4gIC8vIHJlc29sdmUgdGhlIHN1YmplY3QncyBESURcbiAgY29uc3QgZGlkRG9jUmVzcG9uc2UgPSBhd2FpdCBnZXRESUREb2MoY29uZmlnRGF0YS5TYWFTVXJsLCBhdXRob3JpemF0aW9uLCBzdWJqZWN0RGlkKTtcblxuICBsb2dnZXIuZGVidWcoYERpZERvYyByZXBzb25zZTogJHtKU09OLnN0cmluZ2lmeShkaWREb2NSZXNwb25zZSl9YCk7XG5cbiAgaWYgKGRpZERvY1Jlc3BvbnNlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICB0aHJvdyBkaWREb2NSZXNwb25zZTtcbiAgfVxuXG4gIC8vIGNvbnN0IGRpZCA9IHN1YmplY3REaWQuc3BsaXQoJyMnKVswXTtcbiAgY29uc3QgZGlkS2V5SWQgPSBzdWJqZWN0RGlkLnNwbGl0KCcjJylbMV07XG5cbiAgbGV0IHB1YmxpY0tleUluZm9MaXN0OiBQdWJsaWNLZXlJbmZvW107XG5cbiAgaWYgKGRpZEtleUlkKSB7XG4gICAgLyoqXG4gICAgICAgKiBJZiBtYWtpbmcgYSByZXF1ZXN0IHRvIHRoZSBEaWQgRG9jdW1lbnQgc2VydmljZSB3aXRoIGEgZGlkIGFuZCBkaWQgZnJhZ21lbnQsIG9ubHkgYSBzaW5nbGUgUHVibGljS2V5SW5mbyBvYmplY3QgaXMgcmV0dXJuZWQuXG4gICAgICAgKiBQdXR0aW5nIGluIGFycmF5IGZvciB1bmlmb3JtIGhhbmRsaW5nIHdpdGggdGhlIGNhc2Ugbm8gZnJhZ21lbnQgaXMgaW5jbHVkZWQsIGluIHdoaWNoIGNhc2UgYWxsIHRoZSBtYXRjaGluZyBrZXlzIHdpbGwgbmVlZCB0byBiZSB0cmllZCB1bnRpbCBvbmUgd29ya3MuXG4gICAgICAgKi9cbiAgICBwdWJsaWNLZXlJbmZvTGlzdCA9IFthd2FpdCBkaWREb2NSZXNwb25zZS5ib2R5IGFzIFB1YmxpY0tleUluZm9dO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGRpZERvYyA9IGF3YWl0IGRpZERvY1Jlc3BvbnNlLmJvZHkgYXMgRGlkRG9jdW1lbnQ7XG4gICAgLy8gZ2V0IHN1YmplY3QncyBlbmNyeXB0aW9uIHB1YmxpYyBrZXkgaW5mbyBmcm9tIGl0cyBESUQgZG9jdW1lbnRcbiAgICBwdWJsaWNLZXlJbmZvTGlzdCA9IGdldEtleXNGcm9tRElERG9jKGRpZERvYywgdHlwZSk7XG4gIH1cblxuICAvLyAvLyBnZXQgc3ViamVjdCdzIHB1YmxpYyBrZXkgaW5mbyBmcm9tIGl0cyBESUQgZG9jdW1lbnRcbiAgLy8gY29uc3QgcHVibGljS2V5SW5mb3MgPSBnZXRLZXlzRnJvbURJRERvYyhkaWREb2NSZXNwb25zZS5ib2R5LCAnUlNBJyk7XG5cbiAgaWYgKHB1YmxpY0tleUluZm9MaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDA0LCBgJHt0eXBlfSBwdWJsaWMga2V5cyBub3QgZm91bmQgZm9yIHRoZSBESUQgJHtzdWJqZWN0RGlkfWApO1xuICB9XG5cbiAgY29uc3QgYXV0aFRva2VuOiBzdHJpbmcgPSBoYW5kbGVBdXRoVG9rZW5IZWFkZXIoZGlkRG9jUmVzcG9uc2UsIGF1dGhvcml6YXRpb24pO1xuXG4gIHJldHVybiB7XG4gICAgYXV0aFRva2VuLFxuICAgIGJvZHk6IHB1YmxpY0tleUluZm9MaXN0XG4gIH07XG59O1xuIl19