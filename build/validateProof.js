"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProof = void 0;
var library_issuer_verifier_utility_1 = require("library-issuer-verifier-utility");
exports.validateProof = function (proof) {
    var created = proof.created, signatureValue = proof.signatureValue, type = proof.type, verificationMethod = proof.verificationMethod, proofPurpose = proof.proofPurpose;
    if (!created) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: proof.created is required.');
    }
    if (!signatureValue) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: proof.signatureValue is required.');
    }
    if (!type) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: proof.type is required.');
    }
    if (!verificationMethod) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: proof.verificationMethod is required.');
    }
    if (!proofPurpose) {
        throw new library_issuer_verifier_utility_1.CustError(400, 'Invalid Presentation: proof.proofPurpose is required.');
    }
};
