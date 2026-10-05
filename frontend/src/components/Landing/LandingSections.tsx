import { Map, Building2, GitCompare, Shield } from 'lucide-react';

export function LandingModesSection() {
  return (
    <section
      id="sec-modes"
      className="relative w-full py-20 sm:py-28 bg-[var(--bg-chrome)] text-[var(--text-inverse)] border-t border-white/5"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-[11px] font-mono font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
          Two modes · one simulation
        </p>
        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-2xl">
          Edit the network. Present the city.
        </h2>
        <p className="mt-4 text-sm sm:text-base text-white/55 max-w-xl leading-relaxed">
          The same project scene and run metrics power both surfaces — no second backend, no competing truth.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Map className="h-6 w-6 text-[var(--accent)]" aria-hidden />
              <h3 className="text-xl font-bold text-white">Network Evidence</h3>
            </div>
            <p className="text-sm text-white/55 leading-relaxed">
              Orthographic map editor for links, facilities, and scenarios. BPR/MSA assignment, multi-seed
              Compare with confidence intervals, isolation KPIs, and exportable reports.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="h-6 w-6 text-[var(--accent)]" aria-hidden />
              <h3 className="text-xl font-bold text-white">City Twin</h3>
            </div>
            <p className="text-sm text-white/55 leading-relaxed">
              Full-scene 3D with licensed GLBs. Congestion colours and facilities come from your live
              scene JSON and <span className="font-mono text-white/70">link_metrics</span> — presentation
              without inventing a second model.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingEvidenceSection() {
  return (
    <section
      id="sec-evidence"
      className="relative w-full py-20 sm:py-28 bg-[#151C26] text-[var(--text-inverse)] border-t border-white/5"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-[11px] font-mono font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
          Built for decisions
        </p>
        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-2xl">
          Compare before you commit.
        </h2>
        <p className="mt-4 text-sm sm:text-base text-white/55 max-w-xl leading-relaxed">
          Flood, outage, and closure scenarios feed the same runner. Results stay Level-1 honest:
          what the model measured — not marketing theatre.
        </p>

        <ul className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 list-none p-0 m-0">
          <li className="flex gap-4">
            <GitCompare className="h-6 w-6 text-[var(--accent)] shrink-0 mt-0.5" aria-hidden />
            <div>
              <h3 className="font-bold text-white">Multi-seed Compare</h3>
              <p className="mt-1 text-sm text-white/55 leading-relaxed">
                Replication pools and CI bands so a single lucky seed cannot sell a project.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <Shield className="h-6 w-6 text-[var(--accent)] shrink-0 mt-0.5" aria-hidden />
            <div>
              <h3 className="font-bold text-white">Disaster & isolation KPIs</h3>
              <p className="mt-1 text-sm text-white/55 leading-relaxed">
                Close links, flood zones, and measure who gets cut off — before ops go live.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}

interface LandingFinalCTAProps {
  onEnter: () => void;
}

export function LandingFinalCTA({ onEnter }: LandingFinalCTAProps) {
  return (
    <section
      id="sec-enter"
      className="relative w-full py-24 sm:py-32 bg-[var(--bg-chrome)] text-[var(--text-inverse)] border-t border-white/5 text-center"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col items-center">
        <p className="font-extrabold text-4xl sm:text-6xl tracking-tight text-white">METACITY</p>
        <p className="mt-3 text-sm sm:text-base text-white/55 max-w-md">
          Pick a city, propose a plan, see before/after traffic and citizen impact.
        </p>
        <button
          type="button"
          onClick={onEnter}
          className="mt-8 px-10 py-4 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm uppercase tracking-wider transition-colors"
        >
          Start a decision →
        </button>
        <footer className="mt-16 pt-8 border-t border-white/5 w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-white/35">
          <span>© {new Date().getFullYear()} METACITY</span>
          <span>Civic Steel · Decision Mode + City Twin</span>
        </footer>
      </div>
    </section>
  );
}
