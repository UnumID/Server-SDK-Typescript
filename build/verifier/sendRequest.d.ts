import { UnsignedPresentationRequest as UnsignedPresentationRequestDeprecatedV2, SignedPresentationRequest as SignedPresentationRequestDeprecatedV2 } from '@unumid/types-v2';
import { CredentialRequest, UnsignedPresentationRequestPb, PresentationRequestPb, CredentialRequestPb, PresentationRequestDto } from '@unumid/types';
import { SendRequestReqBody, UnumDto } from '../types';
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
export declare const constructSignedPresentationRequestDeprecatedV2: (unsignedPresentationRequest: UnsignedPresentationRequestDeprecatedV2, privateKey: string) => SignedPresentationRequestDeprecatedV2;
/**
 * Signs an unsigned PresentationRequest and attaches the resulting Proof
 * @param unsignedPresentationRequest UnsignedPresentationRequest
 * @param privateKey String
 */
export declare const constructSignedPresentationRequest: (unsignedPresentationRequest: UnsignedPresentationRequestPb, privateKey: string) => PresentationRequestPb;
/**
 * Handler for sending a PresentationRequest to UnumID's SaaS.
 * Middleware function where one can add requests of multiple versions to be encrypted and stored in the SaaS db for versioning needs.
 * @param authorization
 * @param verifier
 * @param credentialRequests
 * @param eccPrivateKey
 * @param holderAppUuid
 */
export declare const sendRequest: (authorization: string, verifier: string, credentialRequests: CredentialRequestPb[] | CredentialRequest[], eccPrivateKey: string, holderAppUuid?: string, expirationDate?: Date | undefined, metadata?: Record<string, unknown> | undefined) => Promise<UnumDto<PresentationRequestDto>>;
/**
 * Handler for sending a PresentationRequest to UnumID's SaaS.
 * @param authorization
 * @param verifier
 * @param credentialRequests
 * @param eccPrivateKey
 * @param holderAppUuid
 */
export declare const sendRequestV3: (authorization: string, verifier: string, credentialRequests: CredentialRequestPb[], eccPrivateKey: string, holderAppUuid: string, id: string, expirationDate?: Date | undefined, metadata?: any) => Promise<UnumDto<PresentationRequestDto>>;
//# sourceMappingURL=sendRequest.d.ts.map