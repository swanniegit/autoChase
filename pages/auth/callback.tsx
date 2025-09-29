"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabaseClient } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const supabase = supabaseClient();
      try {
        const url = window.location.href;
        const hasCode = /[?&]code=/.test(url);
        if (hasCode) {
          const anyAuth: any = supabase.auth as any;
          if (typeof anyAuth.exchangeCodeForSession === 'function') {
            await anyAuth.exchangeCodeForSession({ currentUrl: url });
          } else if (typeof anyAuth.getSessionFromUrl === 'function') {
            await anyAuth.getSessionFromUrl({ storeSession: true });
          }
        }
      } catch (err) {
        // noop; show a simple message or rely on login screen
      } finally {
        const next = (router.query.next as string) || '/autochase';
        router.replace(next);
      }
    };
    // Wait for router to be ready to read query params
    if (router.isReady) run();
  }, [router]);

  return (
    <div className="max-w-md">
      <p className="text-sm text-slate-600">Signing you in with Google…</p>
    </div>
  );
}

