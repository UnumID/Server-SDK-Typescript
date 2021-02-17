import { registerVerifier } from './verifier/registerVerifier';
import { sendEmail } from './verifier/sendEmail';
import { sendRequest } from './verifier/sendRequest';
import { sendSms } from './verifier/sendSms';
import { NoPresentation, Presentation, UnumDto, RegisteredVerifier, PresentationRequestResponse, RegisteredIssuer, VerifiedStatus } from './types';
import { verifyNoPresentation } from './verifier/verifyNoPresentation';
import { verifyPresentation } from './verifier/verifyPresentation';
import { verifyEncryptedPresentation } from './verifier/verifyEncryptedPresentation';
import { registerIssuer } from './issuer/registerIssuer';
import { issueCredential } from './issuer/issueCredentials';
import { revokeCredential } from './issuer/revokeCredentials';

export {
  // Issuer Functions
  registerIssuer,
  issueCredential,
  revokeCredential,
  // Verifier Functions
  registerVerifier,
  sendEmail,
  sendRequest,
  sendSms,
  verifyNoPresentation, // Deprecated as an exposed function in favor of verifyEncryptedPresentation. Ought to be removed after holder stops sending presentations to the test customer app
  verifyPresentation, // Deprecated as an exposed function in favor of verifyEncryptedPresentation. Ought to be removed after holder stops sending presentations to the test customer app
  verifyEncryptedPresentation,
  // Types
  UnumDto,
  RegisteredVerifier,
  PresentationRequestResponse,
  VerifiedStatus,
  NoPresentation,
  Presentation,
  RegisteredIssuer
};
