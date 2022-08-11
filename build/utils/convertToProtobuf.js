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
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertProof = void 0;
/**
 * Convert a json / http Proof type to protobuf
 */
exports.convertProof = function (proof) {
    return __assign(__assign({}, proof), { created: new Date(proof.created) });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udmVydFRvUHJvdG9idWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvY29udmVydFRvUHJvdG9idWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFHQTs7R0FFRztBQUNVLFFBQUEsWUFBWSxHQUFHLFVBQUMsS0FBWTtJQUN2Qyw2QkFDSyxLQUFLLEtBQ1IsT0FBTyxFQUFFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFDaEM7QUFDSixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCB7IFByb29mLCBQcm9vZlBiIH0gZnJvbSAnQHVudW1pZC90eXBlcyc7XG5cbi8qKlxuICogQ29udmVydCBhIGpzb24gLyBodHRwIFByb29mIHR5cGUgdG8gcHJvdG9idWZcbiAqL1xuZXhwb3J0IGNvbnN0IGNvbnZlcnRQcm9vZiA9IChwcm9vZjogUHJvb2YpOiBQcm9vZlBiID0+IHtcbiAgcmV0dXJuIHtcbiAgICAuLi5wcm9vZixcbiAgICBjcmVhdGVkOiBuZXcgRGF0ZShwcm9vZi5jcmVhdGVkKVxuICB9O1xufTtcbiJdfQ==