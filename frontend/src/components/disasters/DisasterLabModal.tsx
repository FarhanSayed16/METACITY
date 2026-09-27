import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Droplets, Power, X, Ban, Play, Eye, Save } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useSceneStore } from '../../store/sceneStore';
import { useScenarioDraftStore, type ScenarioDraftOp } from '../../store/scenarioDraftStore';
import { useHealthStore } from '../../store/healthStore';
import { api } from '../../lib/api';
import { toast } from '../ui/Toast';
import { Button } from '../ui/Button';
import {
  applyScenarioOpsLocal,
  countClosedLinks,
  pickCentralLinks,
  severityToWaterLevel,
} from '../../lib/applyScenarioOpsLocal';

type HazardId = 'flood' | 'outage' | 'close_link';

const HAZARDS: Array<{
  id: HazardId;
  name: string;
  blurb: string;
  icon: typeof Droplets;
}> = [
  {
    id: 'flood',
    name: 'Flood',
    blurb: 'Inundate low-elevation nodes and close connected links (your flood op).',
    icon: Droplets,
  },
  {
    id: 'outage',
    name: 'Utility outage',
    blurb: 'Close central links by severity count (your outage op).',
    icon: Power,
  },
  {
    id: 'close_link',
    name: 'Close link',
    blurb: 'Close the map-selected link, or enter a link id.',
    icon: Ban,
  },
];

const DEFAULT_SEEDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

interface IsolationSnapshot {
  baseline_ratio: number;
  target_ratio: number;
  delta: number;
  closed_links: number;
  component_count: number;
}

export function DisasterLabModal() {
  const open = useUIStore((s) => s.showDisasterLab);
  const setOpen = useUIStore((s) => s.setShowDisasterLab);
  const selectedLinkId = useUIStore((s) => s.selectedLinkId);
  const sceneData = useSceneStore((s) => s.sceneData);
  const setPendingOps = useScenarioDraftStore((s) => s.setPendingOps);
  const mutationsLocked = useHealthStore((s) => s.apiReachable === false);
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [hazard, setHazard] = useState<HazardId>('flood');
  const [severity, setSeverity] = useState(3);
  const [linkIdInput, setLinkIdInput] = useState('');
  const [scenarioName, setScenarioName] = useState('');
  const [draftOps, setDraftOps] = useState<ScenarioDraftOp[]>([]);
  const [isolation, setIsolation] = useState<IsolationSnapshot | null>(null);
  const [measuring, setMeasuring] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && selectedLinkId) setLinkIdInput(selectedLinkId);
  }, [open, selectedLinkId]);

  const waterLevel = severityToWaterLevel(severity);
  const outageCount = Math.min(2 + severity * 2, 16);

  const buildOp = useCallback((): ScenarioDraftOp | null => {
    if (hazard === 'flood') {
      return { type: 'flood', data: { water_level: waterLevel } };
    }
    if (hazard === 'outage') {
      const ids = pickCentralLinks(sceneData, outageCount);
      if (ids.length === 0) {
        toast.warning('No links', 'Load a scene before triggering outage.');
        return null;
      }
      return { type: 'outage', data: { link_ids: ids } };
    }
    const id = (linkIdInput || selectedLinkId || '').trim();
    if (!id) {
      toast.warning('Link required', 'Select a link on the map or type a link id.');
      return null;
    }
    return { type: 'close_link', data: { id } };
  }, [hazard, waterLevel, outageCount, sceneData, linkIdInput, selectedLinkId]);

  const handleAddHazard = () => {
    const op = buildOp();
    if (!op) return;
    setDraftOps((prev) => [...prev, op]);
    setIsolation(null);
    toast.success('Hazard queued', `${op.type} added to lab draft.`);
  };

  const handleClearDraft = () => {
    setDraftOps([]);
    setIsolation(null);
  };

  const handleMeasure = async () => {
    if (!sceneData) {
      toast.error('No scene', 'Open a project map with a loaded scene.');
      return;
    }
    if (draftOps.length === 0) {
      toast.warning('Empty draft', 'Add at least one hazard first.');
      return;
    }
    setMeasuring(true);
    try {
      const baseline = await api.getIsolation(sceneData);
      const applied = applyScenarioOpsLocal(sceneData, draftOps);
      const target = await api.getIsolation(applied);
      const baseR = Number(baseline.isolation_ratio ?? 0);
      const tgtR = Number(target.isolation_ratio ?? 0);
      setIsolation({
        baseline_ratio: baseR,
        target_ratio: tgtR,
        delta: tgtR - baseR,
        closed_links: countClosedLinks(applied) - countClosedLinks(sceneData),
        component_count: Number(target.component_count ?? 0),
      });
    } catch (e: any) {
      toast.error('Isolation failed', e.message || 'Could not compute isolation.');
    } finally {
      setMeasuring(false);
    }
  };

  const label = useMemo(
    () => scenarioName.trim() || `Disaster Lab · ${draftOps.map((o) => o.type).join('+') || 'draft'}`,
    [scenarioName, draftOps]
  );

  const handlePreview = () => {
    if (draftOps.length === 0) {
      toast.warning('Empty draft', 'Add at least one hazard.');
      return;
    }
    setPendingOps(draftOps, label);
    setOpen(false);
    toast.success('Ghost preview', 'Closures shown as red dashed links on the map.');
  };

  const handleSaveScenario = async (andRun: boolean) => {
    if (!projectId) {
      toast.error('No project', 'Open a project workspace first.');
      return;
    }
    if (mutationsLocked) {
      toast.error('API down', 'Cannot create scenarios while offline.');
      return;
    }
    if (draftOps.length === 0) {
      toast.warning('Empty draft', 'Add at least one hazard.');
      return;
    }
    const name = scenarioName.trim() || `Disaster ${new Date().toISOString().slice(0, 16)}`;
    setBusy(true);
    try {
      const scenario = await api.createScenario({
        project_id: projectId,
        name,
        diff_ops: draftOps,
      });
      setPendingOps(draftOps, name);
      toast.success('Scenario saved', `"${name}" ready.`);
      if (andRun) {
        const runs = await api.triggerRun({ scenario_id: scenario.id, seeds: DEFAULT_SEEDS });
        toast.success('Runs enqueued', `${runs.length} seeds queued — watch isolation after Compare.`);
        setOpen(false);
        navigate(`/projects/${projectId}/map?run_id=${runs[0].id}`);
      } else {
        setOpen(false);
        navigate(`/projects/${projectId}`);
      }
    } catch (e: any) {
      toast.error('Save failed', e.message || 'Could not create scenario.');
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[var(--bg-chrome)]/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disaster-lab-title"
    >
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-chrome)] text-[var(--text-inverse)]">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[var(--warning)]" />
            <div>
              <h2 id="disaster-lab-title" className="text-base font-bold tracking-tight">
                Disaster Lab
              </h2>
              <p className="text-xs text-white/55">
                Draft flood / outage / close_link ops → ghost preview → run → isolation KPIs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 rounded-md hover:bg-white/10 text-white/70 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider text-[var(--text-muted)] uppercase mb-3">
              1. Hazard type
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {HAZARDS.map((h) => {
                const Icon = h.icon;
                const selected = hazard === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setHazard(h.id)}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      selected
                        ? 'border-[var(--accent)] bg-[var(--accent-muted)]'
                        : 'border-[var(--border-subtle)] hover:border-[var(--accent)]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon
                        className={`h-4 w-4 ${selected ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}
                      />
                      <span className="font-semibold text-sm text-[var(--text-primary)]">{h.name}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-snug">{h.blurb}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)]">
            {hazard !== 'close_link' ? (
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Severity
                  </label>
                  <span className="text-xs font-mono font-bold text-[var(--accent)]">Level {severity}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
                <p className="text-[11px] text-[var(--text-muted)] mt-2">
                  {hazard === 'flood'
                    ? `water_level ≈ ${waterLevel} (river corridor at x=500)`
                    : `Closes ~${outageCount} central links`}
                </p>
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                  Link id
                </label>
                <input
                  type="text"
                  value={linkIdInput}
                  onChange={(e) => setLinkIdInput(e.target.value)}
                  placeholder={selectedLinkId || 'e.g. LH7'}
                  className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] font-mono"
                />
                <p className="text-[11px] text-[var(--text-muted)] mt-2">
                  {selectedLinkId ? `Map selection: ${selectedLinkId}` : 'Click a link on the map, or type an id.'}
                </p>
              </div>
            )}

            <div>
              <label className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                Scenario name
              </label>
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="Flood corridor A"
                className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)]"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={handleAddHazard}>
                  Add to draft
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={handleClearDraft} disabled={!draftOps.length}>
                  Clear draft
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider text-[var(--text-muted)] uppercase mb-2">
              2. Draft ops ({draftOps.length})
            </h3>
            {draftOps.length === 0 ? (
              <div className="border border-dashed border-[var(--border-subtle)] rounded-lg p-6 text-center text-sm text-[var(--text-muted)]">
                No hazards yet. Add flood, outage, or close_link above.
              </div>
            ) : (
              <ul className="space-y-2">
                {draftOps.map((op, i) => (
                  <li
                    key={`${op.type}-${i}`}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] text-sm"
                  >
                    <span className="font-mono text-xs">
                      <strong className="text-[var(--accent)]">{op.type}</strong>{' '}
                      <span className="text-[var(--text-secondary)]">{JSON.stringify(op.data)}</span>
                    </span>
                    <button
                      type="button"
                      className="text-xs text-[var(--danger)] hover:underline"
                      onClick={() => {
                        setDraftOps((prev) => prev.filter((_, j) => j !== i));
                        setIsolation(null);
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-xs font-mono font-bold tracking-wider text-[var(--text-muted)] uppercase">
                3. Isolation preview
              </h3>
              <Button type="button" size="sm" variant="secondary" onClick={handleMeasure} disabled={measuring || !draftOps.length}>
                {measuring ? 'Measuring…' : 'Measure isolation'}
              </Button>
            </div>
            {isolation ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-sm">
                <div>
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">Baseline</div>
                  <div className="font-mono font-semibold">{isolation.baseline_ratio.toFixed(3)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">After draft</div>
                  <div className="font-mono font-semibold">{isolation.target_ratio.toFixed(3)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">Δ ratio</div>
                  <div className={`font-mono font-semibold ${isolation.delta > 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                    {isolation.delta >= 0 ? '+' : ''}
                    {isolation.delta.toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">Closed Δ / comps</div>
                  <div className="font-mono font-semibold">
                    +{isolation.closed_links} / {isolation.component_count}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">
                Preview fragmentation before you enqueue seeds. After a run, Compare shows the same isolation delta on real artefacts.
              </p>
            )}
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-[var(--text-muted)] max-w-xs">
            Ops use your scenario applier — not a second disaster engine.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={handlePreview} disabled={!draftOps.length} className="gap-1">
              <Eye size={14} /> Preview on map
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => handleSaveScenario(false)} disabled={busy || !draftOps.length} className="gap-1">
              <Save size={14} /> Save scenario
            </Button>
            <Button type="button" size="sm" onClick={() => handleSaveScenario(true)} disabled={busy || !draftOps.length} className="gap-1">
              <Play size={14} /> Save & run
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
