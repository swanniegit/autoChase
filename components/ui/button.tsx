import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
};

const sizeClass: Record<NonNullable<Props['size']>, string> = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3.5 py-2 text-sm',
  lg: 'px-4.5 py-2.5',
};

const variantClass: Record<NonNullable<Props['variant']>, string> = {
  default: 'bg-brand text-white hover:bg-brand-dark border border-brand-dark',
  ghost: 'bg-transparent hover:bg-slate-100 border border-transparent',
  outline: 'bg-white hover:bg-slate-50 border border-slate-300',
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'default', size = 'md', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
        sizeClass[size],
        variantClass[variant],
        className,
      )}
      {...props}
    />
  );
});

export default Button;

