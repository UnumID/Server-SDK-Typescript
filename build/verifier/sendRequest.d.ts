import { CredentialRequest, PresentationRequestPostDto, UnsignedPresentationRequestPb, PresentationRequestPb } from '@unumid/types';
import { SendRequestReqBody, UnumDto } from '../types';
/**
 * Constructs an unsigned PresentationRequest from the incoming request body.
 * @param reqBody SendRequestReqBody
 */
export declare const constructUnsignedPresentationRequest: (reqBody: SendRequestReqBody) => UnsignedPresentationRequestPb;
/**
 * Signs an unsigned PresentationRequest and attaches the resulting Proof
 * @param unsignedPresentationRequest UnsignedPresentationRequest
 * @param privateKey String
 */
export declare const constructSignedPresentationRequest: (unsignedPresentationRequest: UnsignedPresentationRequestPb, privateKey: string) => PresentationRequestPb;
/**
 * Handler for sending a PresentationRequest to UnumID's SaaS.
 * @param authorization
 * @param verifier
 * @param credentialRequests
 * @param eccPrivateKey
 * @param holderAppUuid
 */
export declare const sendRequest: (authorization: string, verifier: string, credentialRequests: CredentialRequest[], eccPrivateKey: string, holderAppUuid: string, expirationDate?: Date | undefined, metadata?: Record<string, unknown> | undefined) => Promise<UnumDto<PresentationRequestPostDto>>;
//# sourceMappingURL=sendRequest.d.ts.map