"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPresentationData = void 0;
var extractCredentialData_1 = require("./extractCredentialData");
/**
 * Helper to extract credential data from a DecryptedPresentation
 * @param decryptedPresentation // a post decrypted and verified presentation object;
 */
exports.extractPresentationData = function (decryptedPresentation) {
    var presentation = decryptedPresentation.presentation, type = decryptedPresentation.type;
    if (type === 'DeclinedPresentation') {
        return [];
    }
    var result = [];
    presentation.verifiableCredential.forEach(function (credential) {
        result.push(extractCredentialData_1.extractCredentialData(credential));
    });
    return result;
};
//# sourceMappingURL=extractPresentationData.js.map