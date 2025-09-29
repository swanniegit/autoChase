import type { NextApiRequest, NextApiResponse } from 'next';
import { signParams, validateITN } from '@/lib/payfast';
import { getServerSupabase } from '@/lib/supabaseServer';

export const config = { api: { bodyParser: true } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const data = req.body || {};
  const theirSig = data['signature'] as string | undefined;
  // Use server-side passphrase
  const { PAYFAST_PASSPHRASE: passphrase, PAYFAST_SANDBOX } = process.env as Record<string, string | undefined>;
  const localSig = signParams(
    Object.fromEntries(Object.entries(data).filter(([k]) => k !== 'signature')) as Record<string, string>,
    passphrase,
  );

  // Basic validation only (full validation requires server-to-server confirm with PayFast)
  const sigOk = Boolean(theirSig && theirSig === localSig);

  // Optional: IP allowlist
  const allowed = (process.env.PAYFAST_IPS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '');
  const ipOk = allowed.length === 0 || allowed.some((a) => ip.includes(a));

  // Post back validation
  let validated = false;
  try {
    validated = await validateITN(
      Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) as Record<string, string>,
      (PAYFAST_SANDBOX || 'true') === 'true',
    );
  } catch (e) {
    console.error('PayFast validate error', e);
  }

  const ok = sigOk && ipOk && validated;
  console.log('PayFast ITN received', { sigOk, ipOk, validated, payment_status: data['payment_status'], m_payment_id: data['m_payment_id'] });

  if (ok && String(data['payment_status']).toUpperCase() === 'COMPLETE') {
    // Activate plan in Supabase settings (upsert)
    const planFromRef = String(data['m_payment_id'] || '').split('-')[0] as 'starter' | 'pro' | 'business' | '';
    if (planFromRef) {
      try {
        const supabase = getServerSupabase();
        const workspace = process.env.AC_WORKSPACE_ID || 'default';
        // Fetch existing settings
        const { data: row } = await supabase
          .from('ac_settings')
          .select('data')
          .eq('workspace_id', workspace)
          .maybeSingle();
        const next = { ...(row?.data || {}), plan: planFromRef };
        await supabase.from('ac_settings').upsert({ workspace_id: workspace, data: next, updated_at: new Date().toISOString() });
      } catch (e) {
        console.error('Failed to update plan in Supabase', e);
      }
    }
  }

  // Log the ITN for auditing
  try {
    const supabase = getServerSupabase();
    await supabase.from('ac_itn_logs').insert({
      ip,
      signature_ok: sigOk,
      ip_ok: ipOk,
      postback_ok: validated,
      payment_status: String(data['payment_status'] || ''),
      m_payment_id: String(data['m_payment_id'] || ''),
      payload: data,
    });
  } catch (e) {
    console.error('Failed to log ITN', e);
  }

  return res.status(200).send('OK');
}
