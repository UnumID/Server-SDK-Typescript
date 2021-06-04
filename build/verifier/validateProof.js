"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProof = void 0;
var error_1 = require("../utils/error");
/**
 * Helper to validate a proof has the required attributes.
 * @param proof ProofPb
 */
exports.validateProof = function (proof) {
    var created = proof.created, signatureValue = proof.signatureValue, type = proof.type, verificationMethod = proof.verificationMethod, proofPurpose = proof.proofPurpose;
    if (!created) {
        throw new error_1.CustError(400, 'Invalid Presentation: proof.created is required.');
    }
    else if (typeof created === 'string') {
        proof.created = new Date(created);
    }
    if (!signatureValue) {
        throw new error_1.CustError(400, 'Invalid Presentation: proof.signatureValue is required.');
    }
    if (!type) {
        throw new error_1.CustError(400, 'Invalid Presentation: proof.type is required.');
    }
    if (!verificationMethod) {
        throw new error_1.CustError(400, 'Invalid Presentation: proof.verificationMethod is required.');
    }
    if (!proofPurpose) {
        throw new error_1.CustError(400, 'Invalid Presentation: proof.proofPurpose is required.');
    }
    return proof;
};
//# sourceMappingURL=validateProof.js.map