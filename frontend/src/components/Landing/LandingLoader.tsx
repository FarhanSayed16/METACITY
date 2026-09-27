import { useEffect, useState } from 'react';

interface LandingLoaderProps {
  onComplete: () => void;
}

const STEPS = [
  { id: 'grid', label: 'Network graph' },
  { id: 'sim', label: 'Simulation engine' },
  { id: 'twin', label: 'City Twin assets' },
  { id: 'ready', label: 'Workspace ready' },
];

export function LandingLoader({ onComplete }: LandingLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length ? prev + 1 : prev));
    }, 140);

    const finishTimeout = setTimeout(() => {
      setIsFading(true);
      setTimeout(onComplete, 350);
    }, 700);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(finishTimeout);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-chrome)] text-[var(--text-inverse)] transition-opacity duration-500 select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center max-w-sm w-full px-6">
        <div className="relative w-12 h-12 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-lg border border-[var(--accent)]/40 opacity-40 animate-soft-pulse" />
          <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/20 border border-[var(--accent)]/60 flex items-center justify-center">
            <span className="font-mono text-[var(--accent)] font-extrabold text-sm tracking-tighter">MC</span>
          </div>
        </div>

        <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-[var(--accent)] mb-5 uppercase">
          Starting METACITY
        </h2>

        <div className="w-full space-y-2 font-mono text-[11px] text-[var(--text-muted)]">
          {STEPS.map((step, idx) => {
            const isDone = currentStep > idx;
            const isCurrent = currentStep === idx;
            return (
              <div
                key={step.id}
                className="flex items-center justify-between py-1 border-b border-white/5"
              >
                <span
                  className={
                    isDone
                      ? 'text-[var(--text-inverse)]'
                      : isCurrent
                        ? 'text-[var(--accent)]'
                        : 'text-white/30'
                  }
                >
                  {step.label}
                </span>
                <span className="font-bold">
                  {isDone ? (
                    <span className="text-[var(--accent)]">✓</span>
                  ) : isCurrent ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-soft-pulse inline-block" />
                  ) : (
                    <span className="text-white/20">·</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-[10px] font-mono tracking-widest text-white/40 uppercase">
          Network evidence · City Twin
        </p>
      </div>

      <button
        type="button"
        onClick={onComplete}
        className="absolute bottom-6 right-6 text-[10px] font-mono text-white/40 hover:text-white/80 transition-colors px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10"
      >
        Skip
      </button>
    </div>
  );
}
