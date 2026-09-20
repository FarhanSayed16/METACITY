import React from 'react';
import { useSimStore } from '../../store/simStore';
import { Play, Pause, FastForward, SkipBack } from 'lucide-react';

export const SimStrip: React.FC = () => {
  const { 
    progress_pct, 
    t_mins, 
    isPlaying, 
    togglePlay, 
    playbackSpeed, 
    setPlaybackSpeed,
    status
  } = useSimStore();

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <>
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-[var(--bg-panel)] border-t border-[var(--border-color)] shadow-lg flex items-center px-4 z-50">
      {/* Controls */}
      <div className="flex items-center space-x-2 mr-4">
        <button className="p-2 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]">
          <SkipBack size={20} />
        </button>
        <button 
          className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={togglePlay}
          disabled={status !== 'connected'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        
        {/* Speed toggle */}
        <button 
          className="ml-2 p-2 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] flex items-center text-sm font-semibold"
          onClick={() => setPlaybackSpeed(playbackSpeed >= 4 ? 1 : playbackSpeed * 2)}
        >
          {playbackSpeed}x <FastForward size={14} className="ml-1" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex-1 flex flex-col justify-center px-4">
        <div className="w-full h-2 bg-[var(--border-color)] rounded-full overflow-hidden relative cursor-pointer">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress_pct}%` }}
          />
        </div>
      </div>

      {/* Time Display */}
      <div className="text-[var(--text-primary)] font-mono font-medium tracking-wider w-24 text-right">
        {formatTime(t_mins)}
      </div>
      
      {/* Status indicator */}
      <div className="ml-4 flex items-center">
        <span className="relative flex h-3 w-3">
          {status === 'connected' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${status === 'connected' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
        </span>
      </div>
    </div>
    {/* Congestion Legend overlay */}
    {status === 'connected' && (
      <div className="absolute bottom-20 right-4 bg-[var(--bg-panel)] p-3 rounded-lg shadow-lg border border-[var(--border-color)] text-xs z-50 flex flex-col space-y-2">
        <div className="font-semibold text-[var(--text-primary)] mb-1">Traffic (V/C)</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></span>Free Flow (&lt; 0.3)</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#f59e0b] mr-2"></span>Congested (0.3 - 0.7)</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-[#ef4444] mr-2"></span>Heavy (&gt; 0.7)</div>
      </div>
    )}
    </>
  );
};
