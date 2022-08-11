"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProofPb = exports.createProof = void 0;
var library_crypto_1 = require("@unumid/library-crypto");
var fast_json_stable_stringify_1 = __importDefault(require("fast-json-stable-stringify"));
var logger_1 = __importDefault(require("../logger"));
/**
 * Create cryptographic proof.
 * @param data
 * @param privateKey
 * @param method
 * @param encoding
 */
exports.createProof = function (data, privateKey, method, encoding) {
    var signature = library_crypto_1.sign(data, privateKey, encoding);
    var proof = {
        created: new Date().toISOString(),
        signatureValue: signature,
        unsignedValue: fast_json_stable_stringify_1.default(data),
        type: 'secp256r1Signature2020',
        verificationMethod: method,
        proofPurpose: 'assertionMethod'
    };
    logger_1.default.debug("Successfully created proof " + JSON.stringify(proof));
    return (proof);
};
/**
 * Create cryptographic proof from byte array of a Protobuf object
 * @param data
 * @param privateKey
 * @param method
 * @param encoding
 */
exports.createProofPb = function (data, privateKey, method) {
    var signature = library_crypto_1.signBytes(data, privateKey);
    var proof = {
        created: new Date(),
        signatureValue: signature,
        type: 'secp256r1Signature2020',
        verificationMethod: method,
        proofPurpose: 'assertionMethod'
    };
    logger_1.default.debug("Successfully created proof " + JSON.stringify(proof));
    return (proof);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlUHJvb2YuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvY3JlYXRlUHJvb2YudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEseURBQXlEO0FBQ3pELDBGQUFtRDtBQUluRCxxREFBK0I7QUFHL0I7Ozs7OztHQU1HO0FBQ1UsUUFBQSxXQUFXLEdBQUcsVUFBQyxJQUFhLEVBQUUsVUFBa0IsRUFBRSxNQUFjLEVBQUUsUUFBMEI7SUFDdkcsSUFBTSxTQUFTLEdBQUcscUJBQUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBRW5ELElBQU0sS0FBSyxHQUFVO1FBQ25CLE9BQU8sRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtRQUNqQyxjQUFjLEVBQUUsU0FBUztRQUN6QixhQUFhLEVBQUUsb0NBQVMsQ0FBQyxJQUFJLENBQUM7UUFDOUIsSUFBSSxFQUFFLHdCQUF3QjtRQUM5QixrQkFBa0IsRUFBRSxNQUFNO1FBQzFCLFlBQVksRUFBRSxpQkFBaUI7S0FDaEMsQ0FBQztJQUVGLGdCQUFNLENBQUMsS0FBSyxDQUFDLGdDQUE4QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBRyxDQUFDLENBQUM7SUFDcEUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pCLENBQUMsQ0FBQztBQUVGOzs7Ozs7R0FNRztBQUNVLFFBQUEsYUFBYSxHQUFHLFVBQUMsSUFBZ0IsRUFBRSxVQUFrQixFQUFFLE1BQWM7SUFDaEYsSUFBTSxTQUFTLEdBQUcsMEJBQVMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFFOUMsSUFBTSxLQUFLLEdBQVk7UUFDckIsT0FBTyxFQUFFLElBQUksSUFBSSxFQUFFO1FBQ25CLGNBQWMsRUFBRSxTQUFTO1FBQ3pCLElBQUksRUFBRSx3QkFBd0I7UUFDOUIsa0JBQWtCLEVBQUUsTUFBTTtRQUMxQixZQUFZLEVBQUUsaUJBQWlCO0tBQ2hDLENBQUM7SUFFRixnQkFBTSxDQUFDLEtBQUssQ0FBQyxnQ0FBOEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUcsQ0FBQyxDQUFDO0lBQ3BFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNqQixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzaWduLCBzaWduQnl0ZXMgfSBmcm9tICdAdW51bWlkL2xpYnJhcnktY3J5cHRvJztcbmltcG9ydCBzdHJpbmdpZnkgZnJvbSAnZmFzdC1qc29uLXN0YWJsZS1zdHJpbmdpZnknO1xuXG5pbXBvcnQgeyBKU09OT2JqLCBQcm9vZlBiIH0gZnJvbSAnQHVudW1pZC90eXBlcyc7XG5cbmltcG9ydCBsb2dnZXIgZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCB7IFByb29mIH0gZnJvbSAnQHVudW1pZC90eXBlcy12Mic7XG5cbi8qKlxuICogQ3JlYXRlIGNyeXB0b2dyYXBoaWMgcHJvb2YuXG4gKiBAcGFyYW0gZGF0YVxuICogQHBhcmFtIHByaXZhdGVLZXlcbiAqIEBwYXJhbSBtZXRob2RcbiAqIEBwYXJhbSBlbmNvZGluZ1xuICovXG5leHBvcnQgY29uc3QgY3JlYXRlUHJvb2YgPSAoZGF0YTogSlNPTk9iaiwgcHJpdmF0ZUtleTogc3RyaW5nLCBtZXRob2Q6IHN0cmluZywgZW5jb2Rpbmc6ICdiYXNlNTgnIHwgJ3BlbScpOiBQcm9vZiA9PiB7XG4gIGNvbnN0IHNpZ25hdHVyZSA9IHNpZ24oZGF0YSwgcHJpdmF0ZUtleSwgZW5jb2RpbmcpO1xuXG4gIGNvbnN0IHByb29mOiBQcm9vZiA9IHtcbiAgICBjcmVhdGVkOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgc2lnbmF0dXJlVmFsdWU6IHNpZ25hdHVyZSxcbiAgICB1bnNpZ25lZFZhbHVlOiBzdHJpbmdpZnkoZGF0YSksXG4gICAgdHlwZTogJ3NlY3AyNTZyMVNpZ25hdHVyZTIwMjAnLFxuICAgIHZlcmlmaWNhdGlvbk1ldGhvZDogbWV0aG9kLFxuICAgIHByb29mUHVycG9zZTogJ2Fzc2VydGlvbk1ldGhvZCdcbiAgfTtcblxuICBsb2dnZXIuZGVidWcoYFN1Y2Nlc3NmdWxseSBjcmVhdGVkIHByb29mICR7SlNPTi5zdHJpbmdpZnkocHJvb2YpfWApO1xuICByZXR1cm4gKHByb29mKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlIGNyeXB0b2dyYXBoaWMgcHJvb2YgZnJvbSBieXRlIGFycmF5IG9mIGEgUHJvdG9idWYgb2JqZWN0XG4gKiBAcGFyYW0gZGF0YVxuICogQHBhcmFtIHByaXZhdGVLZXlcbiAqIEBwYXJhbSBtZXRob2RcbiAqIEBwYXJhbSBlbmNvZGluZ1xuICovXG5leHBvcnQgY29uc3QgY3JlYXRlUHJvb2ZQYiA9IChkYXRhOiBVaW50OEFycmF5LCBwcml2YXRlS2V5OiBzdHJpbmcsIG1ldGhvZDogc3RyaW5nKTogUHJvb2ZQYiA9PiB7XG4gIGNvbnN0IHNpZ25hdHVyZSA9IHNpZ25CeXRlcyhkYXRhLCBwcml2YXRlS2V5KTtcblxuICBjb25zdCBwcm9vZjogUHJvb2ZQYiA9IHtcbiAgICBjcmVhdGVkOiBuZXcgRGF0ZSgpLFxuICAgIHNpZ25hdHVyZVZhbHVlOiBzaWduYXR1cmUsXG4gICAgdHlwZTogJ3NlY3AyNTZyMVNpZ25hdHVyZTIwMjAnLFxuICAgIHZlcmlmaWNhdGlvbk1ldGhvZDogbWV0aG9kLFxuICAgIHByb29mUHVycG9zZTogJ2Fzc2VydGlvbk1ldGhvZCdcbiAgfTtcblxuICBsb2dnZXIuZGVidWcoYFN1Y2Nlc3NmdWxseSBjcmVhdGVkIHByb29mICR7SlNPTi5zdHJpbmdpZnkocHJvb2YpfWApO1xuICByZXR1cm4gKHByb29mKTtcbn07XG4iXX0=