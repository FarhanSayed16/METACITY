import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { useSimStore } from '../../store/simStore';
import { useSceneStore } from '../../store/sceneStore';
import { X, Activity, Info } from 'lucide-react';

export const InspectorPanel: React.FC = () => {
  const selectedLinkId = useUIStore((state) => state.selectedLinkId);
  const setSelectedLinkId = useUIStore((state) => state.setSelectedLinkId);
  const showInspector = useUIStore((state) => state.showInspector);
  const link_metrics = useSimStore((state) => state.link_metrics);
  const sceneData = useSceneStore((state) => state.sceneData);
  const updateLink = useSceneStore((state) => state.updateLink);

  if (!selectedLinkId || !showInspector) return null;

  const selectedLinkData = sceneData?.links?.find((l: any) => l.id === selectedLinkId);

  // Grab the live metrics for this link, if any
  const liveMetrics = link_metrics[selectedLinkId] || { volume: 0, capacity: 1000 };
  const vcRatio = liveMetrics.capacity > 0 ? (liveMetrics.volume / liveMetrics.capacity) : 0;

  return (
    <div className="absolute top-16 right-4 w-80 bg-[var(--bg-panel)] rounded-lg shadow-xl border border-[var(--border-color)] overflow-hidden z-20 flex flex-col max-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-card)]">
        <h3 className="font-semibold text-[var(--text-primary)] truncate">Link {selectedLinkId}</h3>
        <button 
          onClick={() => setSelectedLinkId(null)}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 rounded hover:bg-[var(--bg-hover)]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1 space-y-6">
        
        {/* Live Metrics Section */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3 flex items-center">
            <Activity size={14} className="mr-1" /> Live Traffic
          </h4>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--text-secondary)]">V/C Ratio</span>
                <span className="font-medium text-[var(--text-primary)]">{(vcRatio * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${vcRatio > 0.9 ? 'bg-red-500' : vcRatio > 0.7 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(vcRatio * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-color)]">
                <div className="text-xs text-[var(--text-secondary)] mb-1">Volume (veh/h)</div>
                <div className="text-lg font-semibold text-[var(--text-primary)]">{Math.round(liveMetrics.volume)}</div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-color)]">
                <div className="text-xs text-[var(--text-secondary)] mb-1">Capacity (veh/h)</div>
                <div className="text-lg font-semibold text-[var(--text-primary)]">{Math.round(liveMetrics.capacity)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Static Info Section (Editable) */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3 flex items-center">
            <Info size={14} className="mr-1" /> Road Properties
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Type</span>
              <span className="text-[var(--text-primary)]">Road Edge</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-[var(--text-secondary)] text-xs">Road Class</label>
              <select 
                className="bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-color)] rounded p-1 text-sm outline-none focus:border-blue-500"
                value={selectedLinkData?.road_class || 'local'}
                onChange={(e) => updateLink(selectedLinkId, { road_class: e.target.value })}
              >
                <option value="motorway">Motorway</option>
                <option value="trunk">Trunk</option>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="tertiary">Tertiary</option>
                <option value="local">Local</option>
              </select>
            </div>

            <div className="flex justify-between items-center gap-4">
              <div className="flex flex-col gap-1 w-full">
                <label className="text-[var(--text-secondary)] text-xs">Lanes</label>
                <input 
                  type="number" min="1" max="8"
                  className="bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-color)] rounded p-1 text-sm outline-none focus:border-blue-500 w-full"
                  value={selectedLinkData?.lanes || 2}
                  onChange={(e) => updateLink(selectedLinkId, { lanes: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label className="text-[var(--text-secondary)] text-xs">Speed (km/h)</label>
                <input 
                  type="number" min="5" max="200" step="5"
                  className="bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-color)] rounded p-1 text-sm outline-none focus:border-blue-500 w-full"
                  value={selectedLinkData?.speed_kph || 50}
                  onChange={(e) => updateLink(selectedLinkId, { speed_kph: parseFloat(e.target.value) || 50 })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[var(--text-secondary)] text-xs">Capacity (veh/lane/hr)</label>
              <input 
                type="number" min="100" max="3000" step="100"
                className="bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-color)] rounded p-1 text-sm outline-none focus:border-blue-500"
                value={selectedLinkData?.capacity_per_lane_per_hour || 1800}
                onChange={(e) => updateLink(selectedLinkId, { capacity_per_lane_per_hour: parseInt(e.target.value) || 100 })}
              />
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="oneway"
                checked={selectedLinkData?.oneway || false}
                onChange={(e) => updateLink(selectedLinkId, { oneway: e.target.checked })}
              />
              <label htmlFor="oneway" className="text-[var(--text-secondary)] text-sm cursor-pointer">One-way Traffic</label>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};
