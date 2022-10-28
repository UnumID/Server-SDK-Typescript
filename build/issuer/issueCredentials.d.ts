import { UnumDto } from '../types';
import { Credential, CredentialData, WithVersion, IssueCredentialOptions } from '@unumid/types';
interface CredentialPair {
    encryptedCredential: IssueCredentialOptions;
    credential: Credential;
}
export declare type CredentialEncryptionResult = {
    creds: WithVersion<CredentialPair>[];
    proofOfCreds: WithVersion<CredentialPair>[];
};
export declare function reduceCredentialEncryptionResults(prev: CredentialEncryptionResult, curr: CredentialEncryptionResult): CredentialEncryptionResult;
/**
 * Multiplexed handler for issuing credentials with UnumID's SaaS.
 * @param authorization
 * @param issuer
 * @param subjectDid
 * @param credentialDataList
 * @param signingPrivateKey
 * @param expirationDate
 */
export declare const issueCredentials: (authorization: string, issuerDid: string, subjectDid: string, credentialDataList: CredentialData[], signingPrivateKey: string, expirationDate?: Date | undefined, declineIssueCredentialsToSelf?: boolean) => Promise<UnumDto<(Credential)[]>>;
export {};
//# sourceMappingURL=issueCredentials.d.ts.map