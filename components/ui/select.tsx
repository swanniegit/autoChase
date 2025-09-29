import { SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

export default function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        'border border-slate-300 rounded-md px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand',
        className,
      )}
      {...props}
    />
  );
}

