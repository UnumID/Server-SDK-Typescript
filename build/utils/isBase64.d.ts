/**
 * Utility to determine if the string is a base64 encoded image.
 *
 * ref: https://github.com/miguelmota/is-base64/blob/master/is-base64.js
 * @param str
 * @param opts
 * @returns
 */
export declare function isBase64(str: string, opts: {
    allowEmpty?: boolean;
    mimeRequired?: boolean;
    allowMime?: boolean;
    paddingRequired?: boolean;
}): boolean;
export declare function isBase64Image(str: string): boolean;
//# sourceMappingURL=isBase64.d.ts.map