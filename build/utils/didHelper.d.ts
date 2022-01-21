import { DidDocument, DidKeyType, PublicKeyInfo } from '@unumid/types';
import { CustError } from './error';
import { RESTResponse } from '../types';
/**
 * Get a Did document from the did and url provided.
 * @param baseUrl
 * @param authorization
 * @param did
 */
export declare const getDIDDoc: (baseUrl: string, authorization: string, did: string) => Promise<RESTResponse<DidDocument> | CustError>;
/**
 * Helper to get a key from a Did document.
 * Note: Per convention, Did documents have secp256r1 keys for signing / verification and only holder DID Documents have RSA keys.
 * @param didDocument DiDDocument
 * @param type DidKeyType
 */
export declare const getKeysFromDIDDoc: (didDocument: DidDocument, type: DidKeyType) => PublicKeyInfo[];
export declare const getDidDocPublicKeys: (authorization: string, subjectDid: string) => Promise<PublicKeyInfo[]>;
// # sourceMappingURL=didHelper.d.ts.map
