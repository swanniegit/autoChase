"use client";
import { useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import Button from '@/components/ui/button';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const next = (router.query.next as string) || '/autochase';
  const [email, setEmail] = useState('you@company.com');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = supabaseClient();
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
      if (error) setError(error.message); else setSent(true);
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = supabaseClient();
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
      if (error) { setError(error.message); return; }
      router.replace(next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      <div>
        <Button
          type="button"
          onClick={async () => {
            setError(null);
            const supabase = supabaseClient();
            const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
            const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo },
            });
            if (error) setError(error.message);
          }}
        >
          Continue with Google
        </Button>
      </div>
      <p className="text-sm text-slate-600">Enter your email to receive a 6‑digit code.</p>
      <div className="grid gap-2">
        <label className="text-sm text-slate-700">Email</label>
        <input className="border border-slate-300 rounded-md px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="flex gap-2 items-center">
        <Button onClick={send} disabled={loading}>{loading ? 'Sending…' : 'Send code'}</Button>
        {sent && <span className="text-sm text-green-700">Code sent! Check your email.</span>}
        {error && <span className="text-sm text-red-700">{error}</span>}
      </div>

      {sent && (
        <div className="space-y-3">
          <div className="grid gap-2">
            <label className="text-sm text-slate-700">6‑digit code</label>
            <input className="border border-slate-300 rounded-md px-3 py-2 tracking-widest uppercase" value={code} onChange={(e) => setCode(e.target.value.trim())} placeholder="123456" />
          </div>
          <div className="flex gap-2 items-center">
            <Button onClick={verify} disabled={loading || code.length < 4}>{loading ? 'Verifying…' : 'Verify & login'}</Button>
            <Button variant="outline" onClick={send} disabled={loading}>Resend code</Button>
          </div>
        </div>
      )}
    </div>
  );
}
