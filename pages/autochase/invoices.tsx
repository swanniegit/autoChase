import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/button';
import { listInvoices, upsertInvoice, deleteInvoice, getSettingsCloud } from '@/lib/data';
import { nextReminderDate } from '@/lib/scheduler';
import type { Invoice } from '@/lib/types';
import dynamic from 'next/dynamic';
const RequireAuth = dynamic(() => import('@/components/auth/RequireAuth'), { ssr: false });

const empty: Invoice = {
  id: '',
  clientName: '',
  clientEmail: '',
  invoiceNumber: '',
  amount: 0,
  currency: 'ZAR',
  dueDate: new Date().toISOString().slice(0, 10),
  createdAt: new Date().toISOString(),
};

export default function InvoicesPage() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [needLogin, setNeedLogin] = useState(false);

  useEffect(() => {
    listInvoices().then(setItems).catch(() => setNeedLogin(true));
  }, []);

  const save = async (inv: Invoice) => {
    await upsertInvoice(inv);
    setItems(await listInvoices());
    setEditing(null);
  };

  const remove = (id: string) => {
    deleteInvoice(id).then(() => listInvoices().then(setItems));
  };

  const togglePaid = (id: string) => {
    const inv = items.find((i) => i.id === id);
    if (!inv) return;
    save({ ...inv, paid: !inv.paid });
  };

  const [settings, setSettings] = useState<any>({ paymentLinkTemplate: '' });
  useEffect(() => { getSettingsCloud().then(setSettings).catch(() => {}); }, []);

  return (
    <div className="space-y-6">
      <RequireAuth />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <Button onClick={() => setEditing({ ...empty, id: crypto.randomUUID(), createdAt: new Date().toISOString() })}>Add Invoice</Button>
      </div>

      {editing && (
        <div className="card-base p-4 space-y-3">
          <h2 className="font-medium">{items.some((i) => i.id === editing.id) ? 'Edit' : 'New'} Invoice</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Text label="Client name" value={editing.clientName} onChange={(v) => setEditing({ ...editing, clientName: v })} />
            <Text label="Client email" value={editing.clientEmail} onChange={(v) => setEditing({ ...editing, clientEmail: v })} />
            <Text label="Invoice number" value={editing.invoiceNumber} onChange={(v) => setEditing({ ...editing, invoiceNumber: v })} />
            <Money label="Amount (ZAR)" value={editing.amount} onChange={(v) => setEditing({ ...editing, amount: v })} />
            <DateInput label="Due date" value={editing.dueDate} onChange={(v) => setEditing({ ...editing, dueDate: v })} />
            <Text label="Payment link" value={editing.paymentLink || ''} onChange={(v) => setEditing({ ...editing, paymentLink: v })} placeholder={settings.paymentLinkTemplate} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => save(editing)}>Save</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {needLogin ? (
        <div className="card-base p-6 text-slate-700">Please <a className="underline" href="/auth/login">log in</a> to manage cloud invoices.</div>
      ) : (
      <div className="card-base overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-600">
            <tr>
              <th className="p-3">Invoice</th>
              <th className="p-3">Client</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Due</th>
              <th className="p-3">Next reminder</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t border-slate-200">
                <td className="p-3 font-medium">{i.invoiceNumber}</td>
                <td className="p-3">{i.clientName} <span className="text-slate-500">({i.clientEmail})</span></td>
                <td className="p-3">R {(i.amount / 100).toFixed(2)}</td>
                <td className="p-3">{i.dueDate}</td>
                <td className="p-3">{(nextReminderDate(i, settings)?.toLocaleDateString()) || '-'}</td>
                <td className="p-3">{i.paid ? 'Paid' : 'Unpaid'}</td>
                <td className="p-3 text-right">
                  <div className="inline-flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => togglePaid(i.id)}>{i.paid ? 'Mark unpaid' : 'Mark paid'}</Button>
                    <Button variant="outline" size="sm" onClick={() => setEditing(i)}>Edit</Button>
                    <Button variant="outline" size="sm" onClick={() => remove(i.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="p-6 text-slate-500" colSpan={6}>No invoices yet. Add your first invoice.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}
      <div className="flex gap-2">
        <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
        <Button variant="outline" onClick={downloadTemplate}>Download CSV Template</Button>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="file" accept=".csv" onChange={importCsv} /> Import CSV
        </label>
      </div>
    </div>
  );
}

async function exportCsv() {
  const rows = await listInvoices();
  const headers = ['invoiceNumber','clientName','clientEmail','amount','currency','dueDate','paid','paymentLink'];
  const lines = [headers.join(',')].concat(
    rows.map(r => [r.invoiceNumber,r.clientName,r.clientEmail,(r.amount/100).toFixed(2),r.currency||'ZAR',r.dueDate,Boolean(r.paid),r.paymentLink||''].join(','))
  );
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'invoices.csv'; a.click(); URL.revokeObjectURL(url);
}

function importCsv(e: React.ChangeEvent<HTMLInputElement>) {
  const f = e.target.files?.[0]; if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    const text = String(reader.result || '');
    const parsed = parseCsv(text);
    Promise.all(parsed.map(upsertInvoice)).then(() => window.location.reload());
  };
  reader.readAsText(f);
}

function Text({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-slate-700">{label}</span>
      <input className="border border-slate-300 rounded-md px-3 py-2" value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function parseCsv(text: string): Invoice[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  if (lines.length === 0) return [];
  const header = splitCsvLine(lines[0]);
  const idx = (k: string) => header.indexOf(k);
  const out: Invoice[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length < header.length) continue;
    const inv: Invoice = {
      id: crypto.randomUUID(),
      clientName: cols[idx('clientName')] || '',
      clientEmail: cols[idx('clientEmail')] || '',
      invoiceNumber: cols[idx('invoiceNumber')] || '',
      amount: Math.round(parseFloat(cols[idx('amount')] || '0') * 100),
      currency: cols[idx('currency')] || 'ZAR',
      dueDate: (cols[idx('dueDate')] || new Date().toISOString().slice(0, 10)).slice(0, 10),
      paid: (cols[idx('paid')] || '').toLowerCase() === 'true',
      paymentLink: cols[idx('paymentLink')] || '',
      createdAt: new Date().toISOString(),
    };
    out.push(inv);
  }
  return out;
}

function splitCsvLine(line: string): string[] {
  const res: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else { inQ = !inQ; }
    } else if (ch === ',' && !inQ) {
      res.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  res.push(cur);
  return res.map((s) => s.trim());
}

function downloadTemplate() {
  const headers = ['invoiceNumber','clientName','clientEmail','amount','currency','dueDate','paid','paymentLink'];
  const sample = ['INV-1001','Acme Co','ap@acme.com','1999.00','ZAR','2025-12-31','false','https://pay.example.com/INV-1001'];
  const blob = new Blob([[headers.join(',') , sample.join(',')].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'template.csv'; a.click(); URL.revokeObjectURL(url);
}


function Money({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-slate-700">{label}</span>
      <input type="number" min={0} step={1} className="border border-slate-300 rounded-md px-3 py-2"
        value={(value / 100).toFixed(2)} onChange={(e) => onChange(Math.round(parseFloat(e.target.value || '0') * 100))} />
    </label>
  );
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-slate-700">{label}</span>
      <input type="date" className="border border-slate-300 rounded-md px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
