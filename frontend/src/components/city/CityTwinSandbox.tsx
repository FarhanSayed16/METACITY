/**
 * Phase 2 City Twin sandbox — showcase GLB registry (houses / offices / vehicles).
 * Scene-driven placement lands in Phase 3.
 */
import React, { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, ContactShadows, Html } from '@react-three/drei';
import {
  ASSET_REGISTRY,
  CORE_PRELOAD_IDS,
  getAssetById,
  type AssetEntry,
} from '../../assets/AssetRegistry';
import { preloadCoreAssets } from '../../assets/GLTFAssetCache';
import { RegisteredAsset } from '../../assets/RegisteredAsset';

const SHOWCASE_IDS = [
  'res.house_01',
  'res.house_02',
  'off.mid',
  'off.tower',
  'com.store',
  'ind.factory',
  'health.hospital',
  'edu.school',
  'civic.police',
  'civic.fire',
  'veh.sedan_blue',
  'veh.bus',
  'veh.police',
  'env.tree_oak',
  'special.tower',
] as const;

function ShowcaseGrid() {
  const entries = useMemo(() => {
    return SHOWCASE_IDS.map((id) => getAssetById(id)).filter(Boolean) as AssetEntry[];
  }, []);

  const cols = 5;
  return (
    <group>
      {entries.map((entry, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = (col - (cols - 1) / 2) * 8;
        const z = (row - 1) * 10;
        return (
          <group key={entry.id} position={[x, 0, z]}>
            <RegisteredAsset entry={entry} position={[0, 0, 0]} />
            <Html position={[0, -0.2, 2.5]} center distanceFactor={28} style={{ pointerEvents: 'none' }}>
              <div className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-[#1B2430] shadow whitespace-nowrap border border-slate-200">
                {entry.label}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export const CityTwinSandbox: React.FC = () => {
  useEffect(() => {
    preloadCoreAssets(false);
  }, []);

  const coreCount = CORE_PRELOAD_IDS.length;
  const total = ASSET_REGISTRY.length;

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [18, 14, 22], fov: 45, near: 0.1, far: 500 }}
        shadows
      >
        <color attach="background" args={['#e8eef2']} />
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[40, 60, 20]}
          intensity={1.15}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <Grid
          infiniteGrid
          fadeDistance={80}
          cellSize={2}
          sectionSize={10}
          cellColor="#cbd5e1"
          sectionColor="#94a3b8"
        />
        <ShowcaseGrid />
        <ContactShadows opacity={0.35} scale={80} blur={2.5} far={20} />
        <Environment preset="city" />
        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.05} minDistance={5} maxDistance={80} />
      </Canvas>

      <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-[var(--border-color)] bg-[var(--bg-panel)]/95 backdrop-blur-sm px-3 py-2 text-xs text-[var(--text-secondary)] shadow-sm max-w-xs">
        <div className="font-semibold text-[var(--text-primary)] mb-0.5">Asset sandbox</div>
        <p>
          Showing {SHOWCASE_IDS.length} showcase models · registry {total} · core preload {coreCount}.
          Procedural boxes appear if a GLB fails.
        </p>
        <p className="mt-1 text-[10px] text-[var(--text-muted)]">
          Orbit to inspect · CC0 pack · Phase 3 places these on scene facilities.
        </p>
      </div>
    </div>
  );
};
