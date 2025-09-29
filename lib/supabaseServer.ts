import { createClient } from '@supabase/supabase-js';

export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  const key = process.env.SUPABASE_SERVICE_ROLE as string | undefined;
  if (!url || !key) throw new Error('Supabase env vars not set');
  return createClient(url, key, { auth: { persistSession: false } });
}

