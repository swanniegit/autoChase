import { useMemo, useState } from 'react';
import Button from '@/components/ui/button';

export default function Checkout() {
  const [plan, setPlan] = useState<'starter' | 'pro' | 'business'>('starter');
  const [email, setEmail] = useState('you@company.com');

  const submit = () => {
    fetch('/api/payfast/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, email }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error('PayFast not configured');
        return r.json();
      })
      .then(({ action, fields }) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = action;
        Object.entries(fields).forEach(([k, v]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = k;
          input.value = String(v);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      })
      .catch((e) => alert(e.message));
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold">Subscribe to AutoChase</h1>
      <div className="card-base p-4 space-y-3">
        <div className="grid gap-2">
          <label className="text-sm text-slate-700">Email</label>
          <input className="border border-slate-300 rounded-md px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          {[
            { id: 'starter', label: 'Starter — R 100 / mo' },
            { id: 'pro', label: 'Pro — R 200 / mo' },
            { id: 'business', label: 'Business — R 400 / mo' },
          ].map((p) => (
            <label key={p.id} className="flex items-center gap-3 border border-slate-200 rounded-md p-3">
              <input type="radio" name="plan" checked={plan === (p.id as any)} onChange={() => setPlan(p.id as any)} />
              <div className="font-medium">{p.label}</div>
            </label>
          ))}
        </div>
        <div>
          <Button onClick={submit}>Pay with PayFast</Button>
        </div>
        <p className="text-xs text-slate-500">You will be redirected to PayFast to complete your subscription.</p>
      </div>
    </div>
  );
}
