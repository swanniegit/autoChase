"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Button from '@/components/ui/button';

export default function Login() {
  const [email, setEmail] = useState('you@company.com');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/autochase` } });
    if (error) setError(error.message); else setSent(true);
  };

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="text-sm text-slate-600">Magic link login — check your email after submitting.</p>
      <div className="grid gap-2">
        <label className="text-sm text-slate-700">Email</label>
        <input className="border border-slate-300 rounded-md px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="flex gap-2 items-center">
        <Button onClick={send}>Send magic link</Button>
        {sent && <span className="text-sm text-green-700">Sent! Check your email.</span>}
        {error && <span className="text-sm text-red-700">{error}</span>}
      </div>
    </div>
  );
}

