// web-frontend/src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { SanityClient } from '@sanity/client';      // ★ NEW

/*─────────────────────────────────────────────────────────────
  Lazy, singleton Sanity client                              */
let clientPromise: Promise<SanityClient> | null = null;     // ★ CHANGED

async function getClient(): Promise<SanityClient> {         // ★ CHANGED
  if (!clientPromise) {
    clientPromise = import('@/lib/sanityClient').then((m) =>
      m.getSanityClient()
    );
  }
  return clientPromise;
}
/*─────────────────────────────────────────────────────────────*/

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim().toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json([], { status: 400 });
  }

  try {
    const client = await getClient();                       // type OK
    const products = await client.fetch(
      `*[_type == "product" &&
         (name match $search || category->title match $search)]{
           _id,
           name,
           "slug": slug.current,
           "category": category->title
       }`,
      { search: `*${q}*` }
    );

    return NextResponse.json(products);
  } catch (err) {
    console.error('Search API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
