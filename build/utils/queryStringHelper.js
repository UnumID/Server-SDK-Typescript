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
//# sourceMappingURL=queryStringHelper.js.map