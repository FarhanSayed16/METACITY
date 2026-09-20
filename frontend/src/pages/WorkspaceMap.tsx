import React, { useEffect, useState } from 'react';
import { useLocation, useBlocker, useParams } from 'react-router-dom';
import { Canvas3D } from '../components/Map/Canvas3D';
import { SimStrip } from '../components/layout/SimStrip';
import { InspectorPanel } from '../components/layout/InspectorPanel';
import { useUIStore } from '../store/uiStore';
import { useSimStore } from '../store/simStore';
import { useSceneStore } from '../store/sceneStore';
import { useScenarioDraftStore } from '../store/scenarioDraftStore';
import { useHealthStore } from '../store/healthStore';
import { api } from '../lib/api';
import { toast } from '../components/ui/Toast';
import { Layers, Box, MousePointer2, CirclePlus, GitMerge, Save, Undo, Redo, Camera, Search, Activity, EyeOff, HelpCircle } from 'lucide-react';
import { useKeyboardShortcuts } from '../lib/useKeyboardShortcuts';
import { useURLParams } from '../hooks/useURLParams';
import { MiniMap } from '../components/Map/MiniMap';
import { DemoMode } from '../components/Map/DemoMode';
import { SplitWipe } from '../components/Map/SplitWipe';
import { EnvironmentSettings } from '../components/Map/EnvironmentSettings';
import { Attribution } from '../components/Attribution';
import { ExportPanel } from '../components/ExportPanel';
import { DragDropZone } from '../components/Import/DragDropZone';

export const WorkspaceMap: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const is3D = useUIStore((state) => state.is3D);
  const toggle3D = useUIStore((state) => state.toggle3D);
  const showLayersLegend = useUIStore((s) => s.showLayersLegend);
  const showHelp = useUIStore((s) => s.showHelp);
  const toggleHelp = useUIStore((s) => s.toggleHelp);
  const setSaveHandler = useUIStore((s) => s.setSaveHandler);
  const mutationsLocked = useHealthStore((s) => s.apiReachable === false);
  
  const { connectWS, disconnectWS } = useSimStore();
  const { editorMode, setEditorMode, centralityScores } = useUIStore();
  const { isDirty, undo, redo, sceneData, loadScene } = useSceneStore();
  const pendingOps = useScenarioDraftStore((s) => s.pendingOps);
  const draftLabel = useScenarioDraftStore((s) => s.draftLabel);
  const clearPendingOps = useScenarioDraftStore((s) => s.clearPendingOps);
  const location = useLocation();
  const [sceneError, setSceneError] = useState<string | null>(null);
  const [sceneLoading, setSceneLoading] = useState(true);

  // Set active project ID and fetch scene on mount
  useEffect(() => {
    if (!projectId) return;
    useUIStore.getState().setActiveProjectId(projectId);
    
    setSceneLoading(true);
    setSceneError(null);
    
    api.getScene(projectId)
      .then(data => {
        loadScene(data);
      })
      .catch(err => {
        setSceneError(err.message || 'Failed to load scene');
      })
      .finally(() => setSceneLoading(false));
  }, [projectId]);

  // Keyboard Shortcuts (global)
  useKeyboardShortcuts();
  
  // URL sync
  useURLParams();

  // Save Function
  const handleSave = async () => {
    if (!sceneData || !projectId) return;
    if (mutationsLocked) {
      toast.error('API down', 'Cannot save while the backend is unreachable.');
      return;
    }
    try {
      await api.saveScene(projectId, sceneData);
      useSceneStore.getState().setClean();
      toast.success('Saved', 'Scene saved successfully.');
    } catch (e: any) {
      toast.error('Save failed', e.message || 'Could not reach backend.');
    }
  };

  useEffect(() => {
    setSaveHandler(() => { void handleSave(); });
    return () => setSaveHandler(null);
  }, [sceneData, projectId, mutationsLocked]);

  // Unsaved guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Router-level unsaved guard for SPA navigation
  useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname &&
      !window.confirm('You have unsaved changes. Leave anyway?')
  );

  // If we navigated here with a ?run_id=xxx, connect automatically
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const runId = params.get('run_id');
    if (runId) {
      connectWS(runId);
    }
    
    return () => {
      disconnectWS();
    };
  }, [location.search, connectWS, disconnectWS]);

  // Loading state
  if (sceneLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-[var(--bg-canvas)]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-[var(--text-secondary)]">Loading scene…</p>
        </div>
      </div>
    );
  }

  // Error state
  if (sceneError) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-[var(--bg-canvas)]">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-400 text-5xl">⚠</div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Failed to load scene</h2>
          <p className="text-[var(--text-secondary)]">{sceneError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DragDropZone>
    <div className="relative w-full h-full bg-[var(--bg-canvas)] overflow-hidden">
      
      {/* Map Layers Area — 2D = orthographic network (same NetworkLayer as 3D) */}
      <div className="absolute inset-0 z-0">
        <Canvas3D perspective={is3D} />
      </div>

      <EnvironmentSettings />
      <ExportPanel projectId={projectId} />
      <Attribution />

      {/* Scenario ghost preview banner */}
      {pendingOps.length > 0 && (
        <div className="absolute top-20 left-4 z-20 max-w-sm bg-[var(--bg-panel)] border border-amber-400/60 rounded-lg shadow-lg px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-amber-500">Ghost preview</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {draftLabel ?? 'Scenario draft'} · {pendingOps.length} op{pendingOps.length === 1 ? '' : 's'}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Dashed amber/teal = proposed · red dashed = closures
              </p>
            </div>
            <button
              onClick={clearPendingOps}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-[var(--bg-hover)] hover:bg-red-500/20 text-[var(--text-secondary)]"
              title="Clear ghost preview"
            >
              <EyeOff size={14} />
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Floating UI Elements */}
      
      {/* View Toggle */}
      <div className="absolute top-4 left-4 z-10 flex bg-[var(--bg-panel)] rounded-lg shadow-md border border-[var(--border-color)] overflow-hidden">
        <button 
          onClick={is3D ? toggle3D : undefined}
          className={`px-4 py-2 flex items-center space-x-2 text-sm font-medium transition-colors ${!is3D ? 'bg-blue-500/10 text-blue-500' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
        >
          <Layers size={16} />
          <span>2D Map</span>
        </button>
        <button 
          onClick={!is3D ? toggle3D : undefined}
          className={`px-4 py-2 flex items-center space-x-2 text-sm font-medium transition-colors ${is3D ? 'bg-blue-500/10 text-blue-500' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
        >
          <Box size={16} />
          <span>3D View</span>
        </button>
      </div>

      {/* Editor Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex bg-[var(--bg-panel)] rounded-lg shadow-md border border-[var(--border-color)] overflow-hidden">
        <button 
          onClick={() => setEditorMode('select')}
          className={`px-3 py-2 flex items-center space-x-2 text-sm font-medium transition-colors ${editorMode === 'select' ? 'bg-blue-500/20 text-blue-500' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
          title="Select (Esc)"
        >
          <MousePointer2 size={16} />
        </button>
        <button 
          onClick={() => setEditorMode('addNode')}
          className={`px-3 py-2 flex items-center space-x-2 text-sm font-medium transition-colors ${editorMode === 'addNode' ? 'bg-blue-500/20 text-blue-500' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
          title="Add Node"
        >
          <CirclePlus size={16} />
        </button>
        <button 
          onClick={() => setEditorMode('addLink')}
          className={`px-3 py-2 flex items-center space-x-2 text-sm font-medium transition-colors ${editorMode === 'addLink' ? 'bg-blue-500/20 text-blue-500' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
          title="Draw Link"
        >
          <GitMerge size={16} />
        </button>
        <div className="w-px bg-[var(--border-color)] my-1 mx-1" />
        <button 
          onClick={undo}
          className="px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo size={16} />
        </button>
        <button 
          onClick={redo}
          className="px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo size={16} />
        </button>
        <div className="w-px bg-[var(--border-color)] my-1 mx-1" />
        <button 
          onClick={async () => {
            if (useUIStore.getState().centralityScores) {
              useUIStore.getState().setCentralityScores(null);
            } else {
              try {
                const data = await api.getCentrality(sceneData);
                useUIStore.getState().setCentralityScores(data.centrality);
              } catch (e) {
                alert("Failed to compute centrality");
              }
            }
          }}
          className={`px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors ${centralityScores ? 'text-green-500 bg-green-500/10' : ''}`}
          title="Toggle Betweenness Centrality"
        >
          <Search size={16} />
        </button>
        <button 
          onClick={async () => {
            try {
              const data = await api.getIsolation(sceneData);
              alert(`Network Isolation Report:
- Components: ${data.component_count}
- Largest Component Size: ${data.largest_component_size}
- Isolated Nodes: ${data.isolated_nodes.length}
- Isolation Ratio: ${(data.isolation_ratio * 100).toFixed(2)}%`);
            } catch (e) {
              alert("Failed to compute isolation metrics");
            }
          }}
          className="px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
          title="Compute Network Isolation"
        >
          <Activity size={16} />
        </button>
        <button 
          onClick={async () => {
            const canvas = document.querySelector('canvas');
            if (!canvas) {
              toast.error('Screenshot', 'No canvas found.');
              return;
            }
            const dataUrl = (canvas as HTMLCanvasElement).toDataURL('image/png');
            // Always offer local download
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `metacity-screenshot-${Date.now()}.png`;
            a.click();
            // Also store for HTML reports when API is up
            if (!mutationsLocked) {
              try {
                const runId = useSimStore.getState().activeRunId || undefined;
                await api.uploadScreenshot({
                  image_base64: dataUrl,
                  run_id: runId,
                  slot: 'workspace',
                  label: 'Workspace capture',
                });
                toast.success('Screenshot stored', 'Attached to run for comparison reports.');
              } catch (e: any) {
                toast.warning('Local only', e.message || 'Could not upload to API.');
              }
            }
          }}
          className="px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
          title="Capture Screenshot (downloads + stores for reports)"
        >
          <Camera size={16} />
        </button>
      </div>

      {/* Save Button */}
      {isDirty && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
          <button 
            onClick={handleSave}
            disabled={mutationsLocked}
            className="px-4 py-1.5 flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-medium rounded-full shadow-lg transition-colors"
          >
            <Save size={14} />
            <span>Save Changes</span>
          </button>
        </div>
      )}

      {/* Layers legend (L) */}
      {showLayersLegend && (
        <div className="absolute top-20 right-4 z-20 w-52 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg shadow-lg p-3 text-xs">
          <div className="font-semibold mb-2">Congestion legend</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#10b981]" /> Free / light (v/c ≤ 0.3)</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#f59e0b]" /> Moderate (v/c ≤ 0.7)</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#ef4444]" /> Heavy (v/c &gt; 0.9)</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#FFD166]" /> Selected / ghost</div>
            <p className="pt-1 text-[10px] text-[var(--text-secondary)] leading-snug">
              Moving dashes encode relative volume — not particle trails or absolute flow counts.
            </p>
          </div>
        </div>
      )}

      {/* Help overlay (?) */}
      {showHelp && (
        <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={toggleHelp}>
          <div
            className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle size={20} />
              <h3 className="font-bold text-lg">Keyboard shortcuts</h3>
            </div>
            <ul className="text-sm space-y-2 text-[var(--text-secondary)]">
              <li><kbd className="font-mono">Space</kbd> — Play / Pause</li>
              <li><kbd className="font-mono">1 / 2 / 3</kbd> — Select / Add node / Draw link</li>
              <li><kbd className="font-mono">4</kbd> — Toggle 2D / 3D</li>
              <li><kbd className="font-mono">L</kbd> — Layers legend</li>
              <li><kbd className="font-mono">I</kbd> — Inspector panel</li>
              <li><kbd className="font-mono">Ctrl+S</kbd> — Save scene</li>
              <li><kbd className="font-mono">?</kbd> — This help</li>
              <li><kbd className="font-mono">Ctrl+Z / Y</kbd> — Undo / Redo</li>
              <li><kbd className="font-mono">Esc</kbd> — Deselect / close help</li>
            </ul>
            <button
              onClick={toggleHelp}
              className="mt-5 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <InspectorPanel />
      
      <SplitWipe />
      <MiniMap />
      <DemoMode />

      {/* Sim Strip Component at the bottom */}
      <SimStrip />
    </div>
    </DragDropZone>
  );
};
