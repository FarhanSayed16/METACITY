import { useState } from 'react';
import { GitCompare, Info } from 'lucide-react';

/**
 * Aesthetic baseline/scenario wipe overlay.
 * Does NOT dual-render two sims — labelled honestly (Phase 8 / P2-M1).
 */
export function SplitWipe() {
  const [position, setPosition] = useState(50);
  const [isActive, setIsActive] = useState(false);

  if (!isActive) {
    return (
      <button
        type="button"
        onClick={() => setIsActive(true)}
        className="absolute top-20 left-6 px-3 py-2 bg-[var(--bg-panel)]/95 backdrop-blur rounded-lg shadow-md border border-[var(--border-color)] text-sm font-medium flex items-center gap-2 z-40 hover:border-[var(--accent)] transition-colors workspace-desktop-only"
        title="Aesthetic preview only — not dual simulation"
      >
        <GitCompare size={16} />
        Split preview
      </button>
    );
  }

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      <div
        className="absolute top-0 left-0 bottom-0 bg-[var(--info)]/10 border-r-2 border-white/60"
        style={{ width: `${position}%` }}
      >
        <div className="absolute top-24 left-6 bg-[var(--info)] text-white text-xs font-bold px-3 py-1 rounded shadow-md pointer-events-auto">
          BASELINE (label)
        </div>
      </div>

      <div
        className="absolute top-0 right-0 bottom-0 bg-[var(--accent)]/10 border-l-2 border-white/60"
        style={{ width: `${100 - position}%` }}
      >
        <div className="absolute top-24 right-6 bg-[var(--accent)] text-white text-xs font-bold px-3 py-1 rounded shadow-md pointer-events-auto">
          SCENARIO (label)
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(parseInt(e.target.value, 10))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize pointer-events-auto z-40"
        aria-label="Split position"
      />

      <div
        className="absolute top-1/2 -translate-y-1/2 w-8 h-12 bg-[var(--bg-panel)] rounded-lg shadow-xl flex items-center justify-center border border-[var(--border-color)]"
        style={{ left: `calc(${position}% - 16px)` }}
      >
        <div className="flex space-x-1">
          <div className="w-0.5 h-6 bg-[var(--border-strong)] rounded-full" />
          <div className="w-0.5 h-6 bg-[var(--border-strong)] rounded-full" />
        </div>
      </div>

      <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto z-50">
        <button
          type="button"
          onClick={() => setIsActive(false)}
          className="px-4 py-1.5 bg-[var(--danger)] hover:bg-red-700 text-white rounded-lg shadow-lg text-sm font-medium transition-colors"
        >
          Exit split preview
        </button>
        <p className="flex items-center gap-1.5 text-[10px] text-[var(--text-inverse)] bg-[var(--bg-chrome)]/90 px-2.5 py-1 rounded-md max-w-xs text-center leading-snug">
          <Info size={12} className="shrink-0 text-[var(--warning)]" />
          Aesthetic preview only — one camera, tinted panes. Use Compare for real dual-run evidence.
        </p>
      </div>
    </div>
  );
}
