/**
 * Helper to send a PresentationVerified Receipt to the Unum ID SaaS
 * @param authorization
 * @param verifier
 * @param subject
 * @param reply
 * @param isVerified
 * @param reason
 * @param issuers
 * @param credentialTypes
 * @returns
 */
export declare function sendPresentationVerifiedReceipt(authorization: string, verifier: string, subject: string, reply: string, isVerified: boolean, requestId: string, requestUuid: string, reason?: string, issuers?: string[], credentialTypes?: string[]): Promise<string>;
//# sourceMappingURL=sendPresentationVerifiedReceipt.d.ts.map