"use strict";
// import express from 'express';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustError = void 0;
/**
 * Class to encapsulate custom errors.
 */
var CustError = /** @class */ (function (_super) {
    __extends(CustError, _super);
    function CustError(code, message) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message) || this;
        _this.code = code;
        // see: typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
        Object.setPrototypeOf(_this, _newTarget.prototype); // restore prototype chain
        _this.name = CustError.name; // stack traces display correctly now
        return _this;
    }
    return CustError;
}(Error));
exports.CustError = CustError;
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
//# sourceMappingURL=error.js.map