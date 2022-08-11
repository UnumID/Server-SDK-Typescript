"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertCredentialSubject = void 0;
var lodash_1 = require("lodash");
var error_1 = require("./error");
/**
 * Handler to convert the JSON representation of the CredentialSubject into a Typescript interface, CredentialSubject
 */
exports.convertCredentialSubject = function (input) {
    if (typeof input !== 'string') {
        throw new error_1.CustError(400, "CredentialSubject is not a string: " + input);
    }
    var obj = JSON.parse(input);
    var claims = lodash_1.omit(obj, 'id');
    var result = __assign({ id: obj.id }, claims);
    return result;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udmVydENyZWRlbnRpYWxTdWJqZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2NvbnZlcnRDcmVkZW50aWFsU3ViamVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUVBLGlDQUE4QjtBQUM5QixpQ0FBb0M7QUFFcEM7O0dBRUc7QUFDVSxRQUFBLHdCQUF3QixHQUFHLFVBQUMsS0FBYTtJQUNwRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUM3QixNQUFNLElBQUksaUJBQVMsQ0FBQyxHQUFHLEVBQUUsd0NBQXNDLEtBQU8sQ0FBQyxDQUFDO0tBQ3pFO0lBRUQsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5QixJQUFNLE1BQU0sR0FBRyxhQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRS9CLElBQU0sTUFBTSxjQUNWLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUNQLE1BQU0sQ0FDVixDQUFDO0lBRUYsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyBDcmVkZW50aWFsU3ViamVjdCB9IGZyb20gJ0B1bnVtaWQvdHlwZXMnO1xuaW1wb3J0IHsgb21pdCB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBDdXN0RXJyb3IgfSBmcm9tICcuL2Vycm9yJztcblxuLyoqXG4gKiBIYW5kbGVyIHRvIGNvbnZlcnQgdGhlIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIENyZWRlbnRpYWxTdWJqZWN0IGludG8gYSBUeXBlc2NyaXB0IGludGVyZmFjZSwgQ3JlZGVudGlhbFN1YmplY3RcbiAqL1xuZXhwb3J0IGNvbnN0IGNvbnZlcnRDcmVkZW50aWFsU3ViamVjdCA9IChpbnB1dDogc3RyaW5nKTogQ3JlZGVudGlhbFN1YmplY3QgPT4ge1xuICBpZiAodHlwZW9mIGlucHV0ICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCBgQ3JlZGVudGlhbFN1YmplY3QgaXMgbm90IGEgc3RyaW5nOiAke2lucHV0fWApO1xuICB9XG5cbiAgY29uc3Qgb2JqID0gSlNPTi5wYXJzZShpbnB1dCk7XG4gIGNvbnN0IGNsYWltcyA9IG9taXQob2JqLCAnaWQnKTtcblxuICBjb25zdCByZXN1bHQ6IENyZWRlbnRpYWxTdWJqZWN0ID0ge1xuICAgIGlkOiBvYmouaWQsXG4gICAgLi4uY2xhaW1zXG4gIH07XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG4iXX0=