import React, { useState } from 'react';
import { useUIStore } from '../store/uiStore';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { useHealthStore } from '../store/healthStore';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const projectId = useUIStore((s) => s.activeProjectId);
  const locked = useHealthStore((s) => s.apiReachable === false);
  const navigate = useNavigate();

  const [years, setYears] = useState(3);
  const [yearHistory, setYearHistory] = useState<any[]>([]);
  const [paramName, setParamName] = useState('demand_scale');
  const [sweepValues, setSweepValues] = useState('0.75,1.0,1.25');
  const [sweepResults, setSweepResults] = useState<Record<string, any> | null>(null);
  const [warm, setWarm] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const requireProject = () => {
    if (!projectId) {
      toast.warning('No project', 'Open a project first so analysis has a scene.');
      navigate('/projects');
      return false;
    }
    return true;
  };

  const runMultiYear = async () => {
    if (!requireProject() || locked) return;
    setBusy(true);
    try {
      const res = await api.multiYear(projectId!, { years, shift_rate: 0.05 });
      setYearHistory(res.history || []);
      toast.success('Multi-year', `${(res.history || []).length} years`);
    } catch (e: any) {
      toast.error('Multi-year failed', e.message);
    } finally {
      setBusy(false);
    }
  };

  const runSweep = async () => {
    if (!requireProject() || locked) return;
    const values = sweepValues.split(',').map((v) => Number(v.trim())).filter((n) => !Number.isNaN(n));
    if (!values.length) {
      toast.warning('Values required', 'Enter comma-separated numbers.');
      return;
    }
    setBusy(true);
    try {
      const res = await api.sweep(projectId!, {
        param_name: paramName,
        values,
        msa_max_iter: 5,
      });
      setSweepResults(res.results || {});
      toast.success('Sweep complete', paramName);
    } catch (e: any) {
      toast.error('Sweep failed', e.message);
    } finally {
      setBusy(false);
    }
  };

  const runWarm = async () => {
    if (!requireProject() || locked) return;
    setBusy(true);
    try {
      const res = await api.warmStartCompare(projectId!, { msa_max_iter: 8 });
      setWarm(res);
      toast.success('Warm-start', `${res.links_seeded} links seeded`);
    } catch (e: any) {
      toast.error('Warm-start failed', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Settings & Analysis</h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Active project: <span className="font-mono">{projectId || 'none'}</span>
        </p>
      </div>

      <section className="bg-[var(--bg-surface)] p-6 rounded-lg border border-[var(--border-subtle)]">
        <h2 className="text-lg font-medium mb-2">Multi-year housing loop</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Shift population toward accessible zones each year and record KPIs.
        </p>
        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm">Years</label>
          <input
            type="number"
            min={1}
            max={8}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-20 bg-[var(--bg-input)] border border-[var(--border-color)] rounded px-2 py-1 text-sm"
          />
          <Button onClick={runMultiYear} disabled={busy || locked}>Run</Button>
        </div>
        {yearHistory.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-muted)]">
                <th className="py-1">Year</th>
                <th>Population</th>
                <th>CO₂ kg</th>
                <th>Electricity</th>
              </tr>
            </thead>
            <tbody>
              {yearHistory.map((h) => (
                <tr key={h.year} className="border-t border-[var(--border-subtle)]">
                  <td className="py-1 font-mono">{h.year}</td>
                  <td>{h.population}</td>
                  <td>{Number(h.total_co2_kg || 0).toFixed(1)}</td>
                  <td>{Number(h.total_electricity_kwh || 0).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="bg-[var(--bg-surface)] p-6 rounded-lg border border-[var(--border-subtle)]">
        <h2 className="text-lg font-medium mb-2">Sensitivity sweep</h2>
        <div className="flex flex-wrap gap-3 mb-4 items-end">
          <div>
            <label className="text-xs text-[var(--text-muted)] block mb-1">Parameter</label>
            <select
              value={paramName}
              onChange={(e) => setParamName(e.target.value)}
              className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded px-2 py-1.5 text-sm"
            >
              <option value="demand_scale">demand_scale</option>
              <option value="car_ownership_rate">car_ownership_rate</option>
              <option value="total_population">total_population</option>
              <option value="bpr_alpha">bpr_alpha</option>
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs text-[var(--text-muted)] block mb-1">Values (comma-separated)</label>
            <input
              value={sweepValues}
              onChange={(e) => setSweepValues(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded px-2 py-1.5 text-sm font-mono"
            />
          </div>
          <Button onClick={runSweep} disabled={busy || locked}>Sweep</Button>
        </div>
        {sweepResults && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-muted)]">
                <th className="py-1">Value</th>
                <th>Trips</th>
                <th>Avg TT</th>
                <th>Gap</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(sweepResults).map(([k, v]: any) => (
                <tr key={k} className="border-t border-[var(--border-subtle)]">
                  <td className="py-1 font-mono">{k}</td>
                  <td>{v.total_trips}</td>
                  <td>{Number(v.avg_travel_time).toFixed(2)}</td>
                  <td className="font-mono text-xs">{Number(v.final_gap).toExponential(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="bg-[var(--bg-surface)] p-6 rounded-lg border border-[var(--border-subtle)]">
        <h2 className="text-lg font-medium mb-2">Warm-start vs cold</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Seed MSA with cold-run link travel times and compare gap / iterations.
        </p>
        <Button onClick={runWarm} disabled={busy || locked}>Compare cold vs warm</Button>
        {warm && (
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded bg-[var(--bg-canvas)]">
              <div className="font-semibold mb-1">Cold</div>
              <div>gap {Number(warm.cold.final_gap).toExponential(2)}</div>
              <div>iters {warm.cold.iterations}</div>
              <div>TT {Number(warm.cold.avg_travel_time_mins).toFixed(2)}</div>
            </div>
            <div className="p-3 rounded bg-[var(--bg-canvas)]">
              <div className="font-semibold mb-1">Warm</div>
              <div>gap {Number(warm.warm.final_gap).toExponential(2)}</div>
              <div>iters {warm.warm.iterations}</div>
              <div>TT {Number(warm.warm.avg_travel_time_mins).toFixed(2)}</div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
