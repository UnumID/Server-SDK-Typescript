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
//# sourceMappingURL=convertToProtobuf.js.map