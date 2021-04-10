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
