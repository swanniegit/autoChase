import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabase } from '@/lib/supabaseServer';

const WORKSPACE = process.env.AC_WORKSPACE_ID || 'default';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = getServerSupabase();
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('ac_outbox')
      .select('*')
      .eq('workspace_id', WORKSPACE)
      .order('when_at', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  if (req.method === 'PUT') {
    // Replace outbox with payload array
    const items = req.body || [];
    const { error: delErr } = await supabase.from('ac_outbox').delete().eq('workspace_id', WORKSPACE);
    if (delErr) return res.status(500).json({ error: delErr.message });
    if (items.length) {
      const rows = items.map((i: any) => ({
        id: i.id,
        workspace_id: WORKSPACE,
        invoice_id: i.invoiceId,
        when_at: i.when,
        kind: i.kind,
        sent_at: i.sentAt || null,
        recipient: i.to,
        subject: i.subject,
        body: i.body,
      }));
      const { error } = await supabase.from('ac_outbox').insert(rows);
      if (error) return res.status(500).json({ error: error.message });
    }
    return res.status(200).end();
  }
  return res.status(405).end();
}

