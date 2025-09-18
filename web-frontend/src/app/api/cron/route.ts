import { supabase } from '@/lib/supabase'; // Adjust the import path as necessary, ensure it points to your supabase client
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // This is the keep-alive query
    // It selects a single row from an existing table to create activity
    const { data, error } = await supabase
      .from('test_ping_table')
      .select('health')
      .limit(1);

    if (error) {
      throw error;
    }

    console.log('Supabase ping successful:', data);
    return NextResponse.json({ message: 'Cron job executed successfully!' });
  } catch (error) {
    console.error('Supabase ping failed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

