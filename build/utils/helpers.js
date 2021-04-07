"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flatten2DArray = void 0;
/**
 * Flattens 2D arrays, [[],[],] into one array, []
 * ref: https://stackoverflow.com/questions/56544572/flatten-array-of-arrays-in-typescript
 */
exports.flatten2DArray = function (input) {
    return input.reduce(function (accumulator, value) { return accumulator.concat(value); }, []);
};
//# sourceMappingURL=helpers.js.map