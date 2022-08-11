import { registerVerifier } from './verifier/registerVerifier';
import { sendEmail } from './verifier/sendEmail';
import { sendRequest } from './verifier/sendRequest';
import { sendSms } from './verifier/sendSms';
import { UnumDto, RegisteredVerifier, RegisteredIssuer, VerifiedStatus, DecryptedPresentation, CredentialInfo, CredentialStatusInfo } from './types';
import { verifyPresentation } from './verifier/verifyPresentation';
import { registerIssuer } from './issuer/registerIssuer';
import { issueCredentials } from './issuer/issueCredentials';
import { updateCredentialStatus } from './issuer/updateCredentialStatus';
import { extractCredentialInfo } from './utils/extractCredentialInfo';
import { CredentialSubject, Presentation, Proof, Credential } from '@unumid/types';
import { CustError } from './utils/error';
import { createProof, createProofPb } from './utils/createProof';
import { convertCredentialSubject } from './utils/convertCredentialSubject';
import { getRequest } from './verifier/getRequest';
import { getVersionedRequest } from './verifier/getVersionedRequest';
import { verifySubjectCredentialRequests } from './issuer/verifySubjectCredentialRequests';
import { verifySignedDid } from './utils/verifyDidDocument';
import { revokeAllCredentials } from './issuer/revokeAllCredentials';
import { updateCredentialStatuses } from './issuer/updateCredentialStatuses';
import { checkCredentialStatuses } from './verifier/checkCredentialStatuses';
import { reEncryptCredentials } from './issuer/reEncryptCredentials';

export {
  // Issuer Functions
  registerIssuer,
  issueCredentials,
  reEncryptCredentials,
  updateCredentialStatus,
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
  getRequest,
  getVersionedRequest,
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
  verifySignedDid,
  createProof,
  createProofPb,
  convertCredentialSubject
};
