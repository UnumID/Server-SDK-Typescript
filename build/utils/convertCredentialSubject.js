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
exports.convertCredentialSubject = void 0;
var lodash_1 = require("lodash");
/**
 * Handler to convert the JSON representation of the CredentialSubject into a Typescript interface, CredentialSubject
 */
// export const convertCredentialSubject = (input: JSON): CredentialSubject => {
exports.convertCredentialSubject = function (input) {
    var claims = lodash_1.omit(input, 'id');
    var result = __assign({ id: input.id }, claims);
    return result;
};
//# sourceMappingURL=convertCredentialSubject.js.map