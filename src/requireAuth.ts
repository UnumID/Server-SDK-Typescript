import { CustError } from 'library-issuer-verifier-utility';

export const requireAuth = (auth: string | undefined): void => {
  if (!auth) {
    throw new CustError(401, 'Not authenticated.');
  }

  // We assume that the header is a well-formed Bearer token with a single space
  // TODO: validate this and/or allow for multiple spaces
  // see https://trello.com/c/1jQE9mOT/534-saas-should-ensure-that-the-authorization-header-is-well-formed
  const token = auth.slice(7);

  if (!token) {
    throw new CustError(401, 'Not authenticated.');
  }
};
