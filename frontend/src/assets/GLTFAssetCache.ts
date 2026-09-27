/**
 * GLTF cache helpers — preload core assets; callers use drei useGLTF for actual meshes.
 */
import { useGLTF } from '@react-three/drei';
import {
  ASSET_REGISTRY,
  CORE_PRELOAD_IDS,
  getAssetById,
  type AssetEntry,
} from './AssetRegistry';

const failedPaths = new Set<string>();

export function markAssetFailed(path: string) {
  failedPaths.add(path);
}

export function didAssetFail(path: string): boolean {
  return failedPaths.has(path);
}

export function getCorePreloadEntries(): AssetEntry[] {
  return CORE_PRELOAD_IDS.map((id) => getAssetById(id)).filter(Boolean) as AssetEntry[];
}

/** Fire-and-forget preload of core (and optionally all) GLBs via drei. */
export function preloadCoreAssets(all = false) {
  const entries = all ? ASSET_REGISTRY : getCorePreloadEntries();
  for (const e of entries) {
    try {
      useGLTF.preload(e.path);
    } catch {
      markAssetFailed(e.path);
    }
  }
}

export function clearAssetFailureLog() {
  failedPaths.clear();
}
