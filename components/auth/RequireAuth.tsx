"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabaseClient } from '@/lib/supabaseClient';

export default function RequireAuth() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const run = async () => {
      let sb;
      try { sb = supabaseClient(); } catch { router.replace('/auth/login'); return; }
      const { data } = await sb.auth.getUser();
      if (!data.user) {
        const next = encodeURIComponent(router.asPath || '/autochase');
        router.replace(`/auth/login?next=${next}`);
      } else {
        setChecked(true);
      }
    };
    run();
  }, [router]);

  if (!checked) return null;
  return null;
}
