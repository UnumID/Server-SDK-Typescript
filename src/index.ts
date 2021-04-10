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
import { CredentialSubject, NoPresentation, Presentation, Proof, Credential } from '@unumid/types';
import { checkCredentialStatus } from './verifier/checkCredentialStatus';
import { CustError } from './utils/error';

export {
  // Issuer Functions
  registerIssuer,
  issueCredential,
  updateCredentialStatus,
  // Verifier Functions
  registerVerifier,
  sendEmail,
  sendRequest,
  sendSms,
  verifyPresentation,
  checkCredentialStatus,
  // Types
  UnumDto,
  RegisteredVerifier,
  VerifiedStatus,
  NoPresentation,
  Presentation,
  RegisteredIssuer,
  CredentialSubject,
  DecryptedPresentation,
  CredentialStatusInfo,
  // Util Types
  CustError,
  Proof,
  Credential,
  CredentialInfo,
  // Util Functions
  extractCredentialInfo
};
