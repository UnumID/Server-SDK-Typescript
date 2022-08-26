import { registerVerifier } from './verifier/registerVerifier';
import { sendEmail } from './verifier/sendEmail';
import { sendRequest } from './verifier/sendRequest';
import { sendSms } from './verifier/sendSms';
import { UnumDto, RegisteredVerifier, RegisteredIssuer, VerifiedStatus, DecryptedPresentation, CredentialInfo, CredentialStatusInfo } from './types';
import { verifyPresentation } from './verifier/verifyPresentation';
import { registerIssuer } from './issuer/registerIssuer';
import { issueCredentials } from './issuer/issueCredentials';
import { extractCredentialInfo } from './utils/extractCredentialInfo';
import { CredentialSubject, Presentation, Proof, Credential } from '@unumid/types';
import { CustError } from './utils/error';
import { createProof } from './utils/createProof';
import { convertCredentialSubject } from './utils/convertCredentialSubject';
import { getPresentationRequestByUuid } from './verifier/getRequestByUuid';
import { verifySubjectCredentialRequests } from './issuer/verifySubjectCredentialRequests';
import { verifySignedDid } from './utils/verifyDidDocument';
import { revokeAllCredentials } from './issuer/revokeAllCredentials';
import { updateCredentialStatuses } from './issuer/updateCredentialStatuses';
import { checkCredentialStatuses } from './verifier/checkCredentialStatuses';
import { reEncryptCredentials } from './issuer/reEncryptCredentials';
import { extractCredentialType } from './utils/extractCredentialType';
import { getPresentationRequest } from './verifier/getRequestById';

export {
  // Issuer Functions
  registerIssuer,
  issueCredentials,
  reEncryptCredentials,
  updateCredentialStatuses,
  verifySubjectCredentialRequests,
  revokeAllCredentials,
  // Verifier Functions
  registerVerifier,
  sendEmail,
  sendRequest,
  sendSms,
  verifyPresentation,
  checkCredentialStatuses,
  getPresentationRequestByUuid,
  getPresentationRequest,
  // Types
  UnumDto,
  RegisteredVerifier,
  VerifiedStatus,
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
  extractCredentialInfo,
  extractCredentialType,
  verifySignedDid,
  createProof,
  convertCredentialSubject
};
