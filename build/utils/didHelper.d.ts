import { DidDocument, DidKeyType, PublicKeyInfo } from '@unumid/types';
import { CustError } from './error';
import { RESTResponse, UnumDto } from '../types';
/**
 * Get a Did document from the did and url provided.
 * @param baseUrl
 * @param authorization
 * @param did
 */
export declare const getDIDDoc: (baseUrl: string, authorization: string, did: string) => Promise<RESTResponse<DidDocument | PublicKeyInfo> | CustError>;
/**
 * Helper to return the keys in the DID document which corresponds to the type specified.
 * Note: the can be multiple keys of same type on the same DID document.
 * @param didDocument DiDDocument
 * @param type DidKeyType
 */
export declare const getKeysFromDIDDoc: (didDocument: DidDocument, type: DidKeyType) => PublicKeyInfo[];
export declare const getDidDocPublicKeys: (authorization: string, targetDid: string, type: DidKeyType) => Promise<UnumDto<PublicKeyInfo[]>>;
export declare const getDidDocPublicKey: (authorization: string, targetDidWithKeyId: string) => Promise<UnumDto<PublicKeyInfo>>;
//# sourceMappingURL=didHelper.d.ts.map