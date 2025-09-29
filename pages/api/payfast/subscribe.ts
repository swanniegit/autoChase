import type { NextApiRequest, NextApiResponse } from 'next';
import { buildSubscription } from '@/lib/payfast';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { plan, email } = req.body as { plan: 'starter' | 'pro' | 'business'; email: string };
  if (!plan || !email) return res.status(400).json({ error: 'Missing plan or email' });

  const cfg = {
    merchantId: process.env.PAYFAST_MERCHANT_ID || '',
    merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
    passphrase: process.env.PAYFAST_PASSPHRASE,
    sandbox: (process.env.PAYFAST_SANDBOX || 'true') === 'true',
  };
  if (!cfg.merchantId || !cfg.merchantKey) return res.status(500).json({ error: 'PayFast not configured' });

  const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
  const { action, fields } = buildSubscription(cfg, plan, email, {
    returnUrl: `${origin}/autochase/return?plan=${plan}`,
    cancelUrl: `${origin}/autochase/return?cancel=1`,
    notifyUrl: `${origin}/api/payfast/notify`,
    reference: `${plan}-${Date.now()}`,
  });
  return res.status(200).json({ action, fields });
}

