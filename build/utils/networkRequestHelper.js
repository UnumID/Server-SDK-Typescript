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
exports.handleAuthTokenHeader = exports.makeNetworkRequest = void 0;
var node_fetch_1 = __importDefault(require("node-fetch"));
var error_1 = require("./error");
var logger_1 = __importDefault(require("../logger"));
var helpers_1 = require("./helpers");
var versionList_1 = require("./versionList");
/**
 * Helper to handle network requests.
 * @param inputObj
 */
exports.makeNetworkRequest = function (inputObj) { return __awaiter(void 0, void 0, void 0, function () {
    var restHdr, url, options, respObj, res, responseJson;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                restHdr = (!inputObj.header ? {} : inputObj.header);
                // Always set the content-type in the header
                restHdr['Content-Type'] = 'application/json';
                url = inputObj.baseUrl + inputObj.endPoint;
                options = {
                    method: inputObj.method,
                    body: JSON.stringify(inputObj.data),
                    headers: __assign(__assign({}, restHdr), { version: restHdr.version ? restHdr.version : versionList_1.versionList[versionList_1.versionList.length - 1] // The api version to hit the UnumID SaaS with in the this version of the SDK
                     })
                };
                respObj = {};
                logger_1.default.debug("Making " + inputObj.method + " request to url: " + url);
                return [4 /*yield*/, node_fetch_1.default(url, options)];
            case 1:
                res = _a.sent();
                return [4 /*yield*/, res.json()];
            case 2:
                responseJson = _a.sent();
                // res.ok will be true for success scenario, otherwise, it will be false.
                if (res.ok) {
                    logger_1.default.debug("Successful call to " + url + ".");
                    // Response object will have both header and body for success scenario
                    respObj.headers = res.headers.raw();
                    respObj.body = responseJson;
                    return [2 /*return*/, (respObj)];
                }
                else {
                    logger_1.default.error("Error in call to " + url + ". Error: " + responseJson.code + " " + responseJson.message);
                    throw new error_1.CustError(responseJson.code, responseJson.message);
                }
                return [2 /*return*/];
        }
    });
}); };
/**
 * Helper to handle safe auth token handling in responses from UnumID's Saas via makeNetworkRequest
 * @param response JSONObj
 */
exports.handleAuthTokenHeader = function (response, existingAuthToken) {
    var authTokenResp = response && response.headers && response.headers['x-auth-token'] ? response.headers['x-auth-token'] : '';
    // Ensuring that the authToken attribute is presented as a string or undefined. The header values can be a string | string[] so hence the complex ternary.
    var authToken = (helpers_1.isArrayEmpty(authTokenResp) && authTokenResp ? authTokenResp : (helpers_1.isArrayNotEmpty(authTokenResp) ? authTokenResp[0] : undefined));
    // If authToken is undefined see if the input existing auth token is a valid Bearer token (not an admin key), if an admin key just return undefined, otherwise return a properly formatted Bearer token for use in subsequent requests or the existing, inputting token.
    var result = authToken ? (authToken.startsWith('Bearer ') ? authToken : "Bearer " + authToken) : ((existingAuthToken === null || existingAuthToken === void 0 ? void 0 : existingAuthToken.startsWith('Bearer ')) ? existingAuthToken : authToken);
    return result;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0d29ya1JlcXVlc3RIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvbmV0d29ya1JlcXVlc3RIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwwREFBK0I7QUFHL0IsaUNBQW9DO0FBQ3BDLHFEQUErQjtBQUMvQixxQ0FBMEQ7QUFFMUQsNkNBQTRDO0FBRTVDOzs7R0FHRztBQUNVLFFBQUEsa0JBQWtCLEdBQUcsVUFBcUIsUUFBa0I7Ozs7O2dCQUNqRSxPQUFPLEdBQVksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQWEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM5RSw0Q0FBNEM7Z0JBQzVDLE9BQU8sQ0FBQyxjQUFjLENBQUMsR0FBRyxrQkFBa0IsQ0FBQztnQkFFdkMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQztnQkFDM0MsT0FBTyxHQUFHO29CQUNkLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTTtvQkFDdkIsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztvQkFDbkMsT0FBTyx3QkFDRixPQUFPLEtBQ1YsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHlCQUFXLENBQUMseUJBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsNkVBQTZFO3VCQUMvSjtpQkFDRixDQUFDO2dCQUNJLE9BQU8sR0FBRyxFQUFxQixDQUFDO2dCQUV0QyxnQkFBTSxDQUFDLEtBQUssQ0FBQyxZQUFVLFFBQVEsQ0FBQyxNQUFNLHlCQUFvQixHQUFLLENBQUMsQ0FBQztnQkFFckQscUJBQU0sb0JBQUssQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBQUE7O2dCQUEvQixHQUFHLEdBQUcsU0FBeUI7Z0JBRWhCLHFCQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBQTs7Z0JBQS9CLFlBQVksR0FBRyxTQUFnQjtnQkFDckMseUVBQXlFO2dCQUN6RSxJQUFJLEdBQUcsQ0FBQyxFQUFFLEVBQUU7b0JBQ1YsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsd0JBQXNCLEdBQUcsTUFBRyxDQUFDLENBQUM7b0JBRTNDLHNFQUFzRTtvQkFDdEUsT0FBTyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO29CQUNwQyxPQUFPLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQztvQkFFNUIsc0JBQU8sQ0FBQyxPQUFPLENBQUMsRUFBQztpQkFDbEI7cUJBQU07b0JBQ0wsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsc0JBQW9CLEdBQUcsaUJBQVksWUFBWSxDQUFDLElBQUksU0FBSSxZQUFZLENBQUMsT0FBUyxDQUFDLENBQUM7b0JBQzdGLE1BQU0sSUFBSSxpQkFBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUM5RDs7OztLQUNGLENBQUM7QUFFRjs7O0dBR0c7QUFDVSxRQUFBLHFCQUFxQixHQUFHLFVBQUMsUUFBZ0IsRUFBRSxpQkFBeUI7SUFDL0UsSUFBTSxhQUFhLEdBQUcsUUFBUSxJQUFJLFFBQVEsQ0FBQyxPQUFPLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBRS9ILDBKQUEwSjtJQUMxSixJQUFNLFNBQVMsR0FBbUIsQ0FBQyxzQkFBWSxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLHlCQUFlLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUNuSyx3UUFBd1E7SUFDeFEsSUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsWUFBVSxTQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLGlCQUFpQixhQUFqQixpQkFBaUIsdUJBQWpCLGlCQUFpQixDQUFFLFVBQVUsQ0FBQyxTQUFTLEdBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM5SyxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZmV0Y2ggZnJvbSAnbm9kZS1mZXRjaCc7XG5cbmltcG9ydCB7IFJFU1REYXRhLCBSRVNUUmVzcG9uc2UgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBDdXN0RXJyb3IgfSBmcm9tICcuL2Vycm9yJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCB7IGlzQXJyYXlFbXB0eSwgaXNBcnJheU5vdEVtcHR5IH0gZnJvbSAnLi9oZWxwZXJzJztcbmltcG9ydCB7IEpTT05PYmogfSBmcm9tICdAdW51bWlkL3R5cGVzJztcbmltcG9ydCB7IHZlcnNpb25MaXN0IH0gZnJvbSAnLi92ZXJzaW9uTGlzdCc7XG5cbi8qKlxuICogSGVscGVyIHRvIGhhbmRsZSBuZXR3b3JrIHJlcXVlc3RzLlxuICogQHBhcmFtIGlucHV0T2JqXG4gKi9cbmV4cG9ydCBjb25zdCBtYWtlTmV0d29ya1JlcXVlc3QgPSBhc3luYyA8VCA9IHVua25vd24+IChpbnB1dE9iajogUkVTVERhdGEpOiBQcm9taXNlPFJFU1RSZXNwb25zZTxUPj4gPT4ge1xuICBjb25zdCByZXN0SGRyOiBKU09OT2JqID0gKCFpbnB1dE9iai5oZWFkZXIgPyB7fSBhcyBKU09OT2JqIDogaW5wdXRPYmouaGVhZGVyKTtcbiAgLy8gQWx3YXlzIHNldCB0aGUgY29udGVudC10eXBlIGluIHRoZSBoZWFkZXJcbiAgcmVzdEhkclsnQ29udGVudC1UeXBlJ10gPSAnYXBwbGljYXRpb24vanNvbic7XG5cbiAgY29uc3QgdXJsID0gaW5wdXRPYmouYmFzZVVybCArIGlucHV0T2JqLmVuZFBvaW50O1xuICBjb25zdCBvcHRpb25zID0ge1xuICAgIG1ldGhvZDogaW5wdXRPYmoubWV0aG9kLFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGlucHV0T2JqLmRhdGEpLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgIC4uLnJlc3RIZHIsXG4gICAgICB2ZXJzaW9uOiByZXN0SGRyLnZlcnNpb24gPyByZXN0SGRyLnZlcnNpb24gOiB2ZXJzaW9uTGlzdFt2ZXJzaW9uTGlzdC5sZW5ndGggLSAxXSAvLyBUaGUgYXBpIHZlcnNpb24gdG8gaGl0IHRoZSBVbnVtSUQgU2FhUyB3aXRoIGluIHRoZSB0aGlzIHZlcnNpb24gb2YgdGhlIFNES1xuICAgIH1cbiAgfTtcbiAgY29uc3QgcmVzcE9iaiA9IHt9IGFzIFJFU1RSZXNwb25zZTxUPjtcblxuICBsb2dnZXIuZGVidWcoYE1ha2luZyAke2lucHV0T2JqLm1ldGhvZH0gcmVxdWVzdCB0byB1cmw6ICR7dXJsfWApO1xuXG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHVybCwgb3B0aW9ucyk7XG5cbiAgY29uc3QgcmVzcG9uc2VKc29uID0gYXdhaXQgcmVzLmpzb24oKTtcbiAgLy8gcmVzLm9rIHdpbGwgYmUgdHJ1ZSBmb3Igc3VjY2VzcyBzY2VuYXJpbywgb3RoZXJ3aXNlLCBpdCB3aWxsIGJlIGZhbHNlLlxuICBpZiAocmVzLm9rKSB7XG4gICAgbG9nZ2VyLmRlYnVnKGBTdWNjZXNzZnVsIGNhbGwgdG8gJHt1cmx9LmApO1xuXG4gICAgLy8gUmVzcG9uc2Ugb2JqZWN0IHdpbGwgaGF2ZSBib3RoIGhlYWRlciBhbmQgYm9keSBmb3Igc3VjY2VzcyBzY2VuYXJpb1xuICAgIHJlc3BPYmouaGVhZGVycyA9IHJlcy5oZWFkZXJzLnJhdygpO1xuICAgIHJlc3BPYmouYm9keSA9IHJlc3BvbnNlSnNvbjtcblxuICAgIHJldHVybiAocmVzcE9iaik7XG4gIH0gZWxzZSB7XG4gICAgbG9nZ2VyLmVycm9yKGBFcnJvciBpbiBjYWxsIHRvICR7dXJsfS4gRXJyb3I6ICR7cmVzcG9uc2VKc29uLmNvZGV9ICR7cmVzcG9uc2VKc29uLm1lc3NhZ2V9YCk7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcihyZXNwb25zZUpzb24uY29kZSwgcmVzcG9uc2VKc29uLm1lc3NhZ2UpO1xuICB9XG59O1xuXG4vKipcbiAqIEhlbHBlciB0byBoYW5kbGUgc2FmZSBhdXRoIHRva2VuIGhhbmRsaW5nIGluIHJlc3BvbnNlcyBmcm9tIFVudW1JRCdzIFNhYXMgdmlhIG1ha2VOZXR3b3JrUmVxdWVzdFxuICogQHBhcmFtIHJlc3BvbnNlIEpTT05PYmpcbiAqL1xuZXhwb3J0IGNvbnN0IGhhbmRsZUF1dGhUb2tlbkhlYWRlciA9IChyZXNwb25zZTpKU09OT2JqLCBleGlzdGluZ0F1dGhUb2tlbj86c3RyaW5nKTogc3RyaW5nID0+IHtcbiAgY29uc3QgYXV0aFRva2VuUmVzcCA9IHJlc3BvbnNlICYmIHJlc3BvbnNlLmhlYWRlcnMgJiYgcmVzcG9uc2UuaGVhZGVyc1sneC1hdXRoLXRva2VuJ10gPyByZXNwb25zZS5oZWFkZXJzWyd4LWF1dGgtdG9rZW4nXSA6ICcnO1xuXG4gIC8vIEVuc3VyaW5nIHRoYXQgdGhlIGF1dGhUb2tlbiBhdHRyaWJ1dGUgaXMgcHJlc2VudGVkIGFzIGEgc3RyaW5nIG9yIHVuZGVmaW5lZC4gVGhlIGhlYWRlciB2YWx1ZXMgY2FuIGJlIGEgc3RyaW5nIHwgc3RyaW5nW10gc28gaGVuY2UgdGhlIGNvbXBsZXggdGVybmFyeS5cbiAgY29uc3QgYXV0aFRva2VuOiBzdHJpbmcgPSA8c3RyaW5nPihpc0FycmF5RW1wdHkoYXV0aFRva2VuUmVzcCkgJiYgYXV0aFRva2VuUmVzcCA/IGF1dGhUb2tlblJlc3AgOiAoaXNBcnJheU5vdEVtcHR5KGF1dGhUb2tlblJlc3ApID8gYXV0aFRva2VuUmVzcFswXSA6IHVuZGVmaW5lZCkpO1xuICAvLyBJZiBhdXRoVG9rZW4gaXMgdW5kZWZpbmVkIHNlZSBpZiB0aGUgaW5wdXQgZXhpc3RpbmcgYXV0aCB0b2tlbiBpcyBhIHZhbGlkIEJlYXJlciB0b2tlbiAobm90IGFuIGFkbWluIGtleSksIGlmIGFuIGFkbWluIGtleSBqdXN0IHJldHVybiB1bmRlZmluZWQsIG90aGVyd2lzZSByZXR1cm4gYSBwcm9wZXJseSBmb3JtYXR0ZWQgQmVhcmVyIHRva2VuIGZvciB1c2UgaW4gc3Vic2VxdWVudCByZXF1ZXN0cyBvciB0aGUgZXhpc3RpbmcsIGlucHV0dGluZyB0b2tlbi5cbiAgY29uc3QgcmVzdWx0ID0gYXV0aFRva2VuID8gKGF1dGhUb2tlbi5zdGFydHNXaXRoKCdCZWFyZXIgJykgPyBhdXRoVG9rZW4gOiBgQmVhcmVyICR7YXV0aFRva2VufWApIDogKGV4aXN0aW5nQXV0aFRva2VuPy5zdGFydHNXaXRoKCdCZWFyZXIgJykgPyBleGlzdGluZ0F1dGhUb2tlbiA6IGF1dGhUb2tlbik7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuIl19