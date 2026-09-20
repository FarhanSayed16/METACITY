import React from 'react';
import { CONGESTION_COLORS, CONGESTION_THRESHOLDS } from '../../lib/congestion';

/** Shared congestion legend — keep thresholds identical to NetworkLayer colouring. */
export const CongestionLegend: React.FC<{
  className?: string;
  compact?: boolean;
  showFlowNote?: boolean;
}> = ({ className = '', compact = false, showFlowNote = false }) => (
  <div
    className={`bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg shadow-lg p-3 text-xs ${className}`}
  >
    <div className="font-semibold mb-2 text-[var(--text-primary)]">
      {compact ? 'Traffic (v/c)' : 'Congestion legend'}
    </div>
    <div className="space-y-1.5 text-[var(--text-secondary)]">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: CONGESTION_COLORS.free }} />
        Free / light (≤ {CONGESTION_THRESHOLDS.free})
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: CONGESTION_COLORS.moderate }} />
        Moderate (≤ {CONGESTION_THRESHOLDS.moderate})
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: CONGESTION_COLORS.heavy }} />
        Heavy (&gt; {CONGESTION_THRESHOLDS.heavy})
      </div>
      {!compact && (
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: CONGESTION_COLORS.selected }} />
          Selected / ghost
        </div>
      )}
      {showFlowNote && (
        <p className="pt-1 text-[10px] text-[var(--text-muted)] leading-snug">
          Moving dashes encode relative volume — not particle trails.
        </p>
      )}
    </div>
  </div>
);
