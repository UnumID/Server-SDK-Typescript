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
exports.handleConvertingPresentationRequestDateAttributes = exports.extractPresentationRequest = exports.getPresentationRequest = void 0;
var lodash_1 = require("lodash");
var config_1 = require("../config");
var logger_1 = __importDefault(require("../logger"));
var error_1 = require("../utils/error");
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
/**
 * Helper to get presentationRequests by id from Saas' PresentationRequestRepo
 * @param authorization
 * @param id
 * @returns
 */
function getPresentationRequest(authorization, id) {
    return __awaiter(this, void 0, void 0, function () {
        var receiptCallOptions, resp, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    receiptCallOptions = {
                        method: 'GET',
                        baseUrl: config_1.configData.SaaSUrl,
                        endPoint: "presentationRequestRepository/" + id,
                        header: { Authorization: authorization }
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(receiptCallOptions)];
                case 2:
                    resp = _a.sent();
                    return [2 /*return*/, resp];
                case 3:
                    e_1 = _a.sent();
                    logger_1.default.error("Error getting PresentationRequest " + id + " from Unum ID SaaS, " + config_1.configData.SaaSUrl + ". Error " + e_1);
                    throw e_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getPresentationRequest = getPresentationRequest;
/**
 * Helper to extract the presentationRequest from the PresentationRequestRepo's response, which is a map keyed on version.
 * @param presentationRequestResponse
 * @returns
 */
function extractPresentationRequest(presentationRequestResponse) {
    // export function extractPresentationRequest (presentationRequestDto: PresentationRequestDto): PresentationRequestDto {
    try {
        var presentationRequestDto = presentationRequestResponse.presentationRequests['3.0.0'];
        // need to convert the times to Date objects for proto handling
        return handleConvertingPresentationRequestDateAttributes(presentationRequestDto);
    }
    catch (e) {
        throw new error_1.CustError(500, "Error handling presentation request from Saas: Error " + e);
    }
}
exports.extractPresentationRequest = extractPresentationRequest;
/**
 * Helper to handle converting the stringified date attributes to real Date objects so the proto serializer doesn't complain when going into a byte array for the signature check.
 * @param presentationRequestDto
 * @returns
 */
function handleConvertingPresentationRequestDateAttributes(presentationRequestDto) {
    var result = __assign(__assign({}, presentationRequestDto), { presentationRequest: __assign(__assign({}, presentationRequestDto.presentationRequest), { createdAt: handleAttributeDateType(presentationRequestDto.presentationRequest.createdAt), updatedAt: handleAttributeDateType(presentationRequestDto.presentationRequest.updatedAt), expiresAt: handleAttributeDateType(presentationRequestDto.presentationRequest.expiresAt) }) });
    return result;
}
exports.handleConvertingPresentationRequestDateAttributes = handleConvertingPresentationRequestDateAttributes;
/**
 * Helper to make the date attribute handling a little easier to follow than a complicate ternary.
 * @param input
 * @returns
 */
function handleAttributeDateType(input) {
    if (!input) {
        return undefined;
    }
    if (lodash_1.isDate(input)) {
        return input;
    }
    if (lodash_1.isString(input)) {
        return new Date(input);
    }
    logger_1.default.error('PresentationRequest date attribute value is not a string, undefined or Date. This should never happen.');
    return undefined;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UHJlc2VudGF0aW9uUmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92ZXJpZmllci9nZXRQcmVzZW50YXRpb25SZXF1ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsaUNBQTBDO0FBQzFDLG9DQUF1QztBQUN2QyxxREFBK0I7QUFFL0Isd0NBQTJDO0FBQzNDLHNFQUEwRjtBQUUxRjs7Ozs7R0FLRztBQUNILFNBQXNCLHNCQUFzQixDQUFFLGFBQXFCLEVBQUUsRUFBVTs7Ozs7O29CQUN2RSxrQkFBa0IsR0FBYTt3QkFDbkMsTUFBTSxFQUFFLEtBQUs7d0JBQ2IsT0FBTyxFQUFFLG1CQUFVLENBQUMsT0FBTzt3QkFDM0IsUUFBUSxFQUFFLG1DQUFpQyxFQUFJO3dCQUMvQyxNQUFNLEVBQUUsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFO3FCQUN6QyxDQUFDOzs7O29CQUdhLHFCQUFNLHlDQUFrQixDQUE2QixrQkFBa0IsQ0FBQyxFQUFBOztvQkFBL0UsSUFBSSxHQUFHLFNBQXdFO29CQUVyRixzQkFBTyxJQUFJLEVBQUM7OztvQkFFWixnQkFBTSxDQUFDLEtBQUssQ0FBQyx1Q0FBcUMsRUFBRSw0QkFBdUIsbUJBQVUsQ0FBQyxPQUFPLGdCQUFXLEdBQUcsQ0FBQyxDQUFDO29CQUM3RyxNQUFNLEdBQUMsQ0FBQzs7Ozs7Q0FFWDtBQWhCRCx3REFnQkM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsMEJBQTBCLENBQUUsMkJBQXVEO0lBQ25HLHdIQUF3SDtJQUN0SCxJQUFJO1FBQ0YsSUFBTSxzQkFBc0IsR0FBRywyQkFBMkIsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV6RiwrREFBK0Q7UUFDL0QsT0FBTyxpREFBaUQsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0tBQ2xGO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsMERBQXdELENBQUcsQ0FBQyxDQUFDO0tBQ3ZGO0FBQ0gsQ0FBQztBQVZELGdFQVVDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQWdCLGlEQUFpRCxDQUFFLHNCQUE4QztJQUMvRyxJQUFNLE1BQU0seUJBQ1Asc0JBQXNCLEtBQ3pCLG1CQUFtQix3QkFDZCxzQkFBc0IsQ0FBQyxtQkFBbUIsS0FDN0MsU0FBUyxFQUFFLHVCQUF1QixDQUFDLHNCQUFzQixDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBUyxFQUNoRyxTQUFTLEVBQUUsdUJBQXVCLENBQUMsc0JBQXNCLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFTLEVBQ2hHLFNBQVMsRUFBRSx1QkFBdUIsQ0FBQyxzQkFBc0IsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQVMsTUFFbkcsQ0FBQztJQUVGLE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFaRCw4R0FZQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLHVCQUF1QixDQUFFLEtBQVU7SUFDMUMsSUFBSSxDQUFDLEtBQUssRUFBRTtRQUNWLE9BQU8sU0FBUyxDQUFDO0tBQ2xCO0lBRUQsSUFBSSxlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDakIsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELElBQUksaUJBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNuQixPQUFPLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3hCO0lBRUQsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsd0dBQXdHLENBQUMsQ0FBQztJQUN2SCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSlNPTk9iaiwgUHJlc2VudGF0aW9uUmVxdWVzdER0bywgUHJlc2VudGF0aW9uUmVxdWVzdER0b1BiLCBXaXRoVmVyc2lvbiwgUHJlc2VudGF0aW9uUmVxdWVzdFJlcG9EdG8gfSBmcm9tICdAdW51bWlkL3R5cGVzJztcbmltcG9ydCB7IGlzRGF0ZSwgaXNTdHJpbmcgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgY29uZmlnRGF0YSB9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBSRVNURGF0YSwgUkVTVFJlc3BvbnNlLCBVbnVtRHRvIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgQ3VzdEVycm9yIH0gZnJvbSAnLi4vdXRpbHMvZXJyb3InO1xuaW1wb3J0IHsgaGFuZGxlQXV0aFRva2VuSGVhZGVyLCBtYWtlTmV0d29ya1JlcXVlc3QgfSBmcm9tICcuLi91dGlscy9uZXR3b3JrUmVxdWVzdEhlbHBlcic7XG5cbi8qKlxuICogSGVscGVyIHRvIGdldCBwcmVzZW50YXRpb25SZXF1ZXN0cyBieSBpZCBmcm9tIFNhYXMnIFByZXNlbnRhdGlvblJlcXVlc3RSZXBvXG4gKiBAcGFyYW0gYXV0aG9yaXphdGlvblxuICogQHBhcmFtIGlkXG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJlc2VudGF0aW9uUmVxdWVzdCAoYXV0aG9yaXphdGlvbjogc3RyaW5nLCBpZDogc3RyaW5nKTogUHJvbWlzZTxSRVNUUmVzcG9uc2U8UHJlc2VudGF0aW9uUmVxdWVzdFJlcG9EdG8+PiB7XG4gIGNvbnN0IHJlY2VpcHRDYWxsT3B0aW9uczogUkVTVERhdGEgPSB7XG4gICAgbWV0aG9kOiAnR0VUJyxcbiAgICBiYXNlVXJsOiBjb25maWdEYXRhLlNhYVNVcmwsXG4gICAgZW5kUG9pbnQ6IGBwcmVzZW50YXRpb25SZXF1ZXN0UmVwb3NpdG9yeS8ke2lkfWAsXG4gICAgaGVhZGVyOiB7IEF1dGhvcml6YXRpb246IGF1dGhvcml6YXRpb24gfVxuICB9O1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IG1ha2VOZXR3b3JrUmVxdWVzdDxQcmVzZW50YXRpb25SZXF1ZXN0UmVwb0R0bz4ocmVjZWlwdENhbGxPcHRpb25zKTtcblxuICAgIHJldHVybiByZXNwO1xuICB9IGNhdGNoIChlKSB7XG4gICAgbG9nZ2VyLmVycm9yKGBFcnJvciBnZXR0aW5nIFByZXNlbnRhdGlvblJlcXVlc3QgJHtpZH0gZnJvbSBVbnVtIElEIFNhYVMsICR7Y29uZmlnRGF0YS5TYWFTVXJsfS4gRXJyb3IgJHtlfWApO1xuICAgIHRocm93IGU7XG4gIH1cbn1cblxuLyoqXG4gKiBIZWxwZXIgdG8gZXh0cmFjdCB0aGUgcHJlc2VudGF0aW9uUmVxdWVzdCBmcm9tIHRoZSBQcmVzZW50YXRpb25SZXF1ZXN0UmVwbydzIHJlc3BvbnNlLCB3aGljaCBpcyBhIG1hcCBrZXllZCBvbiB2ZXJzaW9uLlxuICogQHBhcmFtIHByZXNlbnRhdGlvblJlcXVlc3RSZXNwb25zZVxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RQcmVzZW50YXRpb25SZXF1ZXN0IChwcmVzZW50YXRpb25SZXF1ZXN0UmVzcG9uc2U6IFByZXNlbnRhdGlvblJlcXVlc3RSZXBvRHRvKTogUHJlc2VudGF0aW9uUmVxdWVzdER0byB7XG4vLyBleHBvcnQgZnVuY3Rpb24gZXh0cmFjdFByZXNlbnRhdGlvblJlcXVlc3QgKHByZXNlbnRhdGlvblJlcXVlc3REdG86IFByZXNlbnRhdGlvblJlcXVlc3REdG8pOiBQcmVzZW50YXRpb25SZXF1ZXN0RHRvIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwcmVzZW50YXRpb25SZXF1ZXN0RHRvID0gcHJlc2VudGF0aW9uUmVxdWVzdFJlc3BvbnNlLnByZXNlbnRhdGlvblJlcXVlc3RzWyczLjAuMCddO1xuXG4gICAgLy8gbmVlZCB0byBjb252ZXJ0IHRoZSB0aW1lcyB0byBEYXRlIG9iamVjdHMgZm9yIHByb3RvIGhhbmRsaW5nXG4gICAgcmV0dXJuIGhhbmRsZUNvbnZlcnRpbmdQcmVzZW50YXRpb25SZXF1ZXN0RGF0ZUF0dHJpYnV0ZXMocHJlc2VudGF0aW9uUmVxdWVzdER0byk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDUwMCwgYEVycm9yIGhhbmRsaW5nIHByZXNlbnRhdGlvbiByZXF1ZXN0IGZyb20gU2FhczogRXJyb3IgJHtlfWApO1xuICB9XG59XG5cbi8qKlxuICogSGVscGVyIHRvIGhhbmRsZSBjb252ZXJ0aW5nIHRoZSBzdHJpbmdpZmllZCBkYXRlIGF0dHJpYnV0ZXMgdG8gcmVhbCBEYXRlIG9iamVjdHMgc28gdGhlIHByb3RvIHNlcmlhbGl6ZXIgZG9lc24ndCBjb21wbGFpbiB3aGVuIGdvaW5nIGludG8gYSBieXRlIGFycmF5IGZvciB0aGUgc2lnbmF0dXJlIGNoZWNrLlxuICogQHBhcmFtIHByZXNlbnRhdGlvblJlcXVlc3REdG9cbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVDb252ZXJ0aW5nUHJlc2VudGF0aW9uUmVxdWVzdERhdGVBdHRyaWJ1dGVzIChwcmVzZW50YXRpb25SZXF1ZXN0RHRvOiBQcmVzZW50YXRpb25SZXF1ZXN0RHRvKTogUHJlc2VudGF0aW9uUmVxdWVzdER0byB7XG4gIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAuLi5wcmVzZW50YXRpb25SZXF1ZXN0RHRvLFxuICAgIHByZXNlbnRhdGlvblJlcXVlc3Q6IHtcbiAgICAgIC4uLnByZXNlbnRhdGlvblJlcXVlc3REdG8ucHJlc2VudGF0aW9uUmVxdWVzdCxcbiAgICAgIGNyZWF0ZWRBdDogaGFuZGxlQXR0cmlidXRlRGF0ZVR5cGUocHJlc2VudGF0aW9uUmVxdWVzdER0by5wcmVzZW50YXRpb25SZXF1ZXN0LmNyZWF0ZWRBdCkgYXMgRGF0ZSwgLy8gRGVzcGl0ZSB0aGlzIHVnbGluZXNzLCByYXRoZXIgY2hlY2sgZm9yIHByZXNlbmNlIGFuZCBoYW5kbGUgdGhlIHVuZGVmaW5lZCBkaXJlY3RseSB3aGlsZSBub3QgZGVhbGluZyB3aXRoIGEgd2hvbGUgbmV3IHR5cGVcbiAgICAgIHVwZGF0ZWRBdDogaGFuZGxlQXR0cmlidXRlRGF0ZVR5cGUocHJlc2VudGF0aW9uUmVxdWVzdER0by5wcmVzZW50YXRpb25SZXF1ZXN0LnVwZGF0ZWRBdCkgYXMgRGF0ZSxcbiAgICAgIGV4cGlyZXNBdDogaGFuZGxlQXR0cmlidXRlRGF0ZVR5cGUocHJlc2VudGF0aW9uUmVxdWVzdER0by5wcmVzZW50YXRpb25SZXF1ZXN0LmV4cGlyZXNBdCkgYXMgRGF0ZVxuICAgIH1cbiAgfTtcblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEhlbHBlciB0byBtYWtlIHRoZSBkYXRlIGF0dHJpYnV0ZSBoYW5kbGluZyBhIGxpdHRsZSBlYXNpZXIgdG8gZm9sbG93IHRoYW4gYSBjb21wbGljYXRlIHRlcm5hcnkuXG4gKiBAcGFyYW0gaW5wdXRcbiAqIEByZXR1cm5zXG4gKi9cbmZ1bmN0aW9uIGhhbmRsZUF0dHJpYnV0ZURhdGVUeXBlIChpbnB1dDogYW55KTogRGF0ZSB8IHVuZGVmaW5lZCB7XG4gIGlmICghaW5wdXQpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKGlzRGF0ZShpbnB1dCkpIHtcbiAgICByZXR1cm4gaW5wdXQ7XG4gIH1cblxuICBpZiAoaXNTdHJpbmcoaW5wdXQpKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKGlucHV0KTtcbiAgfVxuXG4gIGxvZ2dlci5lcnJvcignUHJlc2VudGF0aW9uUmVxdWVzdCBkYXRlIGF0dHJpYnV0ZSB2YWx1ZSBpcyBub3QgYSBzdHJpbmcsIHVuZGVmaW5lZCBvciBEYXRlLiBUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4uJyk7XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG4iXX0=