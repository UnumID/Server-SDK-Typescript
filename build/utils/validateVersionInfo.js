"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateVersionInfo = void 0;
var semver_1 = require("semver");
var __1 = require("..");
/**
 * Validate version info.
 * @param versionInfo
 */
function validateVersionInfo(versionInfoList) {
    versionInfoList.forEach(function (versionInfo, index) {
        if (!versionInfo.target) {
            throw new __1.CustError(400, "'versionInfo[" + index + "].target' must be defined.");
        }
        if (!versionInfo.target.version && !versionInfo.target.url) {
            throw new __1.CustError(400, "'versionInfo[" + index + "].target.version' or 'versionInfo[" + index + "].target.url' must be defined.");
        }
        if (versionInfo.target.version) {
            if (!semver_1.valid(versionInfo.target.version)) {
                throw new __1.CustError(400, "'versionInfo[" + index + "].target.version' must be valid semver notation.");
            }
        }
        if (!semver_1.valid(versionInfo.sdkVersion)) {
            throw new __1.CustError(400, "'versionInfo[" + index + "].sdkVersion' must be valid semver notation.");
        }
    });
}
exports.validateVersionInfo = validateVersionInfo;
//# sourceMappingURL=validateVersionInfo.js.map