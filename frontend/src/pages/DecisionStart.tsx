import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPinned, Route, Waves, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { useUIStore } from '../store/uiStore';

const PRESET_ICONS: Record<string, typeof Route> = {
  highway_bypass: Route,
  flood: Waves,
  bridge_failure: AlertTriangle,
};

/**
 * Decision Mode — Screen A/B: pick a city template and an infrastructure plan.
 * No drawing, no JSON — cards only.
 */
export function DecisionStart() {
  const navigate = useNavigate();
  const setActiveProjectId = useUIStore((s) => s.setActiveProjectId);

  const [templates, setTemplates] = useState<any[]>([]);
  const [presets, setPresets] = useState<any[]>([]);
  const [templateFilename, setTemplateFilename] = useState('nexus_city_baseline.json');
  const [presetId, setPresetId] = useState('highway_bypass');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getTemplates(), api.getPresets()])
      .then(([t, p]) => {
        setTemplates(t);
        setPresets(p);
        if (t.length) {
          const nexus = t.find((x) => String(x.filename).includes('nexus')) || t[0];
          setTemplateFilename(nexus.filename);
        }
        if (p.length) {
          const bypass = p.find((x) => x.id === 'highway_bypass') || p[0];
          setPresetId(bypass.id);
        }
      })
      .catch(() => setError('Could not load cities or plans. Is the API running?'));
  }, []);

  const selectedPreset = useMemo(
    () => presets.find((p) => p.id === presetId),
    [presets, presetId]
  );

  const runDecision = async () => {
    setLoading(true);
    setError(null);
    setProgress('Creating baseline and plan runs…');
    try {
      const started = await api.startDecision({
        template_filename: templateFilename,
        preset_id: presetId,
        seeds: [0, 1, 2],
      });
      setActiveProjectId(started.project_id);
      setProgress('Simulating before vs after…');

      // Poll until complete, then open Impact
      const decisionId = started.decision_id;
      const startedAt = Date.now();
      const maxMs = 10 * 60 * 1000;

      while (Date.now() - startedAt < maxMs) {
        const status = await api.getDecision(decisionId);
        const frac = status.progress?.fraction ?? 0;
        setProgress(
          `Simulating… ${Math.round(frac * 100)}% (${status.progress?.completed ?? 0}/${status.progress?.total ?? '?'})`
        );
        if (status.status === 'completed' && status.result) {
          navigate(`/decision/${decisionId}/impact`);
          return;
        }
        if (status.status === 'error') {
          throw new Error('One or more simulation runs failed. Try again or open Advanced lab.');
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      throw new Error('Timed out waiting for simulation. Check the worker is running.');
    } catch (err: any) {
      setError(err.message || 'Decision run failed');
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return (
    <div className="min-h-full bg-[var(--bg-app)]">
      <div className="max-w-4xl mx-auto px-4 py-10 md:py-14 animate-fade-up">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-2">
          Decision Mode
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
          Test an infrastructure plan before you build it
        </h1>
        <p className="mt-3 text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          Pick a city, choose a plan (bypass, flood, bridge failure), and we simulate how traffic
          splits and how citizen stress changes — no drawing tools, no JSON.
        </p>

        <section className="mt-10">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <MapPinned className="h-4 w-4 text-[var(--accent)]" />
            1. Choose a city
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {templates.map((t) => {
              const active = t.filename === templateFilename;
              return (
                <button
                  key={t.filename}
                  type="button"
                  onClick={() => setTemplateFilename(t.filename)}
                  className={`text-left rounded-xl border p-4 transition-colors ${
                    active
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                      : 'border-[var(--border-subtle)] hover:border-[var(--accent)]/40 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Building2 className={`h-5 w-5 mt-0.5 ${active ? 'text-[var(--accent)]' : 'text-gray-400'}`} />
                    <div>
                      <div className="font-semibold text-[var(--text-primary)]">{t.name}</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-1">
                        {t.node_count} nodes · {t.link_count} links
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <Route className="h-4 w-4 text-[var(--accent)]" />
            2. Propose a change
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {presets.map((p) => {
              const active = p.id === presetId;
              const Icon = PRESET_ICONS[p.id] || Route;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPresetId(p.id)}
                  className={`text-left rounded-xl border p-4 transition-colors ${
                    active
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                      : 'border-[var(--border-subtle)] hover:border-[var(--accent)]/40 bg-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-2 ${active ? 'text-[var(--accent)]' : 'text-gray-400'}`} />
                  <div className="font-semibold text-[var(--text-primary)]">{p.name}</div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-3">
                    {p.description || `${p.ops_count || 0} network changes`}
                  </p>
                </button>
              );
            })}
          </div>
          {selectedPreset && (
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              Selected: <span className="font-medium text-[var(--text-primary)]">{selectedPreset.name}</span>
            </p>
          )}
        </section>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            type="button"
            onClick={runDecision}
            disabled={loading || !templateFilename || !presetId}
            className="min-w-[220px]"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Running simulation…
              </span>
            ) : (
              'Simulate before vs after'
            )}
          </Button>
          {progress && (
            <span className="text-sm text-[var(--text-secondary)]">{progress}</span>
          )}
        </div>

        <p className="mt-8 text-xs text-[var(--text-secondary)]">
          Need the network editor, DSA demos, or hospital/evac labs?{' '}
          <button
            type="button"
            className="text-[var(--accent)] underline underline-offset-2"
            onClick={() => {
              useUIStore.getState().setAdvancedLab(true);
              navigate('/projects');
            }}
          >
            Open Advanced lab
          </button>
        </p>
      </div>
    </div>
  );
}

export default DecisionStart;
