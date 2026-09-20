import { create } from 'zustand';
import { wsUrl } from '../lib/api';

interface SimState {
  activeRunId: string | null;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  t_mins: number;
  progress_pct: number;
  link_metrics: Record<string, any>;
  agents_sample: any[];
  playbackSpeed: number;
  isPlaying: boolean;
  ws: WebSocket | null;

  connectWS: (runId: string) => void;
  disconnectWS: () => void;
  setPlaybackSpeed: (speed: number) => void;
  togglePlay: () => void;
}

/** Throttle heavy link_metrics React updates (~8 Hz) while keeping time bar smooth. */
const METRICS_MIN_MS = 125;

export const useSimStore = create<SimState>((set, get) => ({
  activeRunId: null,
  status: 'disconnected',
  t_mins: 0,
  progress_pct: 0,
  link_metrics: {},
  agents_sample: [],
  playbackSpeed: 1,
  isPlaying: true,
  ws: null,

  connectWS: (runId: string) => {
    const currentWs = get().ws;
    if (currentWs) {
      currentWs.close();
    }

    set({ status: 'connecting', activeRunId: runId, progress_pct: 0, t_mins: 0 });

    const ws = new WebSocket(wsUrl(`/runs/${runId}/stream`));
    let lastMetricsAt = 0;
    let pendingMetrics: Record<string, any> | null = null;
    let pendingAgents: any[] | null = null;
    let raf = 0;

    const flushMetrics = () => {
      raf = 0;
      if (!pendingMetrics) return;
      set({
        link_metrics: pendingMetrics,
        agents_sample: pendingAgents || [],
      });
      pendingMetrics = null;
      pendingAgents = null;
      lastMetricsAt = performance.now();
    };

    ws.onopen = () => {
      set({ status: 'connected' });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!get().isPlaying) return;

        // Lightweight progress always updates
        set({
          t_mins: data.t_mins || 0,
          progress_pct: data.progress_pct || 0,
        });

        if (data.link_metrics) {
          pendingMetrics = data.link_metrics;
          pendingAgents = data.agents_sample || [];
          const now = performance.now();
          if (now - lastMetricsAt >= METRICS_MIN_MS) {
            flushMetrics();
          } else if (!raf) {
            raf = window.setTimeout(flushMetrics, METRICS_MIN_MS - (now - lastMetricsAt)) as unknown as number;
          }
        }
      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    };

    ws.onerror = () => {
      set({ status: 'error' });
    };

    ws.onclose = () => {
      if (raf) window.clearTimeout(raf);
      set({ status: 'disconnected', ws: null });
    };

    set({ ws });
  },

  disconnectWS: () => {
    const ws = get().ws;
    if (ws) {
      ws.close();
    }
    set({ ws: null, status: 'disconnected', activeRunId: null });
  },

  setPlaybackSpeed: (speed: number) => set({ playbackSpeed: speed }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
}));
