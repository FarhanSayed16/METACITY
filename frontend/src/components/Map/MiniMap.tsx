import React, { useEffect, useRef } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useSceneStore } from '../../store/sceneStore';
import { Map as MapIcon, X } from 'lucide-react';

export const MiniMap: React.FC = () => {
  const showMiniMap = useUIStore((state) => state.showMiniMap);
  const toggleMiniMap = useUIStore((state) => state.toggleMiniMap);
  const isNightMode = useUIStore((state) => state.isNightMode);
  const { sceneData } = useSceneStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!showMiniMap || !sceneData || !sceneData.nodes || !sceneData.links) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Find bounds
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    sceneData.nodes.forEach((n: any) => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    const padding = 10;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const scale = Math.min(width / rangeX, height / rangeY);

    const transformX = (x: number) => padding + (x - minX) * scale;
    const transformY = (y: number) => canvas.height - (padding + (y - minY) * scale); 

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = isNightMode ? '#1e293b' : '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw links
    ctx.strokeStyle = isNightMode ? '#475569' : '#cbd5e1';
    ctx.lineWidth = 1;
    
    const nodeMap = new Map();
    sceneData.nodes.forEach((n: any) => nodeMap.set(n.id, n));

    ctx.beginPath();
    sceneData.links.forEach((l: any) => {
      const from = nodeMap.get(l.from_node);
      const to = nodeMap.get(l.to_node);
      if (from && to) {
        ctx.moveTo(transformX(from.x), transformY(from.y));
        ctx.lineTo(transformX(to.x), transformY(to.y));
      }
    });
    ctx.stroke();

    // Draw nodes
    ctx.fillStyle = isNightMode ? '#94a3b8' : '#64748b';
    sceneData.nodes.forEach((n: any) => {
      ctx.beginPath();
      ctx.arc(transformX(n.x), transformY(n.y), 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

  }, [sceneData, showMiniMap, isNightMode]);

  if (!showMiniMap) {
    return (
      <button 
        onClick={toggleMiniMap}
        className="absolute bottom-6 right-6 p-3 bg-white/90 backdrop-blur rounded-full shadow-lg border border-gray-200 text-gray-700 hover:bg-white z-40 transition-transform hover:scale-105"
        title="Show Mini Map"
      >
        <MapIcon size={20} />
      </button>
    );
  }

  return (
    <div className={`absolute bottom-6 right-6 w-64 h-64 rounded-xl shadow-2xl border ${isNightMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'} overflow-hidden z-40 flex flex-col`}>
      <div className={`h-8 flex items-center justify-between px-3 shrink-0 border-b ${isNightMode ? 'border-slate-800 text-slate-300' : 'border-gray-100 text-gray-500'}`}>
        <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <MapIcon size={14} /> Mini-Map
        </span>
        <button onClick={toggleMiniMap} className="hover:text-red-500 transition-colors">
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 relative">
        <canvas 
          ref={canvasRef} 
          width={256} 
          height={224} 
          className="w-full h-full block"
        />
        {/* Placeholder for camera frustum indicator */}
        <div className="absolute top-1/2 left-1/2 w-4 h-4 border-2 border-[#2A9D8F] transform -translate-x-1/2 -translate-y-1/2 rotate-45 pointer-events-none"></div>
      </div>
    </div>
  );
};
