"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCredentialExpired = void 0;
/**
 * Helper to assess the expiration status of a credential.
 * @param credential VerifiableCredential
 */
exports.isCredentialExpired = function (credential) {
    var expirationDate = credential.expirationDate;
    if (!expirationDate) {
        return false;
    }
    return new Date(expirationDate).getTime() < new Date().getTime();
};
//# sourceMappingURL=isCredentialExpired.js.map