"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCredentialStatusFromMap = void 0;
var error_1 = require("./error");
/**
 * Handler to get a credential status from the response of checkCredentialStatuses.
 *
 * Not much of a utility but very helpful in order to mock response of checkCredentialStatuses in unit tests.
 */
exports.getCredentialStatusFromMap = function (credentialId, statusMap) {
    if (typeof credentialId !== 'string') {
        throw new error_1.CustError(400, "credentialId is not a string: " + credentialId);
    }
    return statusMap[credentialId];
};
//# sourceMappingURL=getCredentialStatusFromMap.js.map