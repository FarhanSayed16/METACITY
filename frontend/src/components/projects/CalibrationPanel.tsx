import React, { useState } from 'react';
import { api } from '../../lib/api';
import { Button } from '../ui/Button';

interface Props {
  projectId: string;
  onCalibrationSuccess: () => void;
}

export const CalibrationPanel: React.FC<Props> = ({ projectId, onCalibrationSuccess }) => {
  const [countsJson, setCountsJson] = useState('{\n  "LH1": 1200,\n  "LH2": 1500\n}');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState('');

  const handleCalibrate = async (fit = false) => {
    try {
      const counts = JSON.parse(countsJson);
      setLoading(true);
      setError('');
      setReport(null);

      const res = await api.calibrateProject(projectId, counts, fit);
      setReport(res);
      onCalibrationSuccess();
    } catch (e: any) {
      setError(e.message || 'Invalid JSON or server error');
    } finally {
      setLoading(false);
    }
  };

  const status = report?.report?.status || report?.status;
  const geh = report?.report?.geh_avg ?? report?.geh_avg;
  const rmse = report?.report?.rmse ?? report?.rmse;
  const perLink = report?.report?.per_link_geh || report?.per_link_geh;

  return (
    <div className="bg-white border border-[var(--border-strong)] rounded-lg p-6 mb-8 shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Calibration & Credibility</h2>
      <p className="text-[var(--text-secondary)] text-sm mb-4">
        Paste observed real-world counts (JSON) for links in this network to test its calibration (GEH & RMSE).
      </p>

      {error && <div className="text-red-600 mb-4 text-sm">{error}</div>}

      <div className="mb-4">
        <textarea
          className="w-full h-32 p-3 text-sm font-mono border border-[var(--border-strong)] rounded-md"
          value={countsJson}
          onChange={(e) => setCountsJson(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={() => handleCalibrate(false)} disabled={loading}>
          {loading ? 'Running…' : 'Run Calibration'}
        </Button>
        <Button variant="secondary" onClick={() => handleCalibrate(true)} disabled={loading}>
          Suggest & re-test fit
        </Button>
      </div>

      {report && (
        <div className="mt-6 pt-6 border-t border-[var(--border-strong)]">
          <h3 className="font-semibold mb-4">Calibration Report</h3>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-[var(--bg-canvas)] rounded-lg">
              <div className="text-xs text-[var(--text-secondary)] uppercase">Status</div>
              <div
                className={`text-lg font-bold ${
                  status === 'calibrated'
                    ? 'text-green-600'
                    : status === 'partially_calibrated'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {(status || '').replace('_', ' ')}
              </div>
            </div>
            <div className="p-4 bg-[var(--bg-canvas)] rounded-lg">
              <div className="text-xs text-[var(--text-secondary)] uppercase">GEH (Average)</div>
              <div className="text-lg font-bold">{Number(geh ?? 0).toFixed(2)}</div>
            </div>
            <div className="p-4 bg-[var(--bg-canvas)] rounded-lg">
              <div className="text-xs text-[var(--text-secondary)] uppercase">RMSE</div>
              <div className="text-lg font-bold">{Number(rmse ?? 0).toFixed(2)}</div>
            </div>
          </div>

          {report.suggested_scale != null && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-900 text-sm">
              Suggested demand scale:{' '}
              <strong className="font-mono">{Number(report.suggested_scale).toFixed(3)}</strong>
              {report.after_fit_report && (
                <span className="ml-2">
                  → after fit GEH {Number(report.after_fit_report.geh_avg).toFixed(2)} (
                  {report.after_fit_report.status})
                </span>
              )}
              <div className="text-xs mt-1 opacity-80">{report.note}</div>
            </div>
          )}

          {perLink && (
            <div>
              <div className="text-sm font-medium mb-2">Per-Link GEH</div>
              <div className="max-h-40 overflow-y-auto text-sm font-mono">
                {Object.entries(perLink).map(([id, g]: any) => (
                  <div
                    key={id}
                    className="flex justify-between py-0.5 border-b border-[var(--border-subtle)]"
                  >
                    <span>{id}</span>
                    <span>{Number(g).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
