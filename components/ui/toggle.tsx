import { InputHTMLAttributes } from 'react';

export default function Toggle({ id, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input id={id} type="checkbox" className="peer sr-only" {...props} />
      <span className="w-10 h-6 rounded-full bg-slate-300 peer-checked:bg-brand transition-colors relative">
        <span className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
}

