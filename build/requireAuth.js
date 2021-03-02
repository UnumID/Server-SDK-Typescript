"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
var library_issuer_verifier_utility_1 = require("@unumid/library-issuer-verifier-utility");
var logger_1 = __importDefault(require("./logger"));
/**
 * Helper to enforce proper authorization token format.
 * @param auth String
 */
exports.requireAuth = function (auth) {
    if (!auth) {
        logger_1.default.error('No authentication string. Not authenticated.');
        throw new library_issuer_verifier_utility_1.CustError(401, 'No authentication string. Not authenticated.');
    }
    // We assume that the header is a well-formed Bearer token with a single space
    // TODO: validate this and/or allow for multiple spaces
    // see https://trello.com/c/1jQE9mOT/534-saas-should-ensure-that-the-authorization-header-is-well-formed
    var token = auth.slice(7);
    if (!token) {
        logger_1.default.error('No authentication token. Not authenticated.');
        throw new library_issuer_verifier_utility_1.CustError(401, 'No authentication token. Not authenticated.');
    }
};
//# sourceMappingURL=requireAuth.js.map