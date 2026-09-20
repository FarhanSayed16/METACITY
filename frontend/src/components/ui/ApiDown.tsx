import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { API_BASE } from '../../lib/api';

export const ApiDown: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-[var(--bg-canvas)] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-8">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          API Unreachable
        </h1>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          METACITY cannot connect to the backend server at <code className="text-[var(--text-primary)] bg-[var(--bg-surface)] px-1.5 py-0.5 rounded text-sm">{API_BASE}</code>. 
          Please ensure the backend is running.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
        <p className="text-xs text-[var(--text-muted)]">
          Run <code className="bg-[var(--bg-surface)] px-1 py-0.5 rounded">uvicorn api.main:app --reload</code> in the backend directory.
        </p>
      </div>
    </div>
  );
};
