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
exports.getRequest = void 0;
var config_1 = require("../config");
var networkRequestHelper_1 = require("../utils/networkRequestHelper");
var logger_1 = __importDefault(require("../logger"));
var requireAuth_1 = require("../requireAuth");
/**
 * Handler for getting a PresentationRequest from UnumID's saas by its uuid
 * @param authorization
 * @param uuid
 * @returns UnumDto<PresentationRequestDto>
*/
exports.getRequest = function (authorization, uuid) { return __awaiter(void 0, void 0, void 0, function () {
    var data, response, authToken, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                requireAuth_1.requireAuth(authorization);
                data = {
                    method: 'GET',
                    baseUrl: config_1.configData.SaaSUrl,
                    endPoint: "presentationRequest/" + uuid,
                    header: { Authorization: authorization }
                };
                return [4 /*yield*/, networkRequestHelper_1.makeNetworkRequest(data)];
            case 1:
                response = _a.sent();
                authToken = networkRequestHelper_1.handleAuthTokenHeader(response, authorization);
                return [2 /*return*/, { body: response.body, authToken: authToken }];
            case 2:
                e_1 = _a.sent();
                logger_1.default.error("Error getting request from UnumID SaaS. " + e_1);
                throw e_1;
            case 3: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92ZXJpZmllci9nZXRSZXF1ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLG9DQUF1QztBQUV2QyxzRUFBMEY7QUFDMUYscURBQStCO0FBQy9CLDhDQUE2QztBQUU3Qzs7Ozs7RUFLRTtBQUNXLFFBQUEsVUFBVSxHQUFHLFVBQ3hCLGFBQXFCLEVBQ3JCLElBQVk7Ozs7OztnQkFHVix5QkFBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUNyQixJQUFJLEdBQWE7b0JBQ3JCLE1BQU0sRUFBRSxLQUFLO29CQUNiLE9BQU8sRUFBRSxtQkFBVSxDQUFDLE9BQU87b0JBQzNCLFFBQVEsRUFBRSx5QkFBdUIsSUFBTTtvQkFDdkMsTUFBTSxFQUFFLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRTtpQkFDekMsQ0FBQztnQkFFZSxxQkFBTSx5Q0FBa0IsQ0FBeUIsSUFBSSxDQUFDLEVBQUE7O2dCQUFqRSxRQUFRLEdBQUcsU0FBc0Q7Z0JBRWpFLFNBQVMsR0FBRyw0Q0FBcUIsQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBRWpFLHNCQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxXQUFBLEVBQUUsRUFBQzs7O2dCQUUxQyxnQkFBTSxDQUFDLEtBQUssQ0FBQyw2Q0FBMkMsR0FBRyxDQUFDLENBQUM7Z0JBQzdELE1BQU0sR0FBQyxDQUFDOzs7O0tBRVgsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByZXNlbnRhdGlvblJlcXVlc3REdG8gfSBmcm9tICdAdW51bWlkL3R5cGVzJztcbmltcG9ydCB7IGNvbmZpZ0RhdGEgfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgUkVTVERhdGEsIFVudW1EdG8gfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBoYW5kbGVBdXRoVG9rZW5IZWFkZXIsIG1ha2VOZXR3b3JrUmVxdWVzdCB9IGZyb20gJy4uL3V0aWxzL25ldHdvcmtSZXF1ZXN0SGVscGVyJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCB7IHJlcXVpcmVBdXRoIH0gZnJvbSAnLi4vcmVxdWlyZUF1dGgnO1xuXG4vKipcbiAqIEhhbmRsZXIgZm9yIGdldHRpbmcgYSBQcmVzZW50YXRpb25SZXF1ZXN0IGZyb20gVW51bUlEJ3Mgc2FhcyBieSBpdHMgdXVpZFxuICogQHBhcmFtIGF1dGhvcml6YXRpb25cbiAqIEBwYXJhbSB1dWlkXG4gKiBAcmV0dXJucyBVbnVtRHRvPFByZXNlbnRhdGlvblJlcXVlc3REdG8+XG4qL1xuZXhwb3J0IGNvbnN0IGdldFJlcXVlc3QgPSBhc3luYyAoXG4gIGF1dGhvcml6YXRpb246IHN0cmluZyxcbiAgdXVpZDogc3RyaW5nXG4pOiBQcm9taXNlPFVudW1EdG88UHJlc2VudGF0aW9uUmVxdWVzdER0bz4+ID0+IHtcbiAgdHJ5IHtcbiAgICByZXF1aXJlQXV0aChhdXRob3JpemF0aW9uKTtcbiAgICBjb25zdCBkYXRhOiBSRVNURGF0YSA9IHtcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICBiYXNlVXJsOiBjb25maWdEYXRhLlNhYVNVcmwsXG4gICAgICBlbmRQb2ludDogYHByZXNlbnRhdGlvblJlcXVlc3QvJHt1dWlkfWAsXG4gICAgICBoZWFkZXI6IHsgQXV0aG9yaXphdGlvbjogYXV0aG9yaXphdGlvbiB9XG4gICAgfTtcblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgbWFrZU5ldHdvcmtSZXF1ZXN0PFByZXNlbnRhdGlvblJlcXVlc3REdG8+KGRhdGEpO1xuICAgIC8vIGNvbnNvbGUubG9nKCdyZXNwb25zZScsIHJlc3BvbnNlKTtcbiAgICBjb25zdCBhdXRoVG9rZW4gPSBoYW5kbGVBdXRoVG9rZW5IZWFkZXIocmVzcG9uc2UsIGF1dGhvcml6YXRpb24pO1xuXG4gICAgcmV0dXJuIHsgYm9keTogcmVzcG9uc2UuYm9keSwgYXV0aFRva2VuIH07XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2dnZXIuZXJyb3IoYEVycm9yIGdldHRpbmcgcmVxdWVzdCBmcm9tIFVudW1JRCBTYWFTLiAke2V9YCk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcbiJdfQ==