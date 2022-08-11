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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKeyPairSet = void 0;
var library_crypto_1 = require("@unumid/library-crypto");
/**
 * Utility to create a key pair set for signing and encryption.
 * @param encoding
 */
exports.createKeyPairSet = function (encoding) {
    if (encoding === void 0) { encoding = 'pem'; }
    return __awaiter(void 0, void 0, void 0, function () {
        var kpSet, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    kpSet = {};
                    // generate ECC key pair with async / await
                    _a = kpSet;
                    return [4 /*yield*/, library_crypto_1.generateEccKeyPair(encoding)];
                case 1:
                    // generate ECC key pair with async / await
                    _a.signing = _c.sent();
                    // generate rsa key pair with async / await
                    _b = kpSet;
                    return [4 /*yield*/, library_crypto_1.generateRsaKeyPair(encoding)];
                case 2:
                    // generate rsa key pair with async / await
                    _b.encryption = _c.sent();
                    return [2 /*return*/, (kpSet)];
            }
        });
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlS2V5UGFpcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvY3JlYXRlS2V5UGFpcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEseURBQWdGO0FBR2hGOzs7R0FHRztBQUNVLFFBQUEsZ0JBQWdCLEdBQUcsVUFBTyxRQUFrQztJQUFsQyx5QkFBQSxFQUFBLGdCQUFrQzs7Ozs7O29CQUNqRSxLQUFLLEdBQWUsRUFBZ0IsQ0FBQztvQkFDM0MsMkNBQTJDO29CQUMzQyxLQUFBLEtBQUssQ0FBQTtvQkFBVyxxQkFBTSxtQ0FBa0IsQ0FBQyxRQUFRLENBQUMsRUFBQTs7b0JBRGxELDJDQUEyQztvQkFDM0MsR0FBTSxPQUFPLEdBQUcsU0FBa0MsQ0FBQztvQkFFbkQsMkNBQTJDO29CQUMzQyxLQUFBLEtBQUssQ0FBQTtvQkFBYyxxQkFBTSxtQ0FBa0IsQ0FBQyxRQUFRLENBQUMsRUFBQTs7b0JBRHJELDJDQUEyQztvQkFDM0MsR0FBTSxVQUFVLEdBQUcsU0FBa0MsQ0FBQztvQkFFdEQsc0JBQU8sQ0FBQyxLQUFLLENBQUMsRUFBQzs7OztDQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2VuZXJhdGVFY2NLZXlQYWlyLCBnZW5lcmF0ZVJzYUtleVBhaXIgfSBmcm9tICdAdW51bWlkL2xpYnJhcnktY3J5cHRvJztcbmltcG9ydCB7IEtleVBhaXJTZXQgfSBmcm9tICcuLi90eXBlcyc7XG5cbi8qKlxuICogVXRpbGl0eSB0byBjcmVhdGUgYSBrZXkgcGFpciBzZXQgZm9yIHNpZ25pbmcgYW5kIGVuY3J5cHRpb24uXG4gKiBAcGFyYW0gZW5jb2RpbmdcbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUtleVBhaXJTZXQgPSBhc3luYyAoZW5jb2Rpbmc6ICdiYXNlNTgnIHwgJ3BlbScgPSAncGVtJyk6IFByb21pc2U8S2V5UGFpclNldD4gPT4ge1xuICBjb25zdCBrcFNldDogS2V5UGFpclNldCA9IHt9IGFzIEtleVBhaXJTZXQ7XG4gIC8vIGdlbmVyYXRlIEVDQyBrZXkgcGFpciB3aXRoIGFzeW5jIC8gYXdhaXRcbiAga3BTZXQuc2lnbmluZyA9IGF3YWl0IGdlbmVyYXRlRWNjS2V5UGFpcihlbmNvZGluZyk7XG5cbiAgLy8gZ2VuZXJhdGUgcnNhIGtleSBwYWlyIHdpdGggYXN5bmMgLyBhd2FpdFxuICBrcFNldC5lbmNyeXB0aW9uID0gYXdhaXQgZ2VuZXJhdGVSc2FLZXlQYWlyKGVuY29kaW5nKTtcblxuICByZXR1cm4gKGtwU2V0KTtcbn07XG4iXX0=