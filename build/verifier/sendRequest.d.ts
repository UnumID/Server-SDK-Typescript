import { PresentationRequestDto as PresentationRequestDtoV3, PresentationRequestPb as PresentationRequestPbV3, UnsignedPresentationRequestPb as UnsignedPresentationRequestV3 } from '@unumid/types-v3';
import { PresentationRequestEnriched, CredentialRequest, UnsignedPresentationRequestPb, PresentationRequestPb } from '@unumid/types';
import { SendRequestReqBody, UnumDto } from '../types';
/**
 * Handler for sending a PresentationRequest to UnumID's SaaS.
 * Middleware function where one can add requests of multiple versions to be encrypted and stored in the SaaS db for versioning needs.
 * @param authorization
 * @param verifier
 * @param credentialRequests
 * @param eccPrivateKey
 * @param holderAppUuid
 */
export declare const sendRequest: (authorization: string, verifier: string, credentialRequests: CredentialRequest[], eccPrivateKey: string, holderAppUuid?: string, expirationDate?: Date | undefined, metadata?: Record<string, unknown> | undefined) => Promise<UnumDto<PresentationRequestEnriched>>;
/**
 * Handler for sending a PresentationRequest to UnumID's SaaS.
 * @param authorization
 * @param verifier
 * @param credentialRequests
 * @param eccPrivateKey
 * @param holderAppUuid
 */
export declare const sendRequestV3: (authorization: string, eccPrivateKey: string, body: SendRequestReqBody) => Promise<UnumDto<PresentationRequestDtoV3>>;
/**
 * Handler for sending a PresentationRequest to UnumID's SaaS.
 * @param authorization
 * @param verifier
 * @param credentialRequests
 * @param eccPrivateKey
 * @param holderAppUuid
 */
export declare const sendRequestV4: (authorization: string, eccPrivateKey: string, body: SendRequestReqBody) => Promise<UnumDto<PresentationRequestEnriched>>;
/**
 * Constructs an unsigned PresentationRequest from the incoming request body.
 * @param reqBody SendRequestReqBody
 */
export declare const constructUnsignedPresentationRequestV3: (reqBody: SendRequestReqBody, version: string) => UnsignedPresentationRequestV3;
/**
 * Constructs an unsigned PresentationRequest from the incoming request body.
 * @param reqBody SendRequestReqBody
 */
export declare const constructUnsignedPresentationRequest: (reqBody: SendRequestReqBody, version: string) => UnsignedPresentationRequestPb;
/**
 * Signs an unsigned PresentationRequest and attaches the resulting Proof
 * @param unsignedPresentationRequest UnsignedPresentationRequest
 * @param privateKey String
 */
export declare const constructSignedPresentationRequestV3: (unsignedPresentationRequest: UnsignedPresentationRequestV3, privateKey: string) => PresentationRequestPbV3;
/**
 * Signs an unsigned PresentationRequest and attaches the resulting Proof
 * @param unsignedPresentationRequest UnsignedPresentationRequest
 * @param privateKey String
 */
export declare const constructSignedPresentationRequest: (unsignedPresentationRequest: UnsignedPresentationRequestPb, privateKey: string) => PresentationRequestPb;
//# sourceMappingURL=sendRequest.d.ts.map