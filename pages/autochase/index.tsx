import Link from 'next/link';

export default function AutoChaseLanding() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Invoice AutoChase</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Recover late payments automatically. Connect your email, set gentle rules, and AutoChase sends polite reminders that get invoices paid.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/autochase/checkout" className="inline-block rounded-md bg-brand text-white px-4 py-2 hover:bg-brand-dark">Subscribe</Link>
          <a href="#how" className="inline-block rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-50">How it works</a>
        </div>
      </section>

      <section id="how" className="grid sm:grid-cols-3 gap-4">
        {[
          { title: 'Connect Email', desc: 'Gmail or Outlook (OAuth). No IMAP passwords.' },
          { title: 'Set Rules', desc: 'Before due date, on due date, and after. Weekdays only.' },
          { title: 'Get Paid', desc: 'Polite, branded reminders with one‑click payment links.' },
        ].map((f) => (
          <div key={f.title} className="card-base p-4">
            <h3 className="font-semibold mb-1">{f.title}</h3>
            <p className="text-sm text-slate-600">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="card-base p-6 space-y-3">
        <h2 className="text-xl font-semibold">Pricing</h2>
        <p className="text-slate-600">Simple monthly pricing. Cancel anytime.</p>
        <ul className="list-disc pl-6 text-slate-700 text-sm">
          <li>Starter: R 100/mo — up to 50 reminders</li>
          <li>Pro: R 200/mo — up to 250 reminders</li>
          <li>Business: R 400/mo — unlimited</li>
        </ul>
        <div className="flex gap-3">
          <Link href="/autochase/checkout" className="inline-block rounded-md bg-brand text-white px-4 py-2 hover:bg-brand-dark">Subscribe</Link>
          <Link href="/autochase/dashboard" className="inline-block rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-50">Go to Dashboard</Link>
        </div>
      </section>
    </div>
  );
}
