import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

export async function POST(request: NextRequest) {
  try {
    const { id, email, name } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await sanityClient.createOrReplace({
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