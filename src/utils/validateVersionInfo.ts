import { VersionInfo } from '@unumid/types';
import { valid } from 'semver';
import { CustError } from '..';

/**
 * Validate version info.
 * @param versionInfo
 */
export function validateVersionInfo (versionInfoList: VersionInfo[]): void {
  versionInfoList.forEach((versionInfo, index: number) => {
    if (!versionInfo.target) {
      throw new CustError(400, `'versionInfo[${index}].target' must be defined.`);
    }

    if (!versionInfo.target.version && !versionInfo.target.url) {
      throw new CustError(400, `'versionInfo[${index}].target.version' or 'versionInfo[${index}].target.url' must be defined.`);
    }

    if (versionInfo.target.version) {
      if (!valid(versionInfo.target.version)) {
        throw new CustError(400, `'versionInfo[${index}].target.version' must be valid semver notation.`);
      }
    }

    if (!valid(versionInfo.sdkVersion)) {
      throw new CustError(400, `'versionInfo[${index}].sdkVersion' must be valid semver notation.`);
    }
  });
}
