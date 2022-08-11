"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isArrayNotEmpty = exports.isArrayEmpty = exports.flatten2DArray = exports.getUUID = void 0;
var uuid_1 = require("uuid");
/**
 * Generate a uuid.
 * @returns uuid
 */
exports.getUUID = function () {
    return (uuid_1.v4());
};
/**
 * Flattens 2D arrays, [[],[],] into one array, []
 * ref: https://stackoverflow.com/questions/56544572/flatten-array-of-arrays-in-typescript
 */
exports.flatten2DArray = function (input) {
    return input.reduce(function (accumulator, value) { return accumulator.concat(value); }, []);
};
/**
 * Checks if an array is: undefined, null, empty, or is not an array.
 * @param input any
 * @returns boolean
 */
exports.isArrayEmpty = function (input) {
    // return true if array does not exist, is not an array, or is empty
    return (!Array.isArray(input) || !input.length);
};
/**
 * Checks if an array is not: undefined, null, empty, or is not an array.
 * @param input any
 * @returns boolean
 */
exports.isArrayNotEmpty = function (input) {
    return !exports.isArrayEmpty(input);
};
//# sourceMappingURL=helpers.js.map