import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingNavbar } from '../components/Landing/LandingNavbar';
import { LandingHeroCity } from '../components/Landing/LandingHeroCity';
import { LandingHeroOverlay } from '../components/Landing/LandingHeroOverlay';
import { LandingLoader } from '../components/Landing/LandingLoader';
import {
  LandingModesSection,
  LandingEvidenceSection,
  LandingFinalCTA,
} from '../components/Landing/LandingSections';

/**
 * Cinematic product entry (Phase 4) — Civic Steel palette, dual-mode story.
 * Outside MainLayout so the first viewport is full-bleed.
 */
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const enter = useCallback(() => {
    navigate('/decision');
  }, [navigate]);

  return (
    <div className="w-full min-h-screen bg-[var(--bg-chrome)] text-[var(--text-inverse)] overflow-x-hidden selection:bg-[var(--accent)]/30 selection:text-white">
      {isLoading && <LandingLoader onComplete={() => setIsLoading(false)} />}

      <LandingNavbar onEnter={enter} />

      <section className="relative w-full h-[100svh] min-h-[520px] overflow-hidden">
        <LandingHeroCity />
        <LandingHeroOverlay onEnter={enter} />
      </section>

      <LandingModesSection />
      <LandingEvidenceSection />
      <LandingFinalCTA onEnter={enter} />
    </div>
  );
};

export default LandingPage;
