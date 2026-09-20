"""Network Inspector — connectivity, bridges, centrality, isolation."""
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/Toast';
import { useHealthStore } from '../store/healthStore';
import { useUIStore } from '../store/uiStore';
import { Activity, GitBranch, Network, Search, Link2 } from 'lucide-react';

type ToolKey = 'connectivity' | 'bridges' | 'centrality' | 'isolation';

export const NetworkTools: React.FC = () => {
  const { id: routeProjectId } = useParams<{ id?: string }>();
  const activeProjectId = useUIStore((s) => s.activeProjectId);
  const projectId = routeProjectId || activeProjectId;
  const navigate = useNavigate();
  const locked = useHealthStore((s) => s.apiReachable === false);

  const [scene, setScene] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<ToolKey | null>(null);
  const [result, setResult] = useState<{ tool: ToolKey; data: any } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .getScene(projectId)
      .then(setScene)
      .catch((e) => setError(e.message || 'Failed to load scene'))
      .finally(() => setLoading(false));
  }, [projectId]);

  const runTool = async (tool: ToolKey) => {
    if (!scene || locked) return;
    setBusy(tool);
    try {
      let data: any;
      if (tool === 'connectivity') data = await api.getConnectivity(scene);
      else if (tool === 'bridges') data = await api.getBridges(scene);
      else if (tool === 'centrality') data = await api.getCentrality(scene);
      else data = await api.getIsolation(scene);
      setResult({ tool, data });
      toast.success('Network tool', `${tool} complete`);
    } catch (e: any) {
      toast.error('Network tool failed', e.message || 'Unknown error');
    } finally {
      setBusy(null);
    }
  };

  if (!projectId) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-2">Network Inspector</h1>
        <p className="text-[var(--text-secondary)] mb-6">
          Open a project to run connectivity, bridge, centrality, and isolation checks on its scene.
        </p>
        <Button onClick={() => navigate('/projects')}>Go to Projects</Button>
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          Or try live algorithm demos on <Link className="text-[var(--accent)] underline" to="/dsa">/dsa</Link>.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => navigate(`/projects/${projectId}`)}>Back to project</Button>
      </div>
    );
  }

  const nodes = scene?.nodes?.length ?? 0;
  const links = scene?.links?.length ?? 0;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Network size={24} /> Network Inspector
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Scene: {nodes} nodes · {links} links
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(`/projects/${projectId}/map`)}>
            Open map
          </Button>
          <Button variant="ghost" onClick={() => navigate('/dsa')}>
            DSA demos
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(
          [
            ['connectivity', 'Connectivity', Link2],
            ['bridges', 'Bridge links', GitBranch],
            ['centrality', 'Betweenness (top)', Search],
            ['isolation', 'Isolation metrics', Activity],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            disabled={locked || !!busy}
            onClick={() => runTool(key)}
            className="flex items-center gap-3 p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-panel)] hover:border-[var(--accent)] text-left disabled:opacity-50"
          >
            <Icon size={20} className="text-[var(--accent)] shrink-0" />
            <div>
              <div className="font-medium">{busy === key ? 'Running…' : label}</div>
              <div className="text-xs text-[var(--text-secondary)]">POST /tools/{key}</div>
            </div>
          </button>
        ))}
      </div>

      {result && (
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-panel)] p-4">
          <h2 className="font-semibold mb-2 capitalize">{result.tool} result</h2>
          <pre className="text-xs overflow-auto max-h-96 font-mono text-[var(--text-secondary)] whitespace-pre-wrap">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
