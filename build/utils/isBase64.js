"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBase64Image = exports.isBase64 = void 0;
/**
 * Utility to determine if the string is a base64 encoded image.
 *
 * ref: https://github.com/miguelmota/is-base64/blob/master/is-base64.js
 * @param str
 * @param opts
 * @returns
 */
function isBase64(str, opts) {
    if (typeof str === 'boolean') {
        return false;
    }
    if (!(opts instanceof Object)) {
        opts = {};
    }
    if (opts.allowEmpty === false && str === '') {
        return false;
    }
    var regex = '(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+\\/]{3}=)?';
    var mimeRegex = '(data:\\w+\\/[a-zA-Z\\+\\-\\.]+;base64,)';
    if (opts.mimeRequired === true) {
        regex = mimeRegex + regex;
    }
    else if (opts.allowMime === true) {
        regex = mimeRegex + '?' + regex;
    }
    if (opts.paddingRequired === false) {
        regex = '(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}(==)?|[A-Za-z0-9+\\/]{3}=?)?';
    }
    return (new RegExp('^' + regex + '$', 'gi')).test(str);
}
exports.isBase64 = isBase64;
function isBase64Image(str) {
    return isBase64(str, { mimeRequired: true });
}
exports.isBase64Image = isBase64Image;
//# sourceMappingURL=isBase64.js.map