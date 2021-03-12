"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCredentialInfo = void 0;
var library_issuer_verifier_utility_1 = require("@unumid/library-issuer-verifier-utility");
/**
 * Handler to extract credential reporting information meant to be relied to UnumID's SaaS for the enhanced analytics dashboard.
 * @param presentation // a post decrypted and verified presentation object;
 */
exports.extractCredentialInfo = function (presentation) {
    var credentialTypes = [];
    if (library_issuer_verifier_utility_1.isArrayNotEmpty(presentation.verifiableCredentials)) {
        // cut off the preceding 'VerifiableCredential' string in each credential type array
        credentialTypes = presentation.verifiableCredentials.flatMap(function (cred) { return library_issuer_verifier_utility_1.isArrayNotEmpty(cred.type) && cred.type[0] === 'VerifiableCredential' ? cred.type.slice(1) : cred.type; });
    }
    return {
        credentialTypes: credentialTypes,
        subjectDid: presentation.proof.verificationMethod
    };
};
//# sourceMappingURL=extractCredentialInfo.js.map