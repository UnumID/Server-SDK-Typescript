"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCredentialType = void 0;
var error_1 = require("./error");
/**
 * Removing the w3c credential spec of "VerifiableCredential" from the Unum ID internal type for simplicity.
 * Note: assuming the type is always of length two, first one being "VerifiableCredential" and second one the actually type.
 * @param credential
 */
exports.getCredentialType = function (credentialTypes) {
    // Removing the w3c credential spec of "VerifiableCredential" from the Unum ID internal type for simplicity
    // const encryptedCredentialTypeFiltered = credential.type.filter(t => t !== 'VerifiableCredential');
    if (credentialTypes.length !== 2) {
        throw new error_1.CustError(500, 'Credential type is malformed.');
    }
    var credentialType = credentialTypes[1];
    return credentialType;
};
//# sourceMappingURL=getCredentialType.js.map