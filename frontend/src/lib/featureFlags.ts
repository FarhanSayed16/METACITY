/**
 * Partner-merge + enhancement feature flags.
 * Product surfaces default on; E-M* enhancements default off (Phase 10 anti-creep).
 */
function envFlag(name: string, defaultValue: boolean): boolean {
  try {
    const v = (import.meta as any).env?.[name];
    if (v === undefined || v === '') return defaultValue;
    return String(v).toLowerCase() === 'true' || v === '1';
  } catch {
    return defaultValue;
  }
}

export const featureFlags = {
  /** City Twin mode route + CTAs (GLB presentation — Phase 2+) */
  cityTwin: envFlag('VITE_CITY_TWIN', true),
  /** Disaster Lab modal — Phase 5 */
  disasterLab: envFlag('VITE_DISASTER_LAB', true),
  /** AI Command Center + Ask — Phase 6 */
  aiCommand: envFlag('VITE_AI_COMMAND', true),

  // ── Phase 10 enhancements (default OFF) ─────────────────────────────
  /** E-M1: friend-style FSM billboards on agents_sample (viz only) */
  enhFsmViz: envFlag('VITE_ENH_FSM_VIZ', false),
  /** E-M2: transit line / bus-metro presentation in City Twin */
  enhTransitLayers: envFlag('VITE_ENH_TRANSIT_LAYERS', false),
  /** E-M3: real LLM behind Ask (still grounded); templates if off */
  enhLlmAsk: envFlag('VITE_ENH_LLM_ASK', false),
  /** E-M4: interiors modal */
  enhInteriors: envFlag('VITE_ENH_INTERIORS', false),
  /** E-M5: multi-user / Supabase — productization only */
  enhMultiuser: envFlag('VITE_ENH_MULTIUSER', false),
  /** E-M6: video/HDR landing hero */
  enhHeroVideo: envFlag('VITE_ENH_HERO_VIDEO', false),
} as const;

export type FeatureFlags = typeof featureFlags;
