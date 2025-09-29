import crypto from 'crypto';

export type PayfastConfig = {
  merchantId: string;
  merchantKey: string;
  passphrase?: string;
  sandbox?: boolean;
};

export type PayfastBaseParams = {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  m_payment_id?: string; // your reference
  email_confirmation?: number; // 1
  confirmation_address?: string;
};

export type PayfastSubscriptionParams = PayfastBaseParams & {
  subscription_type: 1; // 1 = Subscription
  billing_date?: string; // yyyy-mm-dd
  recurring_amount: string; // decimal string
  frequency: 3 | 4 | 5 | 6; // 3=monthly, 4=quarterly, 5=biannual, 6=annual
  cycles: number; // 0 for indefinite
  item_name: string;
};

export function getEndpoint(sandbox?: boolean) {
  return sandbox ? 'https://sandbox.payfast.co.za/eng/process' : 'https://www.payfast.co.za/eng/process';
}

export function getValidateEndpoint(sandbox?: boolean) {
  return sandbox ? 'https://sandbox.payfast.co.za/eng/query/validate' : 'https://www.payfast.co.za/eng/query/validate';
}

export function signParams(obj: Record<string, string>, passphrase?: string) {
  // Sort alphabetically and urlencode values, join with &
  const pairs = Object.keys(obj)
    .filter((k) => obj[k] !== undefined && obj[k] !== null && obj[k] !== '')
    .sort()
    .map((k) => `${k}=${encodeURIComponent(obj[k]).replace(/%20/g, '+')}`);
  const base = pairs.join('&') + (passphrase ? `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}` : '');
  return crypto.createHash('md5').update(base).digest('hex');
}

export async function validateITN(
  params: Record<string, string>,
  sandbox: boolean,
): Promise<boolean> {
  const url = getValidateEndpoint(sandbox);
  // Build form body exactly as PayFast expects
  const pairs = Object.keys(params)
    .filter((k) => k !== 'signature')
    .sort()
    .map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, '+')}`);
  const body = pairs.join('&');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const text = (await res.text()).trim();
  return res.ok && text === 'VALID';
}

export function buildSubscription(
  cfg: PayfastConfig,
  plan: 'starter' | 'pro' | 'business',
  buyerEmail: string,
  opts: { returnUrl: string; cancelUrl: string; notifyUrl: string; reference?: string },
): { action: string; fields: Record<string, string> } {
  const amountMap: Record<typeof plan, string> = { starter: '100.00', pro: '200.00', business: '400.00' };
  const fields: PayfastSubscriptionParams = {
    merchant_id: cfg.merchantId,
    merchant_key: cfg.merchantKey,
    return_url: opts.returnUrl,
    cancel_url: opts.cancelUrl,
    notify_url: opts.notifyUrl,
    email_address: buyerEmail,
    m_payment_id: opts.reference || `${plan}-${Date.now()}`,
    email_confirmation: 1,
    subscription_type: 1,
    recurring_amount: amountMap[plan],
    frequency: 3,
    cycles: 0,
    item_name: `AutoChase ${plan} plan`,
  };
  const stringified: Record<string, string> = Object.fromEntries(
    Object.entries(fields).map(([k, v]) => [k, String(v)])
  );
  const sig = signParams(stringified, cfg.passphrase);
  return { action: getEndpoint(cfg.sandbox), fields: { ...stringified, signature: sig } };
}
