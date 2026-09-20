import React, { useEffect, useState } from 'react';
import { Database, CheckCircle2, XCircle, Loader2, Gauge } from 'lucide-react';
import { useHealthStore } from '../../store/healthStore';
import { useSimStore } from '../../store/simStore';
import { api } from '../../lib/api';

type HealthStatus = 'checking' | 'connected' | 'disconnected';

export const StatusBar: React.FC = () => {
  const apiReachable = useHealthStore((s) => s.apiReachable);
  const modelVersion = useHealthStore((s) => s.modelVersion);
  const activeRunId = useSimStore((s) => s.activeRunId);
  const progress = useSimStore((s) => s.progress_pct);
  const [gap, setGap] = useState<number | null>(null);
  const [iters, setIters] = useState<number | null>(null);

  const status: HealthStatus =
    apiReachable === null ? 'checking' : apiReachable ? 'connected' : 'disconnected';

  useEffect(() => {
    if (!activeRunId || progress < 100) {
      if (!activeRunId) {
        setGap(null);
        setIters(null);
      }
      return;
    }
    let mounted = true;
    api.getRunMeta(activeRunId)
      .then((meta) => {
        if (!mounted) return;
        setGap(meta.final_gap ?? null);
        setIters(meta.iterations ?? null);
      })
      .catch(() => {
        if (mounted) {
          setGap(null);
          setIters(null);
        }
      });
    return () => {
      mounted = false;
    };
  }, [activeRunId, progress]);

  const statusIcon = {
    checking: <Loader2 className="h-3 w-3 animate-spin text-yellow-400" />,
    connected: <CheckCircle2 className="h-3 w-3 text-[var(--success)]" />,
    disconnected: <XCircle className="h-3 w-3 text-red-400" />,
  };

  const statusText = {
    checking: 'Checking…',
    connected: 'API Connected',
    disconnected: 'API Disconnected',
  };

  const statusColor = {
    checking: 'text-yellow-400',
    connected: 'text-[var(--success)]',
    disconnected: 'text-red-400',
  };

  return (
    <footer className="h-8 bg-[var(--bg-chrome)] text-gray-400 border-t border-gray-700 flex items-center justify-between px-4 shrink-0 text-xs font-mono">
      <div className="flex items-center space-x-4">
        <span className="flex items-center space-x-1">
          <Database className="h-3 w-3" />
          <span>Local SQLite</span>
        </span>
        <span className={`flex items-center space-x-1 ${statusColor[status]}`}>
          {statusIcon[status]}
          <span>{statusText[status]}</span>
        </span>
        {modelVersion && (
          <span className="text-[var(--text-muted)]">Model {modelVersion}</span>
        )}
        {gap != null && (
          <span className="flex items-center space-x-1 text-cyan-400" title="MSA equilibrium gap">
            <Gauge className="h-3 w-3" />
            <span>
              gap {Number(gap).toExponential(2)}
              {iters != null ? ` · iter ${iters}` : ''}
            </span>
          </span>
        )}
      </div>
      <div>mvp-1.0</div>
    </footer>
  );
};
