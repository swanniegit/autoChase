import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Button from '@/components/ui/button';
import { supabaseClient } from '@/lib/supabaseClient';

const RequireAuth = dynamic(() => import('@/components/auth/RequireAuth'), { ssr: false });

type Log = {
  id: string;
  received_at: string;
  ip: string | null;
  signature_ok: boolean | null;
  ip_ok: boolean | null;
  postback_ok: boolean | null;
  payment_status: string | null;
  m_payment_id: string | null;
  payload: any;
};

export default function ItnAdmin() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [forbidden, setForbidden] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return logs;
    return logs.filter((l) =>
      (l.payment_status || '').toLowerCase().includes(q) ||
      (l.m_payment_id || '').toLowerCase().includes(q) ||
      (l.ip || '').toLowerCase().includes(q),
    );
  }, [logs, query]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const sb = supabaseClient();
      const { data: userRes } = await sb.auth.getUser();
      const email = userRes.user?.email || '';
      if (email.toLowerCase() !== 'christo@yellowarcher.co.za') {
        setForbidden(true);
        setLogs([]);
        setLoading(false);
        return;
      }
      const { data, error } = await sb
        .from('ac_itn_logs')
        .select('*')
        .order('received_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      setLogs((data as any[]) as Log[]);
    } catch (e: any) {
      setError(e.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div className="space-y-6">
      <RequireAuth />
      {forbidden && (
        <div className="card-base p-6 text-red-700">Access denied.</div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">PayFast ITN Logs</h1>
        <div className="flex items-center gap-2">
          <input
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
            placeholder="Filter by status, ref, or IP"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="outline" onClick={refresh} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</Button>
        </div>
      </div>

      {error && <div className="card-base p-4 text-red-700 text-sm">{error}</div>}

      <div className="card-base overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-600">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Ref</th>
              <th className="p-3">Status</th>
              <th className="p-3">Sig/IP/Postback</th>
              <th className="p-3">IP</th>
              <th className="p-3">Payload</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <Row key={l.id} log={l} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-6 text-slate-500" colSpan={6}>No logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ log }: { log: Log }) {
  const [open, setOpen] = useState(false);
  return (
    <tr className="border-t border-slate-200 align-top">
      <td className="p-3 whitespace-nowrap">{new Date(log.received_at).toLocaleString()}</td>
      <td className="p-3 whitespace-nowrap">{log.m_payment_id}</td>
      <td className="p-3 whitespace-nowrap">{log.payment_status}</td>
      <td className="p-3 whitespace-nowrap">
        <span className={`px-2 py-0.5 rounded text-xs ${log.signature_ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>sig</span>{' '}
        <span className={`px-2 py-0.5 rounded text-xs ${log.ip_ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>ip</span>{' '}
        <span className={`px-2 py-0.5 rounded text-xs ${log.postback_ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>post</span>
      </td>
      <td className="p-3 whitespace-nowrap">{log.ip}</td>
      <td className="p-3">
        <button className="text-xs underline" onClick={() => setOpen((v) => !v)}>{open ? 'Hide' : 'Show'} JSON</button>
        {open && (
          <pre className="mt-2 bg-slate-900 text-slate-100 rounded p-3 overflow-auto max-h-64 text-xs">
            {JSON.stringify(log.payload, null, 2)}
          </pre>
        )}
      </td>
    </tr>
  );
}
