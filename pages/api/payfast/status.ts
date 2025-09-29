import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const configured = Boolean(process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_MERCHANT_KEY);
  const sandbox = (process.env.PAYFAST_SANDBOX || 'true') === 'true';
  res.status(200).json({ configured, sandbox });
}

