import { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { Projects } from './pages/Projects';
import { ProjectOverview } from './pages/ProjectOverview';
import { Settings } from './pages/Settings';
import { UiKit } from './pages/UiKit';
import { NotFound } from './pages/NotFound';
import { ApiDown } from './components/ui/ApiDown';
import { ToastStack } from './components/ui/Toast';
import './index.css';

import { WorkspaceMap } from './pages/WorkspaceMap';
import { Compare } from './pages/Compare';
import { DSAShowcase } from './pages/DSAShowcase';
import { EvacuationMap } from './pages/EvacuationMap';
import { HospitalSurge } from './pages/HospitalSurge';
import { Runs } from './pages/Runs';
import { Planner } from './pages/Planner';
import { NetworkTools } from './pages/NetworkTools';
import { CityTwin } from './pages/CityTwin';
import { DecisionStart } from './pages/DecisionStart';
import { DecisionImpact } from './pages/DecisionImpact';
import { OnboardingTour } from './components/ui/OnboardingTour';
import { useHealthStore } from './store/healthStore';
import { api } from './lib/api';

/** City Twin route is always registered; `featureFlags.cityTwin` gates UI CTAs + page content. */

/**
 * Root layout that wraps the entire app.
 * Handles API health polling and the connection-lost overlay.
 */
function RootLayout() {
  const apiReachable = useHealthStore((s) => s.apiReachable);
  const setApiReachable = useHealthStore((s) => s.setApiReachable);
  const setModelVersion = useHealthStore((s) => s.setModelVersion);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      try {
        const data = await api.checkHealth();
        if (!isMounted) return;
        setApiReachable(true);
        if (data.model_version) setModelVersion(data.model_version);
      } catch {
        if (isMounted) setApiReachable(false);
      } finally {
        if (isMounted) setInitialCheckDone(true);
      }
    };

    check();
    const interval = setInterval(check, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [setApiReachable, setModelVersion]);

  // Landing + Decision entry stay reachable offline so product entry still works.
  const path = window.location.pathname;
  const allowOffline =
    path === '/' || path.includes('/projects') || path.startsWith('/decision');
  if (initialCheckDone && apiReachable === false && !allowOffline) {
    return <ApiDown />;
  }

  return (
    <>
      {apiReachable === false && (
        <div className="fixed inset-0 z-[200] bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 max-w-md shadow-xl rounded-lg text-center">
            <h2 className="text-red-800 text-lg font-bold mb-2">Connection Lost</h2>
            <p className="text-red-700 text-sm">
              The METACITY backend API is unreachable. Save, Run, Compare, and edit mutations are blocked until the API recovers.
            </p>
          </div>
        </div>
      )}
      <Outlet />
      <ToastStack />
      <OnboardingTour />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { path: '/', element: <LandingPage /> },

      // Routes wrapped in MainLayout (with TopBar, ProjectNav, StatusBar)
      {
        element: <MainLayout />,
        children: [
          { path: '/decision', element: <DecisionStart /> },
          { path: '/decision/:decisionId/impact', element: <DecisionImpact /> },
          { path: '/projects', element: <Projects /> },
          { path: '/projects/:id', element: <ProjectOverview /> },
          { path: '/settings', element: <Settings /> },
          { path: '/ui-kit', element: <UiKit /> },
          { path: '/projects/:id/map', element: <WorkspaceMap /> },
          { path: '/projects/:id/city', element: <CityTwin /> },
          { path: '/projects/:id/compare', element: <Compare /> },
          { path: '/projects/:id/runs', element: <Runs /> },
          { path: '/projects/:id/runs/:runId', element: <Runs /> },
          { path: '/projects/:id/planner', element: <Planner /> },
          { path: '/runs', element: <Runs /> },
          { path: '/planner', element: <Planner /> },
          { path: '/network', element: <NetworkTools /> },
          { path: '/projects/:id/network', element: <NetworkTools /> },
          { path: '/dsa', element: <DSAShowcase /> },
          { path: '/evacuation', element: <EvacuationMap /> },
          { path: '/hospital', element: <HospitalSurge /> },
        ],
      },

      { path: '*', element: <NotFound /> },
    ],
  },
]);

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
