import React, { useState } from 'react';

/** CC0 / Kenney attribution for City Twin GLB pack */
export const AssetAttribution: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-4 right-4 z-20 text-[10px] max-w-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded bg-[var(--bg-panel)]/95 border border-[var(--border-color)] px-2 py-1 text-[var(--text-secondary)] shadow-sm hover:text-[var(--accent)] transition-colors"
      >
        3D assets · CC0
      </button>
      {open && (
        <div className="mt-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-panel)] p-3 shadow-lg text-[var(--text-secondary)] leading-relaxed animate-fade-up">
          <p className="font-semibold text-[var(--text-primary)] mb-1">Asset licenses</p>
          <p>
            City Twin GLBs are <strong>CC0 1.0</strong> (public domain dedication). Pipeline inspired by
            Kenney City / Car kits and Poly Haven — no proprietary SimCity/EA assets.
          </p>
          <p className="mt-2">
            Details:{' '}
            <code className="text-[var(--text-primary)]">docs/assets/ASSET_LICENSES.md</code>
          </p>
          <p className="mt-1 text-[var(--text-muted)]">
            Camera/grid patterns reference MIT simcity-threejs-clone (see CREDITS_FRIEND_FORK.md).
          </p>
        </div>
      )}
    </div>
  );
};
