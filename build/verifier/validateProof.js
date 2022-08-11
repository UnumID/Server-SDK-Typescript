"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProofDeprecated = exports.validateProof = void 0;
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
/**
 * Helper to validate a proof has the required attributes.
 * @param proof ProofPb
 */
exports.validateProofDeprecated = function (proof) {
    var created = proof.created, signatureValue = proof.signatureValue, type = proof.type, verificationMethod = proof.verificationMethod, proofPurpose = proof.proofPurpose;
    if (!created) {
        throw new error_1.CustError(400, 'Invalid Presentation: proof.created is required.');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGVQcm9vZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92ZXJpZmllci92YWxpZGF0ZVByb29mLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHdDQUEyQztBQUUzQzs7O0dBR0c7QUFDVSxRQUFBLGFBQWEsR0FBRyxVQUFDLEtBQWM7SUFFeEMsSUFBQSxPQUFPLEdBS0wsS0FBSyxRQUxBLEVBQ1AsY0FBYyxHQUlaLEtBQUssZUFKTyxFQUNkLElBQUksR0FHRixLQUFLLEtBSEgsRUFDSixrQkFBa0IsR0FFaEIsS0FBSyxtQkFGVyxFQUNsQixZQUFZLEdBQ1YsS0FBSyxhQURLLENBQ0o7SUFFVixJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ1osTUFBTSxJQUFJLGlCQUFTLENBQUMsR0FBRyxFQUFFLGtEQUFrRCxDQUFDLENBQUM7S0FDOUU7U0FBTSxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTtRQUN0QyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ25DO0lBRUQsSUFBSSxDQUFDLGNBQWMsRUFBRTtRQUNuQixNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUseURBQXlELENBQUMsQ0FBQztLQUNyRjtJQUVELElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDVCxNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsK0NBQStDLENBQUMsQ0FBQztLQUMzRTtJQUVELElBQUksQ0FBQyxrQkFBa0IsRUFBRTtRQUN2QixNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsNkRBQTZELENBQUMsQ0FBQztLQUN6RjtJQUVELElBQUksQ0FBQyxZQUFZLEVBQUU7UUFDakIsTUFBTSxJQUFJLGlCQUFTLENBQUMsR0FBRyxFQUFFLHVEQUF1RCxDQUFDLENBQUM7S0FDbkY7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMsQ0FBQztBQUVGOzs7R0FHRztBQUNVLFFBQUEsdUJBQXVCLEdBQUcsVUFBQyxLQUFZO0lBRWhELElBQUEsT0FBTyxHQUtMLEtBQUssUUFMQSxFQUNQLGNBQWMsR0FJWixLQUFLLGVBSk8sRUFDZCxJQUFJLEdBR0YsS0FBSyxLQUhILEVBQ0osa0JBQWtCLEdBRWhCLEtBQUssbUJBRlcsRUFDbEIsWUFBWSxHQUNWLEtBQUssYUFESyxDQUNKO0lBRVYsSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUNaLE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSxrREFBa0QsQ0FBQyxDQUFDO0tBQzlFO0lBRUQsSUFBSSxDQUFDLGNBQWMsRUFBRTtRQUNuQixNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUseURBQXlELENBQUMsQ0FBQztLQUNyRjtJQUVELElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDVCxNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsK0NBQStDLENBQUMsQ0FBQztLQUMzRTtJQUVELElBQUksQ0FBQyxrQkFBa0IsRUFBRTtRQUN2QixNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsNkRBQTZELENBQUMsQ0FBQztLQUN6RjtJQUVELElBQUksQ0FBQyxZQUFZLEVBQUU7UUFDakIsTUFBTSxJQUFJLGlCQUFTLENBQUMsR0FBRyxFQUFFLHVEQUF1RCxDQUFDLENBQUM7S0FDbkY7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByb29mLCBQcm9vZlBiIH0gZnJvbSAnQHVudW1pZC90eXBlcyc7XG5pbXBvcnQgeyBDdXN0RXJyb3IgfSBmcm9tICcuLi91dGlscy9lcnJvcic7XG5cbi8qKlxuICogSGVscGVyIHRvIHZhbGlkYXRlIGEgcHJvb2YgaGFzIHRoZSByZXF1aXJlZCBhdHRyaWJ1dGVzLlxuICogQHBhcmFtIHByb29mIFByb29mUGJcbiAqL1xuZXhwb3J0IGNvbnN0IHZhbGlkYXRlUHJvb2YgPSAocHJvb2Y6IFByb29mUGIpOiBQcm9vZlBiID0+IHtcbiAgY29uc3Qge1xuICAgIGNyZWF0ZWQsXG4gICAgc2lnbmF0dXJlVmFsdWUsXG4gICAgdHlwZSxcbiAgICB2ZXJpZmljYXRpb25NZXRob2QsXG4gICAgcHJvb2ZQdXJwb3NlXG4gIH0gPSBwcm9vZjtcblxuICBpZiAoIWNyZWF0ZWQpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uOiBwcm9vZi5jcmVhdGVkIGlzIHJlcXVpcmVkLicpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBjcmVhdGVkID09PSAnc3RyaW5nJykge1xuICAgIHByb29mLmNyZWF0ZWQgPSBuZXcgRGF0ZShjcmVhdGVkKTtcbiAgfVxuXG4gIGlmICghc2lnbmF0dXJlVmFsdWUpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uOiBwcm9vZi5zaWduYXR1cmVWYWx1ZSBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICghdHlwZSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb246IHByb29mLnR5cGUgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAoIXZlcmlmaWNhdGlvbk1ldGhvZCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb246IHByb29mLnZlcmlmaWNhdGlvbk1ldGhvZCBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIGlmICghcHJvb2ZQdXJwb3NlKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvbjogcHJvb2YucHJvb2ZQdXJwb3NlIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgcmV0dXJuIHByb29mO1xufTtcblxuLyoqXG4gKiBIZWxwZXIgdG8gdmFsaWRhdGUgYSBwcm9vZiBoYXMgdGhlIHJlcXVpcmVkIGF0dHJpYnV0ZXMuXG4gKiBAcGFyYW0gcHJvb2YgUHJvb2ZQYlxuICovXG5leHBvcnQgY29uc3QgdmFsaWRhdGVQcm9vZkRlcHJlY2F0ZWQgPSAocHJvb2Y6IFByb29mKTogUHJvb2YgPT4ge1xuICBjb25zdCB7XG4gICAgY3JlYXRlZCxcbiAgICBzaWduYXR1cmVWYWx1ZSxcbiAgICB0eXBlLFxuICAgIHZlcmlmaWNhdGlvbk1ldGhvZCxcbiAgICBwcm9vZlB1cnBvc2VcbiAgfSA9IHByb29mO1xuXG4gIGlmICghY3JlYXRlZCkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb246IHByb29mLmNyZWF0ZWQgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAoIXNpZ25hdHVyZVZhbHVlKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsICdJbnZhbGlkIFByZXNlbnRhdGlvbjogcHJvb2Yuc2lnbmF0dXJlVmFsdWUgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAoIXR5cGUpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uOiBwcm9vZi50eXBlIGlzIHJlcXVpcmVkLicpO1xuICB9XG5cbiAgaWYgKCF2ZXJpZmljYXRpb25NZXRob2QpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgJ0ludmFsaWQgUHJlc2VudGF0aW9uOiBwcm9vZi52ZXJpZmljYXRpb25NZXRob2QgaXMgcmVxdWlyZWQuJyk7XG4gIH1cblxuICBpZiAoIXByb29mUHVycG9zZSkge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCAnSW52YWxpZCBQcmVzZW50YXRpb246IHByb29mLnByb29mUHVycG9zZSBpcyByZXF1aXJlZC4nKTtcbiAgfVxuXG4gIHJldHVybiBwcm9vZjtcbn07XG4iXX0=