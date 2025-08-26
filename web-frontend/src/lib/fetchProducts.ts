/* Lazy helper that loads @sanity/client only when you call fetchProducts().
   This keeps 500 kB of Sanity + RxJS code out of the first-load bundle. */

export async function fetchProducts<QueryResult = unknown>(
  query: string,
  params: Record<string, unknown> = {},
) {
  // Dynamic import = separate chunk, excluded from main bundle
  const { getSanityClient } = await import('./sanityClient');
  const client = getSanityClient();
  return client.fetch<QueryResult>(query, params);
}
