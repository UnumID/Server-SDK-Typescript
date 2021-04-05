import { registerVerifier } from './verifier/registerVerifier';
import { sendEmail } from './verifier/sendEmail';
import { sendRequest } from './verifier/sendRequest';
import { sendSms } from './verifier/sendSms';
import { UnumDto, RegisteredVerifier, PresentationRequestResponse, RegisteredIssuer, VerifiedStatus, DecryptedPresentation, CredentialInfo, CredentialStatusInfo } from './types';
import { verifyPresentation } from './verifier/verifyPresentation';
import { registerIssuer } from './issuer/registerIssuer';
import { issueCredential } from './issuer/issueCredentials';
import { changeCredentialStatus } from './issuer/changeCredentialStatus';
import { CustError, Proof, Credential, CredentialSubject } from '@unumid/library-issuer-verifier-utility';
import { extractCredentialInfo } from './utils/extractCredentialInfo';
import { NoPresentation, Presentation } from '@unumid/types';
import { checkCredentialStatus } from './verifier/checkCredentialStatus';

export {
  // Issuer Functions
  registerIssuer,
  issueCredential,
  changeCredentialStatus,
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
  PresentationRequestResponse,
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
