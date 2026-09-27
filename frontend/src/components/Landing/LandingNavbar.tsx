import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface LandingNavbarProps {
  onEnter: () => void;
}

export function LandingNavbar({ onEnter }: LandingNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[var(--bg-chrome)]/95 backdrop-blur-md border-b border-white/10 py-3'
          : 'bg-gradient-to-b from-[var(--bg-chrome)]/80 to-transparent py-4'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-md bg-[var(--accent)]/20 border border-[var(--accent)]/50 flex items-center justify-center group-hover:border-[var(--accent)] transition-colors">
            <span className="font-mono text-[var(--accent)] font-extrabold text-xs">MC</span>
          </div>
          <span className="font-extrabold text-base tracking-wide text-white group-hover:text-[var(--accent)] transition-colors">
            METACITY
          </span>
        </button>

        <div className="hidden md:flex items-center gap-6 text-xs font-mono text-white/60">
          <button type="button" onClick={() => scrollToSection('sec-modes')} className="hover:text-[var(--accent)] transition">
            Modes
          </button>
          <button type="button" onClick={() => scrollToSection('sec-evidence')} className="hover:text-[var(--accent)] transition">
            Evidence
          </button>
          <button type="button" onClick={() => scrollToSection('sec-enter')} className="hover:text-[var(--accent)] transition">
            Start
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEnter}
            className="hidden sm:inline-flex px-4 py-2 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Open projects
          </button>
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-white/70 hover:bg-white/10"
            aria-label="Menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="font-mono text-xs">{menuOpen ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[var(--bg-chrome)] px-4 py-3 flex flex-col gap-2 animate-fade-up">
          <button type="button" onClick={() => scrollToSection('sec-modes')} className="text-left text-sm text-white/80 py-2">
            Modes
          </button>
          <button type="button" onClick={() => scrollToSection('sec-evidence')} className="text-left text-sm text-white/80 py-2">
            Evidence
          </button>
          <Link to="/projects" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-[var(--accent)] py-2">
            Open projects →
          </Link>
        </div>
      )}
    </nav>
  );
}
