interface LandingHeroOverlayProps {
  onEnter: () => void;
}

export function LandingHeroOverlay({ onEnter }: LandingHeroOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-end sm:justify-center items-center z-20 px-4 pb-16 sm:pb-0">
      <style>{`
        .landing-hero-in {
          opacity: 0;
          animation: landingHeroIn 1.1s var(--ease-out, cubic-bezier(0.22, 1, 0.36, 1)) 1.8s forwards;
        }
        @keyframes landingHeroIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="landing-hero-in flex flex-col items-center text-center pointer-events-auto max-w-3xl">
        <p className="font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-tight text-white leading-none">
          METACITY
        </p>
        <h1 className="mt-4 sm:mt-5 text-lg sm:text-2xl md:text-3xl font-semibold text-white/90 tracking-tight max-w-xl">
          Network evidence. Living city twin.
        </h1>
        <p className="mt-3 text-sm sm:text-base text-white/55 max-w-md leading-relaxed">
          Run deterministic traffic scenarios, compare outcomes with confidence intervals, then explore the same scene as a GLB city twin.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onEnter}
            className="px-8 py-3.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm tracking-wide transition-colors"
          >
            Open projects
          </button>
          <button
            type="button"
            onClick={() => document.getElementById('sec-modes')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3.5 rounded-md border border-white/20 hover:border-[var(--accent)]/60 text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            See how it works
          </button>
        </div>
      </div>
    </div>
  );
}
