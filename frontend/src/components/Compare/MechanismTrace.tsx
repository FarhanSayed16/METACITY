import { AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';

interface MechanismTraceProps {
  mechanisms: string[];
}

export function MechanismTrace({ mechanisms }: MechanismTraceProps) {
  if (!mechanisms || mechanisms.length === 0) {
    return null;
  }

  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
      <h3 className="text-md font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-1">
        <TrendingUp size={20} className="text-[var(--accent)]" />
        Mechanism trace
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Top drivers explaining KPI changes between baseline and scenario.
      </p>

      <ul className="space-y-3">
        {mechanisms.map((mech, idx) => (
          <li key={idx} className="flex gap-3 text-sm text-[var(--text-primary)] items-start">
            <div className="flex-shrink-0 mt-0.5">
              <div className="bg-[var(--accent-muted)] p-1 rounded-full text-[var(--accent)]">
                <ArrowRight size={14} />
              </div>
            </div>
            <span>{mech}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center gap-1.5 text-xs text-[var(--text-muted)] border-t border-[var(--border-color)] pt-3">
        <AlertTriangle size={14} />
        <span>Trace is generated from a single representative paired seed.</span>
      </div>
    </div>
  );
}
