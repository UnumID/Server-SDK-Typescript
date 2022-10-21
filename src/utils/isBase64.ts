
/**
 * Utility to determine if the string is a base64 encoded image.
 *
 * ref: https://github.com/miguelmota/is-base64/blob/master/is-base64.js
 * @param str
 * @param opts
 * @returns
 */
export function isBase64 (str: string, opts: {allowEmpty?: boolean, mimeRequired?: boolean, allowMime?:boolean, paddingRequired?:boolean}): boolean {
  if (typeof str === 'boolean') {
    return false;
  }

  if (!(opts instanceof Object)) {
    opts = {};
  }

  if (opts.allowEmpty === false && str === '') {
    return false;
  }

  let regex = '(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+\\/]{3}=)?';
  const mimeRegex = '(data:\\w+\\/[a-zA-Z\\+\\-\\.]+;base64,)';

  if (opts.mimeRequired === true) {
    regex = mimeRegex + regex;
  } else if (opts.allowMime === true) {
    regex = mimeRegex + '?' + regex;
  }

  if (opts.paddingRequired === false) {
    regex = '(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}(==)?|[A-Za-z0-9+\\/]{3}=?)?';
  }

  return (new RegExp('^' + regex + '$', 'gi')).test(str);
}

export function isBase64Image (str:string) : boolean {
  return isBase64(str, { mimeRequired: true });
}
