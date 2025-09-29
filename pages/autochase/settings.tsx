import { useEffect, useState } from 'react';
import Button from '@/components/ui/button';
import type { PlanId, Settings as TSettings } from '@/lib/types';
import { getSettingsCloud, setSettingsCloud } from '@/lib/data';
import dynamic from 'next/dynamic';
const RequireAuth = dynamic(() => import('@/components/auth/RequireAuth'), { ssr: false });

export default function Settings() {
  const [settings, set] = useState<TSettings | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  useEffect(() => {
    getSettingsCloud().then(set).catch(() => setNeedLogin(true));
  }, []);

  const onChange = (patch: Partial<TSettings>) => settings && set({ ...settings, ...patch });
  const save = () => {
    if (!settings) return;
    setSettingsCloud(settings);
    alert('Saved');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <RequireAuth />
      <h1 className="text-2xl font-semibold">Settings</h1>

      {!settings && needLogin && (
        <div className="card-base p-6 text-slate-700">Please <a className="underline" href="/auth/login">log in</a> to manage cloud settings.</div>
      )}

      {settings && (<section className="card-base p-4 space-y-3">
        <h2 className="font-medium">Email</h2>
        <div className="grid gap-2">
          <label className="text-sm text-slate-700">Sender address</label>
          <input className="border border-slate-300 rounded-md px-3 py-2" value={settings.sender} onChange={(e) => onChange({ sender: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-700">Subject</label>
          <input className="border border-slate-300 rounded-md px-3 py-2" value={settings.subject} onChange={(e) => onChange({ subject: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-700">Message</label>
          <textarea className="border border-slate-300 rounded-md px-3 py-2 h-40" value={settings.body} onChange={(e) => onChange({ body: e.target.value })} />
        </div>
        <div>
          <Button onClick={save}>Save</Button>
        </div>
      </section>)}

      {settings && (<section className="card-base p-4 space-y-3">
        <h2 className="font-medium">Automation Rules</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Text label="Before due days (comma separated)" value={settings.rules.beforeDays.join(',')} onChange={(v) => onChange({ rules: { ...settings.rules, beforeDays: csvNums(v) } })} />
          <Checkbox label="On due date" checked={settings.rules.onDue} onChange={(v) => onChange({ rules: { ...settings.rules, onDue: v } })} />
          <Text label="After due days (comma separated)" value={settings.rules.afterDays.join(',')} onChange={(v) => onChange({ rules: { ...settings.rules, afterDays: csvNums(v) } })} />
          <Checkbox label="Weekdays only" checked={settings.rules.weekdaysOnly} onChange={(v) => onChange({ rules: { ...settings.rules, weekdaysOnly: v } })} />
        </div>
      </section>)}

      {settings && (<section className="card-base p-4 space-y-3">
        <h2 className="font-medium">Brand & Payment</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Text label="Business name" value={settings.businessName || ''} onChange={(v) => onChange({ businessName: v })} />
          <Text label="Payment link template" value={settings.paymentLinkTemplate || ''} onChange={(v) => onChange({ paymentLinkTemplate: v })} placeholder="https://pay.example.com/{{invoiceNumber}}" />
        </div>
      </section>)}

      {settings && (<section className="card-base p-4 space-y-3">
        <h2 className="font-medium">Plan</h2>
        <PlanSelector value={settings.plan || 'starter'} onChange={(p) => onChange({ plan: p })} />
      </section>)}
    </div>
  );
}

function Text({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-slate-700">{label}</span>
      <input className="border border-slate-300 rounded-md px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
      <input type="checkbox" className="h-4 w-4" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function PlanSelector({ value, onChange }: { value: PlanId; onChange: (v: PlanId) => void }) {
  const plans: { id: PlanId; label: string; desc: string }[] = [
    { id: 'starter', label: 'Starter — R 100 / mo', desc: 'Up to 50 reminders' },
    { id: 'pro', label: 'Pro — R 200 / mo', desc: 'Up to 250 reminders' },
    { id: 'business', label: 'Business — R 400 / mo', desc: 'Unlimited' },
  ];
  return (
    <div className="space-y-2">
      {plans.map((p) => (
        <label key={p.id} className="flex items-center gap-3 border border-slate-200 rounded-md p-3">
          <input type="radio" name="plan" checked={value === p.id} onChange={() => onChange(p.id)} />
          <div>
            <div className="font-medium">{p.label}</div>
            <div className="text-sm text-slate-600">{p.desc}</div>
          </div>
        </label>
      ))}
    </div>
  );
}

function csvNums(v: string): number[] {
  return v
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 0);
}
