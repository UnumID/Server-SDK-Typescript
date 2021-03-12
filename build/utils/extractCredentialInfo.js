"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCredentialInfo = void 0;
/**
 * Handler to extract credential reporting information meant to be relied to UnumID's SaaS for the enhanced analytics dashboard.
 * @param presentation // a post decrypted and verified presentation object;
 */
exports.extractCredentialInfo = function (presentation) {
    // const credentialTypes = [];
    // for (const credential of presentation.verifiableCredential) {
    //   credentialTypes.push(credential.type);
    // }
    var credentialTypes = presentation.verifiableCredential.flatMap(function (cred) { return cred.type.slice(1); }); // cut off the preceding 'VerifiableCredential' string in each array
    return {
        credentialTypes: credentialTypes,
        subjectDid: presentation.proof.verificationMethod
    };
};
//# sourceMappingURL=extractCredentialInfo.js.map