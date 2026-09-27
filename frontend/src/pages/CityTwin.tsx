/** City Twin — Phase 3: scene-driven GLB city + congestion roads. */
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Building2, Map, ArrowLeft, Boxes } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { featureFlags } from '../lib/featureFlags';
import { EmptyState } from '../components/ui/EmptyState';
import { CityTwinSandbox } from '../components/city/CityTwinSandbox';
import { CityTwinScene } from '../components/city/CityTwinScene';
import { AssetAttribution } from '../components/city/AssetAttribution';
import { CongestionLegend } from '../components/ui/CongestionLegend';
import { api } from '../lib/api';
import { useSimStore } from '../store/simStore';
import { useUIStore } from '../store/uiStore';
import { preloadCoreAssets } from '../assets/GLTFAssetCache';

export const CityTwin: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const connectWS = useSimStore((s) => s.connectWS);
  const disconnectWS = useSimStore((s) => s.disconnectWS);

  const [scene, setScene] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'scene' | 'sandbox'>('scene');

  useEffect(() => {
    preloadCoreAssets(false);
  }, []);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    useUIStore.getState().setActiveProjectId(projectId);
    setLoading(true);
    setError('');
    api
      .getScene(projectId)
      .then((data) => {
        setScene(data);
        setMode('scene');
      })
      .catch((e) => {
        setError(e.message || 'Failed to load scene');
        setMode('sandbox');
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  // Optional live congestion from ?run_id=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const runId = params.get('run_id');
    if (runId) connectWS(runId);
    return () => {
      disconnectWS();
    };
  }, [location.search, connectWS, disconnectWS]);

  if (!featureFlags.cityTwin) {
    return (
      <div className="p-8">
        <EmptyState
          icon={Building2}
          title="City Twin disabled"
          description="Set VITE_CITY_TWIN=true to enable this mode."
          actionLabel="Open network map"
          onAction={() => projectId && navigate(`/projects/${projectId}/map`)}
        />
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="p-8">
        <EmptyState
          icon={Building2}
          title="Open a project"
          description="City Twin places GLBs from your project scene."
          actionLabel="Go to projects"
          onAction={() => navigate('/projects')}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center bg-[var(--bg-canvas)]">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          <p className="text-sm text-[var(--text-secondary)]">Loading city scene…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[70vh] bg-[var(--bg-canvas)] overflow-hidden">
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => navigate(`/projects/${projectId}`)}>
          <ArrowLeft size={16} className="mr-1" /> Overview
        </Button>
        <Button variant="secondary" size="sm" onClick={() => navigate(`/projects/${projectId}/map`)}>
          <Map size={16} className="mr-1" /> Network mode
        </Button>
        {featureFlags.disasterLab && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              useUIStore.getState().setShowDisasterLab(true);
              navigate(`/projects/${projectId}/map`);
            }}
            title="Open Disaster Lab on the Network map"
          >
            Disaster Lab
          </Button>
        )}
        <Button
          variant={mode === 'scene' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setMode('scene')}
          disabled={!scene}
        >
          <Building2 size={16} className="mr-1" /> Scene city
        </Button>
        <Button
          variant={mode === 'sandbox' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setMode('sandbox')}
        >
          <Boxes size={16} className="mr-1" /> Asset sandbox
        </Button>
      </div>

      <div className="absolute top-4 right-4 z-20 max-w-xs workspace-desktop-only space-y-2">
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-panel)]/95 backdrop-blur-sm px-3 py-2 text-xs shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)] mb-1">
            <Building2 size={14} className="text-[var(--accent)]" />
            City Twin · agents viz
          </div>
          <p className="text-[var(--text-secondary)] leading-snug">
            {mode === 'scene'
              ? 'GLB facilities · congestion roads · sampled agents from live run (viz ≠ microsim).'
              : 'Registry showcase grid (not project-placed).'}
          </p>
          {error && (
            <p className="mt-1 text-[var(--danger)] text-[10px]">Scene load: {error}</p>
          )}
        </div>
        {mode === 'scene' && (
          <CongestionLegend compact className="shadow-sm" />
        )}
      </div>

      {mode === 'scene' && scene ? (
        <CityTwinScene scene={scene} />
      ) : (
        <CityTwinSandbox />
      )}

      <AssetAttribution />
    </div>
  );
};
