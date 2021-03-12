import { CredentialInfo, Presentation } from '../types';

/**
 * Handler to extract credential reporting information meant to be relied to UnumID's SaaS for the enhanced analytics dashboard.
 * @param presentation // a post decrypted and verified presentation object;
 */
export const extractCredentialInfo = (presentation: Presentation): CredentialInfo => {
  // const credentialTypes = [];
  // for (const credential of presentation.verifiableCredential) {
  //   credentialTypes.push(credential.type);
  // }

  const credentialTypes = presentation.verifiableCredential.flatMap(cred => cred.type.slice(1)); // cut off the preceding 'VerifiableCredential' string in each array

  return {
    credentialTypes,
    subjectDid: presentation.proof.verificationMethod
  };
};
