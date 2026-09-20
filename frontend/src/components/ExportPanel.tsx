import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from './ui/Toast';
import { useHealthStore } from '../store/healthStore';
import { useSimStore } from '../store/simStore';

export const ExportPanel: React.FC<{ projectId?: string }> = ({ projectId }) => {
  const [isExporting, setIsExporting] = useState(false);
  const locked = useHealthStore((s) => s.apiReachable === false);
  const activeRunId = useSimStore((s) => s.activeRunId);

  const handleExportGeoJSON = async () => {
    if (!projectId) {
      toast.warning('No project', 'Open a project workspace to export.');
      return;
    }
    if (locked) {
      toast.error('API down', 'Cannot export while offline.');
      return;
    }
    setIsExporting(true);
    try {
      const data = await api.exportGeoJSON(projectId, activeRunId || undefined);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `metacity_export_${projectId}${activeRunId ? `_${activeRunId.slice(0, 8)}` : ''}.geojson`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(
        'Exported',
        activeRunId
          ? 'GeoJSON with link flows from the active run.'
          : 'GeoJSON download started (pass an active run for flow fields).'
      );
    } catch (e: any) {
      toast.error('Export failed', e.message || 'Unknown error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="absolute bottom-20 left-4 z-10 bg-[var(--bg-panel)]/95 backdrop-blur-sm p-3 rounded-lg shadow-md border border-[var(--border-color)]">
      <h3 className="text-[var(--text-primary)] font-semibold mb-2 text-sm">Export</h3>
      <button
        onClick={handleExportGeoJSON}
        disabled={isExporting || locked || !projectId}
        className="flex items-center gap-2 bg-[#1B2430] text-white px-3 py-2 rounded text-sm hover:bg-[#2A9D8F] transition-colors disabled:opacity-50"
      >
        <Download size={16} />
        {isExporting ? 'Exporting…' : 'Download GeoJSON'}
      </button>
      <p className="mt-1.5 text-[10px] text-[var(--text-secondary)] leading-snug">
        {activeRunId
          ? 'Includes volume / v/c from the active run.'
          : 'Run a simulation first to attach flow fields.'}
      </p>
    </div>
  );
};
