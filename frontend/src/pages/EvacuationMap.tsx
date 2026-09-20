import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Flame, User, LogOut, Loader2, MousePointer2, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from '../components/ui/Toast';

export function EvacuationMap() {
  const [gridSize] = useState({ width: 50, height: 50 });
  
  // Design state
  const [walls, setWalls] = useState<Set<string>>(new Set());
  const [exits, setExits] = useState<Set<string>>(new Set());
  const [agents, setAgents] = useState<Set<string>>(new Set());
  const [fires, setFires] = useState<Set<string>>(new Set());
  
  const [tool, setTool] = useState<'wall' | 'exit' | 'agent' | 'fire' | 'erase'>('wall');
  
  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [currentTick, setCurrentTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper to stringify coords
  const coordKey = (x: number, y: number) => `${x},${y}`;
  const parseKey = (k: string) => { const [x, y] = k.split(','); return { x: parseInt(x), y: parseInt(y) }; };

  // Load Template
  const loadTemplate = async () => {
    setIsSimulating(true);
    try {
      const data = await api.runEvacuationTemplate('campus');
      setSimResult(data);
      setCurrentTick(0);
      setIsPlaying(true);
    } catch (e: any) {
      toast.error('Template failed', e.message || 'Failed to load template');
    } finally {
      setIsSimulating(false);
    }
  };

  // Run custom scenario
  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const payload = {
        width: gridSize.width,
        height: gridSize.height,
        wall_cells: Array.from(walls).map(parseKey),
        exit_cells: Array.from(exits).map(parseKey),
        agent_starts: Array.from(agents).map(parseKey),
        fire_starts: Array.from(fires).map(parseKey),
        max_ticks: 500,
        spread_prob: 0.1
      };
      
      const data = await api.runEvacuation(payload);
      setSimResult(data);
      setCurrentTick(0);
      setIsPlaying(true);
    } catch (e: any) {
      toast.error('Simulation failed', e.message || 'Evacuation run failed');
    } finally {
      setIsSimulating(false);
    }
  };

  // Playback Loop
  useEffect(() => {
    let interval: any;
    if (isPlaying && simResult) {
      interval = setInterval(() => {
        setCurrentTick(t => {
          if (t >= simResult.history.length - 1) {
            setIsPlaying(false);
            return t;
          }
          return t + 1;
        });
      }, 100); // 10 ticks per second
    }
    return () => clearInterval(interval);
  }, [isPlaying, simResult]);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const cw = canvas.width / gridSize.width;
    const ch = canvas.height / gridSize.height;

    // Clear
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for(let x=0; x<=gridSize.width; x++) { ctx.beginPath(); ctx.moveTo(x*cw, 0); ctx.lineTo(x*cw, canvas.height); ctx.stroke(); }
    for(let y=0; y<=gridSize.height; y++) { ctx.beginPath(); ctx.moveTo(0, y*ch); ctx.lineTo(canvas.width, y*ch); ctx.stroke(); }

    if (simResult) {
      // Draw simulation state at currentTick
      const state = simResult.history[currentTick];
      if (!state) return;

      // Draw Walls (from payload, since they don't change, wait we need them from design mode if not template, but template doesn't update design state. Actually, if simResult exists, we should just rely on the request payload. But we don't have it. Let's just draw design state walls if we are not in template. If template, we might be missing walls visually. Let's assume the user uses the Custom tool for now, or we just draw design state).
      walls.forEach(w => {
        const {x, y} = parseKey(w);
        ctx.fillStyle = '#334155';
        ctx.fillRect(x*cw, y*ch, cw, ch);
      });
      exits.forEach(e => {
        const {x, y} = parseKey(e);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x*cw, y*ch, cw, ch);
      });

      // Draw smoke
      ctx.fillStyle = 'rgba(100, 100, 100, 0.4)';
      state.smoke.forEach(([sx, sy]: [number, number]) => {
        ctx.fillRect(sx*cw, sy*ch, cw, ch);
      });

      // Draw fire
      ctx.fillStyle = '#ef4444';
      state.fire.forEach(([fx, fy]: [number, number]) => {
        ctx.fillRect(fx*cw, fy*ch, cw, ch);
      });

      // Draw agents
      state.agents.forEach((a: any) => {
        if (a.escaped) return;
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(a.x*cw + cw/2, a.y*ch + ch/2, cw/2 - 1, 0, Math.PI*2);
        ctx.fill();
      });

    } else {
      // Draw Design Mode
      walls.forEach(w => {
        const {x, y} = parseKey(w);
        ctx.fillStyle = '#334155';
        ctx.fillRect(x*cw, y*ch, cw, ch);
      });
      exits.forEach(e => {
        const {x, y} = parseKey(e);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x*cw, y*ch, cw, ch);
      });
      fires.forEach(f => {
        const {x, y} = parseKey(f);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x*cw, y*ch, cw, ch);
      });
      agents.forEach(a => {
        const {x, y} = parseKey(a);
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(x*cw + cw/2, y*ch + ch/2, cw/2 - 1, 0, Math.PI*2);
        ctx.fill();
      });
    }

  }, [gridSize, walls, exits, agents, fires, simResult, currentTick]);

  // Canvas Interactions
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (simResult) return; // Disable editing during playback
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (canvas.width / gridSize.width));
    const y = Math.floor((e.clientY - rect.top) / (canvas.height / gridSize.height));
    
    if (x < 0 || x >= gridSize.width || y < 0 || y >= gridSize.height) return;
    const k = coordKey(x, y);

    if (tool === 'erase') {
      const newWalls = new Set(walls); newWalls.delete(k); setWalls(newWalls);
      const newExits = new Set(exits); newExits.delete(k); setExits(newExits);
      const newFires = new Set(fires); newFires.delete(k); setFires(newFires);
      const newAgents = new Set(agents); newAgents.delete(k); setAgents(newAgents);
      return;
    }

    if (tool === 'wall') { const s = new Set(walls); s.add(k); setWalls(s); }
    if (tool === 'exit') { const s = new Set(exits); s.add(k); setExits(s); }
    if (tool === 'fire') { const s = new Set(fires); s.add(k); setFires(s); }
    if (tool === 'agent') { const s = new Set(agents); s.add(k); setAgents(s); }
  };
  
  // Drag drawing
  const [isDrawing, setIsDrawing] = useState(false);
  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    handleCanvasClick(e);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      
      {/* Toolbar */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-gray-800 flex items-center gap-2">
            <Flame className="text-red-500" />
            Evacuation Simulator
          </span>
        </div>
        
        {!simResult ? (
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setTool('wall')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${tool === 'wall' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-gray-200'}`}>
              <Square size={16} /> Wall
            </button>
            <button onClick={() => setTool('exit')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${tool === 'exit' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-gray-200'}`}>
              <LogOut size={16} /> Exit
            </button>
            <button onClick={() => setTool('agent')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${tool === 'agent' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-gray-200'}`}>
              <User size={16} /> Agent
            </button>
            <button onClick={() => setTool('fire')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${tool === 'fire' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-gray-200'}`}>
              <Flame size={16} /> Fire
            </button>
            <button onClick={() => setTool('erase')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${tool === 'erase' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-gray-200'}`}>
              <MousePointer2 size={16} /> Erase
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200">
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <input 
              type="range" 
              min={0} 
              max={simResult.history.length - 1} 
              value={currentTick} 
              onChange={(e) => { setCurrentTick(parseInt(e.target.value)); setIsPlaying(false); }}
              className="w-64"
            />
            <span className="text-sm font-mono text-gray-500">Tick: {currentTick} / {simResult.ticks}</span>
            <button onClick={() => setSimResult(null)} className="px-4 py-1.5 text-sm font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
              Back to Design
            </button>
          </div>
        )}

        <div className="flex space-x-2">
          {!simResult && (
            <>
              <button 
                onClick={runSimulation}
                disabled={isSimulating || (agents.size === 0 && exits.size === 0)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isSimulating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                Run Custom
              </button>
              <button 
                onClick={loadTemplate}
                disabled={isSimulating}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isSimulating && <Loader2 size={16} className="animate-spin" />}
                Run Demo Template
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar KPI */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 flex flex-col overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Evacuation KPIs</h2>
          
          {simResult ? (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Clearance Time (Ticks)</p>
                <p className="text-3xl font-light text-gray-900">{simResult.ticks}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Escaped</p>
                <p className="text-3xl font-light text-green-600">{simResult.escaped_count} <span className="text-lg text-gray-400">/ {simResult.total_agents}</span></p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Trapped</p>
                <p className="text-3xl font-light text-red-700">{simResult.trapped_count ?? (simResult.total_agents - simResult.escaped_count)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Average Stress</p>
                <p className="text-3xl font-light text-orange-500">{simResult.avg_stress.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Fire Damage (Cells)</p>
                <p className="text-3xl font-light text-red-600">{simResult.total_fire_cells}</p>
              </div>
              {simResult.bottleneck_cells?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Bottlenecks (peak occupancy)</p>
                  <ul className="text-xs font-mono space-y-1 text-gray-600 max-h-28 overflow-y-auto">
                    {simResult.bottleneck_cells.slice(0, 5).map((b: any, i: number) => (
                      <li key={i}>({b.x},{b.y}) · {b.peak_occupancy}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400 text-sm italic">
              Run a simulation to view KPIs.
              <br/><br/>
              <b>Instructions:</b>
              <ul className="list-disc pl-4 mt-2 space-y-1">
                <li>Draw walls to create rooms</li>
                <li>Place green exits</li>
                <li>Add blue agents</li>
                <li>Set one or more red fire sources</li>
                <li>Click Run Custom</li>
              </ul>
            </div>
          )}

          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="bg-orange-50 text-orange-800 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                <b>Disclaimer:</b> Simulated model outcomes do not guarantee real-world safety. This tool is for research and demonstration purposes only.
              </p>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-[url('/grid.png')] flex items-center justify-center p-8 relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={800}
            className="bg-white shadow-2xl rounded-sm cursor-crosshair border border-gray-200"
            onPointerDown={(e) => { setIsDrawing(true); handleCanvasClick(e as any); }}
            onPointerMove={handleCanvasMove as any}
            onPointerUp={() => setIsDrawing(false)}
            onPointerLeave={() => setIsDrawing(false)}
          />
        </div>

      </div>

    </div>
  );
}
