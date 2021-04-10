
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a uuid.
 * @returns uuid
 */
export const getUUID = (): string => {
  return (uuidv4());
};

/**
 * Flattens 2D arrays, [[],[],] into one array, []
 * ref: https://stackoverflow.com/questions/56544572/flatten-array-of-arrays-in-typescript
 */
export const flatten2DArray = (input: any[]): any[] => {
  return input.reduce((accumulator, value) => accumulator.concat(value), []);
};

/**
 * Checks if an array is: undefined, null, empty, or is not an array.
 * @param input any
 * @returns boolean
 */
export const isArrayEmpty = (input: any): boolean => {
  // return true if array does not exist, is not an array, or is empty
  return (!Array.isArray(input) || !input.length);
};

/**
 * Checks if an array is not: undefined, null, empty, or is not an array.
 * @param input any
 * @returns boolean
 */
export const isArrayNotEmpty = (input: any): boolean => {
  return !isArrayEmpty(input);
};
