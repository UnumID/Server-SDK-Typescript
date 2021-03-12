"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCredentialInfoFromPresentation = void 0;
/**
 * Handler to extract credential reporting information meant to be relied to UnumID's SaaS for the enhanced analytics dashboard.
 * @param presentation // a post decrypted and verified presentation object;
 */
exports.extractCredentialInfoFromPresentation = function (presentation) {
    var credentialTypes = [];
    for (var _i = 0, _a = presentation.verifiableCredential; _i < _a.length; _i++) {
        var credential = _a[_i];
        credentialTypes.push(credential.type);
    }
    return {
        credentialTypes: credentialTypes.flat(),
        subjectDid: presentation.proof.verificationMethod
    };
};
//# sourceMappingURL=extractCredentialInfoFromPresentation.js.map