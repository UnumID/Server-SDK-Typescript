"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCredentialType = void 0;
var helpers_1 = require("./helpers");
/**
 * Handler to extract credential credential type, removing the W3C prefix 'VerifiableCredential'.
 * @param string[] type
 */
exports.extractCredentialType = function (type) {
    var result = helpers_1.isArrayNotEmpty(type) && type[0] === 'VerifiableCredential' ? type.slice(1) : type;
    return result;
};
//# sourceMappingURL=extractCredentialType.js.map