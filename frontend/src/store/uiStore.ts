import { create } from 'zustand';
import { featureFlags } from '../lib/featureFlags';

function loadAdvancedLab(): boolean {
  try {
    const stored = localStorage.getItem('metacity.advancedLab');
    if (stored === 'true') return true;
    if (stored === 'false') return false;
  } catch {
    /* ignore */
  }
  return Boolean(featureFlags.advancedLab);
}

interface UIState {
  isNightMode: boolean;
  toggleNightMode: () => void;
  walkthroughMode: boolean;
  setWalkthroughMode: (enabled: boolean) => void;
  showMiniMap: boolean;
  toggleMiniMap: () => void;
  weather: 'clear' | 'rain' | 'snow';
  setWeather: (w: 'clear' | 'rain' | 'snow') => void;
  is3D: boolean;
  toggle3D: () => void;
  selectedLinkId: string | null;
  setSelectedLinkId: (id: string | null) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  editorMode: 'select' | 'addNode' | 'addLink';
  setEditorMode: (mode: 'select' | 'addNode' | 'addLink') => void;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  centralityScores: Record<string, number> | null;
  setCentralityScores: (scores: Record<string, number> | null) => void;
  showInspector: boolean;
  toggleInspector: () => void;
  showLayersLegend: boolean;
  toggleLayersLegend: () => void;
  showHelp: boolean;
  toggleHelp: () => void;
  saveHandler: (() => void) | null;
  setSaveHandler: (fn: (() => void) | null) => void;
  showDisasterLab: boolean;
  setShowDisasterLab: (show: boolean) => void;
  showAskAI: boolean;
  setShowAskAI: (show: boolean) => void;
  selectedAgentId: string | null;
  setSelectedAgentId: (id: string | null) => void;
  /** When false, Decision Mode is primary; lab nav is hidden. */
  advancedLab: boolean;
  setAdvancedLab: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isNightMode: false,
  toggleNightMode: () => set((state) => ({ isNightMode: !state.isNightMode })),
  walkthroughMode: false,
  setWalkthroughMode: (enabled) => set({ walkthroughMode: enabled }),
  showMiniMap: true,
  toggleMiniMap: () => set((state) => ({ showMiniMap: !state.showMiniMap })),
  weather: 'clear',
  setWeather: (w) => set({ weather: w }),
  is3D: true,
  toggle3D: () => set((state) => ({ is3D: !state.is3D })),
  selectedLinkId: null,
  setSelectedLinkId: (id) => set({ selectedLinkId: id }),
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  editorMode: 'select',
  setEditorMode: (mode) => set({ editorMode: mode, selectedNodeId: null, selectedLinkId: null }),
  activeProjectId: null,
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  centralityScores: null,
  setCentralityScores: (scores) => set({ centralityScores: scores }),
  showInspector: true,
  toggleInspector: () => set((s) => ({ showInspector: !s.showInspector })),
  showLayersLegend: false,
  toggleLayersLegend: () => set((s) => ({ showLayersLegend: !s.showLayersLegend })),
  showHelp: false,
  toggleHelp: () => set((s) => ({ showHelp: !s.showHelp })),
  saveHandler: null,
  setSaveHandler: (fn) => set({ saveHandler: fn }),
  showDisasterLab: false,
  setShowDisasterLab: (show) => set({ showDisasterLab: show }),
  showAskAI: false,
  setShowAskAI: (show) => set({ showAskAI: show }),
  selectedAgentId: null,
  setSelectedAgentId: (id) => set({ selectedAgentId: id }),
  advancedLab: loadAdvancedLab(),
  setAdvancedLab: (enabled) => {
    try {
      localStorage.setItem('metacity.advancedLab', enabled ? 'true' : 'false');
    } catch {
      /* ignore */
    }
    set({ advancedLab: enabled });
  },
}));
