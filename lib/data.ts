"use client";
import { supabaseClient } from './supabaseClient';
import type { Invoice, Reminder, Settings } from './types';

async function workspaceId(): Promise<string> {
  const supabase = supabaseClient();
  const { data } = await supabase.auth.getUser();
  const uid = data.user?.id;
  if (!uid) throw new Error('Not authenticated');
  // Ensure profile exists
  await supabase.from('ac_profiles').upsert({ user_id: uid, workspace_id: uid }, { onConflict: 'user_id' });
  return uid;
}

export async function listInvoices(): Promise<Invoice[]> {
  const ws = await workspaceId();
  const supabase = supabaseClient();
  const { data, error } = await supabase
    .from('ac_invoices')
    .select('*')
    .eq('workspace_id', ws)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((r: any) => ({
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

export async function upsertInvoice(inv: Invoice): Promise<void> {
  const ws = await workspaceId();
  const row = {
    id: inv.id,
    workspace_id: ws,
    client_name: inv.clientName,
    client_email: inv.clientEmail,
    invoice_number: inv.invoiceNumber,
    amount_cents: inv.amount,
    currency: inv.currency || 'ZAR',
    due_date: inv.dueDate,
    paid: !!inv.paid,
    payment_link: inv.paymentLink || null,
  };
  const supabase = supabaseClient();
  const { error } = await supabase.from('ac_invoices').upsert(row);
  if (error) throw error;
}

export async function deleteInvoice(id: string): Promise<void> {
  const ws = await workspaceId();
  const supabase = supabaseClient();
  const { error } = await supabase.from('ac_invoices').delete().eq('workspace_id', ws).eq('id', id);
  if (error) throw error;
}

export async function getSettingsCloud(): Promise<Settings> {
  const ws = await workspaceId();
  const supabase = supabaseClient();
  const { data, error } = await supabase.from('ac_settings').select('data').eq('workspace_id', ws).maybeSingle();
  if (error && error.code !== 'PGRST116') throw error;
  return (
    data?.data || {
      sender: 'you@company.com',
      subject: 'Friendly reminder: Invoice {{invoiceNumber}}',
      body:
        'Hi {{clientName}},\n\nJust a friendly reminder that invoice {{invoiceNumber}} for {{amount}} is {{when}}. You can pay here: {{paymentLink}}.\n\nThank you!\n{{yourName}}',
      rules: { beforeDays: [3], onDue: true, afterDays: [7], weekdaysOnly: true },
      businessName: 'Your Company',
      paymentLinkTemplate: 'https://pay.example.com/{{invoiceNumber}}',
      plan: 'starter',
    }
  );
}

export async function setSettingsCloud(s: Settings): Promise<void> {
  const ws = await workspaceId();
  const supabase = supabaseClient();
  const { error } = await supabase.from('ac_settings').upsert({ workspace_id: ws, data: s, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function listOutbox(): Promise<Reminder[]> {
  const ws = await workspaceId();
  const supabase = supabaseClient();
  const { data, error } = await supabase
    .from('ac_outbox')
    .select('*')
    .eq('workspace_id', ws)
    .order('when_at', { ascending: true });
  if (error) throw error;
  return (data || []).map((r: any) => ({ id: r.id, invoiceId: r.invoice_id, when: r.when_at, kind: r.kind, sentAt: r.sent_at || undefined, to: r.recipient, subject: r.subject, body: r.body }));
}

export async function replaceOutbox(items: Reminder[]): Promise<void> {
  const ws = await workspaceId();
  const supabase = supabaseClient();
  const { error: delErr } = await supabase.from('ac_outbox').delete().eq('workspace_id', ws);
  if (delErr) throw delErr;
  if (!items.length) return;
  const rows = items.map((i) => ({ id: i.id, workspace_id: ws, invoice_id: i.invoiceId, when_at: i.when, kind: i.kind, sent_at: i.sentAt || null, recipient: i.to, subject: i.subject, body: i.body }));
  const { error } = await supabase.from('ac_outbox').insert(rows);
  if (error) throw error;
}
