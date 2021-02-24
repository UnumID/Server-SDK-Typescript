import { CustError } from '@unumid/library-issuer-verifier-utility';
import logger from './logger';

/**
 * Helper to enforce proper authorization token format.
 * @param auth String
 */
export const requireAuth = (auth: string | undefined): void => {
  if (!auth) {
    logger.error('No authentication string. Not authenticated.');
    throw new CustError(401, 'No authentication string. Not authenticated.');
  }

  // We assume that the header is a well-formed Bearer token with a single space
  // TODO: validate this and/or allow for multiple spaces
  // see https://trello.com/c/1jQE9mOT/534-saas-should-ensure-that-the-authorization-header-is-well-formed
  const token = auth.slice(7);

  if (!token) {
    logger.error('No authentication token. Not authenticated.');
    throw new CustError(401, 'No authentication token. Not authenticated.');
  }
};
