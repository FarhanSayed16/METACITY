import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, Box, Sparkles, Menu, X } from 'lucide-react';
import { api } from '../../lib/api';
import { useUIStore } from '../../store/uiStore';

export const TopBar: React.FC = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeProjectId = useUIStore((s) => s.activeProjectId);

  useEffect(() => {
    api
      .getModules()
      .then(setModules)
      .catch((err) => console.error('Failed to load modules', err));
  }, []);

  const hasEvacuation = modules.some((m) => m.id === 'evacuation_ca');
  const hasHospital = modules.some((m) => m.id === 'hospital_des');

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <header className="h-14 bg-[var(--bg-chrome)] text-[var(--text-inverse)] flex items-center justify-between px-3 md:px-4 shrink-0 relative z-[60]">
      <div className="flex items-center space-x-2">
        <Box className="h-6 w-6 text-[var(--accent)]" />
        <span className="font-bold text-lg tracking-wide">METACITY</span>
      </div>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center space-x-1">
        <NavLink to="/projects" className={linkClass}>
          Projects
        </NavLink>
        <NavLink to="/ui-kit" className={`${linkClass({ isActive: false })} opacity-70`}>
          UI Kit
        </NavLink>

        {hasEvacuation && (
          <NavLink
            to="/evacuation"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-red-500/20 text-red-200'
                  : 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
              }`
            }
          >
            Evacuation
          </NavLink>
        )}

        {hasHospital && (
          <NavLink
            to="/hospital"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--accent)]/20 text-teal-100'
                  : 'text-teal-300 hover:bg-[var(--accent)]/10'
              }`
            }
          >
            Hospital
          </NavLink>
        )}

        <NavLink
          to={activeProjectId ? `/projects/${activeProjectId}/planner` : '/planner'}
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
              isActive
                ? 'bg-amber-500/20 text-amber-100'
                : 'text-amber-300 hover:bg-amber-500/10 hover:text-amber-200'
            }`
          }
        >
          <Sparkles className="h-3.5 w-3.5" />
          Planner
        </NavLink>

        <NavLink to="/dsa" className={linkClass}>
          Algorithms
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `p-1.5 rounded-md transition-colors ${
              isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`
          }
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </NavLink>
      </nav>

      {/* Mobile menu */}
      <button
        type="button"
        className="md:hidden p-2 rounded-md hover:bg-white/10"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Menu"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {menuOpen && (
        <div className="absolute top-14 inset-x-0 bg-[var(--bg-chrome)] border-t border-white/10 p-3 flex flex-col gap-1 md:hidden shadow-xl animate-fade-up">
          <NavLink to="/projects" className={linkClass} onClick={() => setMenuOpen(false)}>
            Projects
          </NavLink>
          {activeProjectId && (
            <>
              <NavLink
                to={`/projects/${activeProjectId}/compare`}
                className={linkClass}
                onClick={() => setMenuOpen(false)}
              >
                Compare
              </NavLink>
              <NavLink
                to={`/projects/${activeProjectId}/runs`}
                className={linkClass}
                onClick={() => setMenuOpen(false)}
              >
                Runs
              </NavLink>
            </>
          )}
          <NavLink to="/dsa" className={linkClass} onClick={() => setMenuOpen(false)}>
            Algorithms
          </NavLink>
          <NavLink to="/settings" className={linkClass} onClick={() => setMenuOpen(false)}>
            Settings
          </NavLink>
        </div>
      )}
    </header>
  );
};
