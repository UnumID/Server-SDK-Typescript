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
exports.sendSms = void 0;
var config_1 = require("../config");
var logger_1 = __importDefault(require("../logger"));
var requireAuth_1 = require("../requireAuth");
var error_1 = require("../utils/error");
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
/**
 * Validates the SmsRequestBody attributes.
 * @param body SmsRequestBody
 */
var validateSmsRequestBody = function (body) {
    var to = body.to, deeplink = body.deeplink;
    if (!to) {
        throw new error_1.CustError(400, 'to is required.');
    }
    if (!deeplink) {
        throw new error_1.CustError(400, 'deeplink is required.');
    }
    if (typeof to !== 'string') {
        throw new error_1.CustError(400, 'Invalid to: expected string.');
    }
    if (typeof deeplink !== 'string') {
        throw new error_1.CustError(400, 'Invalid deeplink: expected string.');
    }
    if (deeplink.split('presentationRequest/').length !== 2) {
        throw new error_1.CustError(400, 'Invalid deeplink: expected to end in the format presentationRequest/<uuid>.');
    }
};
/**
 * Handler to send a SMS using UnumID's SaaS.
 * Designed to be used with a deeplink which creates a templated message.
 * @param authorization
 * @param to
 * @param deeplink
 */
exports.sendSms = function (authorization, to, deeplink) { return __awaiter(void 0, void 0, void 0, function () {
    var body, data, apiResponse, authToken, result, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                body = { to: to, deeplink: deeplink };
                requireAuth_1.requireAuth(authorization);
                validateSmsRequestBody(body);
                data = {
                    method: 'POST',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: 'sms',
                    header: { Authorization: authorization },
                    data: body
                };
                return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(data)];
            case 1:
                apiResponse = _a.sent();
                if (!apiResponse.body.success) {
                    throw new error_1.CustError(500, 'Unknown error during sendSms');
                }
                authToken = networkRequestHelper_1.handleAuthTokenHeader(apiResponse, authorization);
                result = {
                    authToken: authToken,
                    body: undefined
                };
                return [2 /*return*/, result];
            case 2:
                e_1 = _a.sent();
                logger_1.default.error("Error during sendSms to UnumID Saas. " + e_1);
                throw e_1;
            case 3: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VuZFNtcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92ZXJpZmllci9zZW5kU21zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLG9DQUF1QztBQUN2QyxxREFBK0I7QUFDL0IsOENBQTZDO0FBRTdDLHdDQUEyQztBQUMzQyxzRUFBMEY7QUFNMUY7OztHQUdHO0FBQ0gsSUFBTSxzQkFBc0IsR0FBRyxVQUFDLElBQWlDO0lBQ3ZELElBQUEsRUFBRSxHQUFlLElBQUksR0FBbkIsRUFBRSxRQUFRLEdBQUssSUFBSSxTQUFULENBQVU7SUFFOUIsSUFBSSxDQUFDLEVBQUUsRUFBRTtRQUNQLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0tBQzdDO0lBRUQsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNiLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0tBQ25EO0lBRUQsSUFBSSxPQUFPLEVBQUUsS0FBSyxRQUFRLEVBQUU7UUFDMUIsTUFBTSxJQUFJLGlCQUFTLENBQUMsR0FBRyxFQUFFLDhCQUE4QixDQUFDLENBQUM7S0FDMUQ7SUFFRCxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRTtRQUNoQyxNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsb0NBQW9DLENBQUMsQ0FBQztLQUNoRTtJQUVELElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDdkQsTUFBTSxJQUFJLGlCQUFTLENBQUMsR0FBRyxFQUFFLDZFQUE2RSxDQUFDLENBQUM7S0FDekc7QUFDSCxDQUFDLENBQUM7QUFFRjs7Ozs7O0dBTUc7QUFDVSxRQUFBLE9BQU8sR0FBRyxVQUFPLGFBQXFCLEVBQUUsRUFBVSxFQUFFLFFBQWdCOzs7Ozs7Z0JBRXZFLElBQUksR0FBRyxFQUFFLEVBQUUsSUFBQSxFQUFFLFFBQVEsVUFBQSxFQUFFLENBQUM7Z0JBRTlCLHlCQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQzNCLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUV2QixJQUFJLEdBQUc7b0JBQ1gsTUFBTSxFQUFFLE1BQU07b0JBQ2QsT0FBTyxFQUFFLG1CQUFVLENBQUMsT0FBTztvQkFDM0IsUUFBUSxFQUFFLEtBQUs7b0JBQ2YsTUFBTSxFQUFFLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRTtvQkFDeEMsSUFBSSxFQUFFLElBQUk7aUJBQ1gsQ0FBQztnQkFFa0IscUJBQU0seUNBQWtCLENBQWtCLElBQUksQ0FBQyxFQUFBOztnQkFBN0QsV0FBVyxHQUFHLFNBQStDO2dCQUVuRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQzdCLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO2lCQUMxRDtnQkFFSyxTQUFTLEdBQVcsNENBQXFCLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUV0RSxNQUFNLEdBQXVCO29CQUNqQyxTQUFTLFdBQUE7b0JBQ1QsSUFBSSxFQUFFLFNBQVM7aUJBQ2hCLENBQUM7Z0JBRUYsc0JBQU8sTUFBTSxFQUFDOzs7Z0JBRWQsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsMENBQXdDLEdBQUcsQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLEdBQUMsQ0FBQzs7OztLQUVYLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFeHRlcm5hbENoYW5uZWxNZXNzYWdlSW5wdXQgfSBmcm9tICdAdW51bWlkL3R5cGVzJztcblxuaW1wb3J0IHsgY29uZmlnRGF0YSB9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyByZXF1aXJlQXV0aCB9IGZyb20gJy4uL3JlcXVpcmVBdXRoJztcbmltcG9ydCB7IFVudW1EdG8gfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBDdXN0RXJyb3IgfSBmcm9tICcuLi91dGlscy9lcnJvcic7XG5pbXBvcnQgeyBoYW5kbGVBdXRoVG9rZW5IZWFkZXIsIG1ha2VOZXR3b3JrUmVxdWVzdCB9IGZyb20gJy4uL3V0aWxzL25ldHdvcmtSZXF1ZXN0SGVscGVyJztcblxuZXhwb3J0IGludGVyZmFjZSBTbXNSZXNwb25zZUJvZHkge1xuICBzdWNjZXNzOiBib29sZWFuO1xufVxuXG4vKipcbiAqIFZhbGlkYXRlcyB0aGUgU21zUmVxdWVzdEJvZHkgYXR0cmlidXRlcy5cbiAqIEBwYXJhbSBib2R5IFNtc1JlcXVlc3RCb2R5XG4gKi9cbmNvbnN0IHZhbGlkYXRlU21zUmVxdWVzdEJvZHkgPSAoYm9keTogRXh0ZXJuYWxDaGFubmVsTWVzc2FnZUlucHV0KTogdm9pZCA9PiB7XG4gIGNvbnN0IHsgdG8sIGRlZXBsaW5rIH0gPSBib2R5O1xuXG4gIGlmICghdG8pIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ3RvIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKCFkZWVwbGluaykge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnZGVlcGxpbmsgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAodHlwZW9mIHRvICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCB0bzogZXhwZWN0ZWQgc3RyaW5nLicpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBkZWVwbGluayAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgZGVlcGxpbms6IGV4cGVjdGVkIHN0cmluZy4nKTtcbiAgfVxuXG4gIGlmIChkZWVwbGluay5zcGxpdCgncHJlc2VudGF0aW9uUmVxdWVzdC8nKS5sZW5ndGggIT09IDIpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgZGVlcGxpbms6IGV4cGVjdGVkIHRvIGVuZCBpbiB0aGUgZm9ybWF0IHByZXNlbnRhdGlvblJlcXVlc3QvPHV1aWQ+LicpO1xuICB9XG59O1xuXG4vKipcbiAqIEhhbmRsZXIgdG8gc2VuZCBhIFNNUyB1c2luZyBVbnVtSUQncyBTYWFTLlxuICogRGVzaWduZWQgdG8gYmUgdXNlZCB3aXRoIGEgZGVlcGxpbmsgd2hpY2ggY3JlYXRlcyBhIHRlbXBsYXRlZCBtZXNzYWdlLlxuICogQHBhcmFtIGF1dGhvcml6YXRpb25cbiAqIEBwYXJhbSB0b1xuICogQHBhcmFtIGRlZXBsaW5rXG4gKi9cbmV4cG9ydCBjb25zdCBzZW5kU21zID0gYXN5bmMgKGF1dGhvcml6YXRpb246IHN0cmluZywgdG86IHN0cmluZywgZGVlcGxpbms6IHN0cmluZyk6IFByb21pc2U8VW51bUR0bzx1bmRlZmluZWQ+PiA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgYm9keSA9IHsgdG8sIGRlZXBsaW5rIH07XG5cbiAgICByZXF1aXJlQXV0aChhdXRob3JpemF0aW9uKTtcbiAgICB2YWxpZGF0ZVNtc1JlcXVlc3RCb2R5KGJvZHkpO1xuXG4gICAgY29uc3QgZGF0YSA9IHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgYmFzZVVybDogY29uZmlnRGF0YS5TYWFTVXJsLFxuICAgICAgZW5kUG9pbnQ6ICdzbXMnLFxuICAgICAgaGVhZGVyOiB7IEF1dGhvcml6YXRpb246IGF1dGhvcml6YXRpb24gfSxcbiAgICAgIGRhdGE6IGJvZHlcbiAgICB9O1xuXG4gICAgY29uc3QgYXBpUmVzcG9uc2UgPSBhd2FpdCBtYWtlTmV0d29ya1JlcXVlc3Q8U21zUmVzcG9uc2VCb2R5PihkYXRhKTtcblxuICAgIGlmICghYXBpUmVzcG9uc2UuYm9keS5zdWNjZXNzKSB7XG4gICAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDUwMCwgJ1Vua25vd24gZXJyb3IgZHVyaW5nIHNlbmRTbXMnKTtcbiAgICB9XG5cbiAgICBjb25zdCBhdXRoVG9rZW46IHN0cmluZyA9IGhhbmRsZUF1dGhUb2tlbkhlYWRlcihhcGlSZXNwb25zZSwgYXV0aG9yaXphdGlvbik7XG5cbiAgICBjb25zdCByZXN1bHQ6IFVudW1EdG88dW5kZWZpbmVkPiA9IHtcbiAgICAgIGF1dGhUb2tlbixcbiAgICAgIGJvZHk6IHVuZGVmaW5lZFxuICAgIH07XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGNhdGNoIChlKSB7XG4gICAgbG9nZ2VyLmVycm9yKGBFcnJvciBkdXJpbmcgc2VuZFNtcyB0byBVbnVtSUQgU2Fhcy4gJHtlfWApO1xuICAgIHRocm93IGU7XG4gIH1cbn07XG4iXX0=