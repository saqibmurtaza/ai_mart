import { createClient, type SanityClient } from "@sanity/client";

let client: SanityClient | null = null;

export function getSanityClient(): SanityClient {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  

  if (!projectId) {
    throw new Error("SANITY_PROJECT_ID is missing in environment variables");
  }

  if (!client) {
    client = createClient({
      projectId,
      dataset,
      apiVersion: "2025-07-06",
      useCdn: process.env.NODE_ENV === "production",
    });
  }
  return client;
}
