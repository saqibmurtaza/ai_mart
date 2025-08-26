export async function fetchProducts<QueryResult = unknown>(
  query: string,
  params: Record<string, unknown> = {},
) {

  const { getSanityClient } = await import('./sanityClient');
  const client = getSanityClient();
  return client.fetch<QueryResult>(query, params);
}
