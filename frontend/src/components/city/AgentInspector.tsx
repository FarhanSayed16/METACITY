import { Users, X } from 'lucide-react';
import { useSimStore } from '../../store/simStore';
import { useUIStore } from '../../store/uiStore';

/**
 * Inspector for a sampled agent from WS `agents_sample`.
 * Fields only — no friend FSM / citizen detail API.
 */
export function AgentInspector() {
  const selectedId = useUIStore((s) => s.selectedAgentId);
  const setSelectedAgentId = useUIStore((s) => s.setSelectedAgentId);
  const agents = useSimStore((s) => s.agents_sample);
  const status = useSimStore((s) => s.status);

  if (!selectedId) return null;

  const agent = (agents || []).find((a) => String(a.id) === selectedId);

  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-panel)]/95 backdrop-blur-sm shadow-md text-xs overflow-hidden w-64">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-chrome)] text-[var(--text-inverse)]">
        <div className="flex items-center gap-1.5 font-semibold">
          <Users size={14} className="text-[var(--accent)]" />
          Sampled agent
        </div>
        <button
          type="button"
          onClick={() => setSelectedAgentId(null)}
          className="p-1 rounded hover:bg-white/10"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-3 space-y-2 text-[var(--text-primary)]">
        {!agent ? (
          <p className="text-[var(--text-muted)]">
            Agent left the sample (stream {status}). Click another capsule while a run is live.
          </p>
        ) : (
          <>
            <Row label="id" value={String(agent.id)} mono />
            <Row label="mode" value={String(agent.mode || '—')} />
            <Row label="link_id" value={String(agent.link_id || '—')} mono />
            <Row
              label="progress"
              value={agent.progress != null ? Number(agent.progress).toFixed(3) : '—'}
              mono
            />
            <Row
              label="x · y"
              value={`${Number(agent.x).toFixed(1)} · ${Number(agent.y).toFixed(1)}`}
              mono
            />
          </>
        )}
        <p className="pt-2 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] leading-snug">
          Viz sample from MSA trip positions (≤200). Not a microsimulation or citizen FSM.
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">{label}</span>
      <span className={`text-right break-all ${mono ? 'font-mono' : 'font-medium'}`}>{value}</span>
    </div>
  );
}
