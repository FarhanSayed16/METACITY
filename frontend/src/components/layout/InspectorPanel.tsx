import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { useSimStore } from '../../store/simStore';
import { useSceneStore } from '../../store/sceneStore';
import { X, Activity, Info, MapPin } from 'lucide-react';
import { CONGESTION_THRESHOLDS } from '../../lib/congestion';

export const InspectorPanel: React.FC = () => {
  const selectedLinkId = useUIStore((state) => state.selectedLinkId);
  const selectedNodeId = useUIStore((state) => state.selectedNodeId);
  const setSelectedLinkId = useUIStore((state) => state.setSelectedLinkId);
  const setSelectedNodeId = useUIStore((state) => state.setSelectedNodeId);
  const showInspector = useUIStore((state) => state.showInspector);
  const link_metrics = useSimStore((state) => state.link_metrics);
  const sceneData = useSceneStore((state) => state.sceneData);
  const updateLink = useSceneStore((state) => state.updateLink);

  if (!showInspector) return null;

  const selectedLinkData = selectedLinkId
    ? sceneData?.links?.find((l: any) => l.id === selectedLinkId)
    : null;
  const selectedNodeData = selectedNodeId
    ? sceneData?.nodes?.find((n: any) => n.id === selectedNodeId)
    : null;

  const liveMetrics =
    (selectedLinkId && link_metrics[selectedLinkId]) || { volume: 0, capacity: 1000 };
  const vcRatio =
    liveMetrics.capacity > 0 ? liveMetrics.volume / liveMetrics.capacity : 0;

  const close = () => {
    setSelectedLinkId(null);
    setSelectedNodeId(null);
  };

  const title = selectedLinkId
    ? `Link ${selectedLinkId}`
    : selectedNodeId
      ? `Node ${selectedNodeId}`
      : 'Inspector';

  const barColor =
    vcRatio > CONGESTION_THRESHOLDS.heavy
      ? 'bg-[var(--cong-high)]'
      : vcRatio > CONGESTION_THRESHOLDS.moderate
        ? 'bg-[var(--cong-mid)]'
        : 'bg-[var(--cong-low)]';

  return (
    <div className="absolute top-16 right-2 md:right-4 w-[min(20rem,calc(100vw-1rem))] bg-[var(--bg-panel)] rounded-lg shadow-xl border border-[var(--border-color)] overflow-hidden z-20 flex flex-col max-h-[calc(100vh-140px)] animate-fade-up workspace-desktop-only">
      <div className="px-4 py-3 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-card)]">
        <h3 className="font-semibold text-[var(--text-primary)] truncate">{title}</h3>
        <button
          type="button"
          onClick={close}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 rounded hover:bg-[var(--bg-hover)]"
          aria-label="Close inspector"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1 space-y-6">
        {!selectedLinkId && !selectedNodeId && (
          <div className="text-center py-8 px-2">
            <MapPin className="mx-auto mb-3 text-[var(--accent)]" size={28} />
            <p className="text-sm font-medium text-[var(--text-primary)] mb-1">Nothing selected</p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Click a link or node on the map to inspect properties and live traffic.
            </p>
          </div>
        )}

        {selectedNodeData && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3 flex items-center">
              <MapPin size={14} className="mr-1" /> Node
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Type</span>
                <span className="text-[var(--text-primary)] font-medium">{selectedNodeData.type || 'intersection'}</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-[var(--text-secondary)]">Position</span>
                <span className="text-[var(--text-primary)]">
                  ({Math.round(selectedNodeData.x)}, {Math.round(selectedNodeData.y)})
                </span>
              </div>
            </div>
          </div>
        )}

        {selectedLinkId && (
          <>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3 flex items-center">
                <Activity size={14} className="mr-1" /> Live traffic
              </h4>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--text-secondary)]">V/C ratio</span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {(vcRatio * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor}`}
                      style={{ width: `${Math.min(vcRatio * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-color)]">
                    <div className="text-xs text-[var(--text-secondary)] mb-1">Volume</div>
                    <div className="text-lg font-semibold text-[var(--text-primary)]">
                      {Math.round(liveMetrics.volume)}
                    </div>
                  </div>
                  <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-color)]">
                    <div className="text-xs text-[var(--text-secondary)] mb-1">Capacity</div>
                    <div className="text-lg font-semibold text-[var(--text-primary)]">
                      {Math.round(liveMetrics.capacity)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3 flex items-center">
                <Info size={14} className="mr-1" /> Road properties
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex flex-col gap-1">
                  <label className="text-[var(--text-secondary)] text-xs">Road class</label>
                  <select
                    className="bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-color)] rounded p-1.5 text-sm outline-none focus:border-[var(--accent)]"
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

                <div className="flex justify-between items-center gap-3">
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[var(--text-secondary)] text-xs">Lanes</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      className="bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-color)] rounded p-1.5 text-sm outline-none focus:border-[var(--accent)] w-full"
                      value={selectedLinkData?.lanes || 2}
                      onChange={(e) =>
                        updateLink(selectedLinkId, { lanes: parseInt(e.target.value) || 1 })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[var(--text-secondary)] text-xs">Speed (km/h)</label>
                    <input
                      type="number"
                      min={5}
                      max={200}
                      step={5}
                      className="bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-color)] rounded p-1.5 text-sm outline-none focus:border-[var(--accent)] w-full"
                      value={selectedLinkData?.speed_kph || 50}
                      onChange={(e) =>
                        updateLink(selectedLinkId, {
                          speed_kph: parseFloat(e.target.value) || 50,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[var(--text-secondary)] text-xs">
                    Capacity (veh/lane/hr)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={3000}
                    step={100}
                    className="bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-color)] rounded p-1.5 text-sm outline-none focus:border-[var(--accent)]"
                    value={selectedLinkData?.capacity_per_lane_per_hour || 1800}
                    onChange={(e) =>
                      updateLink(selectedLinkId, {
                        capacity_per_lane_per_hour: parseInt(e.target.value) || 100,
                      })
                    }
                  />
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    id="oneway"
                    checked={selectedLinkData?.oneway || false}
                    onChange={(e) => updateLink(selectedLinkId, { oneway: e.target.checked })}
                  />
                  <label
                    htmlFor="oneway"
                    className="text-[var(--text-secondary)] text-sm cursor-pointer"
                  >
                    One-way traffic
                  </label>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
