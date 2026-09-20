import React from 'react';
import { useSceneStore } from '../store/sceneStore';

export const CalibrationBadge: React.FC = () => {
  // In a real app, this would be read from the active Run or Scene state
  // For MVP, we'll mock the status based on whether a scene is loaded
  const sceneData = useSceneStore(state => state.sceneData);
  
  if (!sceneData) return null;

  // Mock status logic: If it has "osm" in ID, pretend it's real data being calibrated
  const status: string = sceneData.id?.includes('osm') ? 'partially_calibrated' : 'synthetic_uncalibrated';
  
  let colorClass = 'border-amber-500 text-amber-700 bg-amber-50';
  let label = 'Synthetic / Uncalibrated';
  
  if (status === 'partially_calibrated') {
    colorClass = 'border-[#2A9D8F] text-[#2A9D8F] bg-[#E6F4F1]';
    label = 'Partially Calibrated';
  } else if (status === 'calibrated') {
    colorClass = 'border-green-600 text-green-700 bg-green-50';
    label = 'Calibrated against observed';
  }

  return (
    <div className="absolute top-4 left-44 z-20 pointer-events-auto">
      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${colorClass} shadow-sm backdrop-blur-md`}>
        {label}
      </div>
    </div>
  );
};
