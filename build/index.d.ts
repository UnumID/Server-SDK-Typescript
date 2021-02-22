import { registerVerifier } from './verifier/registerVerifier';
import { sendEmail } from './verifier/sendEmail';
import { sendRequest } from './verifier/sendRequest';
import { sendSms } from './verifier/sendSms';
import { NoPresentation, Presentation, UnumDto, RegisteredVerifier, PresentationRequestResponse, RegisteredIssuer, VerifiedStatus, VerifiableCredential } from './types';
import { verifyNoPresentation } from './verifier/verifyNoPresentation';
import { verifyPresentation } from './verifier/verifyPresentation';
import { verifyEncryptedPresentation } from './verifier/verifyEncryptedPresentation';
import { registerIssuer } from './issuer/registerIssuer';
import { issueCredential } from './issuer/issueCredentials';
import { revokeCredential } from './issuer/revokeCredentials';
import { CustError, Proof, Credential, CredentialSubject } from 'library-issuer-verifier-utility';
import { Claim, ClaimList, ClaimPrimitive, ClaimValue } from 'library-issuer-verifier-utility/build/types';
export { registerIssuer, issueCredential, revokeCredential, registerVerifier, sendEmail, sendRequest, sendSms, verifyNoPresentation, // Deprecated as an exposed function in favor of verifyEncryptedPresentation. Ought to be removed after holder stops sending presentations to the test customer app
verifyPresentation, // Deprecated as an exposed function in favor of verifyEncryptedPresentation. Ought to be removed after holder stops sending presentations to the test customer app
verifyEncryptedPresentation, UnumDto, RegisteredVerifier, PresentationRequestResponse, VerifiedStatus, NoPresentation, Presentation, RegisteredIssuer, VerifiableCredential, CredentialSubject, ClaimValue, ClaimList, ClaimPrimitive, Claim, CustError, Proof, Credential };
//# sourceMappingURL=index.d.ts.map