import { create } from 'zustand';

interface SceneState {
  sceneData: any | null; 
  history: any[];
  historyIndex: number;
  isDirty: boolean;
  
  loadScene: (data: any) => void;
  undo: () => void;
  redo: () => void;
  commitChange: (newScene: any) => void;
  
  updateLink: (linkId: string, updates: any) => void;
  deleteLink: (linkId: string) => void;
  addLink: (linkData: any) => void;
  addNode: (nodeData: any) => void;
  deleteNode: (nodeId: string) => void;
  
  setClean: () => void;
}

export const useSceneStore = create<SceneState>((set, get) => ({
  sceneData: null,
  history: [],
  historyIndex: -1,
  isDirty: false,
  
  loadScene: (data) => set({ 
    sceneData: JSON.parse(JSON.stringify(data)), 
    history: [JSON.parse(JSON.stringify(data))], 
    historyIndex: 0,
    isDirty: false
  }),
  
  setClean: () => set({ isDirty: false }),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      set({
        historyIndex: historyIndex - 1,
        sceneData: JSON.parse(JSON.stringify(history[historyIndex - 1])),
        isDirty: true
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({
        historyIndex: historyIndex + 1,
        sceneData: JSON.parse(JSON.stringify(history[historyIndex + 1])),
        isDirty: true
      });
    }
  },

  commitChange: (newScene) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newScene)));
    // Keep max 10 states
    if (newHistory.length > 10) {
      newHistory.shift();
    }
    set({
      sceneData: newScene,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isDirty: true
    });
  },

  updateLink: (linkId, updates) => {
    const { sceneData, commitChange } = get();
    if (!sceneData) return;
    const newScene = JSON.parse(JSON.stringify(sceneData));
    const linkIndex = newScene.links.findIndex((l: any) => l.id === linkId);
    if (linkIndex !== -1) {
      newScene.links[linkIndex] = { ...newScene.links[linkIndex], ...updates };
      commitChange(newScene);
    }
  },

  deleteLink: (linkId) => {
    const { sceneData, commitChange } = get();
    if (!sceneData) return;
    const newScene = JSON.parse(JSON.stringify(sceneData));
    newScene.links = newScene.links.filter((l: any) => l.id !== linkId);
    commitChange(newScene);
  },

  addLink: (linkData) => {
    const { sceneData, commitChange } = get();
    if (!sceneData) return;
    const newScene = JSON.parse(JSON.stringify(sceneData));
    newScene.links.push(linkData);
    commitChange(newScene);
  },

  addNode: (nodeData) => {
    const { sceneData, commitChange } = get();
    if (!sceneData) return;
    const newScene = JSON.parse(JSON.stringify(sceneData));
    newScene.nodes.push(nodeData);
    commitChange(newScene);
  },

  deleteNode: (nodeId) => {
    const { sceneData, commitChange } = get();
    if (!sceneData) return;
    const newScene = JSON.parse(JSON.stringify(sceneData));
    // Must delete connected links too!
    newScene.links = newScene.links.filter((l: any) => l.from_node !== nodeId && l.to_node !== nodeId);
    newScene.nodes = newScene.nodes.filter((n: any) => n.id !== nodeId);
    commitChange(newScene);
  },
}));
