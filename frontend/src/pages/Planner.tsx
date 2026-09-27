import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { useHealthStore } from '../store/healthStore';
import { useUIStore } from '../store/uiStore';
import { featureFlags } from '../lib/featureFlags';
import {
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Activity,
  Search,
  ChevronRight,
} from 'lucide-react';

type TabId = 'planner' | 'ask' | 'health';

/**
 * Phase 6 — AI Command Center shell.
 * Planner search/verify still hit YOUR /planner APIs (full sim on verify).
 * Ask tab opens grounded template UI (not an LLM) via MainLayout modal.
 */
export const Planner: React.FC = () => {
  const { id: routeId } = useParams<{ id?: string }>();
  const activeProjectId = useUIStore((s) => s.activeProjectId);
  const setActiveProjectId = useUIStore((s) => s.setActiveProjectId);
  const setShowAskAI = useUIStore((s) => s.setShowAskAI);
  const projectId = routeId || activeProjectId;
  const navigate = useNavigate();
  const locked = useHealthStore((s) => s.apiReachable === false);

  const [tab, setTab] = useState<TabId>('planner');
  const [objective, setObjective] = useState('minimize_travel_time');
  const [nCandidates, setNCandidates] = useState(20);
  const [topN, setTopN] = useState(3);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [verified, setVerified] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [runs, setRuns] = useState<any[]>([]);
  const [healthMeta, setHealthMeta] = useState<any | null>(null);

  useEffect(() => {
    if (routeId) setActiveProjectId(routeId);
  }, [routeId, setActiveProjectId]);

  useEffect(() => {
    if (!projectId || tab !== 'health') return;
    let cancelled = false;
    (async () => {
      try {
        const list = await api.listProjectRuns(projectId);
        if (cancelled) return;
        setRuns(list || []);
        const latest = [...(list || [])].sort((a, b) =>
          String(b.created_at || '').localeCompare(String(a.created_at || ''))
        )[0];
        if (latest?.id) {
          try {
            const meta = await api.getRunMeta(latest.id);
            if (!cancelled) setHealthMeta(meta);
          } catch {
            if (!cancelled) setHealthMeta(null);
          }
        }
      } catch {
        if (!cancelled) setRuns([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, tab]);

  if (!projectId) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-2">AI Command Center</h1>
        <p className="text-[var(--text-secondary)] mb-4">
          Open a project to search candidates, verify with full simulation, and ask grounded questions.
        </p>
        <Button onClick={() => navigate('/projects')}>Go to Projects</Button>
      </div>
    );
  }

  const runSearch = async () => {
    if (locked) return;
    setBusy(true);
    try {
      const res = await api.plannerSearch(projectId, {
        n_candidates: nCandidates,
        objective,
      });
      setCandidates(res.candidates || []);
      setVerified([]);
      toast.success('Search complete', `${(res.candidates || []).length} surrogate candidates`);
    } catch (e: any) {
      toast.error('Search failed', e.message);
    } finally {
      setBusy(false);
    }
  };

  const runVerify = async () => {
    if (locked || candidates.length === 0) return;
    setBusy(true);
    try {
      const res = await api.plannerVerify(projectId, {
        candidates,
        top_n: topN,
        seeds: [42],
      });
      setVerified(res.verified_candidates || []);
      toast.success('Verified', `${(res.verified_candidates || []).length} checked with full sim`);
    } catch (e: any) {
      toast.error('Verify failed', e.message);
    } finally {
      setBusy(false);
    }
  };

  const tabs: Array<{ id: TabId; label: string; icon: typeof Sparkles }> = [
    { id: 'planner', label: 'Planner', icon: Sparkles },
    { id: 'ask', label: 'Ask', icon: MessageCircle },
    { id: 'health', label: 'Run health', icon: Activity },
  ];

  const kpis = healthMeta?.kpis || healthMeta?.summary || {};

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono font-bold tracking-[0.2em] text-[var(--accent)] uppercase mb-1">
            Phase 6 · Command Center
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Sparkles className="text-[var(--accent)]" /> AI Command Center
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm sm:text-base max-w-2xl">
            Surrogate search → verify on your full simulation path. Ask uses guided templates from run
            artefacts — not an LLM.
          </p>
        </div>
        {featureFlags.aiCommand && (
          <Button
            variant="secondary"
            className="gap-2 shrink-0"
            onClick={() => setShowAskAI(true)}
          >
            <MessageCircle size={16} /> Ask METACITY
          </Button>
        )}
      </div>

      <div className="flex gap-1 border-b border-[var(--border-subtle)] mb-6 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                if (t.id === 'ask' && featureFlags.aiCommand) setShowAskAI(true);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                active
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'planner' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div>
              <label className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                Objective
              </label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)]"
              >
                <option value="minimize_travel_time">Minimize average travel time</option>
              </select>
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                Maps to your planner surrogate objective.
              </p>
            </div>
            <div>
              <label className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                Candidates ({nCandidates})
              </label>
              <input
                type="range"
                min={5}
                max={40}
                value={nCandidates}
                onChange={(e) => setNCandidates(Number(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                Verify top N ({topN})
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={runSearch} disabled={busy || locked} className="gap-2">
              <Search size={16} /> Search candidates
            </Button>
            <Button
              variant="secondary"
              onClick={runVerify}
              disabled={busy || locked || !candidates.length}
              className="gap-2"
            >
              <ShieldCheck size={16} /> Verify top {topN} (full sim)
            </Button>
          </div>

          {candidates.length > 0 && (
            <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-surface)] shadow-sm">
              <div className="px-4 py-3 bg-[var(--bg-chrome)] text-[var(--text-inverse)] font-semibold text-sm flex items-center justify-between">
                <span>Surrogate candidates</span>
                <span className="font-mono text-xs text-white/50">{candidates.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">demand · weather · capacity↓</th>
                      <th className="px-4 py-2">Predicted TT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((c, i) => (
                      <tr key={i} className="border-t border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]">
                        <td className="px-4 py-2 font-mono text-[var(--accent)]">{i + 1}</td>
                        <td className="px-4 py-2 font-mono text-xs">
                          {(c.parameters || []).map((p: number) => p.toFixed(3)).join(' · ')}
                        </td>
                        <td className="px-4 py-2 font-mono">
                          {c.predicted_kpis?.avg_travel_time?.toFixed?.(2) ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {verified.length > 0 && (
            <div className="border border-[var(--accent)]/30 rounded-xl overflow-hidden bg-[var(--bg-surface)] shadow-sm">
              <div className="px-4 py-3 bg-[var(--accent-muted)] text-[var(--accent-hover)] font-semibold text-sm flex items-center gap-2">
                <ShieldCheck size={16} />
                Verified with full simulation
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                      <th className="px-4 py-2">Params</th>
                      <th className="px-4 py-2">Predicted</th>
                      <th className="px-4 py-2">Actual</th>
                      <th className="px-4 py-2">Error %</th>
                      <th className="px-4 py-2">Seeds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verified.map((v, i) => (
                      <tr key={i} className="border-t border-[var(--border-subtle)]">
                        <td className="px-4 py-2 font-mono text-xs">
                          {(v.parameters || []).map((p: number) => p.toFixed(3)).join(' · ')}
                        </td>
                        <td className="px-4 py-2 font-mono">
                          {v.predicted_kpis?.avg_travel_time?.toFixed?.(2) ?? '—'}
                        </td>
                        <td className="px-4 py-2 font-mono font-semibold">
                          {v.verified_kpis?.avg_travel_time?.toFixed?.(2) ?? '—'}
                        </td>
                        <td className="px-4 py-2 font-mono">
                          {v.prediction_error_pct?.toFixed?.(1) ?? '—'}%
                        </td>
                        <td className="px-4 py-2">{v.seeds_tested}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!candidates.length && !busy && (
            <div className="rounded-xl border border-dashed border-[var(--border-subtle)] p-10 text-center">
              <Sparkles className="h-8 w-8 text-[var(--accent)] mx-auto mb-3" />
              <p className="font-semibold text-[var(--text-primary)]">Search the intervention space</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
                Surrogate ranking is fast; Verify re-runs your MSA path so claims stay Level-1 honest.
              </p>
            </div>
          )}
        </div>
      )}

      {tab === 'ask' && (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center">
          <MessageCircle className="h-10 w-10 text-[var(--accent)] mx-auto mb-3" />
          <h2 className="text-lg font-bold mb-2">Grounded Ask</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-4">
            Template answers bound to run meta, KPIs, scene size, disaster drafts, and isolation — clearly
            labelled as not an LLM. Real LLM is Enhancement E-M3 behind a separate flag.
          </p>
          {featureFlags.aiCommand ? (
            <Button onClick={() => setShowAskAI(true)} className="gap-2">
              Open Ask panel <ChevronRight size={16} />
            </Button>
          ) : (
            <p className="text-xs font-mono text-[var(--text-muted)]">Set VITE_AI_COMMAND=1 to enable.</p>
          )}
        </div>
      )}

      {tab === 'health' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider">Runs</div>
              <div className="text-2xl font-extrabold font-mono mt-1">{runs.length}</div>
            </div>
            <div className="p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider">Avg TT</div>
              <div className="text-2xl font-extrabold font-mono mt-1">
                {kpis.avg_travel_time != null ? Number(kpis.avg_travel_time).toFixed(1) : '—'}
              </div>
            </div>
            <div className="p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider">VKT</div>
              <div className="text-2xl font-extrabold font-mono mt-1">
                {kpis.total_vkt != null || kpis.vkt != null
                  ? Number(kpis.total_vkt ?? kpis.vkt).toFixed(0)
                  : '—'}
              </div>
            </div>
            <div className="p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider">Latest status</div>
              <div className="text-lg font-bold font-mono mt-1 truncate">
                {runs[0]?.status || healthMeta?.status || '—'}
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            KPIs from the newest run meta when available. Open Compare for multi-seed CI and isolation delta.
          </p>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/projects/${projectId}/runs`)}>
            View all runs
          </Button>
        </div>
      )}
    </div>
  );
};
