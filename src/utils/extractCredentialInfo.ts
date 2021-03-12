import { CredentialInfo, Presentation } from '../types';

/**
 * Handler to extract credential reporting information meant to be relied to UnumID's SaaS for the enhanced analytics dashboard.
 * @param presentation // a post decrypted and verified presentation object;
 */
export const extractCredentialInfo = (presentation: Presentation): CredentialInfo => {
  const credentialTypes = [];
  for (const credential of presentation.verifiableCredential) {
    credentialTypes.push(credential.type);
  }

  return {
    credentialTypes: credentialTypes.flat(),
    subjectDid: presentation.proof.verificationMethod
  };
};
