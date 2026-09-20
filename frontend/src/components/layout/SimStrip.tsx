import React from 'react';
import { useSimStore } from '../../store/simStore';
import { useUIStore } from '../../store/uiStore';
import { Play, Pause, FastForward } from 'lucide-react';
import { CongestionLegend } from '../ui/CongestionLegend';

export const SimStrip: React.FC = () => {
  const {
    progress_pct,
    t_mins,
    isPlaying,
    togglePlay,
    playbackSpeed,
    setPlaybackSpeed,
    status,
  } = useSimStore();
  const showLayersLegend = useUIStore((s) => s.showLayersLegend);

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 h-14 md:h-16 bg-[var(--bg-panel)]/95 backdrop-blur-sm border-t border-[var(--border-color)] shadow-lg flex items-center px-3 md:px-4 z-50">
        <div className="flex items-center gap-1 mr-3">
          <button
            type="button"
            className="p-2 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white disabled:opacity-40 transition-colors"
            onClick={togglePlay}
            disabled={status !== 'connected'}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <button
            type="button"
            className="ml-1 px-2 py-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] flex items-center text-xs font-semibold transition-colors"
            onClick={() => setPlaybackSpeed(playbackSpeed >= 4 ? 1 : playbackSpeed * 2)}
            title="Playback speed (visual)"
          >
            {playbackSpeed}x <FastForward size={14} className="ml-1" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-2 md:px-4 min-w-0">
          <div
            className="w-full h-2 bg-[var(--border-color)] rounded-full overflow-hidden relative"
            title="Simulation progress (live stream — not seekable)"
            role="progressbar"
            aria-valuenow={Math.round(progress_pct)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="absolute top-0 left-0 h-full bg-[var(--accent)] transition-[width] duration-150 ease-linear"
              style={{ width: `${progress_pct}%` }}
            />
          </div>
        </div>

        <div className="text-[var(--text-primary)] font-mono text-sm font-medium tracking-wider w-16 md:w-20 text-right shrink-0">
          {formatTime(t_mins)}
        </div>

        <div className="ml-3 flex items-center shrink-0" title={`Stream: ${status}`}>
          <span className="relative flex h-2.5 w-2.5">
            {status === 'connected' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                status === 'connected' ? 'bg-[var(--success)]' : 'bg-[var(--text-muted)]'
              }`}
            />
          </span>
        </div>
      </div>

      {/* Only show floating legend when Layers (L) panel is closed — avoid duplicate */}
      {status === 'connected' && !showLayersLegend && (
        <CongestionLegend
          compact
          className="absolute bottom-20 right-4 z-40 workspace-desktop-only"
        />
      )}
    </>
  );
};
