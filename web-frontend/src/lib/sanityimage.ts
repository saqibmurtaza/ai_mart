import imageUrlBuilder from '@sanity/image-url';
import type { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder';   // no <T>
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

import { getSanityClient } from './sanityClient';

/* singleton builder – initialised once per server instance */
let builder: ImageUrlBuilder | null = null;
function getBuilder(): ImageUrlBuilder {
  if (!builder) builder = imageUrlBuilder(getSanityClient());
  return builder;
}

export function urlFor(source: SanityImageSource) {
  return getBuilder().image(source);
}
