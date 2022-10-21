import { CredentialData } from '@unumid/types';
import { CustError } from './error';
import { fetchBase64Image } from './fetchBase64Image';
import { isBase64Image } from './isBase64';
import { isValidUrl } from './isValidUrl';

/**
 * Helper to handle image credential data.
 * Note: the credential schema by credential type should have been confirmed by this point.
 * @param data
 * @returns
 * @throws CustError
 */
export async function handleImageCredentialData (data: CredentialData): Promise<CredentialData> {
  // check that data.image is in base64 encoding, if not then format as such
  // we know that this credential has a key of image thanks to the schema
  const image = data.image as string;

  if (!isBase64Image(image)) {
    // need to check if value contains a url, if so we must grab the image and convert to base64
    if (isValidUrl(image)) {
      // fetch image from url and convert to base64
      const base64Image = await fetchBase64Image(image);
      return { ...data, image: base64Image };
    } else {
      throw new CustError(400, `Invalid ${data.type} image data`);
    }
  }

  return data;
}
