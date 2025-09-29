import { PropsWithChildren } from 'react';
import clsx from 'clsx';

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx('card-base', className)}>{children}</div>;
}

export function CardHeader({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={clsx('px-4 py-3 border-b border-slate-200 flex items-center justify-between', className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx('p-4', className)}>{children}</div>;
}

