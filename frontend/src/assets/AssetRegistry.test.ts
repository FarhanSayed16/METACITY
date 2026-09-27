import { describe, expect, it } from 'vitest';
import {
  ASSET_REGISTRY,
  getAllRelativePaths,
  getAssetById,
  assetForFacilityType,
} from '../assets/AssetRegistry';

describe('AssetRegistry', () => {
  it('has at least 40 GLB entries with nested paths', () => {
    expect(ASSET_REGISTRY.length).toBeGreaterThanOrEqual(40);
    for (const e of ASSET_REGISTRY) {
      expect(e.relativePath).toMatch(/\.glb$/);
      expect(e.path).toBe(`/assets/${e.relativePath}`);
      expect(e.relativePath).not.toMatch(/^[^/]+\.glb$/); // no flat friend paths
    }
  });

  it('resolves house and facility mappings', () => {
    expect(getAssetById('res.house_01')?.relativePath).toContain('residential');
    expect(assetForFacilityType('home', 0)?.id).toBeTruthy();
    expect(assetForFacilityType('office', 1)?.id).toBeTruthy();
  });

  it('exports unique relative paths', () => {
    const paths = getAllRelativePaths();
    expect(new Set(paths).size).toBe(paths.length);
  });
});
