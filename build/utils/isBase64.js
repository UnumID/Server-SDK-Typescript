"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBase64 = void 0;
function isBase64(str) {
    return Buffer.from(str, 'base64').toString('base64') === str;
}
exports.isBase64 = isBase64;
//# sourceMappingURL=isBase64.js.map