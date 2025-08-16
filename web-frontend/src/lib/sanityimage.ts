import imageUrlBuilder from '@sanity/image-url'
import { createClient } from 'next-sanity'

const sanityClient = createClient({
  projectId: 'fb3pwyau', 
  dataset: 'production',
  useCdn: true,
  apiVersion: '2025-07-06',
})

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: any) {
  return builder.image(source)
}
