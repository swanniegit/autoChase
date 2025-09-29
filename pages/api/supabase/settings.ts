import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabase } from '@/lib/supabaseServer';

const WORKSPACE = process.env.AC_WORKSPACE_ID || 'default';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = getServerSupabase();
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('ac_settings')
      .select('data')
      .eq('workspace_id', WORKSPACE)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data?.data || null);
  }
  if (req.method === 'PUT') {
    const payload = req.body || {};
    const { error } = await supabase.from('ac_settings').upsert({
      workspace_id: WORKSPACE,
      data: payload,
      updated_at: new Date().toISOString(),
    });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).end();
  }
  return res.status(405).end();
}

