import { registerVerifier } from './verifier/registerVerifier';
import { sendEmail } from './verifier/sendEmail';
import { sendRequest } from './verifier/sendRequest';
import { sendSms } from './verifier/sendSms';
import { UnumDto, RegisteredVerifier, RegisteredIssuer, VerifiedStatus, DecryptedPresentation, CredentialInfo, CredentialStatusInfo } from './types';
import { verifyPresentation } from './verifier/verifyPresentation';
import { registerIssuer } from './issuer/registerIssuer';
import { issueCredential } from './issuer/issueCredentials';
import { updateCredentialStatus } from './issuer/updateCredentialStatus';
import { extractCredentialInfo } from './utils/extractCredentialInfo';
import { CredentialSubject, Presentation, Proof, Credential } from '@unumid/types';
import { checkCredentialStatus } from './verifier/checkCredentialStatus';
import { CustError } from './utils/error';
import { createProof } from './utils/createProof';
export { registerIssuer, issueCredential, updateCredentialStatus, registerVerifier, sendEmail, sendRequest, sendSms, verifyPresentation, checkCredentialStatus, UnumDto, RegisteredVerifier, VerifiedStatus, Presentation, RegisteredIssuer, CredentialSubject, DecryptedPresentation, CredentialStatusInfo, CustError, Proof, Credential, CredentialInfo, extractCredentialInfo, createProof };
//# sourceMappingURL=index.d.ts.map