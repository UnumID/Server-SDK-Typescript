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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGVWZXJzaW9uSW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy92YWxpZGF0ZVZlcnNpb25JbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLGlDQUErQjtBQUMvQix3QkFBK0I7QUFFL0I7OztHQUdHO0FBQ0gsU0FBZ0IsbUJBQW1CLENBQUUsZUFBOEI7SUFDakUsZUFBZSxDQUFDLE9BQU8sQ0FBQyxVQUFDLFdBQVcsRUFBRSxLQUFhO1FBQ2pELElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFO1lBQ3ZCLE1BQU0sSUFBSSxhQUFTLENBQUMsR0FBRyxFQUFFLGtCQUFnQixLQUFLLCtCQUE0QixDQUFDLENBQUM7U0FDN0U7UUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTtZQUMxRCxNQUFNLElBQUksYUFBUyxDQUFDLEdBQUcsRUFBRSxrQkFBZ0IsS0FBSywwQ0FBcUMsS0FBSyxtQ0FBZ0MsQ0FBQyxDQUFDO1NBQzNIO1FBRUQsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUM5QixJQUFJLENBQUMsY0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3RDLE1BQU0sSUFBSSxhQUFTLENBQUMsR0FBRyxFQUFFLGtCQUFnQixLQUFLLHFEQUFrRCxDQUFDLENBQUM7YUFDbkc7U0FDRjtRQUVELElBQUksQ0FBQyxjQUFLLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ2xDLE1BQU0sSUFBSSxhQUFTLENBQUMsR0FBRyxFQUFFLGtCQUFnQixLQUFLLGlEQUE4QyxDQUFDLENBQUM7U0FDL0Y7SUFDSCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFwQkQsa0RBb0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmVyc2lvbkluZm8gfSBmcm9tICdAdW51bWlkL3R5cGVzJztcbmltcG9ydCB7IHZhbGlkIH0gZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7IEN1c3RFcnJvciB9IGZyb20gJy4uJztcblxuLyoqXG4gKiBWYWxpZGF0ZSB2ZXJzaW9uIGluZm8uXG4gKiBAcGFyYW0gdmVyc2lvbkluZm9cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlVmVyc2lvbkluZm8gKHZlcnNpb25JbmZvTGlzdDogVmVyc2lvbkluZm9bXSk6IHZvaWQge1xuICB2ZXJzaW9uSW5mb0xpc3QuZm9yRWFjaCgodmVyc2lvbkluZm8sIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICBpZiAoIXZlcnNpb25JbmZvLnRhcmdldCkge1xuICAgICAgdGhyb3cgbmV3IEN1c3RFcnJvcig0MDAsIGAndmVyc2lvbkluZm9bJHtpbmRleH1dLnRhcmdldCcgbXVzdCBiZSBkZWZpbmVkLmApO1xuICAgIH1cblxuICAgIGlmICghdmVyc2lvbkluZm8udGFyZ2V0LnZlcnNpb24gJiYgIXZlcnNpb25JbmZvLnRhcmdldC51cmwpIHtcbiAgICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCBgJ3ZlcnNpb25JbmZvWyR7aW5kZXh9XS50YXJnZXQudmVyc2lvbicgb3IgJ3ZlcnNpb25JbmZvWyR7aW5kZXh9XS50YXJnZXQudXJsJyBtdXN0IGJlIGRlZmluZWQuYCk7XG4gICAgfVxuXG4gICAgaWYgKHZlcnNpb25JbmZvLnRhcmdldC52ZXJzaW9uKSB7XG4gICAgICBpZiAoIXZhbGlkKHZlcnNpb25JbmZvLnRhcmdldC52ZXJzaW9uKSkge1xuICAgICAgICB0aHJvdyBuZXcgQ3VzdEVycm9yKDQwMCwgYCd2ZXJzaW9uSW5mb1ske2luZGV4fV0udGFyZ2V0LnZlcnNpb24nIG11c3QgYmUgdmFsaWQgc2VtdmVyIG5vdGF0aW9uLmApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghdmFsaWQodmVyc2lvbkluZm8uc2RrVmVyc2lvbikpIHtcbiAgICAgIHRocm93IG5ldyBDdXN0RXJyb3IoNDAwLCBgJ3ZlcnNpb25JbmZvWyR7aW5kZXh9XS5zZGtWZXJzaW9uJyBtdXN0IGJlIHZhbGlkIHNlbXZlciBub3RhdGlvbi5gKTtcbiAgICB9XG4gIH0pO1xufVxuIl19