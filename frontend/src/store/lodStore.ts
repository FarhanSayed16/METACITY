import { create } from 'zustand';

/** Camera LOD tier for Twin / 3D: 0 high · 1 mid · 2 low (cull detail). */
export type LodTier = 0 | 1 | 2;

interface LodState {
  tier: LodTier;
  setTier: (tier: LodTier) => void;
}

export const useLodStore = create<LodState>((set) => ({
  tier: 0,
  setTier: (tier) => set({ tier }),
}));

/** Distance thresholds (camera distance from origin). Tuned for City Twin scale. */
export function tierFromDistance(dist: number): LodTier {
  if (dist > 120) return 2;
  if (dist > 55) return 1;
  return 0;
}
