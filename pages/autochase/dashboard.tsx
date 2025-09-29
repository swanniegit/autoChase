import Link from 'next/link';
import Button from '@/components/ui/button';
import { useEffect, useMemo, useState } from 'react';
import { getPlanLimit } from '@/lib/plans';
import { interpolate } from '@/lib/scheduler';
import type { Invoice } from '@/lib/types';
import { listInvoices, listOutbox, getSettingsCloud } from '@/lib/data';
import dynamic from 'next/dynamic';
const RequireAuth = dynamic(() => import('@/components/auth/RequireAuth'), { ssr: false });

type Check = { id: string; title: string; desc: string; done: boolean };

export default function Dashboard() {
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [settings, setSettings] = useState<any>(null);
  const [needLogin, setNeedLogin] = useState(false);
  useEffect(() => {
    Promise.all([listInvoices(), listOutbox(), getSettingsCloud()])
      .then(([inv, ob, s]) => { setInvoiceCount(inv.length); setScheduledCount(ob.filter((r) => !r.sentAt).length); setSettings(s); })
      .catch(() => setNeedLogin(true));
  }, []);
  const checks: Check[] = [
    { id: 'email', title: 'Connect Email', desc: 'Gmail/Outlook OAuth', done: false },
    { id: 'template', title: 'Reminder Template', desc: 'Subject + message placeholders', done: false },
    { id: 'rules', title: 'Rules', desc: 'Before/due/after cadence', done: false },
  ];

  return (
    <div className="space-y-6">
      <RequireAuth />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link href="/autochase/settings"><Button variant="outline">Open Settings</Button></Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {checks.map((c) => (
          <div key={c.id} className="card-base p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-sm text-slate-600">{c.desc}</div>
              </div>
              <span className={`text-xs rounded px-2 py-0.5 ${c.done ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{c.done ? 'Done' : 'Pending'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Invoices" value={invoiceCount} />
        <Stat label="Scheduled" value={scheduledCount} />
        <Stat label="Sent (session)" value={0} />
      </div>

      {needLogin ? (
        <div className="card-base p-6 text-slate-700">Please <a className="underline" href="/auth/login">log in</a> to view your cloud dashboard.</div>
      ) : (
        <>
          <UsageMeter count={scheduledCount} />
          <TestReminder />
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card-base p-6">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function UsageMeter({ count }: { count: number }) {
  const [plan, setPlan] = useState<'starter' | 'pro' | 'business' | undefined>();
  useEffect(() => { getSettingsCloud().then((s) => setPlan(s.plan)); }, []);
  const limit = getPlanLimit(plan as any);
  if (limit === 'unlimited') {
    return <div className="card-base p-4 text-sm text-slate-700">Plan: Business — Unlimited reminders</div>;
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

function TestReminder() {
  const [settings, setSettings] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  useEffect(() => { Promise.all([getSettingsCloud(), listInvoices()]).then(([s, inv]) => { setSettings(s); setInvoices(inv as any); }); }, []);
  const sample: Invoice = invoices[0] || {
    id: 'sample',
    clientName: 'Acme Co',
    clientEmail: 'ap@acme.com',
    invoiceNumber: 'INV-1001',
    amount: 199900,
    currency: 'ZAR',
    dueDate: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  };
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (!settings) return;
    setTo(settings.sender);
    setSubject(interpolate(settings.subject, sample, settings, 'test reminder'));
    setBody(interpolate(settings.body, sample, settings, 'test reminder'));
  }, [settings, sample.invoiceNumber]);

  const refresh = () => {
    setSubject(interpolate(settings.subject, sample, settings, 'test reminder'));
    setBody(interpolate(settings.body, sample, settings, 'test reminder'));
  };

  const send = () => {
    const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="card-base p-4 space-y-3">
      <h2 className="text-lg font-semibold">Send test reminder</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-slate-700">To</span>
          <input className="border border-slate-300 rounded-md px-3 py-2" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <div />
        <label className="grid gap-1 text-sm sm:col-span-2">
          <span className="text-slate-700">Subject</span>
          <input className="border border-slate-300 rounded-md px-3 py-2" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm sm:col-span-2">
          <span className="text-slate-700">Body</span>
          <textarea className="border border-slate-300 rounded-md px-3 py-2 h-40" value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
      </div>
      <div className="flex gap-2">
        <Button onClick={refresh}>Refresh from template</Button>
        <Button variant="outline" onClick={send}>Send test email</Button>
      </div>
      <p className="text-xs text-slate-500">Uses your email client via mailto:. In production this will send through connected Gmail/Outlook.</p>
    </div>
  );
}
