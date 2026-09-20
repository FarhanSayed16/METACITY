import React from 'react';
import classNames from 'classnames';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={classNames(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
          {
            'bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-hover)] focus:ring-[var(--accent)]': variant === 'primary',
            'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--bg-surface-muted)] focus:ring-[var(--border-strong)]': variant === 'secondary',
            'bg-[var(--danger)] text-white hover:bg-red-600 focus:ring-red-500': variant === 'destructive',
            'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-muted)] hover:text-[var(--text-primary)] focus:ring-[var(--border-subtle)]': variant === 'ghost',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
            'opacity-50 cursor-not-allowed': props.disabled,
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
