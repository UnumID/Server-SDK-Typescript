"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCredentialExpired = void 0;
exports.isCredentialExpired = function (credential) {
    var expirationDate = credential.expirationDate;
    if (!expirationDate) {
        return false;
    }
    return new Date(expirationDate).getTime() < new Date().getTime();
};
