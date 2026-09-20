import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { CalibrationBadge } from '../components/Compare/CalibrationBadge';
import { AssumptionsDrawer } from '../components/Compare/AssumptionsDrawer';
import { MechanismTrace } from '../components/Compare/MechanismTrace';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Info, ArrowRightLeft, GitCompare, Scale } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Compare() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [baseId, setBaseId] = useState('');
  const [targetId, setTargetId] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [assumptionsOpen, setAssumptionsOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      api.getScenarios(projectId).then((scens) => {
        setScenarios(scens);
        if (scens.length >= 2) {
          setBaseId(scens[0].id);
          setTargetId(scens[1].id);
        } else if (scens.length === 1) {
          setBaseId(scens[0].id);
          setTargetId(scens[0].id);
        }
      });
    }
  }, [projectId]);

  const handleCompare = async () => {
    if (!baseId || !targetId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.compareScenarios({
        baseline_scenario_id: baseId,
        target_scenario_id: targetId,
      });
      setResult(res);
    } catch (err: any) {
      setError(
        err.message ||
          'Comparison failed. Both scenarios need completed runs with matching seeds.'
      );
    } finally {
      setLoading(false);
    }
  };

  const chartData = result
    ? [
        {
          name: 'Mean travel time (mins)',
          Baseline: result.statistics.travel_time.baseline_mean,
          Scenario: result.statistics.travel_time.scenario_mean,
        },
        {
          name: 'Mean trips',
          Baseline: result.statistics.trips.baseline_mean,
          Scenario: result.statistics.trips.scenario_mean,
        },
      ]
    : [];

  const sameScenario = baseId && targetId && baseId === targetId;
  const tt = result?.statistics?.travel_time;
  const trips = result?.statistics?.trips;
  const inconclusive =
    result?.statistics &&
    tt &&
    trips &&
    !tt.significant &&
    !trips.significant;

  if (!projectId) {
    return (
      <div className="p-8">
        <EmptyState
          icon={GitCompare}
          title="Open a project to compare"
          description="Scenario comparison needs a project with at least two completed multi-seed runs."
          actionLabel="Go to projects"
          onAction={() => navigate('/projects')}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Compare scenarios</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Paired-seed statistics with 95% CI and mechanism trace.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {result && (
            <CalibrationBadge
              status={result.calibration_status}
              onClick={() => setAssumptionsOpen(true)}
            />
          )}
          <Button variant="secondary" size="sm" onClick={() => setAssumptionsOpen(true)}>
            <Info size={16} className="mr-2" /> Claims & Assumptions
          </Button>
        </div>
      </div>

      {scenarios.length < 2 ? (
        <EmptyState
          icon={Scale}
          title="Need two scenarios"
          description="Create a baseline and a target scenario (for example Highway Bypass), run each with matching seeds, then return here."
          actionLabel="Open map / scenarios"
          onAction={() => navigate(`/projects/${projectId}/map`)}
        />
      ) : (
        <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-4 md:p-5 shadow-sm mb-6 flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Baseline
            </label>
            <select
              className="w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-surface)] p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
              value={baseId}
              onChange={(e) => setBaseId(e.target.value)}
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-[var(--text-muted)] pb-2 hidden md:block">
            <ArrowRightLeft size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Target
            </label>
            <select
              className="w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-surface)] p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleCompare}
            disabled={loading || !baseId || !targetId || Boolean(sameScenario)}
          >
            {loading ? 'Running…' : 'Compare (t-test)'}
          </Button>
        </div>
      )}

      {sameScenario && scenarios.length >= 2 && (
        <p className="text-sm text-[var(--warning)] mb-4 -mt-2">
          Pick two different scenarios — comparing a scenario to itself is not meaningful.
        </p>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-[var(--danger)] p-4 mb-6 rounded-r-lg">
          <p className="text-red-800 text-sm font-medium mb-1">Comparison failed</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {inconclusive && (
        <div className="mb-6 rounded-xl border border-[var(--border-color)] bg-[var(--accent-muted)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">How to read this:</strong> neither
          travel time nor trips show a statistically significant difference at α = 0.05 (no *).
          That is not a failure — it means the effect is too small or noisy for this seed set.
          Check the 95% CI width and mechanism trace before claiming impact.
        </div>
      )}

      {result && result.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border-color)]">
              <h3 className="font-semibold text-[var(--text-primary)]">Statistical results</h3>
              <p className="text-xs text-[var(--text-muted)]">
                n = {result.statistics.samples} paired seeds · * = significant at 0.05
              </p>
            </div>
            <table className="min-w-full divide-y divide-[var(--border-color)] text-sm">
              <thead className="bg-[var(--bg-card)]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">
                    Metric
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-[var(--text-muted)]">
                    Mean Δ
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-[var(--text-muted)]">
                    95% CI
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-[var(--text-muted)]">
                    p-value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                <tr>
                  <td className="px-4 py-3 font-medium">Travel time</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={
                        tt.diff_mean > 0
                          ? 'text-[var(--danger)] font-semibold'
                          : 'text-[var(--success)] font-semibold'
                      }
                    >
                      {tt.diff_mean > 0 ? '+' : ''}
                      {tt.diff_mean.toFixed(2)}m
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                    [{tt.ci_lower.toFixed(2)}, {tt.ci_upper.toFixed(2)}]
                  </td>
                  <td className="px-4 py-3 text-right">
                    {tt.significant ? (
                      <span className="text-[var(--success)] font-semibold">
                        {tt.p_value.toFixed(4)} *
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">{tt.p_value.toFixed(4)}</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Trips completed</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={
                        trips.diff_mean > 0
                          ? 'text-[var(--success)] font-semibold'
                          : 'text-[var(--danger)] font-semibold'
                      }
                    >
                      {trips.diff_mean > 0 ? '+' : ''}
                      {trips.diff_mean.toFixed(0)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                    [{trips.ci_lower.toFixed(1)}, {trips.ci_upper.toFixed(1)}]
                  </td>
                  <td className="px-4 py-3 text-right">
                    {trips.significant ? (
                      <span className="text-[var(--success)] font-semibold">
                        {trips.p_value.toFixed(4)} *
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">{trips.p_value.toFixed(4)}</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <MechanismTrace mechanisms={result.mechanisms} />

          {result.isolation_delta && (
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                Isolation (disaster network)
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                Post-scenario isolation ratio delta (higher = more fragmentation).
              </p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-xs text-[var(--text-muted)]">Baseline</div>
                  <div className="font-mono">
                    {Number(result.isolation_delta.baseline_isolation_ratio ?? 0).toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-muted)]">Target</div>
                  <div className="font-mono">
                    {Number(result.isolation_delta.target_isolation_ratio ?? 0).toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-muted)]">Δ</div>
                  <div className="font-mono font-semibold">
                    {Number(result.isolation_delta.delta_isolation_ratio ?? 0) >= 0 ? '+' : ''}
                    {Number(result.isolation_delta.delta_isolation_ratio ?? 0).toFixed(3)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm col-span-1 md:col-span-2 h-[360px] md:h-[400px]">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Mean comparisons</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'var(--bg-hover)' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-panel)',
                  }}
                />
                <Legend />
                <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Scenario" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!result && !error && !loading && scenarios.length >= 2 && !sameScenario && (
        <EmptyState
          icon={GitCompare}
          title="Ready to compare"
          description="Select baseline and target, then run the paired t-test. Results include CI bands, significance, and a mechanism trace for storytelling."
        />
      )}

      <AssumptionsDrawer opened={assumptionsOpen} onClose={() => setAssumptionsOpen(false)} />
    </div>
  );
}
