import React from 'react';
import { Button } from '../components/ui/Button';

export const Welcome: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 text-center bg-[var(--bg-canvas)]">
      <h1 className="text-4xl font-extrabold tracking-tight text-[var(--bg-chrome)] sm:text-5xl mb-4">
        Welcome to METACITY
      </h1>
      <p className="text-lg text-[var(--text-secondary)] max-w-2xl mb-8">
        A deterministic, high-performance urban mobility simulator. 
        Evaluate infrastructure changes, compare scenarios, and measure impact with rigorous agent-based modeling.
      </p>
      <div className="flex gap-4">
        <Button size="lg" onClick={() => window.location.href = '/projects'}>
          Go to Projects
        </Button>
      </div>
    </div>
  );
};
