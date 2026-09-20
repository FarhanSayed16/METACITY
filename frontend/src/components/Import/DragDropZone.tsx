import React, { useState, useCallback } from 'react';
import { useSceneStore } from '../../store/sceneStore';
import { UploadCloud } from 'lucide-react';

export const DragDropZone: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const loadScene = useSceneStore((state) => state.loadScene);
  const sceneData = useSceneStore((state) => state.sceneData);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            loadScene(data);
          } catch (error) {
            alert('Failed to parse JSON scene file.');
          }
        };
        reader.readAsText(file);
      } else {
        alert('Please drop a valid JSON scene file.');
      }
    }
  }, [loadScene]);

  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      
      {/* Overlay when dragging */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-[#2A9D8F]/20 backdrop-blur-sm flex items-center justify-center border-4 border-dashed border-[#2A9D8F] m-4 rounded-xl">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 text-[#1B2430]">
            <UploadCloud size={48} className="text-[#2A9D8F]" />
            <h2 className="text-2xl font-bold">Drop Scene JSON Here</h2>
            <p className="text-gray-500">Import your simulation network directly</p>
          </div>
        </div>
      )}
      
      {/* Empty state instruction if no scene loaded */}
      {!sceneData && !isDragging && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
           <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col items-center pointer-events-auto">
            <h2 className="text-xl font-bold text-[#1B2430] mb-2">Welcome to METACITY</h2>
            <p className="text-gray-600 mb-4">Drag and drop a baseline `.json` scene file anywhere on the screen to import it.</p>
            <div className="text-sm text-gray-500 bg-gray-100 p-3 rounded w-full">
              Try using <code className="font-mono bg-gray-200 px-1 rounded">data/templates/nexus_city_baseline.json</code>
            </div>
           </div>
        </div>
      )}
    </div>
  );
};
