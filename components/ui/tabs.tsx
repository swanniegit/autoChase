import clsx from 'clsx';

export type Tab = { id: string; label: string };

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: Tab[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-slate-200 bg-white p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={clsx(
            'px-3 py-1.5 text-sm rounded-md transition-colors',
            t.id === value ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100',
          )}
          onClick={() => onChange(t.id)}
          aria-pressed={t.id === value}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

