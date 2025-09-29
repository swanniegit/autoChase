import { PropsWithChildren, useRef } from 'react';
import Button from './button';
import { Copy, Check, Code as CodeIcon } from 'lucide-react';
import { useState } from 'react';

export default function CodeBlock({ children }: PropsWithChildren) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = ref.current?.textContent ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // noop
    }
  };

  return (
    <div className="relative">
      <div className="absolute -top-3 left-3 inline-flex items-center gap-1 rounded bg-slate-800 text-white px-2 py-0.5 text-xs">
        <CodeIcon className="w-3.5 h-3.5" /> HTML
      </div>
      <pre ref={ref} className="overflow-auto rounded-md bg-slate-900 text-slate-100 text-sm p-4">
        <code>{children}</code>
      </pre>
      <div className="absolute top-2 right-2">
        <Button variant="outline" size="sm" onClick={copy} aria-label="Copy code">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

