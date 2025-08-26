
import { createClient } from '@sanity/client';

export function getSanityClient() {
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2025-07-06',
    useCdn: process.env.NODE_ENV === 'production',
  });
}
