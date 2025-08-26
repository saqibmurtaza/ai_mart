// web-frontend/src/app/api/sync-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { SanityClient } from '@sanity/client';

/* lazy singleton – loads @sanity/client only once per server instance */
let clientPromise: Promise<SanityClient> | null = null;
const getClient = async () => {
  if (!clientPromise) {
    clientPromise = import('@/lib/sanityClient').then((m) => m.getSanityClient());
  }
  return clientPromise;
};

export async function POST(request: NextRequest) {
  try {
    const { id, email, name } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const client = await getClient();                 // lazy-loaded
    await client.createOrReplace({
      _type: 'user',
      _id: id,
      supabaseId: id,
      email,
      name,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error syncing user to Sanity:', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}
