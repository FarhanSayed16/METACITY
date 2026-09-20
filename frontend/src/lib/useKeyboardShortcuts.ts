import { useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { useSceneStore } from '../store/sceneStore';
import { useSimStore } from '../store/simStore';
import { useHealthStore } from '../store/healthStore';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const ui = useUIStore.getState();
      const { undo, redo, deleteLink, deleteNode } = useSceneStore.getState();
      const { togglePlay } = useSimStore.getState();
      const locked = useHealthStore.getState().mutationsLocked();

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }

      if (e.key === '1') ui.setEditorMode('select');
      if (e.key === '2') ui.setEditorMode('addNode');
      if (e.key === '3') ui.setEditorMode('addLink');
      if (e.key === '4') ui.toggle3D();

      // L = layers legend, I = inspector, ? = help
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        ui.toggleLayersLegend();
      }
      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        ui.toggleInspector();
      }
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        ui.toggleHelp();
      }

      // Ctrl+S save (blocked when API down)
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        if (locked) return;
        ui.saveHandler?.();
      }

      if (e.key === 'Escape') {
        ui.setEditorMode('select');
        ui.setSelectedLinkId(null);
        ui.setSelectedNodeId(null);
        if (ui.showHelp) ui.toggleHelp();
      }

      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (!locked) undo();
      }
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        if (!locked) redo();
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (locked) return;
        if (ui.selectedLinkId) {
          if (confirm('Delete this link?')) {
            deleteLink(ui.selectedLinkId);
            ui.setSelectedLinkId(null);
          }
        } else if (ui.selectedNodeId) {
          if (confirm('Delete this node? All connected links will also be deleted.')) {
            deleteNode(ui.selectedNodeId);
            ui.setSelectedNodeId(null);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
