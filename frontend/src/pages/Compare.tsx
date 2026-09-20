import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { CalibrationBadge } from '../components/Compare/CalibrationBadge';
import { AssumptionsDrawer } from '../components/Compare/AssumptionsDrawer';
import { MechanismTrace } from '../components/Compare/MechanismTrace';
import { Button } from '../components/ui/Button';
import { Info, ArrowRightLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Compare() {
  const { id: projectId } = useParams<{ id: string }>();
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [baseId, setBaseId] = useState('');
  const [targetId, setTargetId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      api.getScenarios(projectId).then(scens => {
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
        target_scenario_id: targetId
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Comparison failed. Did both scenarios complete runs with matching seeds?');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? [
    {
      name: 'Mean Travel Time (mins)',
      Baseline: result.statistics.travel_time.baseline_mean,
      Scenario: result.statistics.travel_time.scenario_mean,
    },
    {
      name: 'Mean Trips',
      Baseline: result.statistics.trips.baseline_mean,
      Scenario: result.statistics.trips.scenario_mean,
    }
  ] : [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compare Scenarios</h1>
          <p className="text-sm text-gray-500">Run statistical comparison on paired seeds.</p>
        </div>
        <div className="flex items-center gap-4">
          {result && <CalibrationBadge status={result.calibration_status} />}
          <Button variant="secondary" size="sm" onClick={() => setAssumptionsOpen(true)}>
            <Info size={16} className="mr-2" /> Claims & Assumptions
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Baseline Scenario</label>
          <select 
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
            value={baseId}
            onChange={e => setBaseId(e.target.value)}
          >
            {scenarios.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        
        <div className="text-gray-400 pb-2">
          <ArrowRightLeft size={20} />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Scenario</label>
          <select 
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
            value={targetId}
            onChange={e => setTargetId(e.target.value)}
          >
            {scenarios.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <Button onClick={handleCompare} disabled={loading || !baseId || !targetId}>
          {loading ? 'Running...' : 'Compare (T-Test)'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {result && result.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Stats Table */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Statistical Results</h3>
              <p className="text-xs text-gray-500">n = {result.statistics.samples} paired seeds</p>
            </div>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Metric</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Mean Δ</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">95% CI</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">p-value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900">Travel Time</td>
                  <td className="px-4 py-3 text-right">
                    <span className={result.statistics.travel_time.diff_mean > 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                      {result.statistics.travel_time.diff_mean > 0 ? '+' : ''}{result.statistics.travel_time.diff_mean.toFixed(2)}m
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    [{result.statistics.travel_time.ci_lower.toFixed(2)}, {result.statistics.travel_time.ci_upper.toFixed(2)}]
                  </td>
                  <td className="px-4 py-3 text-right">
                    {result.statistics.travel_time.significant ? 
                      <span className="text-green-600 font-semibold">{result.statistics.travel_time.p_value.toFixed(4)} *</span> : 
                      <span className="text-gray-500">{result.statistics.travel_time.p_value.toFixed(4)}</span>}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900">Trips Completed</td>
                  <td className="px-4 py-3 text-right">
                    <span className={result.statistics.trips.diff_mean > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                      {result.statistics.trips.diff_mean > 0 ? '+' : ''}{result.statistics.trips.diff_mean.toFixed(0)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    [{result.statistics.trips.ci_lower.toFixed(1)}, {result.statistics.trips.ci_upper.toFixed(1)}]
                  </td>
                  <td className="px-4 py-3 text-right">
                    {result.statistics.trips.significant ? 
                      <span className="text-green-600 font-semibold">{result.statistics.trips.p_value.toFixed(4)} *</span> : 
                      <span className="text-gray-500">{result.statistics.trips.p_value.toFixed(4)}</span>}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <MechanismTrace mechanisms={result.mechanisms} />

          {result.isolation_delta && (
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Isolation (disaster network)</h3>
              <p className="text-sm text-gray-600 mb-3">
                Post-scenario isolation ratio delta (higher = more fragmentation).
              </p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-xs text-gray-500">Baseline</div>
                  <div className="font-mono">{Number(result.isolation_delta.baseline_isolation_ratio ?? 0).toFixed(3)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Target</div>
                  <div className="font-mono">{Number(result.isolation_delta.target_isolation_ratio ?? 0).toFixed(3)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Δ</div>
                  <div className="font-mono font-semibold">
                    {Number(result.isolation_delta.delta_isolation_ratio ?? 0) >= 0 ? '+' : ''}
                    {Number(result.isolation_delta.delta_isolation_ratio ?? 0).toFixed(3)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recharts */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm col-span-1 md:col-span-2 h-[400px]">
            <h3 className="font-semibold text-gray-900 mb-4">Mean Comparisons</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Scenario" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}

      <AssumptionsDrawer opened={assumptionsOpen} onClose={() => setAssumptionsOpen(false)} />
    </div>
  );
}
