import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { MainLayout } from './components/layout/MainLayout';
import { Welcome } from './pages/Welcome';
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
import { OnboardingTour } from './components/ui/OnboardingTour';
import { useHealthStore } from './store/healthStore';
import { api } from './lib/api';

function App() {
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

  if (initialCheckDone && apiReachable === false && !window.location.pathname.includes('/projects')) {
    return <ApiDown />;
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
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
        <Routes>
          <Route path="/" element={<Welcome />} />

          <Route element={<MainLayout />}>
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectOverview />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/ui-kit" element={<UiKit />} />
            <Route path="/projects/:id/map" element={<WorkspaceMap />} />
            <Route path="/projects/:id/compare" element={<Compare />} />
            <Route path="/projects/:id/runs" element={<Runs />} />
            <Route path="/projects/:id/runs/:runId" element={<Runs />} />
            <Route path="/projects/:id/planner" element={<Planner />} />
            <Route path="/runs" element={<Runs />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/network" element={<NetworkTools />} />
            <Route path="/projects/:id/network" element={<NetworkTools />} />
            <Route path="/dsa" element={<DSAShowcase />} />
            <Route path="/evacuation" element={<EvacuationMap />} />
            <Route path="/hospital" element={<HospitalSurge />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastStack />
        <OnboardingTour />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
