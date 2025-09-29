import { useEffect, useState } from 'react';
import Button from '@/components/ui/button';
import { scheduleReminders } from '@/lib/scheduler';
import type { Reminder } from '@/lib/types';
import { listInvoices, getSettingsCloud, listOutbox, replaceOutbox } from '@/lib/data';
import { getPlanLimit } from '@/lib/plans';
import dynamic from 'next/dynamic';

const RequireAuth = dynamic(() => import('@/components/auth/RequireAuth'), { ssr: false });

export default function OutboxPage() {
  const [items, setItems] = useState<Reminder[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>();
  const [needLogin, setNeedLogin] = useState(false);

  useEffect(() => {
    Promise.all([listInvoices(), getSettingsCloud(), listOutbox()])
      .then(([inv, s, ob]) => {
        setInvoices(inv);
        setSettings(s);
        setItems(ob);
      })
      .catch(() => setNeedLogin(true));
  }, []);

  const generate = () => {
    if (!settings) return;
    const scheduled = scheduleReminders(invoices, settings);
    const limit = getPlanLimit(settings.plan);
    const limited = limit === 'unlimited' ? scheduled : scheduled.slice(0, limit as number);
    if (limit !== 'unlimited' && scheduled.length > limited.length) {
      alert(`Plan limit reached: showing ${limited.length} of ${scheduled.length} reminders for this period.`);
    }
    setItems(limited);
    replaceOutbox(limited).catch(() => setNeedLogin(true));
  };

  const send = (r: Reminder) => {
    const mailto = `mailto:${encodeURIComponent(r.to)}?subject=${encodeURIComponent(r.subject)}&body=${encodeURIComponent(r.body)}`;
    window.open(mailto, '_blank');
    const next = items.map((it) => (it.id === r.id ? { ...it, sentAt: new Date().toISOString() } : it));
    setItems(next);
    replaceOutbox(next).catch(() => setNeedLogin(true));
  };

  return (
    <div className="space-y-6">
      <RequireAuth />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Outbox</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generate}>Generate Reminders</Button>
        </div>
      </div>

      {needLogin ? (
        <div className="card-base p-6 text-slate-700">Please <a className="underline" href="/auth/login">log in</a> to use the cloud outbox.</div>
      ) : (
        <UsageMeter count={items.filter((i) => !i.sentAt).length} />
      )}

      <div className="card-base overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-600">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">To</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t border-slate-200">
                <td className="p-3">{new Date(i.when).toLocaleString()}</td>
                <td className="p-3">{i.to}</td>
                <td className="p-3">{i.subject}</td>
                <td className="p-3">{i.sentAt ? `Sent ${new Date(i.sentAt).toLocaleString()}` : 'Scheduled'}</td>
                <td className="p-3 text-right">
                  {!i.sentAt && (
                    <Button size="sm" onClick={() => send(i)}>Send now</Button>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="p-6 text-slate-500" colSpan={5}>No reminders in outbox. Click Generate to create from invoices and rules.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsageMeter({ count }: { count: number }) {
  const [plan, setPlan] = useState<'starter' | 'pro' | 'business' | undefined>();
  useEffect(() => { getSettingsCloud().then((s) => setPlan(s.plan)); }, []);
  const limit = getPlanLimit(plan as any);
  if (limit === 'unlimited') {
    return (
      <div className="card-base p-4 text-sm text-slate-700">Plan: Business — Unlimited reminders</div>
    );
  }
  const pct = Math.min(100, Math.round((count / (typeof limit === 'number' ? limit : 1)) * 100));
  return (
    <div className="card-base p-4 space-y-2">
      <div className="flex justify-between text-sm text-slate-700">
        <span>Plan: {plan} — {limit} reminders</span>
        <span>{count}/{String(limit)} used</span>
      </div>
      <div className="h-2 bg-slate-100 rounded">
        <div className={`h-2 rounded ${pct < 80 ? 'bg-green-500' : pct < 100 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

