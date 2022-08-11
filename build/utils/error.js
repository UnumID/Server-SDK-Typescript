"use strict";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztHQUVHO0FBQ0g7SUFBK0IsNkJBQUs7SUFHbEMsbUJBQWEsSUFBWSxFQUFFLE9BQWU7O1FBQTFDLFlBQ0Usa0JBQU0sT0FBTyxDQUFDLFNBTWY7UUFMQyxLQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVqQiwwRUFBMEU7UUFDMUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFJLEVBQUUsV0FBVyxTQUFTLENBQUMsQ0FBQyxDQUFDLDBCQUEwQjtRQUM3RSxLQUFJLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxxQ0FBcUM7O0lBQ25FLENBQUM7SUFDSCxnQkFBQztBQUFELENBQUMsQUFYRCxDQUErQixLQUFLLEdBV25DO0FBWFksOEJBQVMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENsYXNzIHRvIGVuY2Fwc3VsYXRlIGN1c3RvbSBlcnJvcnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDdXN0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvZGU6IG51bWJlcjsgLy8gcGxhY2UgaG9sZGVyIGlmIHdhbnQgdG8gY29kaWZ5IHRoZSBlcnJvcnNcblxuICBjb25zdHJ1Y3RvciAoY29kZTogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLmNvZGUgPSBjb2RlO1xuXG4gICAgLy8gc2VlOiB0eXBlc2NyaXB0bGFuZy5vcmcvZG9jcy9oYW5kYm9vay9yZWxlYXNlLW5vdGVzL3R5cGVzY3JpcHQtMi0yLmh0bWxcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgbmV3LnRhcmdldC5wcm90b3R5cGUpOyAvLyByZXN0b3JlIHByb3RvdHlwZSBjaGFpblxuICAgIHRoaXMubmFtZSA9IEN1c3RFcnJvci5uYW1lOyAvLyBzdGFjayB0cmFjZXMgZGlzcGxheSBjb3JyZWN0bHkgbm93XG4gIH1cbn1cbiJdfQ==