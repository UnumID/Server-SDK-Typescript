"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
var logger_1 = __importDefault(require("./logger"));
var error_1 = require("./utils/error");
/**
 * Helper to enforce proper authorization token format.
 * @param auth String
 */
exports.requireAuth = function (auth) {
    if (!auth) {
        logger_1.default.error('No authentication string. Not authenticated.');
        throw new error_1.CustError(401, 'No authentication string. Not authenticated.');
    }
    // We assume that the header is a well-formed Bearer token with a single space
    // TODO: validate this and/or allow for multiple spaces
    // see https://trello.com/c/1jQE9mOT/534-saas-should-ensure-that-the-authorization-header-is-well-formed
    var token = auth.slice(7);
    if (!token) {
        logger_1.default.error('No authentication token. Not authenticated.');
        throw new error_1.CustError(401, 'No authentication token. Not authenticated.');
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWlyZUF1dGguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVxdWlyZUF1dGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsb0RBQThCO0FBQzlCLHVDQUEwQztBQUUxQzs7O0dBR0c7QUFDVSxRQUFBLFdBQVcsR0FBRyxVQUFDLElBQXdCO0lBQ2xELElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDVCxnQkFBTSxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1FBQzdELE1BQU0sSUFBSSxpQkFBUyxDQUFDLEdBQUcsRUFBRSw4Q0FBOEMsQ0FBQyxDQUFDO0tBQzFFO0lBRUQsOEVBQThFO0lBQzlFLHVEQUF1RDtJQUN2RCx3R0FBd0c7SUFDeEcsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU1QixJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ1YsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQztRQUM1RCxNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsNkNBQTZDLENBQUMsQ0FBQztLQUN6RTtBQUNILENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBsb2dnZXIgZnJvbSAnLi9sb2dnZXInO1xuaW1wb3J0IHsgQ3VzdEVycm9yIH0gZnJvbSAnLi91dGlscy9lcnJvcic7XG5cbi8qKlxuICogSGVscGVyIHRvIGVuZm9yY2UgcHJvcGVyIGF1dGhvcml6YXRpb24gdG9rZW4gZm9ybWF0LlxuICogQHBhcmFtIGF1dGggU3RyaW5nXG4gKi9cbmV4cG9ydCBjb25zdCByZXF1aXJlQXV0aCA9IChhdXRoOiBzdHJpbmcgfCB1bmRlZmluZWQpOiB2b2lkID0+IHtcbiAgaWYgKCFhdXRoKSB7XG4gICAgbG9nZ2VyLmVycm9yKCdObyBhdXRoZW50aWNhdGlvbiBzdHJpbmcuIE5vdCBhdXRoZW50aWNhdGVkLicpO1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAxLCAnTm8gYXV0aGVudGljYXRpb24gc3RyaW5nLiBOb3QgYXV0aGVudGljYXRlZC4nKTtcbiAgfVxuXG4gIC8vIFdlIGFzc3VtZSB0aGF0IHRoZSBoZWFkZXIgaXMgYSB3ZWxsLWZvcm1lZCBCZWFyZXIgdG9rZW4gd2l0aCBhIHNpbmdsZSBzcGFjZVxuICAvLyBUT0RPOiB2YWxpZGF0ZSB0aGlzIGFuZC9vciBhbGxvdyBmb3IgbXVsdGlwbGUgc3BhY2VzXG4gIC8vIHNlZSBodHRwczovL3RyZWxsby5jb20vYy8xalFFOW1PVC81MzQtc2Fhcy1zaG91bGQtZW5zdXJlLXRoYXQtdGhlLWF1dGhvcml6YXRpb24taGVhZGVyLWlzLXdlbGwtZm9ybWVkXG4gIGNvbnN0IHRva2VuID0gYXV0aC5zbGljZSg3KTtcblxuICBpZiAoIXRva2VuKSB7XG4gICAgbG9nZ2VyLmVycm9yKCdObyBhdXRoZW50aWNhdGlvbiB0b2tlbi4gTm90IGF1dGhlbnRpY2F0ZWQuJyk7XG4gICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDEsICdObyBhdXRoZW50aWNhdGlvbiB0b2tlbi4gTm90IGF1dGhlbnRpY2F0ZWQuJyk7XG4gIH1cbn07XG4iXX0=