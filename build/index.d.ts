import { registerVerifier } from './verifier/registerVerifier';
import { sendEmail } from './verifier/sendEmail';
import { sendRequest } from './verifier/sendRequest';
import { sendSms } from './verifier/sendSms';
import { UnumDto, RegisteredVerifier, PresentationRequestResponse, RegisteredIssuer, VerifiedStatus, DecryptedPresentation, CredentialInfo } from './types';
import { verifyNoPresentation } from './verifier/verifyNoPresentation';
import { verifyPresentation } from './verifier/verifyPresentation';
import { verifyEncryptedPresentation } from './verifier/verifyEncryptedPresentation';
import { registerIssuer } from './issuer/registerIssuer';
import { issueCredential } from './issuer/issueCredentials';
import { revokeCredential } from './issuer/revokeCredentials';
import { CustError, Proof, Credential, CredentialSubject } from '@unumid/library-issuer-verifier-utility';
import { extractCredentialInfo } from './utils/extractCredentialInfo';
import { NoPresentation, Presentation } from '@unumid/types';
export { registerIssuer, issueCredential, revokeCredential, registerVerifier, sendEmail, sendRequest, sendSms, verifyNoPresentation, // Deprecated as an exposed function in favor of verifyEncryptedPresentation. Ought to be removed after holder stops sending presentations to the test customer app
verifyPresentation, // Deprecated as an exposed function in favor of verifyEncryptedPresentation. Ought to be removed after holder stops sending presentations to the test customer app
verifyEncryptedPresentation, UnumDto, RegisteredVerifier, PresentationRequestResponse, VerifiedStatus, NoPresentation, Presentation, RegisteredIssuer, CredentialSubject, DecryptedPresentation, CustError, Proof, Credential, CredentialInfo, extractCredentialInfo };
//# sourceMappingURL=index.d.ts.map