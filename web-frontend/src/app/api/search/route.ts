// web-frontend/src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim().toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json([], { status: 400 });
  }

  try {
    const products = await sanityClient.fetch(
      `*[_type == "product" && (name match $search || category->title match $search)]{
        _id,
        name,
        "slug": slug.current,
        "category": category->title  // ✅ resolve reference
      }`,
      { search: `*${q}*` }
    );

    return NextResponse.json(products);
  } catch (err) {
    console.error('Search API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
