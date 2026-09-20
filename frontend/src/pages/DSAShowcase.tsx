import { useMemo, useState } from 'react';
import { Route, Search, Activity, ChevronRight, Play } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { useHealthStore } from '../store/healthStore';
import { toast } from '../components/ui/Toast';

/** Tiny demo network for live A* / Brandes / Bridges demos */
const DEMO_SCENE = {
  schema_version: '1.0.0',
  name: 'DSA Demo Grid',
  nodes: [
    { id: 'A', x: 0, y: 0 },
    { id: 'B', x: 500, y: 0 },
    { id: 'C', x: 1000, y: 0 },
    { id: 'D', x: 0, y: 500 },
    { id: 'E', x: 500, y: 500 },
    { id: 'F', x: 1000, y: 500 },
  ],
  links: [
    { id: 'AB', from_node: 'A', to_node: 'B', lanes: 2, speed_kph: 50, capacity_per_lane_per_hour: 1800 },
    { id: 'BC', from_node: 'B', to_node: 'C', lanes: 2, speed_kph: 50, capacity_per_lane_per_hour: 1800 },
    { id: 'AD', from_node: 'A', to_node: 'D', lanes: 1, speed_kph: 40, capacity_per_lane_per_hour: 1200 },
    { id: 'BE', from_node: 'B', to_node: 'E', lanes: 2, speed_kph: 45, capacity_per_lane_per_hour: 1600 },
    { id: 'CF', from_node: 'C', to_node: 'F', lanes: 1, speed_kph: 40, capacity_per_lane_per_hour: 1200 },
    { id: 'DE', from_node: 'D', to_node: 'E', lanes: 2, speed_kph: 50, capacity_per_lane_per_hour: 1800 },
    { id: 'EF', from_node: 'E', to_node: 'F', lanes: 2, speed_kph: 50, capacity_per_lane_per_hour: 1800 },
    { id: 'AE', from_node: 'A', to_node: 'E', lanes: 1, speed_kph: 35, capacity_per_lane_per_hour: 1000 },
  ],
  zones: [],
  facilities: [],
};

export function DSAShowcase() {
  const [activeTab, setActiveTab] = useState<'pathfinding' | 'bpr' | 'centrality'>('pathfinding');
  const locked = useHealthStore((s) => s.apiReachable === false);
  const [busy, setBusy] = useState(false);

  const [pathResult, setPathResult] = useState<any>(null);
  const [msaResult, setMsaResult] = useState<any>(null);
  const [centResult, setCentResult] = useState<any>(null);
  const [bridgeResult, setBridgeResult] = useState<any>(null);

  const topCentrality = useMemo(() => {
    if (!centResult?.centrality) return [];
    return Object.entries(centResult.centrality)
      .map(([id, score]) => ({ id, score: Number(score) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [centResult]);

  const runPathfind = async () => {
    if (locked) return;
    setBusy(true);
    try {
      const res = await api.pathfind(DEMO_SCENE, 'A', 'F');
      setPathResult(res);
      toast.success('A* complete', res.found ? `${res.hops} hops` : 'No path');
    } catch (e: any) {
      toast.error('Pathfind failed', e.message);
    } finally {
      setBusy(false);
    }
  };

  const runMsa = async () => {
    if (locked) return;
    setBusy(true);
    try {
      const res = await api.msaDemo({
        free_flow: [10, 12, 8],
        capacity: [1000, 800, 1200],
        demand: 1500,
        max_iters: 25,
        epsilon: 0.01,
      });
      setMsaResult(res);
      toast.success('MSA demo', `gap=${Number(res.final_gap).toExponential(2)}`);
    } catch (e: any) {
      toast.error('MSA demo failed', e.message);
    } finally {
      setBusy(false);
    }
  };

  const runCentrality = async () => {
    if (locked) return;
    setBusy(true);
    try {
      const [c, b] = await Promise.all([
        api.getCentrality(DEMO_SCENE),
        api.getBridges(DEMO_SCENE),
      ]);
      setCentResult(c);
      setBridgeResult(b);
      toast.success('Brandes + bridges', `${b.count} bridge(s)`);
    } catch (e: any) {
      toast.error('Centrality failed', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Algorithm Showcase</h1>
        <p className="text-[var(--text-secondary)]">
          Live demos against the METACITY API — A*, MSA/BPR equilibrium, and Brandes betweenness.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 space-y-2">
          {(
            [
              ['pathfinding', 'A* Pathfinding', Route, 'blue'],
              ['bpr', 'MSA / BPR', Activity, 'purple'],
              ['centrality', "Brandes' Algorithm", Search, 'green'],
            ] as const
          ).map(([key, label, Icon, color]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                activeTab === key
                  ? `bg-${color}-50 border-${color}-200 shadow-sm`
                  : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-color)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeTab === key ? `bg-${color}-100 text-${color}-600` : 'bg-gray-100 text-gray-500'}`}>
                  <Icon size={20} />
                </div>
                <span className={`font-medium ${activeTab === key ? 'text-gray-900' : 'text-gray-700'}`}>{label}</span>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>

        <div className="col-span-1 md:col-span-3">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-sm p-8 min-h-[500px]">
            {activeTab === 'pathfinding' && (
              <div>
                <h2 className="text-2xl font-bold mb-2">A* Pathfinding (Heap-based)</h2>
                <p className="text-[var(--text-secondary)] mb-4">
                  Shortest path on the demo grid from <code>A</code> → <code>F</code> using free-flow times.
                </p>
                <Button className="gap-2 mb-6" onClick={runPathfind} disabled={busy || locked}>
                  <Play size={16} /> Run live A*
                </Button>
                {pathResult && (
                  <div className="bg-slate-900 text-emerald-300 rounded-xl p-5 font-mono text-sm space-y-2">
                    <div>found: {String(pathResult.found)}</div>
                    <div>path: {(pathResult.path || []).join(' → ') || '—'}</div>
                    <div>hops: {pathResult.hops}</div>
                    <div>cost_mins: {pathResult.cost_mins != null ? Number(pathResult.cost_mins).toFixed(4) : '—'}</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bpr' && (
              <div>
                <h2 className="text-2xl font-bold mb-2">Method of Successive Averages</h2>
                <p className="text-[var(--text-secondary)] mb-4">
                  Toy 3-link corridor: demand assigned all-or-nothing, smoothed with MSA, costs via BPR.
                </p>
                <Button className="gap-2 mb-6" onClick={runMsa} disabled={busy || locked}>
                  <Play size={16} /> Run MSA / BPR demo
                </Button>
                {msaResult && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                        <div className="text-xs text-purple-700">Iterations</div>
                        <div className="font-bold text-purple-900">{msaResult.iterations}</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                        <div className="text-xs text-purple-700">Final gap</div>
                        <div className="font-mono font-bold text-purple-900">
                          {Number(msaResult.final_gap).toExponential(2)}
                        </div>
                      </div>
                      <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                        <div className="text-xs text-purple-700">Converged</div>
                        <div className="font-bold text-purple-900">{String(msaResult.converged)}</div>
                      </div>
                    </div>
                    <div className="bg-slate-900 text-purple-200 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                      volumes: [{(msaResult.final_volumes || []).join(', ')}]
                      <br />
                      gaps: [{(msaResult.gaps || []).map((g: number) => g.toExponential(1)).join(', ')}]
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'centrality' && (
              <div>
                <h2 className="text-2xl font-bold mb-2">Brandes Betweenness + Bridges</h2>
                <p className="text-[var(--text-secondary)] mb-4">
                  Rank critical nodes and list bridge edges whose removal disconnects the demo graph.
                </p>
                <Button className="gap-2 mb-6" onClick={runCentrality} disabled={busy || locked}>
                  <Play size={16} /> Run Brandes + bridges
                </Button>
                {(topCentrality.length > 0 || bridgeResult) && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                      <div className="px-4 py-2 bg-emerald-50 text-emerald-900 text-sm font-semibold">Top centrality</div>
                      <table className="w-full text-sm">
                        <tbody>
                          {topCentrality.map((row) => (
                            <tr key={row.id} className="border-t border-[var(--border-subtle)]">
                              <td className="px-4 py-2 font-mono">{row.id}</td>
                              <td className="px-4 py-2 text-right font-mono">{row.score.toFixed(4)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="border border-[var(--border-subtle)] rounded-xl p-4">
                      <div className="text-sm font-semibold mb-2">Bridges ({bridgeResult?.count ?? 0})</div>
                      <ul className="text-sm font-mono space-y-1 text-[var(--text-secondary)]">
                        {(bridgeResult?.bridges || []).length === 0 && <li>None</li>}
                        {(bridgeResult?.bridges || []).map((b: any, i: number) => (
                          <li key={i}>{Array.isArray(b) ? b.join(' — ') : JSON.stringify(b)}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
