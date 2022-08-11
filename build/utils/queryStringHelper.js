"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createListQueryString = void 0;
/**
 * Creates a list query string for interfacing with Unum ID saas services.
 * For example: {{saasUrl}}/issuer?uuid[$in][]=f12b49a5-89f8-4cee-8ed6-7ac3ffab3ff3&uuid[$in][]=439e38d0-cb82-419c-bfbb-ae3abf214934
 *
 * @param key string
 * @param values string[]
 */
exports.createListQueryString = function (key, values) {
    var result = '';
    for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
        var value = values_1[_i];
        result = result.concat(key + "[$in][]=" + value + "&");
    }
    return result;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlTdHJpbmdIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvcXVlcnlTdHJpbmdIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7OztHQU1HO0FBQ1UsUUFBQSxxQkFBcUIsR0FBRyxVQUFDLEdBQVcsRUFBRSxNQUFnQjtJQUNqRSxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDaEIsS0FBb0IsVUFBTSxFQUFOLGlCQUFNLEVBQU4sb0JBQU0sRUFBTixJQUFNLEVBQUU7UUFBdkIsSUFBTSxLQUFLLGVBQUE7UUFDZCxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBSSxHQUFHLGdCQUFXLEtBQUssTUFBRyxDQUFDLENBQUM7S0FDbkQ7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZXMgYSBsaXN0IHF1ZXJ5IHN0cmluZyBmb3IgaW50ZXJmYWNpbmcgd2l0aCBVbnVtIElEIHNhYXMgc2VydmljZXMuXG4gKiBGb3IgZXhhbXBsZToge3tzYWFzVXJsfX0vaXNzdWVyP3V1aWRbJGluXVtdPWYxMmI0OWE1LTg5ZjgtNGNlZS04ZWQ2LTdhYzNmZmFiM2ZmMyZ1dWlkWyRpbl1bXT00MzllMzhkMC1jYjgyLTQxOWMtYmZiYi1hZTNhYmYyMTQ5MzRcbiAqXG4gKiBAcGFyYW0ga2V5IHN0cmluZ1xuICogQHBhcmFtIHZhbHVlcyBzdHJpbmdbXVxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlTGlzdFF1ZXJ5U3RyaW5nID0gKGtleTogc3RyaW5nLCB2YWx1ZXM6IHN0cmluZ1tdKTogc3RyaW5nID0+IHtcbiAgbGV0IHJlc3VsdCA9ICcnO1xuICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQoYCR7a2V5fVskaW5dW109JHt2YWx1ZX0mYCk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcbiJdfQ==