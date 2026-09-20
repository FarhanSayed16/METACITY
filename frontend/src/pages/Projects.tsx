import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';
import { api } from '../lib/api';
import type { Project } from '../types/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { NewProjectWizard } from '../components/projects/NewProjectWizard';

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-[var(--text-secondary)]">Manage your simulation environments and scenarios.</p>
        </div>
        <Button className="gap-2" onClick={() => setWizardOpen(true)}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
      
      {loading ? (
        <div className="text-[var(--text-secondary)] animate-pulse">Loading projects...</div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-[var(--border-strong)] rounded-lg bg-[var(--bg-surface-muted)] text-center">
          <div className="h-12 w-12 rounded-full bg-[var(--bg-canvas)] flex items-center justify-center mb-4 text-[var(--text-muted)]">
            <Plus className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md">
            Create a new project from a city template to start simulating traffic and evaluating scenarios.
          </p>
          <Button onClick={() => setWizardOpen(true)}>Create your first project</Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map(p => (
              <TableRow 
                key={p.id} 
                className="cursor-pointer" 
                onClick={() => navigate(`/projects/${p.id}`)}
              >
                <TableCell className="font-semibold">{p.name}</TableCell>
                <TableCell className="text-[var(--text-secondary)]">{p.description}</TableCell>
                <TableCell className="font-mono text-xs">{p.scene_json_path}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    (p.calibration_status || 'uncalibrated') === 'calibrated' ? 'bg-green-100 text-green-800' :
                    (p.calibration_status || 'uncalibrated') === 'partially_calibrated' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {(p.calibration_status || 'uncalibrated').replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-[var(--text-secondary)]">
                  {new Date(p.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <NewProjectWizard 
        isOpen={wizardOpen} 
        onClose={() => setWizardOpen(false)} 
        onSuccess={fetchProjects}
      />
    </div>
  );
};
