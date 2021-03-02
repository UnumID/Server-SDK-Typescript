"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCredentialExpired = void 0;
/**
 * Helper to assess the expiration status of a credential.
 * @param credential VerifiableCredential
 */
exports.isCredentialExpired = function (credential) {
    var expirationDate = credential.expirationDate;
    if (!expirationDate) {
        return false;
    }
    return new Date(expirationDate).getTime() < new Date().getTime();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNDcmVkZW50aWFsRXhwaXJlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92ZXJpZmllci9pc0NyZWRlbnRpYWxFeHBpcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBOzs7R0FHRztBQUNVLFFBQUEsbUJBQW1CLEdBQUcsVUFBQyxVQUFnQztJQUMxRCxJQUFBLGNBQWMsR0FBSyxVQUFVLGVBQWYsQ0FBZ0I7SUFFdEMsSUFBSSxDQUFDLGNBQWMsRUFBRTtRQUNuQixPQUFPLEtBQUssQ0FBQztLQUNkO0lBRUQsT0FBTyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ25FLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFZlcmlmaWFibGVDcmVkZW50aWFsIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG4vKipcbiAqIEhlbHBlciB0byBhc3Nlc3MgdGhlIGV4cGlyYXRpb24gc3RhdHVzIG9mIGEgY3JlZGVudGlhbC5cbiAqIEBwYXJhbSBjcmVkZW50aWFsIFZlcmlmaWFibGVDcmVkZW50aWFsXG4gKi9cbmV4cG9ydCBjb25zdCBpc0NyZWRlbnRpYWxFeHBpcmVkID0gKGNyZWRlbnRpYWw6IFZlcmlmaWFibGVDcmVkZW50aWFsKTogYm9vbGVhbiA9PiB7XG4gIGNvbnN0IHsgZXhwaXJhdGlvbkRhdGUgfSA9IGNyZWRlbnRpYWw7XG5cbiAgaWYgKCFleHBpcmF0aW9uRGF0ZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBuZXcgRGF0ZShleHBpcmF0aW9uRGF0ZSkuZ2V0VGltZSgpIDwgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG59O1xuIl19