/**
 * Flattens 2D arrays, [[],[],] into one array, []
 * ref: https://stackoverflow.com/questions/56544572/flatten-array-of-arrays-in-typescript
 */
export const flatten2DArray = (input: any[]): any[] => {
  return input.reduce((accumulator, value) => accumulator.concat(value), []);
};
