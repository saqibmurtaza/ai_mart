import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');
  const returnTo = searchParams.get('return_to') || '/products'; // Default to /products

  if (!provider || !['google', 'facebook', 'github'].includes(provider)) {
    return new Response(JSON.stringify({ error: 'Invalid or missing provider' }), { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ error: 'Supabase configuration missing' }), { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as 'google' | 'facebook' | 'github',
    options: {
      redirectTo: `http://localhost:3000${returnTo}`,
    },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}