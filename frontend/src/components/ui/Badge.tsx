import React from 'react';
import classNames from 'classnames';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none',
        {
          'bg-[var(--bg-canvas)] text-[var(--text-secondary)]': variant === 'default',
          'bg-[var(--success)] text-white': variant === 'success',
          'bg-[var(--warning)] text-white': variant === 'warning',
          'bg-[var(--danger)] text-white': variant === 'danger',
          'bg-[var(--info)] text-white': variant === 'info',
        },
        className
      )}
      {...props}
    />
  );
};

export interface CalibrationBadgeProps {
  status: 'synthetic_uncalibrated' | 'partially_calibrated' | 'calibrated';
}

export const CalibrationBadge: React.FC<CalibrationBadgeProps> = ({ status }) => {
  let label = '';
  let borderClass = '';
  let textClass = '';

  switch (status) {
    case 'synthetic_uncalibrated':
      label = 'Synthetic (Uncalibrated)';
      borderClass = 'border-[var(--warning)]';
      textClass = 'text-[var(--warning)]';
      break;
    case 'partially_calibrated':
      label = 'Partially Calibrated';
      borderClass = 'border-[var(--accent)]';
      textClass = 'text-[var(--accent)]';
      break;
    case 'calibrated':
      label = 'Calibrated';
      borderClass = 'border-[var(--success)]';
      textClass = 'text-[var(--success)]';
      break;
  }

  return (
    <span className={classNames('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border bg-white', borderClass, textClass)}>
      {label}
    </span>
  );
};
