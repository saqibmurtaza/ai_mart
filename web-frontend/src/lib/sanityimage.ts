import imageUrlBuilder from '@sanity/image-url'
import { createClient } from 'next-sanity'

const sanityClient = createClient({
  projectId: 'fb3pwyau', 
  dataset: 'production',
  useCdn: true,
  apiVersion: '2023-01-01',
})

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: any) {
  return builder.image(source)
}
