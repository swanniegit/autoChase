"use client";
import { useEffect, useMemo, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function AuthStatus() {
  const [email, setEmail] = useState<string | null>(null);
  const supabase = useMemo(() => {
    try { return supabaseClient(); } catch { return null as any; }
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
      if (data.user) {
        // Ensure profile exists with workspace_id = user.id
        await supabase.from('ac_profiles').upsert(
          { user_id: data.user.id, workspace_id: data.user.id },
          { onConflict: 'user_id' },
        );
      }
    };
    run();
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      setEmail(session?.user?.email ?? null);
      if (session?.user) {
        await supabase.from('ac_profiles').upsert(
          { user_id: session.user.id, workspace_id: session.user.id },
          { onConflict: 'user_id' },
        );
      }
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  return email ? (
    <button
      onClick={async () => { await supabase.auth.signOut(); }}
      className="ml-2 text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-50"
      title={email || ''}
    >
      Logout
    </button>
  ) : (
    <Link href="/auth/login" className="ml-2 text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-50">Login</Link>
  );
}
