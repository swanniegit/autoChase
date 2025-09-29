import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSettings, setSettings } from '@/lib/storage';

export default function PayfastReturn() {
  const [status, setStatus] = useState<'ok' | 'cancel' | 'noop'>('noop');
  const [plan, setPlan] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('cancel')) {
      setStatus('cancel');
      return;
    }
    const p = params.get('plan');
    if (p) {
      const s = getSettings();
      s.plan = p as any;
      setSettings(s);
      setPlan(p);
      setStatus('ok');
    }
  }, []);

  return (
    <div className="space-y-4">
      {status === 'ok' && (
        <>
          <h1 className="text-2xl font-semibold">Subscription Successful</h1>
          <p className="text-slate-700">Your plan has been set to {plan}. You can manage settings or start scheduling reminders.</p>
          <div className="flex gap-3">
            <Link href="/autochase/settings" className="underline">Go to Settings</Link>
            <Link href="/autochase/outbox" className="underline">Open Outbox</Link>
          </div>
        </>
      )}
      {status === 'cancel' && (
        <>
          <h1 className="text-2xl font-semibold">Payment Canceled</h1>
          <p className="text-slate-700">You canceled the payment. You can try again or choose another plan.</p>
          <Link href="/autochase/checkout" className="underline">Back to Checkout</Link>
        </>
      )}
      {status === 'noop' && <p className="text-slate-700">Processing...</p>}
    </div>
  );
}

