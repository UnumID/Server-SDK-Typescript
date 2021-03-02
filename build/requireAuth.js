"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
var library_issuer_verifier_utility_1 = require("@unumid/library-issuer-verifier-utility");
var logger_1 = __importDefault(require("./logger"));
/**
 * Helper to enforce proper authorization token format.
 * @param auth String
 */
exports.requireAuth = function (auth) {
    if (!auth) {
        logger_1.default.error('No authentication string. Not authenticated.');
        throw new library_issuer_verifier_utility_1.CustError(401, 'No authentication string. Not authenticated.');
    }
    // We assume that the header is a well-formed Bearer token with a single space
    // TODO: validate this and/or allow for multiple spaces
    // see https://trello.com/c/1jQE9mOT/534-saas-should-ensure-that-the-authorization-header-is-well-formed
    var token = auth.slice(7);
    if (!token) {
        logger_1.default.error('No authentication token. Not authenticated.');
        throw new library_issuer_verifier_utility_1.CustError(401, 'No authentication token. Not authenticated.');
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWlyZUF1dGguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVxdWlyZUF1dGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMkZBQW9FO0FBQ3BFLG9EQUE4QjtBQUU5Qjs7O0dBR0c7QUFDVSxRQUFBLFdBQVcsR0FBRyxVQUFDLElBQXdCO0lBQ2xELElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDVCxnQkFBTSxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1FBQzdELE1BQU0sSUFBSSwyQ0FBUyxDQUFDLEdBQUcsRUFBRSw4Q0FBOEMsQ0FBQyxDQUFDO0tBQzFFO0lBRUQsOEVBQThFO0lBQzlFLHVEQUF1RDtJQUN2RCx3R0FBd0c7SUFDeEcsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU1QixJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ1YsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQztRQUM1RCxNQUFNLElBQUksMkNBQVMsQ0FBQyxHQUFHLEVBQUUsNkNBQTZDLENBQUMsQ0FBQztLQUN6RTtBQUNILENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEN1c3RFcnJvciB9IGZyb20gJ0B1bnVtaWQvbGlicmFyeS1pc3N1ZXItdmVyaWZpZXItdXRpbGl0eSc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcblxuLyoqXG4gKiBIZWxwZXIgdG8gZW5mb3JjZSBwcm9wZXIgYXV0aG9yaXphdGlvbiB0b2tlbiBmb3JtYXQuXG4gKiBAcGFyYW0gYXV0aCBTdHJpbmdcbiAqL1xuZXhwb3J0IGNvbnN0IHJlcXVpcmVBdXRoID0gKGF1dGg6IHN0cmluZyB8IHVuZGVmaW5lZCk6IHZvaWQgPT4ge1xuICBpZiAoIWF1dGgpIHtcbiAgICBsb2dnZXIuZXJyb3IoJ05vIGF1dGhlbnRpY2F0aW9uIHN0cmluZy4gTm90IGF1dGhlbnRpY2F0ZWQuJyk7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDEsICdObyBhdXRoZW50aWNhdGlvbiBzdHJpbmcuIE5vdCBhdXRoZW50aWNhdGVkLicpO1xuICB9XG5cbiAgLy8gV2UgYXNzdW1lIHRoYXQgdGhlIGhlYWRlciBpcyBhIHdlbGwtZm9ybWVkIEJlYXJlciB0b2tlbiB3aXRoIGEgc2luZ2xlIHNwYWNlXG4gIC8vIFRPRE86IHZhbGlkYXRlIHRoaXMgYW5kL29yIGFsbG93IGZvciBtdWx0aXBsZSBzcGFjZXNcbiAgLy8gc2VlIGh0dHBzOi8vdHJlbGxvLmNvbS9jLzFqUUU5bU9ULzUzNC1zYWFzLXNob3VsZC1lbnN1cmUtdGhhdC10aGUtYXV0aG9yaXphdGlvbi1oZWFkZXItaXMtd2VsbC1mb3JtZWRcbiAgY29uc3QgdG9rZW4gPSBhdXRoLnNsaWNlKDcpO1xuXG4gIGlmICghdG9rZW4pIHtcbiAgICBsb2dnZXIuZXJyb3IoJ05vIGF1dGhlbnRpY2F0aW9uIHRva2VuLiBOb3QgYXV0aGVudGljYXRlZC4nKTtcbiAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMSwgJ05vIGF1dGhlbnRpY2F0aW9uIHRva2VuLiBOb3QgYXV0aGVudGljYXRlZC4nKTtcbiAgfVxufTtcbiJdfQ==