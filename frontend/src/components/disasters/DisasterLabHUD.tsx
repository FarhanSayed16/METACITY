import { AlertTriangle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useScenarioDraftStore } from '../../store/scenarioDraftStore';
import { featureFlags } from '../../lib/featureFlags';

/** Compact launcher + draft hazard count for the network map. */
export function DisasterLabHUD() {
  if (!featureFlags.disasterLab) return null;

  const setOpen = useUIStore((s) => s.setShowDisasterLab);
  const pendingOps = useScenarioDraftStore((s) => s.pendingOps);
  const hazardOps = pendingOps.filter((o) =>
    ['flood', 'outage', 'close_link', 'remove_link'].includes(o.type)
  );
  const active = hazardOps.length > 0;

  return (
    <div className="absolute top-[4.5rem] right-4 z-20 flex flex-col items-end gap-2 pointer-events-none">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold shadow-md border transition-colors ${
          active
            ? 'bg-[var(--danger)] text-white border-red-700 animate-soft-pulse'
            : 'bg-[var(--bg-panel)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-[var(--accent)]'
        }`}
        title="Open Disaster Lab"
      >
        <AlertTriangle size={14} />
        <span>{active ? `${hazardOps.length} hazard op${hazardOps.length === 1 ? '' : 's'}` : 'Disaster Lab'}</span>
      </button>
    </div>
  );
}
