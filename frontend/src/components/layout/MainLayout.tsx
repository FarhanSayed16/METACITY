import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { ProjectNav } from './ProjectNav';
import { StatusBar } from './StatusBar';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)]">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <div className="workspace-desktop-only">
          <ProjectNav />
        </div>
        <main className="flex-1 overflow-auto relative min-w-0">
          <Outlet />
        </main>
      </div>
      <StatusBar />
    </div>
  );
};
