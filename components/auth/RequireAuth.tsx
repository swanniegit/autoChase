"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

export default function RequireAuth() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getUser();
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

