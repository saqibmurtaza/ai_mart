import { createClient, type SanityClient } from '@sanity/client';

/*  ❯❯  Singleton – initialise once, reuse everywhere  */
let client: SanityClient | null = null;

export function getSanityClient(): SanityClient {
  if (!client) {
    client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
      dataset:    process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2025-07-06',
      useCdn:     process.env.NODE_ENV === 'production',
    });
  }
  return client;
}
