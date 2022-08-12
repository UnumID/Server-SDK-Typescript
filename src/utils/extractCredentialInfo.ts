
import { CredentialInfo } from '../types';
import { Presentation, PresentationPb, Credential } from '@unumid/types';
import { isArrayNotEmpty } from './helpers';
import { Proof } from '@unumid/types/build/protos/proof';
import { extractCredentialType } from './extractCredentialType';

/**
 * Handler to extract credential reporting information meant to be relied to UnumID's SaaS for the enhanced analytics dashboard.
 * @param presentation // a post decrypted and verified presentation object;
 */
export const extractCredentialInfo = (presentation: Presentation | PresentationPb): CredentialInfo => {
  let credentialTypes: string[] = [];

  if (presentation.verifiableCredential && isArrayNotEmpty(presentation.verifiableCredential)) { // Don't really need to check for existence because does so in isArrayNotEmpty() but doing so just to appease typescript
    // cut off the preceding 'VerifiableCredential' string in each credential type array
    credentialTypes = (presentation.verifiableCredential as Credential[]).flatMap(cred => extractCredentialType(cred.type));
  }

  // need to handle the possibility of a did fragment being part of the verification method.
  const subjectDid = (presentation.proof as Proof).verificationMethod.split('#')[0];

  return {
    credentialTypes,
    subjectDid
  };
};
