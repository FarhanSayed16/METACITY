import { create } from 'zustand';

interface HealthState {
  apiReachable: boolean | null;
  modelVersion: string;
  setApiReachable: (ok: boolean) => void;
  setModelVersion: (v: string) => void;
  mutationsLocked: () => boolean;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  apiReachable: null,
  modelVersion: '',
  setApiReachable: (ok) => set({ apiReachable: ok }),
  setModelVersion: (v) => set({ modelVersion: v }),
  mutationsLocked: () => get().apiReachable === false,
}));
