import { UnumDto } from '../types';
import { Credential, CredentialPb, CredentialData } from '@unumid/types';
/**
 * Multiplexed handler for issuing credentials with UnumID's SaaS.
 * @param authorization
 * @param issuer
 * @param subjectDid
 * @param credentialDataList
 * @param signingPrivateKey
 * @param expirationDate
 */
export declare const issueCredentials: (authorization: string, issuerDid: string, subjectDid: string, credentialDataList: CredentialData[], signingPrivateKey: string, expirationDate?: Date | undefined, declineIssueCredentialsToSelf?: boolean) => Promise<UnumDto<(CredentialPb | Credential)[]>>;
//# sourceMappingURL=issueCredentials.d.ts.map