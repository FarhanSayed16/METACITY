/**
 * Shared congestion colour thresholds (v/c ratio).
 * Keep in sync with NetworkLayer colouring and WorkspaceMap legend.
 */
export const CONGESTION_THRESHOLDS = {
  free: 0.3,
  moderate: 0.7,
  heavy: 0.9,
} as const;

export const CONGESTION_COLORS = {
  free: '#10b981',
  moderate: '#f59e0b',
  heavy: '#ef4444',
  selected: '#FFD166',
  defaultDay: '#264653',
  defaultNight: '#445566',
} as const;

export function congestionColor(
  vc: number,
  opts?: { night?: boolean; selected?: boolean }
): string {
  if (opts?.selected) return CONGESTION_COLORS.selected;
  if (vc > CONGESTION_THRESHOLDS.heavy) return CONGESTION_COLORS.heavy;
  if (vc > CONGESTION_THRESHOLDS.moderate) return CONGESTION_COLORS.moderate;
  if (vc > CONGESTION_THRESHOLDS.free) return CONGESTION_COLORS.free;
  return opts?.night ? CONGESTION_COLORS.defaultNight : CONGESTION_COLORS.defaultDay;
}
