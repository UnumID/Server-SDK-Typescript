"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCredentialInfo = void 0;
var helpers_1 = require("./helpers");
/**
 * Handler to extract credential reporting information meant to be relied to UnumID's SaaS for the enhanced analytics dashboard.
 * @param presentation // a post decrypted and verified presentation object;
 */
exports.extractCredentialInfo = function (presentation) {
    var credentialTypes = [];
    if (presentation.verifiableCredential && helpers_1.isArrayNotEmpty(presentation.verifiableCredential)) { // Don't really need to check for existence because does so in isArrayNotEmpty() but doing so just to appease typescript
        // cut off the preceding 'VerifiableCredential' string in each credential type array
        credentialTypes = presentation.verifiableCredential.flatMap(function (cred) { return helpers_1.isArrayNotEmpty(cred.type) && cred.type[0] === 'VerifiableCredential' ? cred.type.slice(1) : cred.type; });
    }
    // need to handle the possibility of a did fragment being part of the verification method.
    var subjectDid = presentation.proof.verificationMethod.split('#')[0];
    return {
        credentialTypes: credentialTypes,
        subjectDid: subjectDid
    };
};
//# sourceMappingURL=extractCredentialInfo.js.map