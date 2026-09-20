import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Template, Profile } from '../../types/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewProjectWizard: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('');
  const [profile, setProfile] = useState('default');
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Import from OSM
  const [creationMode, setCreationMode] = useState<'template' | 'osm'>('template');
  const [bbox, setBbox] = useState({ south: 0, west: 0, north: 0, east: 0 });

  useEffect(() => {
    if (isOpen) {
      // Reset state
      setName('');
      setDescription('');
      setTemplate('');
      setProfile('default');
      setError('');
      
      // Fetch metadata
      Promise.all([
        api.getTemplates(),
        api.getProfiles()
      ]).then(([t, p]) => {
        setTemplates(t);
        setProfiles(p);
        if (t.length > 0) setTemplate(t[0].filename);
      }).catch(err => {
        console.error(err);
        setError('Failed to load templates or profiles.');
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    if (creationMode === 'template' && !template) return;
    
    setLoading(true);
    setError('');
    try {
      if (creationMode === 'template') {
        const proj = await api.createProject({
          name,
          description: description || `Created with ${profile} profile`,
          scene_json_path: template,
          profile_id: profile,
        });
        onSuccess?.();
        onClose();
        navigate(`/projects/${proj.id}`);
      } else {
        const res = await api.importFromOSM(bbox, name);
        onSuccess?.();
        onClose();
        navigate(`/projects/${res.project_id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Create New Project"
    >
      <form id="new-project-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-[var(--danger)] bg-red-50 rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        <div className="flex space-x-2 border-b border-[var(--border-strong)] pb-2 mb-4">
          <button 
            type="button"
            className={`px-3 py-1 text-sm font-medium rounded-md ${creationMode === 'template' ? 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            onClick={() => setCreationMode('template')}
          >
            Use Template
          </button>
          <button 
            type="button"
            className={`px-3 py-1 text-sm font-medium rounded-md ${creationMode === 'osm' ? 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            onClick={() => setCreationMode('osm')}
          >
            Import from OSM
          </button>
        </div>
        
        <Input 
          label="Project Name" 
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={creationMode === 'osm' ? "e.g. Downtown Import" : "e.g. Nexus Downtown Scenario A"}
          required
        />
        
        {creationMode === 'template' && (
          <>
            <Input 
              label="Description (Optional)" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief summary of this experiment..."
            />
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--text-primary)]">City Template</label>
              <select 
                value={template} 
                onChange={e => setTemplate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-[var(--border-strong)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                required
              >
                <option value="" disabled>Select a template...</option>
                {templates.map(t => (
                  <option key={t.filename} value={t.filename}>{t.name} ({t.node_count} nodes)</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--text-primary)]">Simulation Profile</label>
              <select 
                value={profile} 
                onChange={e => setProfile(e.target.value)}
                className="flex h-10 w-full rounded-md border border-[var(--border-strong)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                required
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - {p.description}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {creationMode === 'osm' && (
          <div className="space-y-4">
            <div className="text-sm text-[var(--text-secondary)]">
              Specify the bounding box coordinates to fetch road networks directly from OpenStreetMap.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="North Latitude" type="number" step="any" required
                value={bbox.north || ''} onChange={e => setBbox({...bbox, north: parseFloat(e.target.value)})} 
                placeholder="e.g. 51.51"
              />
              <Input 
                label="South Latitude" type="number" step="any" required
                value={bbox.south || ''} onChange={e => setBbox({...bbox, south: parseFloat(e.target.value)})} 
                placeholder="e.g. 51.50"
              />
              <Input 
                label="West Longitude" type="number" step="any" required
                value={bbox.west || ''} onChange={e => setBbox({...bbox, west: parseFloat(e.target.value)})} 
                placeholder="e.g. -0.11"
              />
              <Input 
                label="East Longitude" type="number" step="any" required
                value={bbox.east || ''} onChange={e => setBbox({...bbox, east: parseFloat(e.target.value)})} 
                placeholder="e.g. -0.09"
              />
            </div>
            <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-canvas)] p-2 rounded-md">
              Note: Large bounding boxes may take a long time to download and process.
            </div>
          </div>
        )}
      </form>
      
      <div className="flex justify-end space-x-3 mt-8">
        <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
        <Button type="submit" form="new-project-form" disabled={loading || !name || (creationMode === 'template' && !template)}>
          {loading ? 'Creating...' : 'Create Project'}
        </Button>
      </div>
    </Modal>
  );
};
