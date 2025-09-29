import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabase } from '@/lib/supabaseServer';

const WORKSPACE = process.env.AC_WORKSPACE_ID || 'default';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = getServerSupabase();
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('ac_invoices')
      .select('*')
      .eq('workspace_id', WORKSPACE)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  if (req.method === 'POST') {
    const inv = req.body;
    const { error } = await supabase.from('ac_invoices').insert({
      id: inv.id,
      workspace_id: WORKSPACE,
      client_name: inv.clientName,
      client_email: inv.clientEmail,
      invoice_number: inv.invoiceNumber,
      amount_cents: inv.amount,
      currency: inv.currency || 'ZAR',
      due_date: inv.dueDate,
      paid: !!inv.paid,
      payment_link: inv.paymentLink || null,
    });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).end();
  }
  if (req.method === 'PUT') {
    const inv = req.body;
    const { error } = await supabase
      .from('ac_invoices')
      .update({
        client_name: inv.clientName,
        client_email: inv.clientEmail,
        invoice_number: inv.invoiceNumber,
        amount_cents: inv.amount,
        currency: inv.currency || 'ZAR',
        due_date: inv.dueDate,
        paid: !!inv.paid,
        payment_link: inv.paymentLink || null,
      })
      .eq('workspace_id', WORKSPACE)
      .eq('id', inv.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).end();
  }
  if (req.method === 'DELETE') {
    const { id } = req.query as { id: string };
    const { error } = await supabase
      .from('ac_invoices')
      .delete()
      .eq('workspace_id', WORKSPACE)
      .eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).end();
  }
  return res.status(405).end();
}

