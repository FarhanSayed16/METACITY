import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { useHealthStore } from '../store/healthStore';
import { useUIStore } from '../store/uiStore';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const Planner: React.FC = () => {
  const { id: routeId } = useParams<{ id?: string }>();
  const activeProjectId = useUIStore((s) => s.activeProjectId);
  const projectId = routeId || activeProjectId;
  const navigate = useNavigate();
  const locked = useHealthStore((s) => s.apiReachable === false);

  const [candidates, setCandidates] = useState<any[]>([]);
  const [verified, setVerified] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  if (!projectId) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-2">Scenario Planner</h1>
        <p className="text-[var(--text-secondary)] mb-4">Open a project first to search and verify candidates.</p>
        <Button onClick={() => navigate('/projects')}>Go to Projects</Button>
      </div>
    );
  }

  const runSearch = async () => {
    if (locked) return;
    setBusy(true);
    try {
      const res = await api.plannerSearch(projectId, { n_candidates: 20 });
      setCandidates(res.candidates || []);
      setVerified([]);
      toast.success('Search complete', `${(res.candidates || []).length} candidates`);
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
        top_n: 3,
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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="text-amber-500" /> Scenario Planner
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Surrogate search over demand / weather / capacity, then verify top candidates with full simulation.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <Button onClick={runSearch} disabled={busy || locked} className="gap-2">
          <Sparkles size={16} /> Search candidates
        </Button>
        <Button variant="secondary" onClick={runVerify} disabled={busy || locked || !candidates.length} className="gap-2">
          <ShieldCheck size={16} /> Verify top 3
        </Button>
      </div>

      {candidates.length > 0 && (
        <div className="mb-8 border border-[var(--border-subtle)] rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-[var(--bg-surface)] font-semibold text-sm">Surrogate candidates</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">demand / weather / capacity↓</th>
                <th className="px-4 py-2">Predicted TT</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, i) => (
                <tr key={i} className="border-t border-[var(--border-subtle)]">
                  <td className="px-4 py-2 font-mono">{i + 1}</td>
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
      )}

      {verified.length > 0 && (
        <div className="border border-[var(--border-subtle)] rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-900 font-semibold text-sm">Verified (full sim)</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
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
                  <td className="px-4 py-2 font-mono">{v.predicted_kpis?.avg_travel_time?.toFixed?.(2) ?? '—'}</td>
                  <td className="px-4 py-2 font-mono">{v.verified_kpis?.avg_travel_time?.toFixed?.(2) ?? '—'}</td>
                  <td className="px-4 py-2 font-mono">{v.prediction_error_pct?.toFixed?.(1) ?? '—'}%</td>
                  <td className="px-4 py-2">{v.seeds_tested}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
