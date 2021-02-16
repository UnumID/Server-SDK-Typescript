import { registerVerifier } from './verifier/registerVerifier';
import { sendEmail } from './verifier/sendEmail';
import { sendRequest } from './verifier/sendRequest';
import { sendSms } from './verifier/sendSms';
import { NoPresentation, Presentation, Receipt, VerifierDto, RegisteredVerifier, PresentationRequestResponse, IssuerDto, RegisteredIssuer, VerifiedStatus } from './types';
import { verifyNoPresentation } from './verifier/verifyNoPresentation';
import { verifyPresentation } from './verifier/verifyPresentation';
import { verifyEncryptedPresentation } from './verifier/verifyEncryptedPresentation';
import { registerIssuer } from './issuer/registerIssuer';
import { issueCredential } from './issuer/issueCredentials';
import { revokeCredential } from './issuer/revokeCredentials';
export { registerIssuer, issueCredential, revokeCredential, registerVerifier, sendEmail, sendRequest, sendSms, verifyNoPresentation, // Deprecated as an exposed function in favor of verifyEncryptedPresentation. Ought to be removed after holder stops sending presentations to the test customer app
verifyPresentation, // Deprecated as an exposed function in favor of verifyEncryptedPresentation. Ought to be removed after holder stops sending presentations to the test customer app
verifyEncryptedPresentation, VerifierDto, RegisteredVerifier, PresentationRequestResponse, Receipt, VerifiedStatus, NoPresentation, Presentation, IssuerDto, RegisteredIssuer };
//# sourceMappingURL=index.d.ts.map