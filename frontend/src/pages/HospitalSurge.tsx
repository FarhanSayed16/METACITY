import { useState } from 'react';
import { Activity, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';
import { toast } from '../components/ui/Toast';

export function HospitalSurge() {
  const [baselineBeds, setBaselineBeds] = useState(100);
  const [scenarioBeds, setScenarioBeds] = useState(150);
  const [nurses, setNurses] = useState(50);
  const [surgeRate, setSurgeRate] = useState(2.0);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const data = await api.compareHospital({
        beds_baseline: baselineBeds,
        beds_scenario: scenarioBeds,
        nurses,
        surge_rate: surgeRate,
        max_ticks: 1440
      });
      setResults(data);
    } catch (e: any) {
      toast.error('Hospital sim failed', e.message || 'Failed to run hospital simulation');
    } finally {
      setIsSimulating(false);
    }
  };

  // Prepare chart data
  const chartData = [];
  if (results) {
    const ticks = Math.max(
      results.baseline.queue_history.length, 
      results.scenario.queue_history.length
    );
    for (let i = 0; i < ticks; i++) {
      chartData.push({
        tick: i,
        time: `${Math.floor(i/60).toString().padStart(2, '0')}:${(i%60).toString().padStart(2, '0')}`,
        baselineQueue: results.baseline.queue_history[i] || 0,
        scenarioQueue: results.scenario.queue_history[i] || 0
      });
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Activity className="text-blue-600" size={32} />
          Hospital Surge Simulation (DES)
        </h1>
        <p className="text-gray-500 mt-2">
          Compare how adding bed capacity affects the emergency room triage queue during a mass casualty or surge event over a 24-hour period.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* Controls */}
        <div className="col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Simulation Parameters</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                <span>Baseline Beds</span>
                <span className="text-blue-600 font-bold">{baselineBeds}</span>
              </label>
              <input type="range" min="50" max="300" step="10" value={baselineBeds} onChange={e => setBaselineBeds(parseInt(e.target.value))} className="w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                <span>Scenario Beds</span>
                <span className="text-green-600 font-bold">{scenarioBeds}</span>
              </label>
              <input type="range" min="50" max="300" step="10" value={scenarioBeds} onChange={e => setScenarioBeds(parseInt(e.target.value))} className="w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                <span>Nurses</span>
                <span className="text-gray-600 font-bold">{nurses}</span>
              </label>
              <input type="range" min="10" max="150" step="5" value={nurses} onChange={e => setNurses(parseInt(e.target.value))} className="w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                <span>Surge Rate (Arrivals/min)</span>
                <span className="text-red-600 font-bold">{surgeRate.toFixed(1)}</span>
              </label>
              <input type="range" min="0.5" max="10.0" step="0.5" value={surgeRate} onChange={e => setSurgeRate(parseFloat(e.target.value))} className="w-full" />
            </div>

            <button 
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2 mt-4"
            >
              {isSimulating ? <Loader2 size={16} className="animate-spin" /> : <PlayIcon size={16} />}
              Run Comparison
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="col-span-8">
          {results ? (
            <div className="space-y-6">
              
              {/* KPIs */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Baseline Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2 border-gray-100">Baseline ({baselineBeds} beds)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Peak Queue</p>
                      <p className="text-2xl font-light text-gray-900">{results.baseline.peak_queue_length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Treated</p>
                      <p className="text-2xl font-light text-blue-600">{results.baseline.total_treated} <span className="text-sm text-gray-400">/ {results.baseline.total_arrived}</span></p>
                    </div>
                  </div>
                </div>

                {/* Scenario Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-green-500"></div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2 border-gray-100">Scenario ({scenarioBeds} beds)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Peak Queue</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-light text-gray-900">{results.scenario.peak_queue_length}</p>
                        <Delta old={results.baseline.peak_queue_length} curr={results.scenario.peak_queue_length} invert />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Treated</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-light text-green-600">{results.scenario.total_treated} <span className="text-sm text-gray-400">/ {results.scenario.total_arrived}</span></p>
                        <Delta old={results.baseline.total_treated} curr={results.scenario.total_treated} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Chart */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-6">Triage Queue Length (24 Hours)</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" minTickGap={30} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" />
                      <Line type="monotone" name={`Baseline (${baselineBeds} beds)`} dataKey="baselineQueue" stroke="#94a3b8" strokeWidth={2} dot={false} />
                      <Line type="monotone" name={`Scenario (${scenarioBeds} beds)`} dataKey="scenarioQueue" stroke="#10b981" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Activity className="text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900">No Simulation Data</h3>
              <p className="text-gray-500 mt-2 max-w-sm">Adjust the parameters on the left and click "Run Comparison" to simulate hospital surge capacity.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Icon helper
function PlayIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  )
}

function Delta({ old, curr, invert = false }: { old: number, curr: number, invert?: boolean }) {
  const diff = curr - old;
  if (diff === 0) return null;
  const isGood = invert ? diff < 0 : diff > 0;
  const color = isGood ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${color} mb-1`}>
      {diff > 0 ? '+' : ''}{diff}
    </span>
  );
}
