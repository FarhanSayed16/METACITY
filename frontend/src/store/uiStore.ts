import { create } from 'zustand';

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
}));
