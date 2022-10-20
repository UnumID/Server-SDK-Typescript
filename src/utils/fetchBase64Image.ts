import fetch from 'node-fetch';
/**
 * Fetch url image and encode to a base64 string
 *
 * ref: https://stackoverflow.com/a/67629456/2631728
 * @param url
 * @returns
 */
export async function fetchBase64Image (url: string): Promise<string> {
//   const response = await fetch(url);

  //   if (!response.body) {
  //     throw new Error(`Failed to fetch image from ${url}`);
  //   }

  //   const buffer = Buffer.from(response.body).toString('base64');
  //   return buffer;
  //   const result = await fetch(url).then(r => r.arrayBuffer()).then(buf => `data:image/${r.headers.get('content-type')};base64,` + buf.toString('base64'));
  //   return result;
  try {
    const imageUrlData = await fetch(url);
    const buffer = await imageUrlData.arrayBuffer();
    const stringifiedBuffer = Buffer.from(buffer).toString('base64');
    const contentType = imageUrlData.headers.get('content-type');
    const imageBas64 = `data:image/${contentType};base64,${stringifiedBuffer}`;
    return imageBas64;
  } catch (e) {
    throw new Error(`Failed to fetch image from ${url}`);
  }

  return url;
}
