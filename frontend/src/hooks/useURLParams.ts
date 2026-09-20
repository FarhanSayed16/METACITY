import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';

/**
 * Syncs specific uiStore state to URL search parameters for deep linking.
 * Usage: Call this hook once in the top-level WorkspaceMap or App.
 */
export function useURLParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const is3D = useUIStore((state) => state.is3D);
  const toggle3D = useUIStore((state) => state.toggle3D);
  const isNightMode = useUIStore((state) => state.isNightMode);
  const toggleNightMode = useUIStore((state) => state.toggleNightMode);

  // 1. On mount, read from URL and set store
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === '2d' && is3D) {
      toggle3D();
    } else if (mode === '3d' && !is3D) {
      toggle3D();
    }

    const theme = searchParams.get('theme');
    if (theme === 'dark' && !isNightMode) {
      toggleNightMode();
    } else if (theme === 'light' && isNightMode) {
      toggleNightMode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. On store change, update URL
  useEffect(() => {
    const currentMode = searchParams.get('mode');
    const intendedMode = is3D ? '3d' : '2d';
    
    const currentTheme = searchParams.get('theme');
    const intendedTheme = isNightMode ? 'dark' : 'light';

    if (currentMode !== intendedMode || currentTheme !== intendedTheme) {
      setSearchParams({
        mode: intendedMode,
        theme: intendedTheme,
      }, { replace: true });
    }
  }, [is3D, isNightMode, searchParams, setSearchParams]);
}
