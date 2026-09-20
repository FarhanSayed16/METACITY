import { create } from 'zustand';

export interface ScenarioDraftOp {
  type: string;
  data: Record<string, any>;
}

interface ScenarioDraftState {
  pendingOps: ScenarioDraftOp[];
  draftLabel: string | null;
  setPendingOps: (ops: ScenarioDraftOp[], label?: string) => void;
  clearPendingOps: () => void;
}

export const useScenarioDraftStore = create<ScenarioDraftState>((set) => ({
  pendingOps: [],
  draftLabel: null,
  setPendingOps: (ops, label) =>
    set({ pendingOps: ops, draftLabel: label ?? 'Scenario draft' }),
  clearPendingOps: () => set({ pendingOps: [], draftLabel: null }),
}));
