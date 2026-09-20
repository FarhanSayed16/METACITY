import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, Box, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { useUIStore } from '../../store/uiStore';

export const TopBar: React.FC = () => {
  const [modules, setModules] = useState<any[]>([]);
  const activeProjectId = useUIStore((s) => s.activeProjectId);

  useEffect(() => {
    api.getModules()
      .then(setModules)
      .catch((err) => console.error('Failed to load modules', err));
  }, []);

  const hasEvacuation = modules.some((m) => m.id === 'evacuation_ca');
  const hasHospital = modules.some((m) => m.id === 'hospital_des');

  return (
    <header className="h-14 bg-[var(--bg-chrome)] text-[var(--text-inverse)] flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center space-x-2">
        <Box className="h-6 w-6 text-[var(--accent)]" />
        <span className="font-bold text-lg tracking-wide">METACITY</span>
      </div>
      <nav className="flex items-center space-x-1">
        <NavLink
          to="/projects"
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`
          }
        >
          Projects
        </NavLink>
        <NavLink
          to="/ui-kit"
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`
          }
        >
          UI Kit
        </NavLink>

        {hasEvacuation && (
          <NavLink
            to="/evacuation"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-red-500/20 text-red-200' : 'text-red-400 hover:bg-red-500/10 hover:text-red-300'}`
            }
          >
            Evacuation
          </NavLink>
        )}

        {hasHospital && (
          <NavLink
            to="/hospital"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-blue-500/20 text-blue-200' : 'text-blue-400 hover:bg-blue-500/10 hover:text-blue-300'}`
            }
          >
            Hospital
          </NavLink>
        )}

        <NavLink
          to={activeProjectId ? `/projects/${activeProjectId}/planner` : '/planner'}
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${isActive ? 'bg-amber-500/20 text-amber-100' : 'text-amber-300 hover:bg-amber-500/10 hover:text-amber-200'}`
          }
        >
          <Sparkles className="h-3.5 w-3.5" />
          Planner
        </NavLink>

        <NavLink
          to="/dsa"
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`
          }
        >
          Algorithm Showcase
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `p-1.5 rounded-md transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`
          }
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </NavLink>
      </nav>
    </header>
  );
};
