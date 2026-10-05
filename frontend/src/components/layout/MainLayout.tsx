import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { ProjectNav } from './ProjectNav';
import { StatusBar } from './StatusBar';
import { AskMetacityAI } from '../ai/AskMetacityAI';
import { featureFlags } from '../../lib/featureFlags';
import { useUIStore } from '../../store/uiStore';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const advancedLab = useUIStore((s) => s.advancedLab);
  const isDecision = location.pathname.startsWith('/decision');
  // Decision Mode: no side rail. Advanced lab: show project tools rail.
  const showSideNav = advancedLab && !isDecision;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)]">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {showSideNav && (
          <div className="workspace-desktop-only">
            <ProjectNav />
          </div>
        )}
        <main className="flex-1 overflow-auto relative min-w-0">
          <Outlet />
        </main>
      </div>
      <StatusBar />
      {featureFlags.aiCommand && advancedLab && <AskMetacityAI />}
    </div>
  );
};
