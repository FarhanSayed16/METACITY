import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Download,
  Loader2,
  RefreshCw,
  Scale,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, API_BASE } from '../lib/api';
import { Button } from '../components/ui/Button';
import { CalibrationBadge } from '../components/Compare/CalibrationBadge';
import { AssumptionsDrawer } from '../components/Compare/AssumptionsDrawer';
import { featureFlags } from '../lib/featureFlags';
import { useUIStore } from '../store/uiStore';

/**
 * Decision Mode — Screen C: Impact briefing (before vs after).
 */
export function DecisionImpact() {
  const { decisionId } = useParams<{ decisionId: string }>();
  const navigate = useNavigate();
  const setActiveProjectId = useUIStore((s) => s.setActiveProjectId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);

  useEffect(() => {
    if (!decisionId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let status = await api.getDecision(decisionId);
        const startedAt = Date.now();
        while (
          !cancelled &&
          status.status === 'running' &&
          Date.now() - startedAt < 10 * 60 * 1000
        ) {
          await new Promise((r) => setTimeout(r, 2000));
          status = await api.getDecision(decisionId);
        }
        if (cancelled) return;
        if (status.status !== 'completed' || !status.result) {
          const msg =
            status.status === 'error'
              ? 'Simulation failed for this decision.'
              : status.compare_error || 'Decision is still running. Wait and refresh.';
          throw new Error(msg);
        }
        setData(status);
        if (status.project_id) setActiveProjectId(status.project_id);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load impact');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [decisionId, setActiveProjectId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-[var(--text-secondary)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
        <p className="text-sm">Building your impact briefing…</p>
      </div>
    );
  }

  if (error || !data?.result) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <p className="text-red-700 mb-4">{error || 'No result'}</p>
        <Button onClick={() => navigate('/decision')}>Try another plan</Button>
      </div>
    );
  }

  const result = data.result;
  const stats = result.statistics || {};
  const tt = stats.travel_time || {};
  const stress = stats.stress || {};
  const impatience = stats.impatience || {};
  const citizen = result.citizen_impact || {};
  const narrative: string[] = result.narrative || result.mechanisms || [];
  const projectId = data.project_id as string;
  const planRunId = result.sample_plan_run_id as string;
  const baselineRunId = result.sample_baseline_run_id as string;

  const chartData = [
    {
      name: 'Travel time (min)',
      Before: tt.baseline_mean ?? 0,
      After: tt.scenario_mean ?? 0,
    },
    {
      name: 'Stress index',
      Before: stress.baseline_mean ?? citizen.baseline?.stress_index ?? 0,
      After: stress.scenario_mean ?? citizen.plan?.stress_index ?? 0,
    },
    {
      name: 'Impatience',
      Before: impatience.baseline_mean ?? citizen.baseline?.impatience_index ?? 0,
      After: impatience.scenario_mean ?? citizen.plan?.impatience_index ?? 0,
    },
  ];

  const reportUrl = `${API_BASE}/reports/comparison?baseline_id=${encodeURIComponent(
    data.baseline_scenario_id
  )}&target_id=${encodeURIComponent(data.plan_scenario_id)}`;

  const stressDelta =
    (stress.scenario_mean ?? citizen.plan?.stress_index ?? 0) -
    (stress.baseline_mean ?? citizen.baseline?.stress_index ?? 0);

  return (
    <div className="min-h-full bg-[var(--bg-app)]">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 animate-fade-up">
        <button
          type="button"
          onClick={() => navigate('/decision')}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Try another plan
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-1">
              Impact briefing
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              {data.preset_name || 'Infrastructure plan'}
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-xl">
              {data.preset_description ||
                'Before vs after simulation for decision-makers — traffic bifurcation and citizen impact.'}
            </p>
          </div>
          <CalibrationBadge
            status={result.calibration_status || 'synthetic_uncalibrated'}
            onClick={() => setAssumptionsOpen(true)}
          />
        </div>

        {/* Big numbers */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard
            label="Avg travel time"
            before={fmt(tt.baseline_mean, 'min')}
            after={fmt(tt.scenario_mean, 'min')}
            better={
              tt.scenario_mean != null &&
              tt.baseline_mean != null &&
              tt.scenario_mean < tt.baseline_mean
            }
          />
          <KpiCard
            label="Stress index"
            before={fmt(stress.baseline_mean ?? citizen.baseline?.stress_index)}
            after={fmt(stress.scenario_mean ?? citizen.plan?.stress_index)}
            better={stressDelta < 0}
          />
          <KpiCard
            label="People delayed"
            before={String(citizen.baseline?.people_delayed ?? '—')}
            after={String(citizen.plan?.people_delayed ?? '—')}
            better={
              (citizen.plan?.people_delayed ?? 0) < (citizen.baseline?.people_delayed ?? 0)
            }
          />
          <KpiCard
            label="Impatience"
            before={fmt(impatience.baseline_mean ?? citizen.baseline?.impatience_index)}
            after={fmt(impatience.scenario_mean ?? citizen.plan?.impatience_index)}
            better={
              (impatience.scenario_mean ?? citizen.plan?.impatience_index ?? 0) <
              (impatience.baseline_mean ?? citizen.baseline?.impatience_index ?? 0)
            }
          />
        </div>

        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-white p-4 md:p-5">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <Scale className="h-4 w-4 text-[var(--accent)]" />
              Before vs after
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Paired multi-seed comparison (real dual runs — not a cosmetic wipe).
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Before" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="After" fill="#2A9D8F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-white p-4 md:p-5">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              What this means for people
            </h2>
            <ul className="space-y-3">
              {narrative.map((line, i) => (
                <li key={i} className="text-sm text-[var(--text-primary)] leading-relaxed flex gap-2">
                  <span className="text-[var(--accent)] font-bold shrink-0">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-3">
              Stress and Impatience are Level-1 scores derived from trip delays (not microsimulated
              emotions). Open assumptions for the formulas.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {featureFlags.cityTwin && (
            <Button
              type="button"
              onClick={() =>
                navigate(`/projects/${projectId}/city?run_id=${encodeURIComponent(planRunId)}`)
              }
            >
              <span className="inline-flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                View after in 3D Twin
              </span>
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              navigate(`/projects/${projectId}/city?run_id=${encodeURIComponent(baselineRunId)}`)
            }
          >
            View before in 3D
          </Button>
          <a
            href={reportUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex"
          >
            <Button type="button" variant="secondary">
              <span className="inline-flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download report
              </span>
            </Button>
          </a>
          <Button type="button" variant="ghost" onClick={() => navigate('/decision')}>
            <span className="inline-flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try another plan
            </span>
          </Button>
        </div>

        <p className="mt-6 text-xs text-[var(--text-secondary)]">
          Advanced:{' '}
          <Link className="text-[var(--accent)] underline" to={`/projects/${projectId}/compare`}>
            Compare tools
          </Link>
          {' · '}
          <Link className="text-[var(--accent)] underline" to={`/projects/${projectId}/map`}>
            Network editor
          </Link>
          {' · '}
          <Link className="text-[var(--accent)] underline" to={`/projects/${projectId}/runs`}>
            Runs
          </Link>
        </p>
      </div>

      <AssumptionsDrawer opened={assumptionsOpen} onClose={() => setAssumptionsOpen(false)} />
    </div>
  );
}

function fmt(v: number | undefined | null, unit = ''): string {
  if (v == null || Number.isNaN(Number(v))) return '—';
  const n = Number(v);
  const s = Math.abs(n) >= 10 ? n.toFixed(1) : n.toFixed(2);
  return unit ? `${s} ${unit}` : s;
}

function KpiCard({
  label,
  before,
  after,
  better,
}: {
  label: string;
  before: string;
  after: string;
  better?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-white p-4">
      <div className="text-xs text-[var(--text-secondary)] mb-2">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-gray-400 line-through decoration-gray-300">{before}</span>
        <span
          className={`text-xl font-bold tabular-nums ${
            better === true
              ? 'text-emerald-700'
              : better === false
                ? 'text-amber-700'
                : 'text-[var(--text-primary)]'
          }`}
        >
          {after}
        </span>
      </div>
      <div className="text-[10px] uppercase tracking-wide text-gray-400 mt-1">Before → After</div>
    </div>
  );
}

export default DecisionImpact;
