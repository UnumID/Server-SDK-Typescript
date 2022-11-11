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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCredentialData = void 0;
var extractCredentialType_1 = require("./extractCredentialType");
var convertCredentialSubject_1 = require("./convertCredentialSubject");
var lodash_1 = __importDefault(require("lodash"));
/**
 * Helper to extract credential data from a Credential
 * @param credential
 * @returns
 */
function extractCredentialData(credential) {
    var type = extractCredentialType_1.extractCredentialType(credential.type)[0];
    var subject = convertCredentialSubject_1.convertCredentialSubject(credential.credentialSubject);
    var _subject = lodash_1.default.omit(subject, 'id');
    return __assign({ type: type }, _subject);
}
exports.extractCredentialData = extractCredentialData;
//# sourceMappingURL=extractCredentialData.js.map