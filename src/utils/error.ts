// import express from 'express';

/**
 * Class to encapsulate custom errors.
 */
export class CustError extends Error {
  code: number; // place holder if want to codify the errors

  constructor (code: number, message: string) {
    super(message);
    this.code = code;

    // see: typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    this.name = CustError.name; // stack traces display correctly now
  }
}

// /**
//  * Handle formatting the error response.
//  * Note: `statusCode` attribute is similar to `status` but leveraged in a secondary manner as it is currently only used for request error handling.
//  * DEPRECATED: now that this library is being used in a SDK fashion.
//  * @param err
//  * @param res
//  */
// export const customErrFormatter = (err: CustError, res: express.Response): void => {
//   const { code, message } = err;

//   if (code) {
//     res.status(code).json({
//       status: 'error',
//       code,
//       message
//     });
//   } else {
//     res.status(400).json({
//       status: 'external error',
//       code: 400,
//       message
//     });
//   }
// };
