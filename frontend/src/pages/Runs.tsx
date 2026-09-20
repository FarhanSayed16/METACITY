import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/Toast';
import { useHealthStore } from '../store/healthStore';
import { useUIStore } from '../store/uiStore';
import { Map, RefreshCw, FileBarChart } from 'lucide-react';

export const Runs: React.FC = () => {
  const { id: routeProjectId, runId } = useParams<{ id?: string; runId?: string }>();
  const activeProjectId = useUIStore((s) => s.activeProjectId);
  const projectId = routeProjectId || activeProjectId;
  const navigate = useNavigate();
  const locked = useHealthStore((s) => s.apiReachable === false);

  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<{ meta: any; metrics: any; run: any } | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.listProjectRuns(projectId)
      .then(setRuns)
      .catch((e) => setError(e.message || 'Failed to load runs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [projectId]);

  useEffect(() => {
    const target = runId;
    if (!target) {
      setDetail(null);
      return;
    }
    Promise.all([
      api.getRun(target).catch(() => null),
      api.getRunMeta(target).catch(() => ({})),
      api.getRunMetrics(target).catch(() => ({})),
    ]).then(([run, meta, metrics]) => {
      setDetail({ run, meta, metrics });
    });
  }, [runId]);

  if (!projectId) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-2">Simulations</h1>
        <p className="text-[var(--text-secondary)] mb-6">
          Open a project first, then view its run history here.
        </p>
        <Button onClick={() => navigate('/projects')}>Go to Projects</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={load}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Simulations</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Project runs with MSA gap and status
          </p>
        </div>
        <Button variant="secondary" onClick={load} className="gap-2" disabled={locked}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {detail && (
        <div className="mb-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-5">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-lg font-semibold font-mono">{runId}</h2>
            <Button variant="ghost" onClick={() => navigate(`/projects/${projectId}/runs`)}>Close</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-[var(--text-muted)] text-xs uppercase">Status</div>
              <div className="font-medium">{detail.run?.status ?? '—'}</div>
            </div>
            <div>
              <div className="text-[var(--text-muted)] text-xs uppercase">Final gap</div>
              <div className="font-mono font-medium">
                {detail.meta?.final_gap != null ? Number(detail.meta.final_gap).toExponential(2) : '—'}
              </div>
            </div>
            <div>
              <div className="text-[var(--text-muted)] text-xs uppercase">Iterations</div>
              <div className="font-medium">{detail.meta?.iterations ?? '—'}</div>
            </div>
            <div>
              <div className="text-[var(--text-muted)] text-xs uppercase">Avg travel (min)</div>
              <div className="font-medium">
                {detail.metrics?.average_travel_time_mins != null
                  ? Number(detail.metrics.average_travel_time_mins).toFixed(2)
                  : '—'}
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              className="gap-2"
              onClick={() => navigate(`/projects/${projectId}/map?run_id=${runId}`)}
            >
              <Map className="h-4 w-4" /> Open on map
            </Button>
          </div>
        </div>
      )}

      {runs.length === 0 ? (
        <div className="border border-dashed border-[var(--border-subtle)] rounded-lg p-12 text-center">
          <FileBarChart className="h-10 w-10 mx-auto text-[var(--text-muted)] mb-3" />
          <h3 className="font-semibold mb-1">No runs yet</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Create a scenario and run seeds 0–9 from the project overview.
          </p>
          <Button onClick={() => navigate(`/projects/${projectId}`)}>Back to project</Button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[var(--border-subtle)] rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-surface)] text-left text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Scenario</th>
                <th className="px-4 py-3 font-medium">Seed</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Gap</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id} className="border-t border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]">
                  <td className="px-4 py-3">{r.scenario_name || r.scenario_id.slice(0, 8)}</td>
                  <td className="px-4 py-3 font-mono">{r.seed}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      r.status === 'completed' ? 'bg-emerald-500/15 text-emerald-600' :
                      r.status === 'running' || r.status === 'pending' ? 'bg-amber-500/15 text-amber-600' :
                      'bg-red-500/15 text-red-600'
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {r.final_gap != null ? Number(r.final_gap).toExponential(2) : '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)] text-xs">
                    {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      to={`/projects/${projectId}/runs/${r.id}`}
                      className="text-blue-500 hover:underline text-xs"
                    >
                      Detail
                    </Link>
                    <button
                      className="text-blue-500 hover:underline text-xs"
                      onClick={() => navigate(`/projects/${projectId}/map?run_id=${r.id}`)}
                    >
                      Map
                    </button>
                    {(r.status === 'error' || r.status === 'interrupted') && (
                      <button
                        className="text-amber-600 hover:underline text-xs disabled:opacity-40"
                        disabled={locked}
                        onClick={async () => {
                          try {
                            await api.retryRun(r.id);
                            toast.success('Retry queued', `Run ${r.id.slice(0, 8)}…`);
                            load();
                          } catch (e: any) {
                            toast.error('Retry failed', e.message);
                          }
                        }}
                      >
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
