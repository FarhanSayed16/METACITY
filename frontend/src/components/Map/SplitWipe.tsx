import React, { useState } from 'react';
import { GitCompare } from 'lucide-react';

export const SplitWipe: React.FC = () => {
  // We'll use a local state for the slider position
  const [position, setPosition] = useState(50);
  const [isActive, setIsActive] = useState(false);

  // In a real implementation, this would clip the Canvas3D. 
  // For MVP, we render a CSS overlay that tints the left/right sides.
  
  if (!isActive) {
    return (
      <button 
        onClick={() => setIsActive(true)}
        className="absolute top-20 left-6 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg border border-gray-200 text-sm font-medium flex items-center gap-2 z-40 transition-transform hover:scale-105"
      >
        <GitCompare size={16} /> Split View
      </button>
    );
  }

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      
      {/* Left Side (Baseline tint) */}
      <div 
        className="absolute top-0 left-0 bottom-0 bg-blue-500/10 backdrop-contrast-125 border-r-2 border-white/50"
        style={{ width: `${position}%` }}
      >
        <div className="absolute top-24 left-6 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded shadow-md pointer-events-auto">
          BASELINE
        </div>
      </div>

      {/* Right Side (Scenario tint) */}
      <div 
        className="absolute top-0 right-0 bottom-0 bg-green-500/10 backdrop-contrast-125 border-l-2 border-white/50"
        style={{ width: `${100 - position}%` }}
      >
        <div className="absolute top-24 right-6 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded shadow-md pointer-events-auto">
          SCENARIO
        </div>
      </div>

      {/* Draggable Divider */}
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={position}
        onChange={(e) => setPosition(parseInt(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize pointer-events-auto z-40"
      />

      {/* Visual handle for the slider */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 w-8 h-12 bg-white rounded-lg shadow-xl flex items-center justify-center border border-gray-200"
        style={{ left: `calc(${position}% - 16px)` }}
      >
        <div className="flex space-x-1">
          <div className="w-0.5 h-6 bg-gray-300 rounded-full" />
          <div className="w-0.5 h-6 bg-gray-300 rounded-full" />
        </div>
      </div>

      {/* Close button */}
      <button 
        onClick={() => setIsActive(false)}
        className="absolute top-20 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg text-sm font-medium pointer-events-auto z-50 transition-colors"
      >
        Exit Split View
      </button>

    </div>
  );
};
