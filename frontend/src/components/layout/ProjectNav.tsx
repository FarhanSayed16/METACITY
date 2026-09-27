import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Map, Activity, Play, Network, Building2 } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { featureFlags } from '../../lib/featureFlags';

export const ProjectNav: React.FC = () => {
  const { id: routeId } = useParams<{ id?: string }>();
  const activeProjectId = useUIStore((s) => s.activeProjectId);
  const projectId = routeId || activeProjectId;

  const base = projectId ? `/projects/${projectId}` : null;

  return (
    <aside className="w-16 bg-[var(--bg-chrome)] text-gray-400 flex flex-col items-center py-4 space-y-4 shrink-0 border-t border-gray-700">
      <NavLink
        to={base ? `${base}/map` : '/projects'}
        className={({ isActive }) =>
          `p-2 rounded-lg transition-colors ${isActive ? 'bg-[var(--accent)] text-white' : 'hover:bg-gray-700 hover:text-white'}`
        }
        title="Network Evidence map"
      >
        <Map className="h-6 w-6" />
      </NavLink>
      {featureFlags.cityTwin && (
        <NavLink
          to={base ? `${base}/city` : '/projects'}
          className={({ isActive }) =>
            `p-2 rounded-lg transition-colors ${isActive ? 'bg-[var(--accent)] text-white' : 'hover:bg-gray-700 hover:text-white'}`
          }
          title="City Twin (GLB presentation)"
        >
          <Building2 className="h-6 w-6" />
        </NavLink>
      )}
      <NavLink
        to={base ? `${base}/runs` : '/runs'}
        className={({ isActive }) =>
          `p-2 rounded-lg transition-colors ${isActive ? 'bg-[var(--accent)] text-white' : 'hover:bg-gray-700 hover:text-white'}`
        }
        title="Simulations"
      >
        <Play className="h-6 w-6" />
      </NavLink>
      <NavLink
        to={base ? `${base}/compare` : '/projects'}
        className={({ isActive }) =>
          `p-2 rounded-lg transition-colors ${isActive ? 'bg-[var(--accent)] text-white' : 'hover:bg-gray-700 hover:text-white'}`
        }
        title="Comparison"
      >
        <Activity className="h-6 w-6" />
      </NavLink>
      <NavLink
        to={base ? `${base}/network` : '/network'}
        className={({ isActive }) =>
          `p-2 rounded-lg transition-colors ${isActive ? 'bg-[var(--accent)] text-white' : 'hover:bg-gray-700 hover:text-white'}`
        }
        title="Network Inspector"
      >
        <Network className="h-6 w-6" />
      </NavLink>
    </aside>
  );
};
