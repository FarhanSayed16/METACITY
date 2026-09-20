import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/** Civic Steel empty / education panel for Compare, Runs, Network, etc. */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => (
  <div
    className={`animate-fade-up rounded-xl border border-[var(--border-color)] bg-[var(--bg-panel)] px-6 py-10 text-center max-w-lg mx-auto ${className}`}
  >
    {Icon && (
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[var(--accent)]">
        <Icon size={22} />
      </div>
    )}
    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h2>
    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">{description}</p>
    {actionLabel && onAction && (
      <Button onClick={onAction}>{actionLabel}</Button>
    )}
  </div>
);
