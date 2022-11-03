import { UnumDto } from '../types';
import { CredentialPb, PublicKeyInfo, CredentialData, IssueCredentialsOptions, WithVersion, IssueCredentialOptions } from '@unumid/types';
import { Credential } from '@unumid/types/build/protos/credential';
interface CredentialPair {
    encryptedCredential: IssueCredentialOptions;
    credential: Credential;
}
export declare type CredentialEncryptionResult = {
    creds: WithVersion<CredentialPair>[];
    proofOfCreds: WithVersion<CredentialPair>[];
};
/**
 * Multiplexed handler for issuing credentials with UnumID's SaaS.
 *
 * Note: if the subjectDid contains an key id, aka fragment, it will be ignored and credentials will be issued to all key ids
 * associated with the base DID.
 * @param authorization
 * @param issuer
 * @param _subjectDid
 * @param credentialDataList
 * @param signingPrivateKey
 * @param expirationDate
 */
export declare const issueCredentials: (authorization: string, issuerDid: string, _subjectDid: string, credentialDataList: CredentialData[], signingPrivateKey: string, expirationDate?: Date | undefined, declineIssueCredentialsToSelf?: boolean) => Promise<UnumDto<Credential[]>>;
/**
 * Helper to construct a IssueCredentialOptions prior to sending to the Saas
 * @param credential
 * @param proofOfCredential
 * @param publicKeyInfos
 * @param subjectDid
 * @returns
 */
export declare const constructIssueCredentialOptions: (credential: CredentialPb, subjectPublicKeyInfos: PublicKeyInfo[], subjectDidWithFragment: string, version: string) => IssueCredentialOptions;
/**
 * Helper to send multiple encrypted credentials, IssueCredentialsOptions, to the Saas
 * @param authorization
 * @param encryptedCredentialUploadOptions
 * @param version
 * @returns
 */
export declare const sendEncryptedCredentials: (authorization: string, encryptedCredentialUploadOptions: IssueCredentialsOptions, version: string) => Promise<UnumDto<void>>;
export {};
//# sourceMappingURL=issueCredentials.d.ts.map