import type { Invoice, Settings, Reminder } from './types';

const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

const safeGet = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const safeSet = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export const getInvoices = (): Invoice[] => safeGet<Invoice[]>('ac.invoices', []);
export const setInvoices = (items: Invoice[]) => safeSet('ac.invoices', items);

export const getSettings = (): Settings =>
  safeGet<Settings>('ac.settings', {
    sender: 'you@company.com',
    subject: 'Friendly reminder: Invoice {{invoiceNumber}}',
    body:
      'Hi {{clientName}},\n\nJust a friendly reminder that invoice {{invoiceNumber}} for {{amount}} is {{when}}. You can pay here: {{paymentLink}}.\n\nThank you!\n{{yourName}}',
    rules: { beforeDays: [3], onDue: true, afterDays: [7], weekdaysOnly: true },
    businessName: 'Your Company',
    paymentLinkTemplate: 'https://pay.example.com/{{invoiceNumber}}',
    plan: 'starter',
  });
export const setSettings = (s: Settings) => safeSet('ac.settings', s);

export const getOutbox = (): Reminder[] => safeGet<Reminder[]>('ac.outbox', []);
export const setOutbox = (r: Reminder[]) => safeSet('ac.outbox', r);

// Remote helpers (optional)
export async function remoteGetInvoices(): Promise<Invoice[]> {
  if (!hasSupabase) return getInvoices();
  const res = await fetch('/api/supabase/invoices');
  if (!res.ok) return getInvoices();
  const rows = await res.json();
  return rows.map((r: any) => ({
    id: r.id,
    clientName: r.client_name,
    clientEmail: r.client_email,
    invoiceNumber: r.invoice_number,
    amount: r.amount_cents,
    currency: r.currency,
    dueDate: r.due_date,
    paid: r.paid,
    paymentLink: r.payment_link || undefined,
    createdAt: r.created_at,
  }));
}

export async function remoteUpsertInvoice(inv: Invoice): Promise<void> {
  if (!hasSupabase) return setInvoices(upsertLocal(getInvoices(), inv));
  const method = 'PUT';
  await fetch('/api/supabase/invoices', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(inv) });
}

export async function remoteInsertInvoice(inv: Invoice): Promise<void> {
  if (!hasSupabase) return setInvoices(upsertLocal(getInvoices(), inv));
  await fetch('/api/supabase/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(inv) });
}

export async function remoteDeleteInvoice(id: string): Promise<void> {
  if (!hasSupabase) return setInvoices(getInvoices().filter((i) => i.id !== id));
  await fetch('/api/supabase/invoices?id=' + encodeURIComponent(id), { method: 'DELETE' });
}

export async function remoteGetSettings(): Promise<Settings> {
  if (!hasSupabase) return getSettings();
  const res = await fetch('/api/supabase/settings');
  if (!res.ok) return getSettings();
  const data = await res.json();
  return data || getSettings();
}

export async function remoteSetSettings(s: Settings): Promise<void> {
  if (!hasSupabase) return setSettings(s);
  await fetch('/api/supabase/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
}

export async function remoteGetOutbox(): Promise<Reminder[]> {
  if (!hasSupabase) return getOutbox();
  const res = await fetch('/api/supabase/outbox');
  if (!res.ok) return getOutbox();
  const rows = await res.json();
  return rows.map((r: any) => ({ id: r.id, invoiceId: r.invoice_id, when: r.when_at, kind: r.kind, sentAt: r.sent_at || undefined, to: r.recipient, subject: r.subject, body: r.body }));
}

export async function remoteSetOutbox(items: Reminder[]): Promise<void> {
  if (!hasSupabase) return setOutbox(items);
  await fetch('/api/supabase/outbox', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(items) });
}

function upsertLocal(list: Invoice[], inv: Invoice): Invoice[] {
  const next = [...list];
  const idx = next.findIndex((i) => i.id === inv.id);
  if (idx >= 0) next[idx] = inv; else next.unshift(inv);
  return next;
}
