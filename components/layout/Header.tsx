import Link from 'next/link';
import { Mail, LayoutDashboard, Settings, FileSpreadsheet, SendHorizonal } from 'lucide-react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const AuthStatus = dynamic(() => import('@/components/auth/AuthStatus'), { ssr: false });

export default function Header() {
  const connected = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  // Fetch PayFast status from server env via API to avoid leaking secrets and to reflect server truth
  const [pf, setPf] = useState<{ configured: boolean; sandbox: boolean }>({ configured: false, sandbox: true });
  useEffect(() => {
    fetch('/api/payfast/status')
      .then((r) => r.json())
      .then(setPf)
      .catch(() => {});
  }, []);
  const payfastConfigured = pf.configured;
  const payfastSandbox = pf.sandbox;
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container-max flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold">
          <Mail className="h-6 w-6 text-brand" />
          AutoChase
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink href="/autochase/dashboard" label="Dashboard" Icon={LayoutDashboard} />
          <NavLink href="/autochase/invoices" label="Invoices" Icon={FileSpreadsheet} />
          <NavLink href="/autochase/outbox" label="Outbox" Icon={SendHorizonal} />
          <NavLink href="/autochase/settings" label="Settings" Icon={Settings} />
          <span className={`ml-2 inline-flex items-center gap-2 text-xs px-2 py-1 rounded ${connected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
            <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-600' : 'bg-slate-400'}`}></span>
            {connected ? 'Connected' : 'Local'}
          </span>
          <span
            className={`ml-2 inline-flex items-center gap-2 text-xs px-2 py-1 rounded ${
              payfastConfigured ? (payfastSandbox ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700') : 'bg-slate-100 text-slate-600'
            }`}
            title="PayFast configuration"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                payfastConfigured ? (payfastSandbox ? 'bg-amber-500' : 'bg-green-600') : 'bg-slate-400'
              }`}
            ></span>
            {payfastConfigured ? (payfastSandbox ? 'PayFast: Sandbox' : 'PayFast: Live') : 'PayFast: Not set'}
          </span>
          <AuthStatus />
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, label, Icon }: { href: string; label: string; Icon: any }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
