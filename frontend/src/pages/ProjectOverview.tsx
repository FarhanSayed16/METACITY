import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Project } from '../types/api';
import { Button } from '../components/ui/Button';
import { Map, Plus, Play, ChevronDown, Trash2, X, Eye } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/Toast';
import { CalibrationPanel } from '../components/projects/CalibrationPanel';
import { useScenarioDraftStore } from '../store/scenarioDraftStore';
import { useHealthStore } from '../store/healthStore';

// Supported op types
const OP_TYPES = [
  { value: 'add_node', label: 'Add Node', fields: ['id', 'x', 'y', 'type'] },
  { value: 'add_link', label: 'Add Link', fields: ['id', 'from_node', 'to_node', 'lanes', 'speed_kph', 'capacity_per_lane_per_hour', 'road_class', 'oneway'] },
  { value: 'remove_link', label: 'Remove Link', fields: ['id'] },
  { value: 'set_lanes', label: 'Set Lanes', fields: ['id', 'lanes'] },
  { value: 'set_speed', label: 'Set Speed', fields: ['id', 'speed_kph'] },
  { value: 'set_capacity', label: 'Set Capacity', fields: ['id', 'capacity_per_lane_per_hour'] },
  { value: 'close_link', label: 'Close Link', fields: ['id'] },
  { value: 'flood', label: 'Flood', fields: ['water_level'] },
  { value: 'outage', label: 'Outage', fields: ['link_ids', 'zone_id'] },
  { value: 'add_facility', label: 'Add Facility', fields: ['id', 'type', 'zone_id', 'x', 'y', 'capacity', 'floors'] },
];

const DEFAULT_SEEDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

interface OpEntry {
  type: string;
  data: Record<string, any>;
}

export const ProjectOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mutationsLocked = useHealthStore((s) => s.apiReachable === false);
  const [project, setProject] = useState<Project | null>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showBuilder, setShowBuilder] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [builderOps, setBuilderOps] = useState<OpEntry[]>([]);
  const [showPresetPicker, setShowPresetPicker] = useState(false);

  const fetchProjectData = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.getProject(id),
      api.getScenarios(id),
      api.getPresets()
    ])
      .then(([p, s, pr]) => {
        setProject(p);
        setScenarios(s);
        setPresets(pr);
      })
      .catch(err => {
        setError(err.message || 'Failed to load project details.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleApplyPreset = async (presetId: string) => {
    if (mutationsLocked) {
      toast.error('API down', 'Cannot apply presets while offline.');
      return;
    }
    try {
      const preset = await api.getPreset(presetId);
      await api.createScenario({ project_id: id, name: preset.name, diff_ops: preset.ops });
      const s = await api.getScenarios(id!);
      setScenarios(s);
      toast.success('Preset applied', `"${preset.name}" created as a scenario.`);
    } catch (e: any) {
      toast.error('Preset failed', e.message);
    }
    setShowPresetPicker(false);
  };

  const addOp = () => {
    setBuilderOps([...builderOps, { type: 'add_node', data: {} }]);
  };

  const removeOp = (idx: number) => {
    setBuilderOps(builderOps.filter((_, i) => i !== idx));
  };

  const updateOpType = (idx: number, type: string) => {
    const updated = [...builderOps];
    updated[idx] = { type, data: {} };
    setBuilderOps(updated);
  };

  const updateOpData = (idx: number, field: string, value: string) => {
    const updated = [...builderOps];
    // Auto-cast numeric fields
    const numFields = ['x', 'y', 'lanes', 'speed_kph', 'capacity_per_lane_per_hour', 'capacity', 'floors', 'water_level'];
    const castValue = numFields.includes(field) ? Number(value) || value : value;
    // Boolean fields
    const boolFields = ['oneway'];
    const finalValue = boolFields.includes(field) ? value === 'true' : castValue;
    updated[idx] = { ...updated[idx], data: { ...updated[idx].data, [field]: finalValue } };
    setBuilderOps(updated);
  };

  const handlePreviewOnMap = () => {
    if (builderOps.length === 0) {
      toast.warning('No operations', 'Add at least one operation to preview.');
      return;
    }
    useScenarioDraftStore.getState().setPendingOps(
      builderOps,
      newScenarioName.trim() || 'Unsaved scenario draft'
    );
    toast.success('Ghost preview', 'Opening workspace with dashed scenario overlay.');
    navigate(`/projects/${id}/map`);
  };

  const handleCreateScenario = async () => {
    if (mutationsLocked) {
      toast.error('API down', 'Cannot create scenarios while offline.');
      return;
    }
    if (!newScenarioName.trim()) {
      toast.warning('Name required', 'Please enter a scenario name.');
      return;
    }
    if (builderOps.length === 0) {
      toast.warning('No operations', 'Add at least one operation.');
      return;
    }
    try {
      await api.createScenario({ project_id: id, name: newScenarioName, diff_ops: builderOps });
      setShowBuilder(false);
      setNewScenarioName('');
      setBuilderOps([]);
      const s = await api.getScenarios(id!);
      setScenarios(s);
      toast.success('Scenario created', `"${newScenarioName}" saved.`);
    } catch(e: any) {
      toast.error('Failed to create scenario', e.message);
    }
  };

  const handleRunScenario = async (scenarioId: string) => {
    if (mutationsLocked) {
      toast.error('API down', 'Cannot enqueue runs while offline.');
      return;
    }
    try {
      const runs = await api.triggerRun({ scenario_id: scenarioId, seeds: DEFAULT_SEEDS });
      toast.success('Runs enqueued', `${runs.length} seeds (0–9) queued.`);
      navigate(`/projects/${id}/map?run_id=${runs[0].id}`);
    } catch(e: any) {
      toast.error('Run failed', e.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-6 w-[500px]" />
        <div className="mt-8">
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <h2 className="text-xl font-bold text-[var(--danger)] mb-2">Error</h2>
        <p className="text-[var(--text-secondary)] mb-4">{error || 'Project not found'}</p>
        <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        <p className="text-[var(--text-secondary)] text-lg">{project.description}</p>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-6 mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg mb-1">Base Template</h3>
          <p className="text-[var(--text-secondary)] font-mono text-sm">{project.scene_json_path}</p>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Created: {new Date(project.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex-shrink-0 flex gap-2">
          <Button variant="secondary" size="lg" className="gap-2" onClick={() => navigate(`/projects/${id}/runs`)}>
            <Play className="h-5 w-5" />
            Runs
          </Button>
          <Button size="lg" className="gap-2" onClick={() => navigate(`/projects/${id}/map`)}>
            <Map className="h-5 w-5" />
            Open Workspace
          </Button>
        </div>
      </div>

      <CalibrationPanel 
        projectId={id!} 
        onCalibrationSuccess={fetchProjectData} 
      />

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Scenarios</h2>
        <div className="flex gap-2">
          {/* Preset picker */}
          <div className="relative">
            <Button variant="secondary" onClick={() => setShowPresetPicker(!showPresetPicker)} className="gap-1">
              Presets
              <ChevronDown className="h-4 w-4" />
            </Button>
            {showPresetPicker && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg shadow-xl z-50 overflow-hidden">
                {presets.length === 0 ? (
                  <div className="p-4 text-sm text-[var(--text-secondary)]">No presets available</div>
                ) : (
                  presets.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleApplyPreset(p.id)}
                      className="w-full text-left px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border-subtle)] last:border-0"
                    >
                      <div className="font-medium text-sm">{p.name}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">{p.description}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">{p.ops_count} operations</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <Button onClick={() => setShowBuilder(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            New Scenario
          </Button>
        </div>
      </div>

      {scenarios.length === 0 ? (
        <div className="bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] rounded-lg p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No Scenarios Yet</h3>
          <p className="text-[var(--text-secondary)] mb-6">Test hypotheses safely. Use a preset or build a custom scenario.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {scenarios.map(s => (
            <div key={s.id} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-5 flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-lg">{s.name}</h4>
                <p className="text-xs text-[var(--text-muted)] mt-1">{new Date(s.created_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => {
                    let ops: any[] = [];
                    try {
                      if (Array.isArray(s.diff_ops)) ops = s.diff_ops;
                      else if (typeof s.diff_json === 'string') ops = JSON.parse(s.diff_json || '[]');
                      else if (Array.isArray(s.ops)) ops = s.ops;
                    } catch {
                      ops = [];
                    }
                    if (!ops.length) {
                      toast.warning('No ops', 'This scenario has no operations to preview.');
                      return;
                    }
                    useScenarioDraftStore.getState().setPendingOps(ops, s.name);
                    navigate(`/projects/${id}/map`);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button onClick={() => handleRunScenario(s.id)} className="gap-2" disabled={mutationsLocked}>
                  <Play className="h-4 w-4" />
                  Run (Seeds 0–9)
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scenario Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-panel)] rounded-lg w-[700px] max-h-[85vh] flex flex-col border border-[var(--border-color)] shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
              <h2 className="text-xl font-bold">Create Scenario</h2>
              <button onClick={() => setShowBuilder(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Scenario Name</label>
                <input 
                  type="text" 
                  value={newScenarioName} 
                  onChange={e => setNewScenarioName(e.target.value)} 
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-lg text-sm"
                  placeholder="e.g. Close Main Street"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Operations</label>
                  <button onClick={addOp} className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add Op
                  </button>
                </div>
                
                {builderOps.length === 0 && (
                  <div className="border border-dashed border-[var(--border-subtle)] rounded-lg p-8 text-center text-sm text-[var(--text-muted)]">
                    No operations yet. Click "Add Op" to start building.
                  </div>
                )}
                
                <div className="space-y-3">
                  {builderOps.map((op, idx) => {
                    const opDef = OP_TYPES.find(o => o.value === op.type);
                    return (
                      <div key={idx} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <select
                            value={op.type}
                            onChange={e => updateOpType(idx, e.target.value)}
                            className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-2 py-1.5 text-sm font-medium"
                          >
                            {OP_TYPES.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                          <button onClick={() => removeOp(idx)} className="text-red-400 hover:text-red-300 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {opDef?.fields.map(field => (
                            <div key={field}>
                              <label className="text-xs text-[var(--text-muted)] mb-0.5 block">{field}</label>
                              {field === 'oneway' ? (
                                <select
                                  value={String(op.data[field] ?? 'false')}
                                  onChange={e => updateOpData(idx, field, e.target.value)}
                                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded px-2 py-1.5 text-xs"
                                >
                                  <option value="false">No</option>
                                  <option value="true">Yes</option>
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={op.data[field] ?? ''}
                                  onChange={e => updateOpData(idx, field, e.target.value)}
                                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded px-2 py-1.5 text-xs font-mono"
                                  placeholder={field}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-[var(--border-subtle)]">
              <Button variant="ghost" onClick={() => setShowBuilder(false)}>Cancel</Button>
              <Button variant="secondary" onClick={handlePreviewOnMap} className="gap-1">
                <Eye className="h-4 w-4" />
                Preview on map
              </Button>
              <Button onClick={handleCreateScenario}>Save Scenario</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
