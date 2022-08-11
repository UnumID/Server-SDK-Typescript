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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9oZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDZCQUFvQztBQUVwQzs7O0dBR0c7QUFDVSxRQUFBLE9BQU8sR0FBRztJQUNyQixPQUFPLENBQUMsU0FBTSxFQUFFLENBQUMsQ0FBQztBQUNwQixDQUFDLENBQUM7QUFFRjs7O0dBR0c7QUFDVSxRQUFBLGNBQWMsR0FBRyxVQUFDLEtBQVk7SUFDekMsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQUMsV0FBVyxFQUFFLEtBQUssSUFBSyxPQUFBLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQXpCLENBQXlCLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDN0UsQ0FBQyxDQUFDO0FBRUY7Ozs7R0FJRztBQUNVLFFBQUEsWUFBWSxHQUFHLFVBQUMsS0FBVTtJQUNyQyxvRUFBb0U7SUFDcEUsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsRCxDQUFDLENBQUM7QUFFRjs7OztHQUlHO0FBQ1UsUUFBQSxlQUFlLEdBQUcsVUFBQyxLQUFVO0lBQ3hDLE9BQU8sQ0FBQyxvQkFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzlCLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgdjQgYXMgdXVpZHY0IH0gZnJvbSAndXVpZCc7XG5cbi8qKlxuICogR2VuZXJhdGUgYSB1dWlkLlxuICogQHJldHVybnMgdXVpZFxuICovXG5leHBvcnQgY29uc3QgZ2V0VVVJRCA9ICgpOiBzdHJpbmcgPT4ge1xuICByZXR1cm4gKHV1aWR2NCgpKTtcbn07XG5cbi8qKlxuICogRmxhdHRlbnMgMkQgYXJyYXlzLCBbW10sW10sXSBpbnRvIG9uZSBhcnJheSwgW11cbiAqIHJlZjogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTY1NDQ1NzIvZmxhdHRlbi1hcnJheS1vZi1hcnJheXMtaW4tdHlwZXNjcmlwdFxuICovXG5leHBvcnQgY29uc3QgZmxhdHRlbjJEQXJyYXkgPSAoaW5wdXQ6IGFueVtdKTogYW55W10gPT4ge1xuICByZXR1cm4gaW5wdXQucmVkdWNlKChhY2N1bXVsYXRvciwgdmFsdWUpID0+IGFjY3VtdWxhdG9yLmNvbmNhdCh2YWx1ZSksIFtdKTtcbn07XG5cbi8qKlxuICogQ2hlY2tzIGlmIGFuIGFycmF5IGlzOiB1bmRlZmluZWQsIG51bGwsIGVtcHR5LCBvciBpcyBub3QgYW4gYXJyYXkuXG4gKiBAcGFyYW0gaW5wdXQgYW55XG4gKiBAcmV0dXJucyBib29sZWFuXG4gKi9cbmV4cG9ydCBjb25zdCBpc0FycmF5RW1wdHkgPSAoaW5wdXQ6IGFueSk6IGJvb2xlYW4gPT4ge1xuICAvLyByZXR1cm4gdHJ1ZSBpZiBhcnJheSBkb2VzIG5vdCBleGlzdCwgaXMgbm90IGFuIGFycmF5LCBvciBpcyBlbXB0eVxuICByZXR1cm4gKCFBcnJheS5pc0FycmF5KGlucHV0KSB8fCAhaW5wdXQubGVuZ3RoKTtcbn07XG5cbi8qKlxuICogQ2hlY2tzIGlmIGFuIGFycmF5IGlzIG5vdDogdW5kZWZpbmVkLCBudWxsLCBlbXB0eSwgb3IgaXMgbm90IGFuIGFycmF5LlxuICogQHBhcmFtIGlucHV0IGFueVxuICogQHJldHVybnMgYm9vbGVhblxuICovXG5leHBvcnQgY29uc3QgaXNBcnJheU5vdEVtcHR5ID0gKGlucHV0OiBhbnkpOiBib29sZWFuID0+IHtcbiAgcmV0dXJuICFpc0FycmF5RW1wdHkoaW5wdXQpO1xufTtcbiJdfQ==