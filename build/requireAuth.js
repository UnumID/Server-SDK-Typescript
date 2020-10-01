"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
var library_issuer_verifier_utility_1 = require("library-issuer-verifier-utility");
exports.requireAuth = function (auth) {
    if (!auth) {
        throw new library_issuer_verifier_utility_1.CustError(401, 'Not authenticated.');
    }
    // We assume that the header is a well-formed Bearer token with a single space
    // TODO: validate this and/or allow for multiple spaces
    // see https://trello.com/c/1jQE9mOT/534-saas-should-ensure-that-the-authorization-header-is-well-formed
    var token = auth.slice(7);
    if (!token) {
        throw new library_issuer_verifier_utility_1.CustError(401, 'Not authenticated.');
    }
};
