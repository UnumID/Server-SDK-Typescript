"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProof = void 0;
exports.validateProof = function (proof) {
    var created = proof.created, signatureValue = proof.signatureValue, type = proof.type, verificationMethod = proof.verificationMethod, proofPurpose = proof.proofPurpose;
    return created && signatureValue && type && verificationMethod && proofPurpose;
};
